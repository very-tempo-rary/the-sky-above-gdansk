import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import styles from './Frame21.module.css'

import cloud1Img from '@assets/images/clouds/1-black.png'
import cloud2Img from '@assets/images/clouds/3-black.png'
import cloud3Img from '@assets/images/clouds/5-black.png'

import swift1 from '@assets/svg/additional/add-swift-1.svg'
import swift2 from '@assets/svg/additional/add-swift-2.svg'
import swift3 from '@assets/svg/additional/add-swift-3.svg'
import swift4 from '@assets/svg/additional/add-swift-4.svg'

export default function Frame21() {
  const sceneRef       = useRef<HTMLElement>(null)
  const cloud1Ref      = useRef<HTMLImageElement>(null)
  const cloud2Ref      = useRef<HTMLImageElement>(null)
  const cloud3Ref      = useRef<HTMLImageElement>(null)
  const fortunatelyRef = useRef<HTMLParagraphElement>(null)
  const headingRef     = useRef<HTMLHeadingElement>(null)
  const para1Ref       = useRef<HTMLParagraphElement>(null)
  const para2Ref       = useRef<HTMLParagraphElement>(null)
  const bird1Ref       = useRef<HTMLImageElement>(null)
  const bird2Ref       = useRef<HTMLImageElement>(null)
  const bird3Ref       = useRef<HTMLImageElement>(null)
  const bird4Ref       = useRef<HTMLImageElement>(null)

  const tlRef        = useRef<gsap.core.Timeline | null>(null)
  const blinkTlRef   = useRef<gsap.core.Timeline | null>(null)
  const blinkingRef  = useRef(false)
  const targetRef    = useRef(0)
  const currentRef   = useRef(0)
  const overshootRef = useRef(0)
  const navigating   = useRef(false)

  // progress at which blinking starts — when bird4 (first to arrive) has fully landed (t=5.8/11.6)
  const BLINK_START = 5.8 / 11.6

  // ── Apply initial (dark / "Fortunately") state ───────────────────────────
  function applyInitialState() {
    gsap.set(sceneRef.current, { backgroundColor: '#262626' })
    gsap.set(
      [cloud1Ref.current, cloud2Ref.current, cloud3Ref.current],
      { x: 0, opacity: 1 },
    )
    gsap.set(fortunatelyRef.current, { opacity: 1 })
    gsap.set(
      [headingRef.current, para1Ref.current, para2Ref.current],
      { opacity: 0, y: 30 },
    )
    gsap.set(
      [bird1Ref.current, bird2Ref.current, bird3Ref.current, bird4Ref.current],
      { opacity: 0, x: -500, y: 180 },
    )
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  function goToFrame7() {
    blinkingRef.current = false
    blinkTlRef.current?.pause()
    gsap.set([bird1Ref.current, bird2Ref.current, bird3Ref.current, bird4Ref.current], { opacity: 1 })
    window.dispatchEvent(new Event('frame7:show'))
    const frame7 = document.getElementById('frame7')
    if (frame7) {
      window.scrollTo({ top: frame7.offsetTop, behavior: 'instant' })
      gsap.fromTo('#frame7',
        { opacity: 0, y: -56 },
        { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out', clearProps: 'transform,opacity' },
      )
    }
  }

  function goToFrame4() {
    blinkingRef.current = false
    blinkTlRef.current?.pause()
    gsap.set([bird1Ref.current, bird2Ref.current, bird3Ref.current, bird4Ref.current], { opacity: 1 })
    targetRef.current  = 1
    currentRef.current = 1
    tlRef.current?.progress(1)
    const frame4 = document.getElementById('frame4')
    if (!frame4) return

    // Set Frame4 invisible at y:0 BEFORE scrolling so the ResizeObserver fires
    // (and the layout width settles) while it's hidden at its natural position.
    // Two rAFs let that settle, then the animation starts with y:56 applied as a
    // CSS transform (doesn't affect document layout, so no width jump).
    // Body is temporarily #087BFF so there is no dark-body flash during the fade.
    document.body.style.backgroundColor = '#087BFF'
    gsap.set('#frame4', { opacity: 0 })
    window.scrollTo({ top: frame4.offsetTop, behavior: 'instant' })
    requestAnimationFrame(() => requestAnimationFrame(() => {
      gsap.fromTo('#frame4',
        { opacity: 0, y: 56 },
        {
          opacity: 1, y: 0, duration: 0.55, ease: 'power3.out',
          clearProps: 'transform,opacity',
          onComplete: () => { document.body.style.backgroundColor = '' },
        },
      )
    }))
  }

  useEffect(() => {
    applyInitialState()

    // ── Paused timeline, scrubbed by wheel ──────────────────────────────────
    //
    //  t=0→D     dead zone — user sits on "Fortunately" screen
    //  t=D→D+1.5 "Fortunately" fades out
    //  t=D→D+3.0 background: #111111 → #087bff; clouds part off-screen
    //  t=D+1.5   heading fades in from bottom
    //  t=D+2.3   para1 fades in from bottom
    //  t=D+2.7   birds fly in RIGHT→LEFT (bird4 first), staggered 0.5s, 1.3s each
    //  t=D+5.5   para2 fades in from bottom
    //  t=D+6.6→D+9.6 rest on final state before overshoot triggers Frame4
    const DELAY = 2.0   // dead zone at start (user pauses on "Fortunately")
    const tl = gsap.timeline({ paused: true })

    tl.to(fortunatelyRef.current, { opacity: 0,               ease: 'power1.out',   duration: 1.5 }, DELAY)
    tl.to(sceneRef.current,       { backgroundColor: '#087bff', ease: 'none',        duration: 3.0 }, DELAY)
    tl.to(cloud1Ref.current,      { x: -700, opacity: 0,      ease: 'power1.inOut', duration: 2.5 }, DELAY)
    tl.to(cloud2Ref.current,      { x: +700, opacity: 0,      ease: 'power1.inOut', duration: 2.5 }, DELAY)
    tl.to(cloud3Ref.current,      { x: +700, opacity: 0,      ease: 'power1.inOut', duration: 2.5 }, DELAY)
    tl.to(headingRef.current,     { opacity: 1, y: 0,         ease: 'power1.out',   duration: 1.1 }, DELAY + 1.5)
    tl.to(para1Ref.current,       { opacity: 1, y: 0,         ease: 'power1.out',   duration: 1.1 }, DELAY + 2.3)
    // Birds enter from bottom-left. Position and opacity tweens start together so
    // the movement is visible throughout. power1.out on opacity: rises quickly at
    // first (bird visible off-screen while travelling) then eases to full opacity.
    tl.to(bird4Ref.current, { x: 0, y: 0, ease: 'power2.out', duration: 1.1 }, DELAY + 2.7)
    tl.to(bird4Ref.current, { opacity: 1, ease: 'power1.out', duration: 1.1 }, DELAY + 2.7)
    tl.to(bird3Ref.current, { x: 0, y: 0, ease: 'power2.out', duration: 1.1 }, DELAY + 3.4)
    tl.to(bird3Ref.current, { opacity: 1, ease: 'power1.out', duration: 1.1 }, DELAY + 3.4)
    tl.to(bird2Ref.current, { x: 0, y: 0, ease: 'power2.out', duration: 1.1 }, DELAY + 4.1)
    tl.to(bird2Ref.current, { opacity: 1, ease: 'power1.out', duration: 1.1 }, DELAY + 4.1)
    tl.to(bird1Ref.current, { x: 0, y: 0, ease: 'power2.out', duration: 1.1 }, DELAY + 4.8)
    tl.to(bird1Ref.current, { opacity: 1, ease: 'power1.out', duration: 1.1 }, DELAY + 4.8)
    tl.to(para2Ref.current,       { opacity: 1, y: 0,         ease: 'power1.out',   duration: 1.1 }, DELAY + 5.5)
    tl.to({},                     { duration: 3.0 }, DELAY + 6.6)  // extends timeline to t≈11.6

    tlRef.current = tl

    // ── Blink timeline (left → right, repeat) ──────────────────────────────
    // Each bird fades out then back in (yoyo). Runs only when the user is
    // at rest in the end zone (progress ≥ BLINK_START).
    // Overlapping starts (0 → 0.2 → 0.4 → 0.6s) so birds fade as one leftward wave,
    // not four separate blinks. Each tween is 0.3s out + 0.3s back = 0.6s total.
    const blinkTl = gsap.timeline({ repeat: -1, paused: true, repeatDelay: 1.8 })
    blinkTl.to(bird1Ref.current, { opacity: 0, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0)
    blinkTl.to(bird2Ref.current, { opacity: 0, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0.2)
    blinkTl.to(bird3Ref.current, { opacity: 0, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0.4)
    blinkTl.to(bird4Ref.current, { opacity: 0, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0.6)
    blinkTlRef.current = blinkTl

    // ── Smooth-scrub ticker ─────────────────────────────────────────────────
    const ticker: gsap.TickerCallback = () => {
      const diff = targetRef.current - currentRef.current
      if (Math.abs(diff) < 0.0001) {
        // At rest past the bird-landing point, and not mid-navigation — start blinking
        if (currentRef.current >= BLINK_START && !blinkingRef.current && !navigating.current) {
          blinkingRef.current = true
          blinkTl.play(0)
        }
        return
      }
      // User is scrolling — stop blink and restore full opacity
      if (blinkingRef.current) {
        blinkingRef.current = false
        blinkTl.pause()
        gsap.set(
          [bird1Ref.current, bird2Ref.current, bird3Ref.current, bird4Ref.current],
          { opacity: 1 },
        )
      }
      currentRef.current += diff * 0.1
      tl.progress(Math.min(1, Math.max(0, currentRef.current)))
    }
    gsap.ticker.add(ticker)

    // ── Wheel handler ───────────────────────────────────────────────────────
    const totalPx = window.innerHeight * 9

    function onWheel(e: WheelEvent) {
      e.preventDefault()
      if (navigating.current) return

      let delta = e.deltaY
      if (e.deltaMode === 1) delta *= 40
      if (e.deltaMode === 2) delta *= window.innerHeight

      const next = targetRef.current + delta / totalPx

      // Scroll UP at the start — accumulate negative overshoot (mirrors forward logic)
      if (currentRef.current <= 0.05 && delta < 0) {
        overshootRef.current += delta   // delta is negative here
        if (overshootRef.current < -(window.innerHeight * 0.3)) {
          navigating.current = true
          goToFrame7()
          return
        }
      } else if (delta > 0) {
        // Reset backward accumulator when scrolling forward
        overshootRef.current = Math.max(0, overshootRef.current)
      }

      // Scroll DOWN past the end — accumulate positive overshoot
      if (currentRef.current >= 0.95 && delta > 0) {
        overshootRef.current += delta
        if (overshootRef.current > window.innerHeight * 0.8) {
          navigating.current = true
          goToFrame4()
          return
        }
      } else if (delta < 0) {
        // Reset forward accumulator when scrolling backward
        overshootRef.current = Math.min(0, overshootRef.current)
      }

      targetRef.current = Math.min(1, Math.max(0, next))
    }

    const scene = sceneRef.current
    scene?.addEventListener('wheel', onWheel, { passive: false })

    // ── frame21:goto — dispatched by Frame7 (progress 0) and Frame4 (progress 1) ──
    function onGoto(e: Event) {
      const { progress } = (e as CustomEvent<{ progress: number }>).detail
      blinkingRef.current = false
      blinkTl.pause()
      targetRef.current  = progress
      currentRef.current = progress
      tl.progress(progress)
      navigating.current   = false
      overshootRef.current = 0
      if (progress === 0) applyInitialState()
    }
    window.addEventListener('frame21:goto', onGoto)

    return () => {
      scene?.removeEventListener('wheel', onWheel)
      window.removeEventListener('frame21:goto', onGoto)
      gsap.ticker.remove(ticker)
      tl.kill()
      blinkTl.kill()
    }
  }, [])

  return (
    <section id="frame21" ref={sceneRef} className={styles.scene}>

      {/* ── Clouds ────────────────────────────────────────────────────────── */}
      <img ref={cloud1Ref} src={cloud1Img} alt="" className={styles.cloud1} draggable={false} />
      <img ref={cloud2Ref} src={cloud2Img} alt="" className={styles.cloud2} draggable={false} />
      <img ref={cloud3Ref} src={cloud3Img} alt="" className={styles.cloud3} draggable={false} />

      {/* ── "Fortunately, things are starting to look up." ────────────────── */}
      <p ref={fortunatelyRef} className={styles.fortunately}>
        Fortunately, things are starting to look up.
      </p>

      {/* ── Bird silhouettes (Figma Frame22, fly in from left) ────────────── */}
      <img ref={bird1Ref} src={swift1} alt="" className={`${styles.bird} ${styles.bird1}`} draggable={false} />
      <img ref={bird2Ref} src={swift2} alt="" className={`${styles.bird} ${styles.bird2}`} draggable={false} />
      <img ref={bird3Ref} src={swift3} alt="" className={`${styles.bird} ${styles.bird3}`} draggable={false} />
      <img ref={bird4Ref} src={swift4} alt="" className={`${styles.bird} ${styles.bird4}`} draggable={false} />

      {/* ── "Slowly moving back in" text block ────────────────────────────── */}
      <div className={styles.textContent}>
        <h2 ref={headingRef} className={styles.heading}>Slowly moving back in</h2>
        <p ref={para1Ref} className={styles.para}>
          Though this is hardly the systemic change that is truly needed, people are starting
          to realize the urban bird populations&rsquo; precarious situation.
        </p>
        <p ref={para2Ref} className={styles.para}>
          Every year, new steps – big and small – towards bird life preservation are taken in Gdańsk.
        </p>
      </div>

    </section>
  )
}
