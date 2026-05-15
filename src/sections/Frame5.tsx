import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import styles from './Frame5.module.css'
import NavButton from '../components/NavButton'
import { lockScroll, unlockScroll } from '../utils/scrollLock'
import { restartExperience } from '../utils/restartExperience'

// ── Silhouettes (dark fill baked in — same assets as the tile grid) ───────────
import sil01 from '@assets/svg/silhouettes/vector-1.svg'   // Sandwich tern
import sil02 from '@assets/svg/silhouettes/vector-2.svg'   // Common swift
import sil03 from '@assets/svg/silhouettes/vector-3.svg'   // Jackdaw
import sil05 from '@assets/svg/silhouettes/vector-5.svg'   // Peregrine falcon
import sil07 from '@assets/svg/silhouettes/vector-7.svg'   // Black redstart

// ── Tile photos — shown when a bird is correctly matched ──────────────────────
import tileSwift    from '@assets/images/birds/swift-tile.png'
import tileTern     from '@assets/images/birds/tern-tile.png'
import tileJackdaw  from '@assets/images/birds/jackdaw-tile.png'
import tileFalcon   from '@assets/images/birds/falcon-tile.png'
import tileRedstart from '@assets/images/birds/redstart-tile.png'

// ── Nesting site photos — shown centred on hover of a matched pair ────────────
// "site-1 goes with common swift"; bird order top-to-bottom matches site number.
import site1 from '@assets/images/nesting/site-1.png'
import site2 from '@assets/images/nesting/site-2.png'
import site3 from '@assets/images/nesting/site-3.png'
import site4 from '@assets/images/nesting/site-4.png'
import site5 from '@assets/images/nesting/site-5.png'

// ── Data ──────────────────────────────────────────────────────────────────────
interface Bird {
  id:        string
  name:      string
  silhouette: string
  tilePng:   string
  sitePhoto: string
}

interface Site {
  id:    string
  lines: string[]
}

const BIRDS: Bird[] = [
  { id: 'swift',    name: 'Common swift',    silhouette: sil02, tilePng: tileSwift,    sitePhoto: site1 },
  { id: 'tern',     name: 'Sandwich tern',   silhouette: sil01, tilePng: tileTern,     sitePhoto: site2 },
  { id: 'jackdaw',  name: 'Jackdaw',         silhouette: sil03, tilePng: tileJackdaw,  sitePhoto: site3 },
  { id: 'falcon',   name: 'Peregrine falcon', silhouette: sil05, tilePng: tileFalcon,  sitePhoto: site4 },
  { id: 'redstart', name: 'Black redstart',  silhouette: sil07, tilePng: tileRedstart, sitePhoto: site5 },
]

const SITES: Site[] = [
  { id: 'beach-sand',    lines: ['Beach sand'] },
  { id: 'power-plant',   lines: ['Power plant chimneys'] },
  { id: 'rooftops',      lines: ['Rooftops and ledges', 'in industrial complexes'] },
  { id: 'building-gaps', lines: ['Building gaps and crevices'] },
  { id: 'church-spires', lines: ['Church spires, chimneys'] },
]

const ANSWERS: Record<string, string> = {
  swift:    'building-gaps',
  tern:     'beach-sand',
  jackdaw:  'church-spires',
  falcon:   'power-plant',
  redstart: 'rooftops',
}

// ── Layout constants (px, relative to the container element's top-left) ───────
const ROW_H    = 96
const ROW_CY   = 48    // vertical centre of a row (ROW_H / 2)
const LEFT_HX  = 342   // left handle centre x  (354 − 12)
const RIGHT_HX = 926   // right handle centre x (354 + 560 + 12)
const H_SPAN   = RIGHT_HX - LEFT_HX
const CP_FRAC  = 0.45
const CP_OFF   = H_SPAN * CP_FRAC

const PHOTO_W  = 240
const PHOTO_H  = 240
const GAP_CX   = (LEFT_HX + RIGHT_HX) / 2  // horizontal centre of the gap
const HIT_R    = 40

