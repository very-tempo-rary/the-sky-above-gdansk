import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './Frame3.module.css'
import NavButton from '../components/NavButton'
import { lockScroll, unlockScroll } from '../utils/scrollLock'
import { restartExperience } from '../utils/restartExperience'

// ── SVG silhouettes (fill="#262626" baked in — no filter needed) ──────────────
import sil00 from '@assets/svg/silhouettes/vector.svg'
import sil01 from '@assets/svg/silhouettes/vector-1.svg'
import sil02 from '@assets/svg/silhouettes/vector-2.svg'
import sil03 from '@assets/svg/silhouettes/vector-3.svg'
import sil04 from '@assets/svg/silhouettes/vector-4.svg'
import sil05 from '@assets/svg/silhouettes/vector-5.svg'
import sil06 from '@assets/svg/silhouettes/vector-6.svg'
import sil07 from '@assets/svg/silhouettes/vector-7.svg'
import sil08 from '@assets/svg/silhouettes/vector-8.svg'
import sil09 from '@assets/svg/silhouettes/vector-9.svg'
import sil10 from '@assets/svg/silhouettes/vector-10.svg'
import sil11 from '@assets/svg/silhouettes/vector-11.svg'

// ── Tile PNGs — shown on the selected tile (cropped bird photos) ──────────────
import tileSeagull  from '@assets/images/birds/seagull-tile.png'
import tileTern     from '@assets/images/birds/tern-tile.png'
import tileSwan     from '@assets/images/birds/swan-tile.png'
import tileSwift    from '@assets/images/birds/swift-tile.png'
import tileRedstart from '@assets/images/birds/redstart-tile.png'
import tileJackdaw  from '@assets/images/birds/jackdaw-tile.png'
import tileRook     from '@assets/images/birds/rook-tile.png'
import tileKestrel  from '@assets/images/birds/kestrel-tile.png'
import tileFalcon   from '@assets/images/birds/falcon-tile.png'
import tilePigeon   from '@assets/images/birds/pigeon-tile.png'
import tileSparrow  from '@assets/images/birds/sparrow-tile.png'
import tileMartin   from '@assets/images/birds/martin-tile.png'

// ── Detail panel photos (full-frame bird photos for the right panel) ──────────
import photoSeagull  from '@assets/images/birds/Seagull.png'
import photoTern     from '@assets/images/birds/Tern.png'
import photoSwan     from '@assets/images/birds/Swan.png'
import photoSwift    from '@assets/images/birds/Swift.png'
import photoRedstart from '@assets/images/birds/Redstart.png'
import photoJackdaw  from '@assets/images/birds/Jackdaw.png'
import photoRook     from '@assets/images/birds/Rook.png'
import photoKestrel  from '@assets/images/birds/Kestrel.png'
import photoFalcon   from '@assets/images/birds/Falcon.png'
import photoPigeon   from '@assets/images/birds/Pigeon.png'
import photoSparrow  from '@assets/images/birds/Sparrow.png'
import photoMartin   from '@assets/images/birds/Martin.png'

// ── Trend SVGs as React components so CSS can set fill colour ─────────────────
// (SVG paths have fill="white" baked in; CSS overrides presentation attributes)
import TrendStrongDecline   from '@assets/svg/ui/Trend=Strong decline, State=Default.svg?react'
import TrendModerateDecline from '@assets/svg/ui/Trend=Moderate decline, State=Default.svg?react'
import TrendStable          from '@assets/svg/ui/Trend=Stable, State=Default.svg?react'
import TrendModerateGrowth  from '@assets/svg/ui/Trend=Moderate growth, State=Default.svg?react'
import TrendNone            from '@assets/svg/ui/Trend=None, State=Default.svg?react'
import InfoIcon             from '@assets/svg/ui/Shape=Info.svg?react'

gsap.registerPlugin(ScrollTrigger)

// ── Types ─────────────────────────────────────────────────────────────────────
type Trend = 'Strong decline' | 'Moderate decline' | 'Stable' | 'Moderate growth' | 'None'

type TrendComponent = React.FC<React.SVGProps<SVGSVGElement>>

