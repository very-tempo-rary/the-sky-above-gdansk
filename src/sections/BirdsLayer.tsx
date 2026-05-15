import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './BirdsLayer.module.css'
import { getLastCursorPos, triggerCursorHide } from '../utils/cursorStore'

import birdA from '@assets/svg/additional/add-bird.svg'
import bird1 from '@assets/svg/additional/add-bird-1.svg'
import bird2 from '@assets/svg/additional/add-bird-2.svg'   // same SVG as Frame1 cursor
import bird3 from '@assets/svg/additional/add-bird-3.svg'
import bird4 from '@assets/svg/additional/add-bird-4.svg'
import bird5 from '@assets/svg/additional/add-bird-5.svg'
import bird6 from '@assets/svg/additional/add-bird-6.svg'

gsap.registerPlugin(ScrollTrigger)

// ── Linger delay before flying out when the user scrolls away ────────────────
const LINGER_MS = 700

interface BirdDef {
  src: string
  /** centre x as fraction of scene width  (0–1) */
  left: number
  /** centre y as fraction of scene height (0–1) */
  top: number
  /** container width in px (img fills 100% of this) */
  size: number
  /** SVG height-to-width ratio — needed for correct vertical centering.
   *  All birds except bird2 are 160×160 squares so default is 1.0.
   *  bird2 (add-bird-2) is 118×79, so its aspect is 79/118 ≈ 0.669.  */
  heightAspect?: number
  /** base rotation in degrees */
  rot: number
  /** which edge this bird enters / exits from */
  fromDir: 'left' | 'right' | 'top' | 'bottom' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'
  /** idle sway parameters */
  sway: { x: number; y: number; rot: number; dur: number }
  /** fly-in stagger offset in seconds */
  delay: number
  /** if true, fly-in starts from the last recorded cursor position */
  isCursorBird?: boolean
}

// ── Size notes ───────────────────────────────────────────────────────────────
// All SVGs are 160×160 squares except bird2 (118×79).
// All 160×160 birds share the same container size (BASE_SIZE) so their
// on-screen proportions exactly mirror the SVG canvases.
// bird2 is scaled by (118/160) to stay proportional to the same reference.
const BASE_SIZE = 180   // display size for the 160×160 canvas
const BIRDS: BirdDef[] = [
  // bird1 — large, top-right
  { src: bird1,  left: 0.76, top: 0.12, size: BASE_SIZE, rot: -10,
    fromDir: 'topRight',
    sway: { x: 25, y: -20, rot:  7, dur: 3.4 }, delay: 0.10 },
  // birdA — spread wings, upper-left
  { src: birdA,  left: 0.21, top: 0.25, size: BASE_SIZE, rot:  8,
    fromDir: 'topLeft',
    sway: { x: -21, y: 25, rot: -6, dur: 2.7 }, delay: 0.25 },
  // bird2 (cursor bird): 118×79 canvas — center, slightly right
  { src: bird2,  left: 0.54, top: 0.30, size: Math.round(118 / 160 * BASE_SIZE), heightAspect: 79 / 118, rot:  5,
    fromDir: 'top',
    sway: { x: 18, y: -22, rot:  6, dur: 3.1 }, delay: 0.00, isCursorBird: true },
  // bird3 — small silhouette, lower-right
  { src: bird3,  left: 0.79, top: 0.68, size: BASE_SIZE, rot: -6,
    fromDir: 'bottomRight',
    sway: { x: 22, y: -18, rot:  8, dur: 2.5 }, delay: 0.35 },
  // bird4 — diving, right-center
  { src: bird4,  left: 0.67, top: 0.50, size: BASE_SIZE, rot: -5,
    fromDir: 'right',
    sway: { x: 20, y: 22, rot:  6, dur: 3.8 }, delay: 0.20 },
  // bird5 — duck, lower-center
  { src: bird5,  left: 0.43, top: 0.76, size: BASE_SIZE, rot:  0,
    fromDir: 'bottom',
    sway: { x: 22, y: -26, rot: -6, dur: 3.2 }, delay: 0.40 },
  // bird6 — duck, lower-left
  { src: bird6,  left: 0.21, top: 0.63, size: BASE_SIZE, rot: -8,
    fromDir: 'bottomLeft',
    sway: { x: -21, y: -22, rot:  7, dur: 2.9 }, delay: 0.30 },
]

