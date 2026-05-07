import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import styles from './Frame6.module.css'

// ── Assets ────────────────────────────────────────────────────────────────────
import cloudImg  from '@assets/images/clouds/cloud-eviction.png'
import cloudMask from '@assets/images/clouds/cloud-eviction-mask.png'
import rainSvg   from '@assets/svg/additional/rain.svg'

// ── Layout constants (Figma 1440 × 810 canvas) ───────────────────────────────
// Cloud y: Frame14 = 426, Frame15 = −348  →  delta = −774 px
// Text container top = 233.5 px; title centre in Frame14 = 810/2 = 405 px
// Title centre in Frame15 layout = 233.5 + 20.5 = 254 px
// → initial y offset so title appears centred = 405 − 254 = 151 px
const CLOUD_DY = -774
const TEXT_DY  =  151

export default function Frame6() {
  const sceneRef         = useRef<HTMLElement>(null)
  const cloudRef         = useRef<HTMLDivElement>(null)
  const cloudOverlayRef  = useRef<HTMLDivElement>(null)
  const textContainerRef = useRef<HTMLDivElement>(null)
  const para1Ref         = useRef<HTMLDivElement>(null)
  const rainRef          = useRef<HTMLDivElement>(null)
  const para2Ref         = useRef<HTMLDivElement>(null)

  const tlRef      = useRef<gsap.core.Timeline | null>(null)
  const targetRef  = useRef(0)   // target progress 0–1 (driven by wheel)
  const currentRef = useRef(0)   // smoothed progress (drives timeline)
  const navigating = useRef(false)

  // ── Apply initial GSAP states ─────────────────────────────────────────────
  function applyInitialState() {
    gsap.set(textContainerRef.current, { y: TEXT_DY })
    gsap.set(
      [para1Ref.current, rainRef.current, para2Ref.current],
      { opacity: 0, y: 30 },
    )
  }

  // ── Navigation helpers ────────────────────────────────────────────────────
  function goToFrame5() {
    const frame5 = document.getElementById('frame5')
    if (frame5) {
      window.scrollTo({ top: frame5.offsetTop, behavior: 'instant' })
      gsap.fromTo('#frame5',
        { opacity: 0, y: -56 },
        { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out', clearProps: 'transform,opacity' },
      )
    }
  }

  function goToFrame7() {
    // Snap timeline to end so Frame6 background is fully #262626 before Frame7 appears
    targetRef.current  = 1
    currentRef.current = 1
    tlRef.current?.progress(1)

    window.dispatchEvent(new Event('frame7:show'))
    const frame7 = document.getElementById('frame7')
    if (frame7) {
      window.scrollTo({ top: frame7.offsetTop, behavior: 'instant' })
      // No opacity: body bg is #087BFF — keeping Frame7 fully opaque avoids a blue flash
      gsap.fromTo('#frame7',
        { y: 56 },
        { y: 0, duration: 0.55, ease: 'power3.out', clearProps: 'transform' },
      )
    }
  }

  useEffect(() => {
    applyInitialState()

    // ── Paused timeline — progress driven by wheel, not ScrollTrigger ─────────
    const tl = gsap.timeline({ paused: true })

    tl.to(sceneRef.current,          { backgroundColor: '#262626', ease: 'none', duration: 2 }, 0)
    tl.to(cloudOverlayRef.current,   { backgroundColor: '#262626', ease: 'none', duration: 2 }, 0)
    tl.to(cloudRef.current,          { y: CLOUD_DY, ease: 'none', duration: 4 }, 0)
    tl.to(textContainerRef.current,  { y: 0, ease: 'power2.out', duration: 0.8 }, 0.5)
    tl.to(para1Ref.current,          { opacity: 1, y: 0, ease: 'power2.out', duration: 0.6 }, 0.7)
    tl.to(rainRef.current,           { opacity: 1, y: 0, ease: 'power2.out', duration: 0.5 }, 1.5)
    tl.to(para2Ref.current,          { opacity: 1, y: 0, ease: 'power2.out', duration: 0.5 }, 2.0)

    tlRef.current = tl

    // ── Smooth-scrub ticker (mimics scrub: 1.5) ───────────────────────────────
    const ticker: gsap.TickerCallback = () => {
      const diff = targetRef.current - currentRef.current
      if (Math.abs(diff) < 0.0001) return
      currentRef.current += diff * 0.1
      tl.progress(Math.min(1, Math.max(0, currentRef.current)))
    }
    gsap.ticker.add(ticker)

    // ── Wheel handler ─────────────────────────────────────────────────────────
    // Scroll up past 0% → Frame5 (matching game)
    // Scroll down past 100% → Frame7 (building infographic)
    const totalPx = window.innerHeight * 3

    function onWheel(e: WheelEvent) {
      e.preventDefault()
      if (navigating.current) return

      let delta = e.deltaY
      if (e.deltaMode === 1) delta *= 40
      if (e.deltaMode === 2) delta *= window.innerHeight

      const next = targetRef.current + delta / totalPx

      if (next < -0.05 && currentRef.current <= 0.05) {
        // Overshoot past start → back to matching game
        navigating.current = true
        goToFrame5()
        return
      }

      if (next > 1.05 && currentRef.current >= 0.95) {
        // Overshoot past end → forward to building infographic
        navigating.current = true
        goToFrame7()
        return
      }

      targetRef.current = Math.min(1, Math.max(0, next))
    }

    const scene = sceneRef.current
    scene?.addEventListener('wheel', onWheel, { passive: false })

    // ── frame6:goto event ─────────────────────────────────────────────────────
    // Dispatched by Frame5 Continue (progress 0) and Frame7 Back (progress 1).
    // Allows arriving at Frame6 at either end of the animation.
    function onGoto(e: Event) {
      const { progress } = (e as CustomEvent<{ progress: number }>).detail
      targetRef.current  = progress
      currentRef.current = progress
      tl.progress(progress)
      navigating.current = false
      if (progress === 0) applyInitialState()
    }
    window.addEventListener('frame6:goto', onGoto)

    return () => {
      scene?.removeEventListener('wheel', onWheel)
      window.removeEventListener('frame6:goto', onGoto)
      gsap.ticker.remove(ticker)
      tl.kill()
    }
  }, [])

  return (
    <section id="frame6" ref={sceneRef} className={styles.scene}>

      {/* ── Cloud ─────────────────────────────────────────────────────────── */}
      <div ref={cloudRef} className={styles.cloudWrap}>
        <img
          src={cloudImg}
          alt=""
          className={styles.cloudImg}
          draggable={false}
        />
        <div
          ref={cloudOverlayRef}
          className={styles.cloudOverlay}
          style={{ WebkitMaskImage: `url(${cloudMask})`, maskImage: `url(${cloudMask})` }}
        />
      </div>

      {/* ── Text container ────────────────────────────────────────────────── */}
      <div ref={textContainerRef} className={styles.textContainer}>
        <h2 className={styles.title}>The great eviction</h2>

        <div ref={para1Ref} className={styles.para}>
          After more funding for Poland started coming in, widespread thermal
          modernization of buildings – especially insulation and facade sealing –
          has significantly improved energy efficiency in cities.
        </div>

        <div ref={para2Ref} className={styles.para}>
          But it has also unintentionally harmed our feathery co-tenants, most
          notably swifts and sparrows.
        </div>
      </div>

      {/* ── Rain (centred on 1440-px Figma canvas) ────────────────────────── */}
      {/* Rain 1: Figma x=26  → left = calc(50% − (720−26)px) = calc(50% − 694px) */}
      {/* Rain 2: Figma x=682 → left = calc(50% − (720−682)px) = calc(50% − 38px) */}
      <div ref={rainRef} className={styles.rainGroup}>
        <div className={styles.rainWrap} style={{ left: 'calc(50% - 694px)', top: 554 }}>
          <img src={rainSvg} alt="" className={styles.rainImg} draggable={false} />
        </div>
        <div className={styles.rainWrap} style={{ left: 'calc(50% - 38px)', top: 516 }}>
          <img src={rainSvg} alt="" className={styles.rainImg} draggable={false} />
        </div>
      </div>

    </section>
  )
}
