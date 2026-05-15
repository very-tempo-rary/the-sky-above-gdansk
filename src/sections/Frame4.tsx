import { useState, useRef, useLayoutEffect, useEffect } from 'react'
import gsap from 'gsap'
import styles from './Frame4.module.css'
import NavButton from '../components/NavButton'
import { restartExperience } from '../utils/restartExperience'

// ── Map SVG (inline via ?react so we can highlight district paths with CSS) ───
import GdanskMap from '@assets/svg/map/gdansk-districts.svg?react'

// ── Silhouette SVGs for the map hotspots (inactive state) ─────────────────────
import silSeagull from '@assets/svg/silhouettes/vector.svg'
import silTern    from '@assets/svg/silhouettes/vector-1.svg'
import silSwift   from '@assets/svg/silhouettes/vector-2.svg'
import silJackdaw from '@assets/svg/silhouettes/vector-3.svg'
import silFalcon  from '@assets/svg/silhouettes/vector-5.svg'
import silKestrel from '@assets/svg/silhouettes/vector-6.svg'
import silSparrow from '@assets/svg/silhouettes/vector-8.svg'

// ── Tile photos for active state on the map hotspot ───────────────────────────
import tileSeagull  from '@assets/images/birds/seagull-tile.png'
import tileTern     from '@assets/images/birds/tern-tile.png'
import tileSwift    from '@assets/images/birds/swift-tile.png'
import tileJackdaw  from '@assets/images/birds/jackdaw-tile.png'
import tileFalcon   from '@assets/images/birds/falcon-tile.png'
import tileKestrel  from '@assets/images/birds/kestrel-tile.png'
import tileSparrow  from '@assets/images/birds/sparrow-tile.png'

// ── Note icon ─────────────────────────────────────────────────────────────────
import noteIconSvg from '@assets/svg/silhouettes/vector-2.svg'

// ── Spotlight path data (from assets/svg/spotlights/*.svg) ───────────────────
// left = scene x where the spotlight wrapper begins (district right edge at 1440px).
// Path d coords are in Figma's 810px canvas system; adjustPath() shifts the
// left-tip y-values by (sceneH−810)/2 so they track the vertically-centred map.
const SPOTLIGHT: Record<string, { viewW: number; left: number; d: string }> = {
  swifts:           { viewW: 554, left: 406, d: 'M8.5 286.5L554 0V810L0 364.5L8.5 286.5Z' },
  'bird-feeder':    { viewW: 749, left: 211, d: 'M4 240L749 0V810L0 362L4 240Z' },
  'falcon-cam':     { viewW: 749, left: 211, d: 'M4 240L749 0V810L0 362L4 240Z' },
  'civic-budget':   { viewW: 621, left: 325, d: 'M18.5 407L621 0V810L0 440L18.5 407Z' },
  'falco-gedanense':{ viewW: 548, left: 412, d: 'M0 400.5L547.5 0V810L13.5 472L0 400.5Z' },
  'bird-island':    { viewW: 526, left: 434, d: 'M5 275L526 0V810L13 405L7 400L7 368L0 345L11 325L17 305L17 285L5 275Z' },
  'seagull-shoal':  { viewW: 91,  left: 869, d: 'M4 411L91 0V810L0 600Z' },
}

// Stogi's left-edge indent is now baked directly into the path geometry, so no clip needed.
const SPOTLIGHT_CLIP: Record<string, (sceneH: number) => string> = {}

// ── Adjust Figma 810px path coords to actual scene height ────────────────────
// The path y-values (except top=0 and bottom=810) are scene-absolute pixel
// positions derived from Figma's 810px canvas.  When the scene is taller the
// map stays vertically centred, shifting every district by (sceneH−810)/2.
// This function applies that same shift so the beam tip stays on the district.
function adjustPath(d: string, sceneH: number): string {
  if (sceneH === 810) return d
  const delta = (sceneH - 810) / 2
  return d
    .replace('V810', `V${sceneH}`)
    .replace(/([ML])\s*(-?\d+\.?\d*)\s+(-?\d+\.?\d*)/g, (_, cmd, x, y) => {
      const yv = parseFloat(y)
      if (yv === 0) return `${cmd}${x} ${y}`          // top-right corner: keep at 0
      return `${cmd}${x} ${(yv + delta).toFixed(1)}`  // shift everything else
    })
}

