import { useState, useRef, useEffect } from 'react'
import gsap from 'gsap'
import styles from './Frame7.module.css'
import NavButton from '../components/NavButton'
import { restartExperience } from '../utils/restartExperience'

// ── Building SVGs ─────────────────────────────────────────────────────────────
import beforeSvg from '@assets/svg/building/before.svg'
import afterSvg  from '@assets/svg/building/after.svg'

// ── Black silhouettes (for flying birds on building + panel icons) ─────────────
import silKestrel  from '@assets/svg/silhouettes/black/kestrel.svg'
import silSwift    from '@assets/svg/silhouettes/black/swift.svg'
import silRedstart from '@assets/svg/silhouettes/black/redstart.svg'
import silMartin   from '@assets/svg/silhouettes/black/martin.svg'
import silSparrow  from '@assets/svg/silhouettes/black/sparrow.svg'
import silJackdaw  from '@assets/svg/silhouettes/black/jackdaw.svg'

// ── Tile photos (shown on hover) ──────────────────────────────────────────────
import tileKestrel  from '@assets/images/birds/kestrel-tile.png'
import tileSwift    from '@assets/images/birds/swift-tile.png'
import tileRedstart from '@assets/images/birds/redstart-tile.png'
import tileMartin   from '@assets/images/birds/martin-tile.png'
import tileSparrow  from '@assets/images/birds/sparrow-tile.png'
import tileJackdaw  from '@assets/images/birds/jackdaw-tile.png'

// ── Bird data ─────────────────────────────────────────────────────────────────
// hx / hy  = handle dot position as offset from building-area centre (px)
//            Building-area centre ≡ (480, 405) in Figma's 960×810 left container.
//            All values: Figma handle px − (480 | 405).
// bx / by  = flying-silhouette position offset from building-area centre (same coord system).
//            undefined = no silhouette on building for this species.
// svgInBuilding = bird shape is already baked into before.svg at this position.
//            birdSilWrap acts as invisible hover target only; shows photo on hover.

interface Bird {
  id:               string
  label:            string
  silSrc:           string
  tileSrc:          string
  description:      React.ReactNode   // before-state panel text
  afterDescription: React.ReactNode   // after-state panel text (what renovation did)
  hx: number; hy: number              // handle offset from area centre
  bx?: number; by?: number            // bird silhouette offset (optional)
  buildingSize?:    number            // silhouette/hit-area size in px (default 120)
  svgInBuilding?:   boolean           // if true: bird drawn into before.svg; don't render SVG overlay
}

const BIRDS: Bird[] = [
  {
    id: 'kestrel', label: 'Kestrels',
    silSrc: silKestrel, tileSrc: tileKestrel,
    description:      'Pair nesting on wide concrete window reveal of top-floor stairwell – unused ledge, south-facing, sheltered.',
    afterDescription: 'New plastic window casing installed, flush to wall face. Ledge depth reduced from 18 cm to 4 cm.',
    hx: -24,  hy: -275,
    bx: -12,  by: -310,
  },
  {
    id: 'swift', label: 'Common Swifts',
    silSrc: silSwift, tileSrc: tileSwift,
    description:      'Colony of 4 pairs nesting inside the disused attic ventilation shaft – warm, enclosed, predator-proof.',
    afterDescription: 'Thermal foam insulation applied flush to roof edge. Gap sealed. The pair returned in May to a wall.',
    // birdSilWrap centred on before.svg bird centroid (338,216 → offset 120,−160).
    // Handle offset: bird is consistently +12px right / −35px higher than handle across all birds.
    hx: 108,  hy:  -95,
    bx: 120,  by: -130,
  },
  {
    id: 'redstart', label: 'Black Redstarts',
    silSrc: silRedstart, tileSrc: tileRedstart,
    description:      'Pair nesting under the entrance canopy: the equivalent of a rocky overhang.',
    afterDescription: 'Cornice removed during façade restyling. Surface rendered smooth. No projection remains.',
    hx: -157, hy: 185,
    bx: -145, by: 149, buildingSize: 135,
  },
  {
    id: 'martin', label: 'House Martins',
    silSrc: silMartin, tileSrc: tileMartin,
    description:      'Three mud nests built under third-floor balcony soffit. Reused each spring for over a decade.',
    afterDescription: 'Balcony enclosed with glazed panels as part of energy upgrade. Nesting surface gone.',
    hx: 153,  hy: 102,
    bx: 165,  by:  67, buildingSize: 135,
  },
  {
    id: 'sparrow', label: 'House Sparrows',
    silSrc: silSparrow, tileSrc: tileSparrow,
    description:      <>Colony of 8 pairs nesting in cracks between prefab panels, a feature of every unrestored <em>blok</em> in Poland.</>,
    afterDescription: 'External render applied over all panel joints. Every crack filled. Every gap gone.',
    hx: -218, hy:  16,
    bx: -206, by: -20, buildingSize: 135,
  },
  {
    id: 'jackdaw', label: 'Jackdaws',
    silSrc: silJackdaw, tileSrc: tileJackdaw,
    description:      'Nests in gap beneath roof coping: the same crevice, reused for 30 years by the same returning pair.',
    afterDescription: 'Metal grille fitted over shaft opening during roof works. Access permanently blocked.',
    // birdSilWrap centred on before.svg bird centroid (367,121 → offset 154,−269).
    // Handle offset: bird is consistently +12px right / −35px higher than handle across all birds.
    hx: 152,  hy: -215,
    bx: 164,  by: -250,
  },
]

