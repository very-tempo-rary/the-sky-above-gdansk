import { useState, useEffect } from 'react'
import { flushSync } from 'react-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './index.css'

gsap.registerPlugin(ScrollTrigger)
import Frame1 from './sections/Frame1'
import Frame2 from './sections/Frame2'
import Frame3 from './sections/Frame3'
import Frame5 from './sections/Frame5'
import Frame6 from './sections/Frame6'
import Frame7 from './sections/Frame7'
import Frame21 from './sections/Frame21'
import Frame4 from './sections/Frame4'
import Frame23 from './sections/Frame23'
import MobileScreen from './sections/MobileScreen'

export default function App() {
  // Incrementing this key forces Frame4, Frame5, and Frame23 to fully remount on restart,
  // which is the only reliable way to guarantee their React state is wiped clean.
  const [restartCount, setRestartCount] = useState(0)

  useEffect(() => {
    function onRemount() { flushSync(() => setRestartCount(c => c + 1)) }
    window.addEventListener('restart:remount', onRemount)
    return () => window.removeEventListener('restart:remount', onRemount)
  }, [])

  // ── Resize guard ────────────────────────────────────────────────────────────
  // Frame2's 2900vh wrapper changes in absolute pixels when the viewport is
  // resized, shifting every subsequent section's scroll position. The browser
  // keeps the current pixel scroll fixed, so you land in a random animation
  // transition — often one where all elements are at opacity:0 → blank dark
  // screen. Scrolling to the top after the window settles puts the experience
  // back in a known valid state, and refreshing ScrollTrigger re-anchors all
  // scroll-based calculations to the new viewport dimensions.
  useEffect(() => {
    let prevW = window.innerWidth
    let timeout: ReturnType<typeof setTimeout>

    function onResize() {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        if (Math.abs(window.innerWidth - prevW) < 10) return
        prevW = window.innerWidth
        ScrollTrigger.refresh()
        window.scrollTo({ top: 0, behavior: 'instant' })
      }, 300)
    }

    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      clearTimeout(timeout)
    }
  }, [])

  return (
    <>
      <Frame1 />
      <Frame2 />
      <Frame3 />
      <Frame5 key={`f5-${restartCount}`} />
      <Frame6 />
      <Frame7 />
      <Frame21 />
      {/* Wrapper lets goToFrame4 animate with y:56 without triggering
          Frame4's internal overflow:hidden ResizeObserver */}
      <div id="frame4-wrap">
        <Frame4 key={`f4-${restartCount}`} />
      </div>
      <Frame23 key={`f23-${restartCount}`} />
      <MobileScreen />
    </>
  )
}