// ── Sidebar initiative photos ─────────────────────────────────────────────────
import photoSwifts     from '@assets/images/initiatives/swifts-against-mosquitoes.png'
import photoBirdFeeder from '@assets/images/initiatives/bird-feeder.png'
import photoFalconCam  from '@assets/images/initiatives/falcon-cam.png'
import photoCivic      from '@assets/images/initiatives/civic-budget-nest-boxes.png'
import photoFalco      from '@assets/images/initiatives/falco-gedanense.png'
import photoBirdIsland from '@assets/images/initiatives/bird-island.png'
import photoSeagull    from '@assets/images/initiatives/seagull-shoal.png'

// ── Types ─────────────────────────────────────────────────────────────────────
interface Initiative {
  id: string
  name: string
  nameIsItalic?: boolean
  polishName: string
  species: string
  where: string
  /** Sidebar photo */
  photo: string
  /** Inactive-state SVG silhouette on the map */
  silhouette: string
  /** Active-state tile photo on the map hotspot */
  tilePng: string
  /** Position as % of the 879×509 map area (NOT the full scene).
   *  Calculated as: (figma_center_x − 40) / 879  and  (figma_center_y − 150.5) / 509 */
  mapX: string
  mapY: string
  district: string
  /** SVG <path> IDs that form this district (identified via isPointInFill) */
  districtPaths: string[]
  /** District label position — derived from the district path's bbox in the SVG.
   *  labelX = center of district bbox as % of mapWrap width.
   *  labelY = CSS calc expression: district top edge % minus 24px gap. */
  districtLabelX: string
  districtLabelY: string
  paragraphs: Array<string | React.ReactNode>
}