interface Species {
  id:          string
  name:        string
  polishName:  string
  description: string
  population:  string
  trend:       Trend
  zone:        string
  habitat:     string
  silhouette:  string   // SVG URL — dark #262626 fill baked in
  tilePng:     string   // Cropped photo for selected-tile state
  photo:       string   // Full photo for detail panel
}

// ── Trend icon component map ───────────────────────────────────────────────────
const TREND_ICON: Record<Trend, TrendComponent> = {
  'Strong decline':   TrendStrongDecline,
  'Moderate decline': TrendModerateDecline,
  'Stable':           TrendStable,
  'Moderate growth':  TrendModerateGrowth,
  'None':             TrendNone,
}

// ── Species data (grid order: row-by-row, left to right) ──────────────────────
const SPECIES: Species[] = [
  {
    id: 'seagull', name: 'Herring gull', polishName: 'Mewa srebrzysta',
    description: 'Not just a seagull that wandered too far from the sea – this is a species that has restructured its entire annual cycle around food waste and roof geometry. Over 1,000 individuals were observed in Gdańsk in a 2023 wintering birds count.',
    population: '~3K pairs', trend: 'Strong decline', zone: 'Water',
    habitat: 'Waterfront / City rooftops',
    silhouette: sil00, tilePng: tileSeagull, photo: photoSeagull,
  },
  {
    id: 'tern', name: 'Sandwich tern', polishName: 'Rybitwa czubata',
    description: 'Gdańsk is home to the only sandwich tern colony in Poland. The population lives on the artificial Bird Island, built for it in 2022. Terns nest on the ground, in beach sand, and they feed by plunge-diving in the sea for fish. Males offer fish to females as part of their courtship display.',
    population: '~800 pairs', trend: 'Strong decline', zone: 'Water',
    habitat: 'Waterfront / Port',
    silhouette: sil01, tilePng: tileTern, photo: photoTern,
  },
  {
    id: 'swan', name: 'Mute swan', polishName: 'Łabędź niemy',
    description: 'Gdańsk is home to about 30–40 breeding pairs of mute swans: the largest urban breeding population in Poland. The Motława river and Radunia Canal network function as a fragmented wetland system.',
    population: '~7K pairs', trend: 'Moderate growth', zone: 'Water',
    habitat: 'Waterfront / park ponds / canals',
    silhouette: sil04, tilePng: tileSwan, photo: photoSwan,
  },
  {
    id: 'swift', name: 'Common swift', polishName: 'Jerzyk zwyczajny',
    description: 'Never lands except to nest. A swift can fly two million miles in its lifetime – equal to more than four trips to the Moon and back. Transferred from rock crevices to old building gaps, and now depend on which buildings remain habitable after renovations.',
    population: '64–187K pairs', trend: 'Moderate growth', zone: 'Sky',
    habitat: 'Building gaps and crevices',
    silhouette: sil02, tilePng: tileSwift, photo: photoSwift,
  },
  {
    id: 'redstart', name: 'Black redstart', polishName: 'Kopciuszek zwyczajny',
    description: 'Inhabits stony ground on cliff and mountains, but has expanded to include similar urban habitats, including areas bombed during World War II. Today, its rattling song can be heard even in city centers and industrial spaces, also at night by artificial lighting.',
    population: '~1M pairs', trend: 'Moderate growth', zone: 'Industrial margins',
    habitat: 'Shipyard / Housing estates',
    silhouette: sil07, tilePng: tileRedstart, photo: photoRedstart,
  },
  {
    id: 'jackdaw', name: 'Jackdaw', polishName: 'Kawka zwyczajna',
    description: 'Extremely sociable, they live in large bands, with every bird having its own unique contact call. They nest in hollows of larger trees and rock crevices, but – like redstarts – have expanded to post-World War II rubble, as well as chimneys and church spires.',
    population: '286–352K pairs', trend: 'Moderate growth', zone: 'Human settlement',
    habitat: 'Old Town churches / Chimneys',
    silhouette: sil03, tilePng: tileJackdaw, photo: photoJackdaw,
  },
  {
    id: 'rook', name: 'Rook', polishName: 'Gawron',
    description: 'Most vulnerable species featured, declining by almost half in 2012–25 in the Pomerania region. The birds build rookeries of 50–500 nests in city-center avenues; they can return to the same trees for decades. Unfortunately, noise and mess complaints often put rooks in conflict with urban management.',
    population: '183–222K pairs', trend: 'Moderate decline', zone: 'Green corridors',
    habitat: 'Street trees / Parks',
    silhouette: sil10, tilePng: tileRook, photo: photoRook,
  },
  {
    id: 'kestrel', name: 'Common kestrel', polishName: 'Pustułka zwyczajna',
    description: 'Uses tall buildings as elevated platforms to characteristically hover-hunt over open ground. About 100 kestrels are born every year in Gdańsk; sadly, only 40–50% of this species’ young survive into adulthood.',
    population: '3–5K pairs', trend: 'Moderate growth', zone: 'Sky',
    habitat: 'Old Town churches',
    silhouette: sil06, tilePng: tileKestrel, photo: photoKestrel,
  },
  {
    id: 'falcon', name: 'Peregrine falcon', polishName: 'Sokół wędrowny',
    description: 'Treats tall buildings and industrial chimneys as sea cliffs. The species is still being reintroduced in Poland, and remains extremely rare. Two nest boxes in Tricity (the adjoining cities of Gdańsk, Sopot and Gdynia) were inhabited in 2015–22; one remains occupied today.',
    population: '~55 pairs', trend: 'None', zone: 'Sky',
    habitat: 'Tallest buildings and chimneys',
    silhouette: sil05, tilePng: tileFalcon, photo: photoFalcon,
  },
  {
    id: 'pigeon', name: 'Wood pigeon', polishName: 'Gołąb grzywacz',
    description: 'One of the most widespread urban birds in Poland. A forest species that has quietly colonised city parks and street trees without anyone designing for it. It asks only for a horizontal branch.',
    population: '~1M pairs', trend: 'Moderate growth', zone: 'Green corridors',
    habitat: 'Street Trees / Parks',
    silhouette: sil09, tilePng: tilePigeon, photo: photoPigeon,
  },
  {
    id: 'sparrow', name: 'House sparrow', polishName: 'Wróbel zwyczajny',
    description: 'Always closely tied to our settlements, sparrows now suffer as modern buildings lack nesting spaces, dense shrubs disappear, and threats from cats and winter cold persist. These scrubby birds have limited flight range, and can sometimes move in with larger birds – even predatory ones.',
    population: '6–7M pairs', trend: 'Moderate decline', zone: 'Human settlement',
    habitat: 'Entire city',
    silhouette: sil08, tilePng: tileSparrow, photo: photoSparrow,
  },
  {
    id: 'martin', name: 'House martin', polishName: 'Jaskółka oknówka',
    description: 'Smaller, plumper, and with a more distinctly forked tail than the swift, the house martin is a type of swallow. Its nest: a cup of mud pellets pressed against a vertical wall directly under the eaves, with only a small opening at the top. Pairs build the nests together, and can reuse them for years.',
    population: '419–596K pairs', trend: 'Stable', zone: 'Sky',
    habitat: 'Eaves / Facades',
    silhouette: sil11, tilePng: tileMartin, photo: photoMartin,
  },
]

