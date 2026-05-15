import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { unlockScroll } from './scrollLock'

/**
 * Fade the page out to blue, jump to the top, fade back in.
 * Safe to call from any frame — unlocks scroll automatically.
 */
export function restartExperience(): void {
  unlockScroll()
  // Clear any frame-restoration key so scroll-lock triggers re-engage on replay
  sessionStorage.removeItem('activeFrame')
  // Kill any in-progress GSAP scroll tween (e.g. arrow click still animating)
  gsap.killTweensOf(window)

  let overlay = document.getElementById('restart-overlay') as HTMLDivElement | null
  if (!overlay) {
    overlay = document.createElement('div')
    overlay.id = 'restart-overlay'
    Object.assign(overlay.style, {
      position: 'fixed',
      inset: '0',
      background: '#087BFF',
      zIndex: '99999',
      opacity: '0',
      pointerEvents: 'none',
    })
    document.body.appendChild(overlay)
  }

  gsap.killTweensOf(overlay)
  gsap.to(overlay, {
    opacity: 1,
    duration: 0.35,
    ease: 'power2.in',
    onComplete: () => {
      window.scrollTo({ top: 0, behavior: 'instant' })
      // Reset any stateful frames back to their initial state
      // Force Frame4 + Frame5 to fully remount (guaranteed clean state)
      window.dispatchEvent(new Event('restart:remount'))
      window.dispatchEvent(new Event('birds:reset'))
      window.dispatchEvent(new Event('frame3:reset'))
      // Force all ScrollTriggers to recalculate from the new scroll position.
      // Without this, triggers have stale positions from the scroll-lock state
      // (overflow:hidden) and won't fire correctly when scrolling back down.
      ScrollTrigger.refresh()
      gsap.to(overlay as HTMLDivElement, {
        opacity: 0,
        duration: 0.5,
        delay: 0.1,
        ease: 'power2.out',
      })
    },
  })
}
