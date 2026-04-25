/**
 * Shared store for Frame1's cursor position and hide callback.
 *
 * BirdsLayer reads the last cursor position so bird2 can start its flight
 * from wherever the user's mouse last was.  It also calls `triggerCursorHide`
 * the moment flyIn() fires, so the Frame1 cursor disappears at the exact same
 * frame that bird2 materialises at that position — no async gap, no fade.
 */
let _x = -1
let _y = -1
let _hideFn: (() => void) | null = null

export function setLastCursorPos(x: number, y: number): void { _x = x; _y = y }
export function getLastCursorPos(): { x: number; y: number } { return { x: _x, y: _y } }

/** Frame1 registers its cursor-hide function here on mount. */
export function setCursorHideFn(fn: () => void): void { _hideFn = fn }

/** BirdsLayer calls this when flyIn() fires to atomically kill the Frame1 cursor. */
export function triggerCursorHide(): void { _hideFn?.() }