// ── Data ──────────────────────────────────────────────────────────────────────
const INITIATIVES: Initiative[] = [
  {
    id: 'swifts',
    name: 'Swifts against mosquitoes',
    polishName: 'Jerzyki w walce z komarami',
    species: 'Common Swift',
    where: 'Starowiejska Street / Letnica',
    photo: photoSwifts,
    silhouette: silSwift,
    tilePng: tileSwift,
    mapX: '42.89%',
    mapY: '34.48%',
    district: 'Letnica',
    districtPaths: ['path1334'],
    districtLabelX: '42.90%',
    districtLabelY: 'calc(34.48% - 39px)',
    paragraphs: [
      'A swift can eat 20,000 insects in 24 hours.',
      <>The <em>Swifts against mosquitoes</em> project – placing 5 nest boxes for swifts on residential buildings – won the 2026 Green Civic Budget vote in the Letnica district. The goal: to both protect birds, and limit the number of mosquitoes in the area.</>,
      "This is far from the first ‘pro-swift’ initiative in Gdańsk, with the city having given out 350 boxes for people to install in 2010–13.",
    ],
  },
  {
    id: 'bird-feeder',
    name: 'The Bird Feeder Action',
    polishName: 'Akcja Karmnik',
    species: 'House Sparrow',
    where: 'Gdańsk Zoo / Oliwa',
    photo: photoBirdFeeder,
    silhouette: silSparrow,
    tilePng: tileSparrow,
    mapX: '19.91%',
    mapY: '19.94%',
    district: 'Oliwa',
    districtPaths: ['path1380'],
    districtLabelX: '22.01%',
    districtLabelY: 'calc(19.94% - 39px)',
    paragraphs: [
      'The Bird Feeder Action is a country-wide bird banding program the Gdańsk Zoo takes part in. The banding is done every winter – this is when birds are easiest to catch, as they gather more around feeders. One species particularly dependant on feeders is the sparrow: tiny, and prone to cold.',
      'The Zoo sessions are open to the public, which makes them a great opportunity to learn about different bird species, their food, and the crucial role of banding.',
    ],
  },
  {
    id: 'falcon-cam',
    name: 'Falcon cam',
    polishName: 'Kamera do obserwacji sokołów',
    species: 'Peregrine Falcon',
    where: 'Olivia Star / Oliwa',
    photo: photoFalconCam,
    silhouette: silFalcon,
    tilePng: tileFalcon,
    mapX: '27.07%',
    mapY: '25.64%',
    district: 'Oliwa',
    districtPaths: ['path1380'],
    districtLabelX: '22.01%',
    districtLabelY: 'calc(25.64% - 39px)',
    paragraphs: [
      'Falcons are enough of a rarity in Poland to inspire not only coverage in the local media, but even projects that livestream their comings and goings.',
      "The tallest building in Tricity started being visited by a falcon while still under construction. A nest box and a livestreaming camera were placed at the top; unfortunately, so far the birds have not moved in.",
      'A similar setup used to be placed on a local refinery chimney (falcons lived there as recently as 2023), and one more camera is operating at a power plant chimney in Gdynia – with a pair of falcons nesting there now.',
    ],
  },
  {
    id: 'civic-budget',
    name: 'Civic Budget nest boxes',
    polishName: 'Budki lęgowe z Budżetu Obywatelskiego',
    species: 'Jackdaw',
    where: 'Liszta Street / Suchanino',
    photo: photoCivic,
    silhouette: silJackdaw,
    tilePng: tileJackdaw,
    mapX: '35.04%',
    mapY: '53.54%',
    district: 'Suchanino',
    districtPaths: ['path10171'],
    districtLabelX: '34.96%',
    districtLabelY: 'calc(53.54% - 39px)',
    paragraphs: [
      "Green Civic Budget 2024 winner, this project involved placing 50 nest boxes in one of Suchanino district’s leafy green corridors.",
      'The set included models for larger birds, like owls – or jackdaws, who have been spotted pecking out nesting holes in the walls of nearby apartment blocks.',
      'As of 2022, there were 2,200 nest boxes for various birds and squirrels all around Gdańsk.',
    ],
  },
  {
    id: 'falco-gedanense',
    name: 'Falco gedanense',
    nameIsItalic: true,
    polishName: 'Falco gedanense',
    species: 'Common Kestrel',
    where: "St. John’s Church / Main City",
    photo: photoFalco,
    silhouette: silKestrel,
    tilePng: tileKestrel,
    mapX: '44.94%',
    mapY: '51.18%',
    district: 'Śródmieście',
    districtPaths: ['path4962'],
    districtLabelX: '44.15%',
    districtLabelY: 'calc(51.18% - 39px)',
    paragraphs: [
      <><em>Falco gedanense</em> is an invented Latin name for the kestrel, meaning &lsquo;the Gdańsk falcon&rsquo;. These miniature raptors seem drawn to the city&rsquo;s many gothic churches.</>,
      "The project consists of a range of initiatives sparked in 2014 by just one passionate activist: Justyna Manuszewska. They include installing nest boxes, population monitoring, banding, educational events, and even workshops like painting the boxes in folk patterns. It’s Tricity’s only biodiversity compensation program for birds of prey in the urban environment.",
      "St. John’s Church is one of the kestrels’ nesting locations, and the cultural center it houses organized a talk about them last year. As of 2022, there were 38 nest boxes for the birds in Gdańsk. One of them was placed on the iconic M3 shipyard crane.",
    ],
  },
  {
    id: 'bird-island',
    name: 'Bird Island',
    polishName: 'Ptasia Wyspa',
    species: 'Sandwich Tern',
    where: 'North Port / Stogi',
    photo: photoBirdIsland,
    silhouette: silTern,
    tilePng: tileTern,
    mapX: '51.76%',
    mapY: '31.53%',
    district: 'Stogi',
    districtPaths: ['path2080'],
    districtLabelX: '51.38%',
    districtLabelY: 'calc(31.53% - 39px)',
    paragraphs: [
      "Bird Island is a 2 km² artificial nesting site on a breakwater 2 km offshore, designed to mimic natural conditions for common and sandwich terns. It hosts Poland’s only sandwich tern colony, with 846 pairs recorded in 2025.",
      'The birds were relocated from the deteriorating Ore Pier in the North Port. To encourage the move, access to the pier was discouraged, while the new site used decoys, recorded calls, and nesting materials to attract them. The colony relocated within about a month.',
      "Unlike the pier, the island is protected from land predators and storms. In 2025, around 1,000 sandwich tern fledglings were raised there, marking one of the species’ most successful breeding seasons in Poland.",
    ],
  },
  {
    id: 'seagull-shoal',
    name: 'Seagull Shoal Reserve',
    polishName: 'Mewia Łacha',
    species: 'Herring Gull',
    where: 'Sobieszewo Island',
    photo: photoSeagull,
    silhouette: silSeagull,
    tilePng: tileSeagull,
    mapX: '97.04%',
    mapY: '55.50%',
    district: 'Sobieszewo',
    districtPaths: ['path1316'],
    districtLabelX: '83.23%',
    districtLabelY: 'calc(55.50% - 39px)',
    paragraphs: [
      "The Vistula river mouth is one of Poland’s most fascinating areas in terms of ornithology – with both a huge wealth of species (even 275), and very large seasonal concentrations of birds like gulls, ducks and waders. The winter gatherings of seagulls and ducks can reach over 100,000 birds.",
      'The Reserve is easily reachable by bus, but it only permits entrance on one path. The biggest threat to bird breeding here are tourists.',
    ],
  },
]


