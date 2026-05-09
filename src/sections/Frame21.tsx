import { useRef } from 'react'
import gsap from 'gsap'
import styles from './Frame21.module.css'
import NavButton from '../components/NavButton'
import { restartExperience } from '../utils/restartExperience'

import cloud1 from '@assets/images/clouds/1-black.png'
import cloud2 from '@assets/images/clouds/3-black.png'
import cloud3 from '@assets/images/clouds/5-black.png'

export default function Frame21() {
  const navigating = useRef(false)

  function goToFrame7() {
    window.dispatchEvent(new Event('frame7:show'))
    const frame7 = document.getElementById('frame7')
    if (frame7) {
      window.scrollTo({ top: frame7.offsetTop, behavior: 'instant' })
      gsap.fromTo('#frame7',
        { y: -56 },
        { y: 0, duration: 0.55, ease: 'power3.out', clearProps: 'transform' },
      )
    }
  }

  function goToFrame4() {
    const frame4 = document.getElementById('frame4')
    if (frame4) {
      window.scrollTo({ top: frame4.offsetTop, behavior: 'instant' })
      gsap.fromTo('#frame4',
        { opacity: 0, y: 56 },
        { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out', clearProps: 'transform,opacity' },
      )
    }
  }

  function handleBack() {
    if (navigating.current) return
    navigating.current = true
    goToFrame7()
  }

  function handleContinue() {
    if (navigating.current) return
    navigating.current = true
    goToFrame4()
  }

  function handleRestart() { restartExperience() }

  return (
    <section id="frame21" className={styles.scene}>

      {/* ── Cloud 1 — top-left, bleeds off left + top ───────────────────── */}
      <img
        src={cloud1}
        alt=""
        className={styles.cloud1}
        draggable={false}
      />

      {/* ── Cloud 2 — right side, bleeds off right + top + bottom ───────── */}
      <img
        src={cloud2}
        alt=""
        className={styles.cloud2}
        draggable={false}
      />

      {/* ── Cloud 3 — upper-right, bleeds off top + right ───────────────── */}
      <img
        src={cloud3}
        alt=""
        className={styles.cloud3}
        draggable={false}
      />

      {/* ── Text ────────────────────────────────────────────────────────── */}
      <p className={styles.text}>Fortunately, things are starting to look up.</p>

      {/* ── Navigation ──────────────────────────────────────────────────── */}
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