// ── Component ─────────────────────────────────────────────────────────────────
export default function Frame7() {
  const [view,    setView]    = useState<'before' | 'after'>('before')
  const [hovered, setHovered] = useState<string | null>(null)
  const sceneRef   = useRef<HTMLElement>(null)
  const navigating = useRef(false)

  // ── Wheel: prevent scroll from leaving this section ───────────────────────
  // Navigation is done exclusively via the Back / Continue buttons.
  useEffect(() => {
    function onWheel(e: WheelEvent) {
      e.preventDefault()
    }
    const scene = sceneRef.current
    scene?.addEventListener('wheel', onWheel, { passive: false })
    return () => scene?.removeEventListener('wheel', onWheel)
  }, [])

  // ── Reset when this section is activated ──────────────────────────────────
  useEffect(() => {
    function onShow() {
      setView('before')
      setHovered(null)
      navigating.current = false
    }
    window.addEventListener('frame7:show', onShow)
    return () => window.removeEventListener('frame7:show', onShow)
  }, [])

  // ── Navigation helpers ────────────────────────────────────────────────────
  function goToFrame21() {
    const frame21 = document.getElementById('frame21')
    if (frame21) {
      window.scrollTo({ top: frame21.offsetTop, behavior: 'instant' })
      gsap.fromTo('#frame21',
        { opacity: 0, y: 56 },
        { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out', clearProps: 'transform,opacity' },
      )
    }
  }

  function goToFrame6End() {
    window.dispatchEvent(new CustomEvent('frame6:goto', { detail: { progress: 1 } }))
    const frame6 = document.getElementById('frame6')
    if (frame6) {
      window.scrollTo({ top: frame6.offsetTop, behavior: 'instant' })
      gsap.fromTo('#frame6',
        { y: -56 },
        { y: 0, duration: 0.55, ease: 'power3.out', clearProps: 'transform' },
      )
    }
  }

  function handleBack() {
    navigating.current = true
    goToFrame6End()
  }

  function handleContinue() {
    navigating.current = true
    goToFrame21()
  }

  function handleRestart() { restartExperience() }

  const isAfter = view === 'after'

  return (
    <section id="frame7" ref={sceneRef} className={styles.scene}>

      {/* ── Title ───────────────────────────────────────────────────────── */}
      <div className={styles.title}>
        <p>Renovations</p>
        <p>vs. urban</p>
        <p>bird life</p>
      </div>

      {/* ── Before / After toggle ────────────────────────────────────────── */}
      <div className={styles.toggle}>
        <button
          className={`${styles.toggleBtn} ${!isAfter ? styles.toggleBtnActive : ''}`}
          onClick={() => setView('before')}
        >
          Before
        </button>
        <button
          className={`${styles.toggleBtn} ${isAfter ? styles.toggleBtnActive : ''}`}
          onClick={() => setView('after')}
        >
          After
        </button>
      </div>

      {/* ── Building area (left) ─────────────────────────────────────────── */}
      <div className={styles.buildingArea}>

        {/* Building SVG */}
        <div className={styles.buildingWrap}>
          <img
            src={isAfter ? afterSvg : beforeSvg}
            alt=""
            className={styles.buildingImg}
            draggable={false}
          />
        </div>

        {/* Bird silhouettes — only in Before state.
            Show SVG silhouette by default; swap to tile photo on hover. */}
        {!isAfter && BIRDS.map(bird => {
          if (bird.bx === undefined || bird.by === undefined) return null
          const sz = bird.buildingSize ?? 135
          const isHov = hovered === bird.id
          return (
            <div
              key={`sil-${bird.id}`}
              className={styles.birdSilWrap}
              style={{
                left: `calc(50% + ${bird.bx}px)`,
                top:  `calc(50% + ${bird.by}px)`,
              }}
              onMouseEnter={() => setHovered(bird.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <img
                src={isHov ? bird.tileSrc : bird.silSrc}
                alt=""
                style={isHov
                  ? { display: 'block', width: sz, height: sz, objectFit: 'cover' }
                  : { display: 'block', width: sz, height: 'auto' }
                }
                draggable={false}
              />
            </div>
          )
        })}

        {/* Handle dots — visible in both Before and After states.
            Hovering always activates the panel entry.
            In After state there are no building silhouettes, but panel highlights still work. */}
        {BIRDS.map(bird => (
          <button
            key={`handle-${bird.id}`}
            className={`${styles.handle} ${hovered === bird.id ? styles.handleActive : ''}`}
            style={{
              left: `calc(50% + ${bird.hx}px)`,
              top:  `calc(50% + ${bird.hy}px)`,
            }}
            onMouseEnter={() => setHovered(bird.id)}
            onMouseLeave={() => setHovered(null)}
            aria-label={bird.label}
          />
        ))}

        {/* Bird hover label — shown below the active handle, centred on its x */}
        {hovered && (() => {
          const b = BIRDS.find(x => x.id === hovered)!
          return (
            <p
              key={`label-${b.id}`}
              className={styles.birdLabel}
              style={{
                left: `calc(50% + ${b.hx}px)`,
                top:  `calc(50% + ${b.hy + 36}px)`,
              }}
            >
              {b.label}
            </p>
          )
        })()}

      </div>

      {/* ── Right panel ──────────────────────────────────────────────────── */}
      <aside className={styles.panel}>
        {BIRDS.map(bird => {
          const isActive = hovered === bird.id
          return (
            <div
              key={bird.id}
              className={`${styles.entry} ${isActive ? styles.entryActive : ''}`}
              onMouseEnter={() => setHovered(bird.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Icon: in both states, tile photo replaces silhouette on hover.
                  After state: photo is faded (opacity 0.4). Inactive After: icon dimmed.
                  iconWrapActive (overflow:visible) fires on any hover so the 104px photo can bleed out. */}
              <div className={`${styles.iconWrap} ${isActive ? styles.iconWrapActive : ''} ${isAfter && !isActive ? styles.iconWrapDimmed : ''}`}>
                <img
                  src={isActive ? bird.tileSrc : bird.silSrc}
                  alt=""
                  className={
                    isActive && isAfter  ? styles.iconImgFaded :
                    isActive             ? styles.iconImgActive :
                                           styles.iconImg
                  }
                  draggable={false}
                />
              </div>
              <div className={styles.entryText}>
                <p className={styles.entryDesc}>{isAfter ? bird.afterDescription : bird.description}</p>
              </div>
            </div>
          )
        })}
      </aside>

      {/* ── Navigation ───────────────────────────────────────────────────── */}
      <div className={styles.navWrap}>
        <NavButton
          onBack={handleBack}
          onContinue={handleContinue}
          onRestart={handleRestart}
        />
      </div>

    </section>
  )
}
