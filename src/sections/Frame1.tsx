import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import styles from './Frame1.module.css'
import { setLastCursorPos, setCursorHideFn } from '../utils/cursorStore'

import cloud1 from '@assets/images/clouds/1-white.png'
import cloud2 from '@assets/images/clouds/2-white.png'
import cloud3 from '@assets/images/clouds/3-white.png'
import cloud4 from '@assets/images/clouds/4-white.png'
import cloud5 from '@assets/images/clouds/5-white.png'
import birdSvg from '@assets/svg/additional/add-bird-2.svg'
import arrowSvg from '@assets/svg/ui/Direction=Down.svg'

interface CloudConfig {
  src: string
  top: number    // % from top
  width: number  // px
  duration: number // seconds for one full right-to-left pass
}

// Bigger, slower clouds — varied vertical positions
const CLOUDS: CloudConfig[] = [
  { src: cloud2, top: 52, width: 680, duration: 75 },
  { src: cloud5, top:  7, width: 420, duration: 55 },
  { src: cloud1, top: 60, width: 580, duration: 90 },
  { src: cloud3, top: 22, width: 380, duration: 65 },
  { src: cloud4, top: 38, width: 500, duration: 80 },
]

const BG_COLORS = ['#087BFF', '#E3D3E4', '#FF6E61', '#A4E7E9', '#65CCFF', '#087BFF']
const STEP_DURATION = 5

export default function Frame1() {
  const sectionRef = useRef<HTMLElement>(null)
  const cursorRef  = useRef<HTMLDivElement>(null)
  const cloudRefs  = useRef<(HTMLImageElement | null)[]>([])

  useEffect(() => {
    const section = sectionRef.current
    const cursor  = cursorRef.current
    if (!section || !cursor) return

    gsap.set(cursor, { xPercent: -50, yPercent: -50, opacity: 0 })

    // Register a zero-duration hide so BirdsLayer can kill this cursor
    // at the exact frame flyIn() fires, with no async callback lag.
    setCursorHideFn(() => gsap.set(cursor, { opacity: 0 }))

    const ctx = gsap.context(() => {
      // Background colour cycle
      gsap.set(section, { backgroundColor: BG_COLORS[0] })
      const colorTl = gsap.timeline({ repeat: -1 })
      BG_COLORS.slice(1).forEach(color => {
        colorTl.to(section, { backgroundColor: color, duration: STEP_DURATION, ease: 'none' })
      })

      // Clouds: drift in from right, no scatter-pop.
      // Each tween loops right→left. We seek to a random progress so they
      // appear already mid-journey without any instantaneous position jump.
      const screenW = window.innerWidth
      cloudRefs.current.forEach((cloud, i) => {
        if (!cloud) return
        const { width, duration } = CLOUDS[i]
        const tween = gsap.fromTo(
          cloud,
          { x: screenW, force3D: true },
          { x: -width, duration, ease: 'none', repeat: -1 }
        )
        // Seek into the loop so the cloud is already mid-screen on load
        tween.progress(0.05 + Math.random() * 0.85)
      })
    }, section)

    // Custom cursor
    // Hiding is owned by BirdsLayer (via triggerCursorHide in cursorStore)
    // so the cursor and bird2 swap at exactly the same frame.
    // The IntersectionObserver is kept as a safety net for the edge case
    // where the user navigates away before the birds' ScrollTrigger fires.
    const onMouseMove  = (e: MouseEvent) => {
      gsap.set(cursor, { x: e.clientX, y: e.clientY })
      setLastCursorPos(e.clientX, e.clientY)
    }
    const onMouseEnter = () => gsap.set(cursor, { opacity: 1 })
    const onMouseLeave = () => gsap.set(cursor, { opacity: 0 })

    section.addEventListener('mousemove',  onMouseMove)
    section.addEventListener('mouseenter', onMouseEnter)
    section.addEventListener('mouseleave', onMouseLeave)

    const observer = new IntersectionObserver(
      ([entry]) => { if (!entry.isIntersecting) gsap.set(cursor, { opacity: 0 }) },
      { threshold: 0 }
    )
    observer.observe(section)

    return () => {
      section.removeEventListener('mousemove',  onMouseMove)
      section.removeEventListener('mouseenter', onMouseEnter)
      section.removeEventListener('mouseleave', onMouseLeave)
      observer.disconnect()
      ctx.revert()
    }
  }, [])

  return (
    <section ref={sectionRef} className={styles.frame} id="frame1">

      {CLOUDS.map((cloud, i) => (
        <img
          key={i}
          ref={el => { cloudRefs.current[i] = el }}
          src={cloud.src}
          className={styles.cloud}
          style={{ top: `${cloud.top}%`, width: `${cloud.width}px` }}
          alt=""
          aria-hidden="true"
          draggable={false}
        />
      ))}

      <h1 className={styles.title}>The sky above Gdańsk</h1>

      {/* Gradient fade to Frame 2 blue */}
      <div className={styles.bottomFade} />

      <button
        className={styles.arrow}
        onClick={() => document.getElementById('frame2')?.scrollIntoView({ behavior: 'smooth' })}
        aria-label="Scroll to next section"
      >
        <img src={arrowSvg} width={64} height={64} alt="" />
      </button>

      <div ref={cursorRef} className={styles.cursor} aria-hidden="true">
        <img src={birdSvg} alt="" />
      </div>

    </section>
  )
}