// ── Helpers ───────────────────────────────────────────────────────────────────
function birdY(i: number) { return i * ROW_H + ROW_CY }
function siteY(i: number) { return i * ROW_H + ROW_CY }

function bezier(x1: number, y1: number, x2: number, y2: number): string {
  return `M ${x1},${y1} C ${x1 + CP_OFF},${y1} ${x2 - CP_OFF},${y2} ${x2},${y2}`
}

function dragBezier(x1: number, y1: number, x2: number, y2: number): string {
  const dx = x2 - x1
  const cp = Math.abs(dx) * CP_FRAC
  const s  = dx >= 0 ? 1 : -1
  return `M ${x1},${y1} C ${x1 + cp * s},${y1} ${x2 - cp * s},${y2} ${x2},${y2}`
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Frame5() {
  const sceneRef     = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [connections,   setConnections]   = useState<Map<string, string>>(new Map())
  const [dragging,      setDragging]      = useState<{
    birdId: string; birdIndex: number; mx: number; my: number
  } | null>(null)
  const [hoveredPair,   setHoveredPair]   = useState<string | null>(null)
  // Which unmatched handle is currently hovered (shows inner dot)
  const [hoveredHandle, setHoveredHandle] = useState<string | null>(null)

  const allConnected = connections.size === BIRDS.length

  // ── Reset state when arriving from restart or Frame6 back-navigation ─────────
  useEffect(() => {
    function onReset() {
      setConnections(new Map())
      setDragging(null)
      setHoveredPair(null)
      setHoveredHandle(null)
    }
    window.addEventListener('frame5:reset', onReset)
    return () => window.removeEventListener('frame5:reset', onReset)
  }, [])

  // ── Restore after page refresh ────────────────────────────────────────────────
  // If the user refreshed while on Frame5, scroll back here and re-lock.
  // requestAnimationFrame defers until after GSAP + ScrollTrigger have initialised
  // (and Frame3's lockTrigger has already checked sessionStorage and bailed out).
  useEffect(() => {
    if (sessionStorage.getItem('activeFrame') === 'frame5') {
      requestAnimationFrame(() => {
        const el = document.getElementById('frame5')
        if (el) {
          window.scrollTo({ top: el.offsetTop, behavior: 'instant' })
          lockScroll()
        }
      })
    }
  }, [])

  // ── Navigation ───────────────────────────────────────────────────────────────
  function handleBack() {
    sessionStorage.removeItem('activeFrame')
    unlockScroll()
    const frame3 = document.getElementById('frame3')
    if (frame3) {
      window.scrollTo({ top: frame3.getBoundingClientRect().top + window.scrollY, behavior: 'instant' })
    }
    lockScroll()
    const scene3 = document.getElementById('frame3-scene')
    if (scene3) {
      gsap.fromTo(scene3,
        { opacity: 0, y: -56 },
        { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out', clearProps: 'transform,opacity' },
      )
    }
  }

  function handleContinue() {
    // Place Frame6 at progress=0 (start state) before revealing it
    window.dispatchEvent(new CustomEvent('frame6:goto', { detail: { progress: 0 } }))
    const frame6 = document.getElementById('frame6')
    if (frame6) {
      document.body.style.backgroundColor = '#087BFF'
      // Document scroll stays locked — window.scrollTo still moves the viewport
      window.scrollTo({ top: frame6.offsetTop, behavior: 'instant' })
      gsap.fromTo(
        '#frame6',
        { opacity: 0, y: 56 },
        {
          opacity: 1, y: 0, duration: 0.55, ease: 'power3.out', clearProps: 'transform,opacity',
          onComplete: () => { document.body.style.backgroundColor = '' },
        },
      )
    }
  }

  function handleRestart() { restartExperience() }

  // ── Show Answers / Unmatch ────────────────────────────────────────────────────
  function handleToggleAnswers() {
    if (allConnected) {
      setConnections(new Map())
      setHoveredPair(null)
    } else {
      setConnections(new Map(Object.entries(ANSWERS)))
    }
  }

  // ── Drag start ───────────────────────────────────────────────────────────────
  function startDrag(birdId: string, birdIndex: number, e: React.MouseEvent) {
    if (connections.has(birdId)) return
    e.preventDefault()
    setHoveredHandle(null)
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    setDragging({
      birdId,
      birdIndex,
      mx: e.clientX - rect.left,
      my: e.clientY - rect.top,
    })
  }

  // ── Global mouse handlers while dragging ──────────────────────────────────────
  useEffect(() => {
    if (!dragging) return

    function onMove(e: MouseEvent) {
      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      setDragging(d => d
        ? { ...d, mx: e.clientX - rect.left, my: e.clientY - rect.top }
        : null
      )
    }

    function onUp(e: MouseEvent) {
      const container = containerRef.current
      if (!container) { setDragging(null); return }
      const rect = container.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top

      let hitSiteId: string | null = null
      SITES.forEach((site, si) => {
        const dx = mx - RIGHT_HX
        const dy = my - siteY(si)
        if (Math.hypot(dx, dy) < HIT_R) hitSiteId = site.id
      })

      if (hitSiteId && dragging) {
        const alreadyTaken = [...connections.values()].includes(hitSiteId)
        if (!alreadyTaken && ANSWERS[dragging.birdId] === hitSiteId) {
          setConnections(prev => new Map([...prev, [dragging.birdId, hitSiteId!]]))
        }
      }
      setDragging(null)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
    }
  }, [dragging, connections])

  // ── Hover helpers ─────────────────────────────────────────────────────────────
  function onEnterBird(birdId: string) {
    if (dragging) return
    if (connections.has(birdId)) setHoveredPair(birdId)
  }
  function onEnterSite(siteId: string) {
    if (dragging) return
    const birdId = [...connections.entries()].find(([, s]) => s === siteId)?.[0]
    if (birdId) setHoveredPair(birdId)
  }
  function onEnterConnector(birdId: string) {
    if (dragging) return
    if (connections.has(birdId)) setHoveredPair(birdId)
  }
  function onLeaveHover() { setHoveredPair(null) }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div
      id="frame5"
      ref={sceneRef}
      className={styles.scene}
      data-dragging={dragging ? '' : undefined}
    >

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className={styles.header}>
        <h2 className={styles.title}>
          Can you match these birds with their nesting sites?
        </h2>
        <button className={styles.answerBtn} onClick={handleToggleAnswers}>
          {allConnected ? 'Unmatch' : 'Show answers'}
        </button>
      </header>

      {/* ── Centred main area ───────────────────────────────────────────── */}
      <div className={styles.main}>

        {/* ── Matching container ────────────────────────────────────────── */}
        <div className={styles.container} ref={containerRef}>

          {/* Left column — birds */}
          <div className={styles.colLeft}>
            {BIRDS.map((bird, bi) => {
              const isMatched      = connections.has(bird.id)
              const isDimmed       = hoveredPair !== null && hoveredPair !== bird.id
              const isDraggingThis = dragging?.birdId === bird.id
              const showDot        = isMatched || isDraggingThis || hoveredHandle === bird.id
              return (
                <div
                  key={bird.id}
                  className={`${styles.row} ${isDimmed ? styles.rowDimmed : ''}`}
                  onMouseEnter={() => onEnterBird(bird.id)}
                  onMouseLeave={onLeaveHover}
                >
                  <span className={styles.birdName}>{bird.name}</span>

                  {/* Silhouette / tile photo */}
                  <div className={styles.silWrap}>
                    <div className={styles.silInner}>
                      <img
                        src={isMatched ? bird.tilePng : bird.silhouette}
                        alt={bird.name}
                        className={isMatched ? styles.tilePng : styles.silSvg}
                        draggable={false}
                      />
                    </div>
                  </div>

                  {/* Bird handle — drag origin */}
                  <button
                    className={`${styles.handle} ${showDot ? styles.handleFilled : ''}`}
                    onMouseDown={e => startDrag(bird.id, bi, e)}
                    onMouseEnter={() => { if (!isMatched && !dragging) setHoveredHandle(bird.id) }}
                    onMouseLeave={() => setHoveredHandle(null)}
                    disabled={isMatched}
                    aria-label={`Connect ${bird.name}`}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.3)" />
                      {showDot && <circle cx="12" cy="12" r="4" fill="white" />}
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>

          {/* Right column — nesting sites */}
          <div className={styles.colRight}>
            {SITES.map((site, _si) => {
              const connectedBirdId = [...connections.entries()].find(([, s]) => s === site.id)?.[0] ?? null
              const isMatched = connectedBirdId !== null
              const isDimmed  = hoveredPair !== null && hoveredPair !== connectedBirdId
              return (
                <div
                  key={site.id}
                  className={`${styles.row} ${styles.rowRight} ${isDimmed ? styles.rowDimmed : ''}`}
                  onMouseEnter={() => onEnterSite(site.id)}
                  onMouseLeave={onLeaveHover}
                >
                  {/* Site handle — drop target (visual only) */}
                  <div className={`${styles.handle} ${styles.handleSite} ${isMatched ? styles.handleFilled : ''}`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.3)" />
                      {isMatched && <circle cx="12" cy="12" r="4" fill="white" />}
                    </svg>
                  </div>

                  <div className={styles.siteLabel}>
                    {site.lines.map((line, li) => (
                      <span key={li} className={styles.siteLine}>{line}</span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── SVG connector overlay ──────────────────────────────────── */}
          <svg className={styles.connectorSvg} aria-hidden="true">
            {/* Permanent correct connections */}
            {[...connections.entries()].map(([birdId, siteId]) => {
              const bi = BIRDS.findIndex(b => b.id === birdId)
              const si = SITES.findIndex(s => s.id === siteId)
              const y1 = birdY(bi)
              const y2 = siteY(si)
              const isDimmed  = hoveredPair !== null && hoveredPair !== birdId
              const d = bezier(LEFT_HX, y1, RIGHT_HX, y2)
              return (
                <g key={birdId}>
                  {/* Invisible wide stroke — hover hit area */}
                  <path
                    d={d}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="24"
                    style={{ cursor: 'default', pointerEvents: 'stroke' } as React.CSSProperties}
                    onMouseEnter={() => onEnterConnector(birdId)}
                    onMouseLeave={onLeaveHover}
                  />
                  {/* Visible connector */}
                  <path
                    d={d}
                    fill="none"
                    stroke="white"
                    strokeWidth="2.5"
                    opacity={isDimmed ? 0.25 : 1}
                    style={{ pointerEvents: 'none' } as React.CSSProperties}
                  />
                </g>
              )
            })}

            {/* Active drag connector */}
            {dragging && (() => {
              const y1 = birdY(dragging.birdIndex)
              return (
                <path
                  d={dragBezier(LEFT_HX, y1, dragging.mx, dragging.my)}
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  opacity="0.7"
                  style={{ pointerEvents: 'none' } as React.CSSProperties}
                />
              )
            })()}
          </svg>

          {/* ── Nesting site photo on hovered pair ────────────────────── */}
          {hoveredPair && (() => {
            const bird   = BIRDS.find(b => b.id === hoveredPair)!
            const siteId = connections.get(hoveredPair)!
            const bi     = BIRDS.findIndex(b => b.id === hoveredPair)
            const si     = SITES.findIndex(s => s.id === siteId)
            const midY   = (birdY(bi) + siteY(si)) / 2
            return (
              <img
                key={hoveredPair}
                src={bird.sitePhoto}
                alt="Nesting site"
                className={styles.sitePhoto}
                style={{
                  left:   GAP_CX - PHOTO_W / 2,
                  top:    midY   - PHOTO_H / 2,
                  width:  PHOTO_W,
                  height: PHOTO_H,
                }}
                draggable={false}
                onMouseEnter={() => onEnterConnector(hoveredPair)}
                onMouseLeave={onLeaveHover}
              />
            )
          })()}

        </div>{/* container */}
      </div>{/* main */}

      {/* ── Navigation buttons ───────────────────────────────────────── */}
      <div className={styles.navWrap}>
        <NavButton onBack={handleBack} onContinue={handleContinue} onRestart={handleRestart} />
      </div>

    </div>
  )
}
