/** Tracks whether scroll is currently locked to avoid double-applying/removing */
let _locked = false

/** Prevent the page from scrolling (overflow: hidden on root). */
export function lockScroll(): void {
  if (_locked) return
  _locked = true
  document.documentElement.style.overflow = 'hidden'
}

/** Restore normal scrolling. */
export function unlockScroll(): void {
  if (!_locked) return
  _locked = false
  document.documentElement.style.overflow = ''
}

export function isScrollLocked(): boolean {
  return _locked
}