// ── Fly-in starting offsets (px from each tile's final grid position) ─────────
// Tiles scatter across and beyond all four screen edges, then converge.
// Each pair maps to the same index in SPECIES (matching the grid order).
const FLY_FROM: [number, number][] = [
  [-1100, -400],  //  0 seagull  — top-left
  [    0, -700],  //  1 tern     — straight up
  [  950, -300],  //  2 swan     — top-right
  [ -900,   50],  //  3 swift    — far left
  [  200, -600],  //  4 redstart — top-centre
  [  850, -500],  //  5 jackdaw  — top-right
  [ -500,  250],  //  6 rook     — left
  [  300,  600],  //  7 kestrel  — bottom
  [  950,  100],  //  8 falcon   — far right
  [ -750,  400],  //  9 pigeon   — bottom-left
  [  100,  800],  // 10 sparrow  — straight down
  [  950,  400],  // 11 martin   — bottom-right
]

// ── Component ─────────────────────────────────────────────────────────────────
export default function Frame3() {
  const [selected,     setSelected]     = useState('seagull')
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const wrapperRef       = useRef<HTMLDivElement>(null)
  const gridRef          = useRef<HTMLDivElement>(null)
  const tileRefs         = useRef<(HTMLDivElement | null)[]>([])
  const detailRef        = useRef<HTMLDivElement>(null)
  const tlRef            = useRef<gsap.core.Timeline | null>(null)
  const lockTriggerRef   = useRef<ReturnType<typeof ScrollTrigger.create> | null>(null)
  // When navigating forward to Frame4 we must skip the onEnter re-fire that GSAP
  // produces after unlockScroll() recalibrates its internal scroll from 0 → actual.
  const suppressLockRef  = useRef(false)

  // Helper — resets tiles, grid and detail panel to the pre-animation hidden state.
  // Called both from useEffect (initial mount) and from handleBack (before leaving).
  function resetToHidden() {
    const tiles  = tileRefs.current.filter(Boolean) as HTMLDivElement[]
    const grid   = gridRef.current
    const detail = detailRef.current
    tiles.forEach((tile, i) => {
      const [dx, dy] = FLY_FROM[i] ?? [0, -500]
      gsap.set(tile, { x: dx, y: dy, opacity: 0 })
    })
    if (grid)   gsap.set(grid,   { opacity: 0 })
    if (detail) gsap.set(detail, { opacity: 0 })
  }

  useEffect(() => {
    const wrapper = wrapperRef.current
    const grid    = gridRef.current
    const tiles   = tileRefs.current.filter(Boolean) as HTMLDivElement[]
    const detail  = detailRef.current
    if (!wrapper || !grid || !tiles.length || !detail) return

    // Hide grid (suppresses the border-top white line before the animation fires)
    // and scatter tiles to their starting positions.
    gsap.set(grid, { opacity: 0 })
    tiles.forEach((tile, i) => {
      const [dx, dy] = FLY_FROM[i] ?? [0, -500]
      gsap.set(tile, { x: dx, y: dy, opacity: 0 })
    })
    gsap.set(detail, { opacity: 0 })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrapper,
        start: 'top top',
        // restart on every forward entry; no action on backward crossing so that
        // tiles stay visible when returning from Frame4 via its Back button.
        toggleActions: 'restart none none none',
      },
      onStart: () => {
        // On every play (including re-plays after Back + return):
        // 1. Scatter all tiles to their from positions immediately so that the
        //    staggered fromTo tweens don't flash tiles at their previous final
        //    positions before each individual tween starts.
        // 2. Reveal the grid (hides the border-top white line between sticking
        //    and the first visible tile arriving).
        // 3. Re-enable GPU compositing.
        const liveTiles = tileRefs.current.filter(Boolean) as HTMLDivElement[]
        liveTiles.forEach((tile, i) => {
          const [dx, dy] = FLY_FROM[i] ?? [0, -500]
          tile.style.willChange = 'transform, opacity'
          gsap.set(tile, { x: dx, y: dy, opacity: 0 })
        })
        gsap.set(grid, { opacity: 1 })
      },
      onComplete: () => {
        // Tear down GPU layers in the resting state to prevent disappearing 1px borders
        const liveTiles = tileRefs.current.filter(Boolean) as HTMLDivElement[]
        liveTiles.forEach(tile => { tile.style.willChange = '' })
      },
    })
    tlRef.current = tl

    // All tiles fly in together — timed animation, not scroll-driven
    tiles.forEach((tile, i) => {
      const [dx, dy] = FLY_FROM[i] ?? [0, -500]
      tl.fromTo(
        tile,
        { x: dx, y: dy, opacity: 0 },
        { x: 0,  y: 0,  opacity: 1, duration: 0.7, ease: 'power3.out' },
        i * 0.06   // stagger — all tiles arrive within ~1.4s
      )
    })

    // Detail panel fades in early alongside the first tiles
    tl.to(detail, { opacity: 1, duration: 0.4 }, 0.3)

    // Scroll-lock trigger — fires every time Frame3 enters the viewport.
    // Kept alive for the component's lifetime so it can re-fire on re-entry.
    // suppressLockRef lets handleContinue skip the spurious onEnter that GSAP
    // produces when it recalibrates from 0→actual after unlockScroll().
    lockTriggerRef.current = ScrollTrigger.create({
      trigger: wrapper,
      start: 'top top',
      onEnter: () => {
        if (suppressLockRef.current) {
          suppressLockRef.current = false
          return
        }
        // If a later frame is being restored after a page refresh, don't snap back here
        const activeFrame = sessionStorage.getItem('activeFrame')
        if (activeFrame && activeFrame !== 'frame3') return
        const wrapperY = wrapper.getBoundingClientRect().top + window.scrollY
        window.scrollTo({ top: wrapperY, behavior: 'instant' })
        lockScroll()
      },
    })

    return () => {
      tl.scrollTrigger?.kill()
      lockTriggerRef.current?.kill()
      lockTriggerRef.current = null
    }
  }, [])

  // ── Navigation handlers ──────────────────────────────────────────────────────
  function handleRestart() {
    resetToHidden()

    if (tlRef.current) {
      // Kill the completed ScrollTrigger so GSAP loses its "already entered"
      // state. Without this, the trigger won't fire onEnter → restart when the
      // user scrolls back to Frame3 after jumping to the top.
      tlRef.current.scrollTrigger?.kill()
      // Seek to time=0 (paused) so the timeline is clean for the next replay.
      tlRef.current.pause(0)
      // Reattach a fresh ScrollTrigger to the same timeline so it will restart
      // the fly-in animation the next time Frame3 enters the viewport.
      if (wrapperRef.current) {
        ScrollTrigger.create({
          trigger: wrapperRef.current,
          start: 'top top',
          toggleActions: 'restart none none none',
          animation: tlRef.current,
        })
      }
    }

    restartExperience()
  }

  function handleBack() {
    tlRef.current?.pause()

    // Fade the scene out upward first, then instant-scroll — mirrors the
    // smooth float-in that Frame4's Back uses when returning here.
    const scene = document.getElementById('frame3-scene')
    gsap.to(scene ?? [], {
      opacity: 0,
      y: -48,
      duration: 0.35,
      ease: 'power2.in',
      onComplete: () => {
        resetToHidden()   // scatters tiles + hides grid & detail
        // Restore scene so the next fly-in starts from a clean state
        if (scene) gsap.set(scene, { clearProps: 'transform,opacity' })

        unlockScroll()
        // Land on "Twelve ways to live in the city" (t≈17 in Frame2 timeline)
        const frame2 = document.getElementById('frame2')
        const frame3 = document.getElementById('frame3')
        if (frame2 && frame3) {
          const frame2Y = frame2.getBoundingClientRect().top + window.scrollY
          const frame3Y = frame3.getBoundingClientRect().top + window.scrollY
          const depth   = frame3Y - frame2Y
          window.scrollTo({ top: frame2Y + depth * (17 / 19.5), behavior: 'instant' })
        }
      },
    })
  }

  function handleContinue() {
    // Suppress the spurious lockTrigger onEnter that GSAP fires when it
    // recalibrates its internal scroll position after unlockScroll().
    suppressLockRef.current = true
    sessionStorage.setItem('activeFrame', 'frame5')
    unlockScroll()
    const frame5 = document.getElementById('frame5')
    if (frame5) {
      const y = frame5.getBoundingClientRect().top + window.scrollY
      window.scrollTo({ top: y, behavior: 'instant' })
      // Animate Frame5 floating in from below
      gsap.fromTo(
        frame5,
        { opacity: 0, y: 56 },
        { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out', clearProps: 'transform,opacity' },
      )
    }
    lockScroll()
  }

  // Close tooltip whenever the user switches species
  useEffect(() => { setTooltipOpen(false) }, [selected])

  const sp = SPECIES.find(s => s.id === selected) ?? SPECIES[0]
  const TrendIcon = TREND_ICON[sp.trend]

  return (
    <div className={styles.wrapper} ref={wrapperRef} id="frame3">
      <div className={styles.scene} id="frame3-scene">

        {/* ── Left: 3 × 4 tile grid ────────────────────────────────────────── */}
        <div className={styles.grid} ref={gridRef}>
          {SPECIES.map((bird, i) => {
            const isSelected = bird.id === selected
            const TileTrendIcon = TREND_ICON[bird.trend]
            return (
              <div
                key={bird.id}
                className={`${styles.tile} ${isSelected ? styles.tileSelected : ''}`}
                ref={(el: HTMLDivElement | null) => { tileRefs.current[i] = el }}
                onClick={() => setSelected(bird.id)}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelected(bird.id) }}
              >
                <span className={styles.tileName}>{bird.name}</span>

                <div className={styles.tileSilhouette}>
                  <img
                    src={isSelected ? bird.tilePng : bird.silhouette}
                    alt={bird.name}
                    className={`${styles.tileImg} ${isSelected ? styles.tileImgPhoto : ''}`}
                    draggable={false}
                  />
                </div>

                <TileTrendIcon
                  className={`${styles.trendIcon} ${isSelected ? styles.trendIconSelected : ''}`}
                  aria-label={bird.trend}
                  width={24}
                  height={24}
                />
              </div>
            )
          })}
        </div>

        {/* ── Right: detail panel ──────────────────────────────────────────── */}
        <div className={styles.detail} ref={detailRef}>

          {/* key forces remount + CSS fade-in on species change */}
          <div key={selected} className={styles.detailContent}>
            <img
              src={sp.photo}
              alt={sp.name}
              className={styles.detailPhoto}
              draggable={false}
            />

            <div className={styles.detailText}>
              <h3 className={styles.detailName}>{sp.name}</h3>
              <p  className={styles.detailPolish}>{sp.polishName}</p>
              <p  className={styles.detailDesc}>{sp.description}</p>

              <div className={styles.tags}>
                <span className={styles.tag}>
                  <span className={styles.tagLabel}>Polish population:</span>
                  <strong>{sp.population}</strong>
                </span>
                <span className={styles.tag}>
                  <span className={styles.tagLabel}>Trend:</span>
                  <TrendIcon
                    className={styles.tagTrendIcon}
                    aria-hidden="true"
                    width={20}
                    height={20}
                  />
                  <strong>{sp.trend}</strong>
                </span>
                <span className={styles.tag}>
                  <span className={styles.tagLabel}>Zone:</span>
                  <strong>{sp.zone}</strong>
                </span>
                {sp.habitat && (
                  <span className={styles.tag}>
                    <span className={styles.tagLabel}>Habitat:</span>
                    <strong>{sp.habitat}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.detailNav}>
            <NavButton onBack={handleBack} onContinue={handleContinue} onRestart={handleRestart} />
          </div>

          {/* ── Tooltip: data-source info ──────────────────────────────────── */}
          <div className={styles.tooltip}>
            <button
              className={`${styles.tooltipBtn} ${tooltipOpen ? styles.tooltipBtnActive : ''}`}
              onClick={() => setTooltipOpen(o => !o)}
              aria-label="About this data"
              aria-expanded={tooltipOpen}
            >
              <InfoIcon width={24} height={24} aria-hidden="true" />
            </button>

            {tooltipOpen && (
              <div className={styles.tooltipPanel}>
                <p className={styles.tooltipText}>
                  Trend types (Growth, decline, etc.) from &ldquo;Monitoring of Birds of Poland&rdquo; / &ldquo;Monitoring Ptaków Polski&rdquo; published in the &ldquo;Nature Monitoring Bulletin&rdquo; / &ldquo;Biuletyn monitoringu przyrody&rdquo; no. 28 (2024).
                </p>
                <p className={styles.tooltipText}>
                  Monitoring of Birds of Poland is a government program implemented in Poland in 2006, to fill requirements of the EU Bird Directive: the effective protection and monitor favourable conservation status of endangered species.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