// ── Component ─────────────────────────────────────────────────────────────────
export default function Frame4() {
  const [selectedId, setSelectedId] = useState<string>(INITIATIVES[0].id)
  const panelRef  = useRef<HTMLDivElement>(null)
  const sceneRef  = useRef<HTMLElement>(null)
  const [sceneH, setSceneH] = useState(810)

  // Track actual scene height so spotlight viewBox + path stay aligned with map
  useLayoutEffect(() => {
    const el = sceneRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setSceneH(el.offsetHeight))
    ro.observe(el)
    setSceneH(el.offsetHeight)
    return () => ro.disconnect()
  }, [])

  // ── Reset selected initiative when restarting ────────────────────────────────
  useEffect(() => {
    function onReset() { setSelectedId(INITIATIVES[0].id) }
    window.addEventListener('frame4:reset', onReset)
    return () => window.removeEventListener('frame4:reset', onReset)
  }, [])

  const selected = INITIATIVES.find(i => i.id === selectedId) ?? INITIATIVES[0]

  function handleSelect(id: string) {
    setSelectedId(id)
    panelRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Navigation handlers ──────────────────────────────────────────────────────
  function handleRestart() { restartExperience() }

  function handleBack() {
    // Go back to Frame21 at its end state (blue, full text visible).
    // Pure opacity fade avoids revealing Frame7's dark background above Frame21.
    window.dispatchEvent(new CustomEvent('frame21:goto', { detail: { progress: 1 } }))
    const frame21 = document.getElementById('frame21')
    if (frame21) {
      window.scrollTo({ top: frame21.offsetTop, behavior: 'instant' })
      gsap.fromTo(
        '#frame21',
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: 'power1.out', clearProps: 'opacity' },
      )
    }
  }

  function handleContinue() {
    // placeholder — next frame not yet implemented
  }

  return (
    <section
      id="frame4"
      ref={sceneRef}
      className={styles.scene}
      data-initiative={selectedId}
    >
      {/* ── Layer 1: Map SVG (bottom — below spotlight) ────────────────────── */}
      <div className={styles.mapWrap} aria-hidden="true">
        <GdanskMap className={styles.mapSvg} />
      </div>

      {/* ── Layer 2: Spotlight beam (above map, below birds) ────────────────── */}
      {/* Wrapper div: top:0→bottom:0 fills full scene height, left:sp.left→right:480px.
          ViewBox height = sceneH so viewBox coords == scene coords (no offset math).
          adjustPath shifts left-tip y-values so the beam tracks the centred map. */}
      {(() => {
        const sp   = SPOTLIGHT[selectedId]
        if (!sp) return null
        const clip = SPOTLIGHT_CLIP[selectedId]?.(sceneH)
        const clipId = `spotlight-clip-${selectedId}`
        return (
          <div
            key={selectedId}
            className={styles.spotlightOverlay}
            style={{ left: sp.left }}
            aria-hidden="true"
          >
            <svg
              className={styles.spotlightSvg}
              viewBox={`0 0 ${sp.viewW} ${sceneH}`}
              preserveAspectRatio="none"
            >
              {clip && (
                <defs>
                  <clipPath id={clipId}>
                    <polygon points={clip} />
                  </clipPath>
                </defs>
              )}
              <path
                d={adjustPath(sp.d, sceneH)}
                fill="rgba(255,255,255,0.1)"
                clipPath={clip ? `url(#${clipId})` : undefined}
              />
            </svg>
          </div>
        )
      })()}

      {/* ── Layer 3: Birds + label (top — above spotlight) ──────────────────── */}
      {/* Same dimensions as the map layer so %-based hotspot coords still work. */}
      <div className={styles.mapWrap}>
        {/* Bird hotspots — left/top are % of mapWrap (879×509), not the scene */}
        {INITIATIVES.map(initiative => {
          const isActive = initiative.id === selectedId
          return (
            <button
              key={initiative.id}
              className={`${styles.hotspot} ${isActive ? styles.hotspotActive : ''}`}
              style={{ left: initiative.mapX, top: initiative.mapY }}
              onClick={() => handleSelect(initiative.id)}
              aria-label={`View initiative: ${initiative.name}`}
              aria-pressed={isActive}
            >
              <img
                src={isActive ? initiative.tilePng : initiative.silhouette}
                alt=""
                className={isActive ? styles.hotspotImgActive : styles.hotspotImg}
              />
            </button>
          )
        })}

        {/* District label — 24px above district top edge, centred on district */}
        <p
          className={styles.districtLabel}
          style={{ left: selected.districtLabelX, top: selected.districtLabelY }}
          key={selected.id}
        >
          {selected.district}
        </p>
      </div>

      {/* ── Title ────────────────────────────────────────────────────────── */}
      <h2 className={styles.title}>Initiatives to help bird life in Gdańsk</h2>

      {/* ── Note at bottom ────────────────────────────────────────────────── */}
      <div className={styles.note}>
        <img src={noteIconSvg} alt="" className={styles.noteIcon} />
        <p className={styles.noteText}>
          Click on the birds to find out about each project
        </p>
      </div>

      {/* ── Navigation buttons ───────────────────────────────────────────── */}
      <div className={styles.navBtnWrap}>
        <NavButton onBack={handleBack} onContinue={handleContinue} onRestart={handleRestart} />
      </div>

      {/* ── Side panel ───────────────────────────────────────────────────── */}
      <aside className={styles.panel} ref={panelRef}>
        <div className={styles.panelInner} key={selectedId}>
          <div className={styles.photoWrap}>
            <img src={selected.photo} alt={selected.name} className={styles.photo} />
          </div>

          {selected.nameIsItalic
            ? <h3 className={`${styles.initiativeName} ${styles.initiativeNameItalic}`}>{selected.name}</h3>
            : <h3 className={styles.initiativeName}>{selected.name}</h3>
          }

          <p className={styles.polishName}>{selected.polishName}</p>

          <div className={styles.tagSet}>
            <span className={styles.tag}>
              <span className={styles.tagLabel}>Featured species:</span>
              <span className={styles.tagValue}>{selected.species}</span>
            </span>
            <span className={styles.tag}>
              <span className={styles.tagLabel}>Where:</span>
              <span className={styles.tagValue}>{selected.where}</span>
            </span>
          </div>

          <div className={styles.body}>
            {selected.paragraphs.map((p, i) => (
              <p key={i} className={styles.bodyParagraph}>{p}</p>
            ))}
          </div>
        </div>
      </aside>
    </section>
  )
}