export default function BirdsLayer() {
  const birdRefs        = useRef<(HTMLDivElement | null)[]>([])
  const swayTweens      = useRef<(gsap.core.Tween | null)[]>([])
  const flyOutTimer     = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stateRef        = useRef<'hidden' | 'in' | 'out'>('hidden')
  // Stores the cursor position captured at flyIn time so flyOut can send
  // the cursor bird back to exactly where it came from.
  const activeCursorFrom = useRef<{ x: number; y: number } | null>(null)
  // True during the first RAF tick so the spurious onEnter+onLeave that GSAP
  // fires when the page is loaded at a scroll position past the trigger zone
  // (e.g. after a refresh on Frame3/4) are silently ignored.
  const ignoreInitRef   = useRef(true)

  useEffect(() => {
    const vpW = window.innerWidth
    const vpH = window.innerHeight

    const birds = birdRefs.current.filter(Boolean) as HTMLDivElement[]
    if (birds.length === 0) return

    // ── Pre-compute off-screen entry/exit offsets ────────────────────────────
    // Each offset moves the bird from its CSS rest position (left/top) to fully
    // outside the viewport edge it enters from.
    // The cursor bird's offset is computed fresh at flyIn() time so it detaches
    // from wherever the user's cursor actually was; here we just store null for it.
    function edgeOffset(b: BirdDef): { x: number; y: number } {
      const m    = 100                    // extra margin beyond edge
      const rx   = b.left * vpW           // bird's rest x in viewport px
      const ry   = b.top  * vpH           // bird's rest y in viewport px
      const offR = vpW - rx + m           // offset to push off right
      const offL = -(rx + m)              // offset to push off left
      const offB = vpH - ry + m           // offset to push off bottom
      const offT = -(ry + m)              // offset to push off top

      switch (b.fromDir) {
        case 'left':        return { x: offL, y: 0    }
        case 'right':       return { x: offR, y: 0    }
        case 'top':         return { x: 0,    y: offT }
        case 'bottom':      return { x: 0,    y: offB }
        case 'topLeft':     return { x: offL, y: offT }
        case 'topRight':    return { x: offR, y: offT }
        case 'bottomLeft':  return { x: offL, y: offB }
        case 'bottomRight': return { x: offR, y: offB }
      }
    }

    // Static edge offsets for non-cursor birds (cursor bird computed at fly-in time)
    const staticOffsets = BIRDS.map(b => b.isCursorBird ? null : edgeOffset(b))

    // ── Set initial hidden state ─────────────────────────────────────────────
    birds.forEach((el, i) => {
      const offset = staticOffsets[i] ?? edgeOffset(BIRDS[i])
      gsap.set(el, {
        rotation: BIRDS[i].rot,
        x: offset.x,
        y: offset.y,
        opacity: 0,
      })
    })

    // ── Fly-in ───────────────────────────────────────────────────────────────
    function flyIn() {
      if (ignoreInitRef.current || stateRef.current === 'in') return
      stateRef.current = 'in'

      if (flyOutTimer.current) {
        clearTimeout(flyOutTimer.current)
        flyOutTimer.current = null
      }

      // Capture cursor position NOW (at fly-in time) for the cursor bird,
      // then immediately kill the Frame1 cursor — same synchronous call stack,
      // so the swap happens in the same RAF frame with no async gap.
      const { x: cx, y: cy } = getLastCursorPos()
      triggerCursorHide()

      birds.forEach((el, i) => {
        const b = BIRDS[i]

        // Determine this bird's entry offset
        let offset: { x: number; y: number }
        if (b.isCursorBird && cx >= 0 && cy >= 0) {
          offset = { x: cx - b.left * vpW, y: cy - b.top * vpH }
          activeCursorFrom.current = offset
        } else {
          offset = staticOffsets[i] ?? edgeOffset(b)
          if (b.isCursorBird) activeCursorFrom.current = offset
        }

        // Kill any active tweens so fly-in can start cleanly
        gsap.killTweensOf(el)
        swayTweens.current[i]?.kill()
        swayTweens.current[i] = null

        if (b.isCursorBird) {
          // Cursor bird: place it at opacity 1 immediately so there is no
          // fade — it's a direct position swap with the Frame1 cursor.
          gsap.set(el, { rotation: b.rot, x: offset.x, y: offset.y, opacity: 1 })
          gsap.to(el, {
            x: 0, y: 0,           // position only — opacity stays at 1
            duration: 0.85,
            ease: 'power2.out',
            delay: b.delay,
            onComplete: () => {
              if (stateRef.current !== 'in') return
              swayTweens.current[i] = gsap.to(el, {
                x: b.sway.x, y: b.sway.y, rotation: b.rot + b.sway.rot,
                duration: b.sway.dur, ease: 'sine.inOut', repeat: -1, yoyo: true,
              })
            },
          })
        } else {
          // All other birds: normal fade-in from edge
          gsap.set(el, { rotation: b.rot, x: offset.x, y: offset.y, opacity: 0 })
          gsap.to(el, {
            x: 0, y: 0, opacity: 1,
            duration: 0.85,
            ease: 'power2.out',
            delay: b.delay,
            onComplete: () => {
              if (stateRef.current !== 'in') return
              swayTweens.current[i] = gsap.to(el, {
                x: b.sway.x, y: b.sway.y, rotation: b.rot + b.sway.rot,
                duration: b.sway.dur, ease: 'sine.inOut', repeat: -1, yoyo: true,
              })
            },
          })
        }
      })
    }

    // ── Fly-out ──────────────────────────────────────────────────────────────
    function flyOut() {
      if (stateRef.current === 'out' || stateRef.current === 'hidden') return
      stateRef.current = 'out'

      birds.forEach((el, i) => {
        const b = BIRDS[i]
        swayTweens.current[i]?.kill()
        swayTweens.current[i] = null
        gsap.killTweensOf(el)

        // Cursor bird flies back to the same spot it came from
        const offset = b.isCursorBird && activeCursorFrom.current
          ? activeCursorFrom.current
          : (staticOffsets[i] ?? edgeOffset(b))

        gsap.to(el, {
          x: offset.x,
          y: offset.y,
          opacity: 0,
          duration: 0.65,
          ease: 'power2.in',
          delay: b.delay * 0.5,
          onComplete: () => {
            if (stateRef.current === 'out') stateRef.current = 'hidden'
          },
        })
      })
    }

    function scheduleFlyOut() {
      if (ignoreInitRef.current) return
      if (flyOutTimer.current) clearTimeout(flyOutTimer.current)
      flyOutTimer.current = setTimeout(() => {
        flyOutTimer.current = null
        flyOut()
      }, LINGER_MS)
    }

    // ── ScrollTrigger ────────────────────────────────────────────────────────
    // Frame2 timeline: 2 units dwell + 19.5 animation = 21.5 units total.
    // Birds fly in at 0.3 units (stat still centred), fly out at 1.7 units
    // (before the stat starts moving at 2 units).
    // Both offsets are expressed as pixel distances from Frame2's top edge:
    //   offset = (units / 21.5) × (wrapper.offsetHeight − vpH)
    const wrapper = document.getElementById('frame2')
    if (!wrapper) return

    const TIMELINE_TOTAL = 21.5
    const frame2Scroll   = wrapper.offsetHeight - vpH
    // FLY_IN at scroll-position 0 (start: 'top top') — fires the instant
    // Frame2 becomes sticky, which is the same frame Frame1 leaves the viewport.
    // triggerCursorHide() inside flyIn() kills the Frame1 cursor atomically.
    // FLY_OUT at 1.8/21.5 — just before the stat starts moving at t=2.
    const FLY_OUT_PX = Math.round(frame2Scroll * (1.8 / TIMELINE_TOTAL))

    const st = ScrollTrigger.create({
      trigger: wrapper,
      start: 'top top',                 // instant — same moment Frame1 exits
      end:   `top top-=${FLY_OUT_PX}`,  // birds leave just before stat moves
      onEnter:     () => flyIn(),
      onLeave:     () => scheduleFlyOut(),
      onEnterBack: () => {
        if (flyOutTimer.current) { clearTimeout(flyOutTimer.current); flyOutTimer.current = null }
        flyIn()
      },
      onLeaveBack: () => scheduleFlyOut(),
    })

    // Clear the init guard after one frame — GSAP's initial synchronous refresh
    // has already fired by this point, so real user-scroll callbacks will work.
    const initRaf = requestAnimationFrame(() => { ignoreInitRef.current = false })

    // ── birds:reset — force all birds off-screen instantly on restart ─────────
    function onReset() {
      if (flyOutTimer.current) { clearTimeout(flyOutTimer.current); flyOutTimer.current = null }
      birds.forEach((el, i) => {
        swayTweens.current[i]?.kill()
        swayTweens.current[i] = null
        gsap.killTweensOf(el)
        const offset = staticOffsets[i] ?? edgeOffset(BIRDS[i])
        gsap.set(el, { rotation: BIRDS[i].rot, x: offset.x, y: offset.y, opacity: 0 })
      })
      stateRef.current = 'hidden'
      activeCursorFrom.current = null
    }
    window.addEventListener('birds:reset', onReset)

    return () => {
      cancelAnimationFrame(initRaf)
      window.removeEventListener('birds:reset', onReset)
      st.kill()
      birds.forEach((_, i) => { swayTweens.current[i]?.kill() })
      if (flyOutTimer.current) clearTimeout(flyOutTimer.current)
    }
  }, [])

  return (
    <div className={styles.layer} aria-hidden="true">
      {BIRDS.map((bird, i) => (
        <div
          key={i}
          ref={el => { birdRefs.current[i] = el }}
          className={styles.bird}
          style={{
            left:       `${bird.left * 100}%`,
            top:        `${bird.top  * 100}%`,
            width:      bird.size,
            marginLeft: -bird.size / 2,
            // Rendered height = size × heightAspect (1.0 for square SVGs).
            // Using the actual height keeps the bird centred on its top anchor.
            marginTop:  -(bird.size * (bird.heightAspect ?? 1)) / 2,
          }}
        >
          <img src={bird.src} alt="" draggable={false} />
        </div>
      ))}
    </div>
  )
}
