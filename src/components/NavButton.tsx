import styles from './NavButton.module.css'
import ArrowUp      from '@assets/svg/ui/Direction=Up.svg?react'
import ArrowDown    from '@assets/svg/ui/Direction=Down.svg?react'
import ArrowLeftAlt from '@assets/svg/ui/Direction=Left alt.svg?react'

interface NavButtonProps {
  onBack:          () => void
  onContinue:      () => void
  onRestart:       () => void
  backLabel?:      string
  continueLabel?:  string
  restartLabel?:   string
}

/**
 * Restart + Back + Continue navigation button set.
 *
 * Hover animation: the arrow "conveyor-belts" out in the direction it points
 * while a clone slides in from the opposite side (one-way — no reverse on leave).
 * Label text becomes underlined on hover.
 */
export default function NavButton({
  onBack,
  onContinue,
  onRestart,
  backLabel     = 'Back',
  continueLabel = 'Continue',
  restartLabel  = 'Restart',
}: NavButtonProps) {
  return (
    <div className={styles.wrap}>

      {/* Restart — left arrow, leftward conveyor */}
      <button
        className={`${styles.btn} ${styles.restartBtn}`}
        onClick={onRestart}
        aria-label={restartLabel}
      >
        <span className={styles.arrowWrap}>
          <ArrowLeftAlt
            className={`${styles.arrowSvg} ${styles.restartArrow}`}
            aria-hidden="true"
            width={16}
            height={16}
          />
          <ArrowLeftAlt
            className={`${styles.arrowSvg} ${styles.restartClone}`}
            aria-hidden="true"
            width={16}
            height={16}
          />
        </span>
        <span className={styles.label}>{restartLabel}</span>
      </button>

      {/* Back — up arrow, upward conveyor */}
      <button
        className={`${styles.btn} ${styles.backBtn}`}
        onClick={onBack}
        aria-label={backLabel}
      >
        <span className={styles.arrowWrap}>
          <ArrowUp
            className={`${styles.arrowSvg} ${styles.backArrow}`}
            aria-hidden="true"
            width={16}
            height={16}
          />
          <ArrowUp
            className={`${styles.arrowSvg} ${styles.backClone}`}
            aria-hidden="true"
            width={16}
            height={16}
          />
        </span>
        <span className={styles.label}>{backLabel}</span>
      </button>

      {/* Continue — down arrow, downward conveyor */}
      <button
        className={`${styles.btn} ${styles.continueBtn}`}
        onClick={onContinue}
        aria-label={continueLabel}
      >
        <span className={styles.label}>{continueLabel}</span>
        <span className={styles.arrowWrap}>
          <ArrowDown
            className={`${styles.arrowSvg} ${styles.continueArrow}`}
            aria-hidden="true"
            width={16}
            height={16}
          />
          <ArrowDown
            className={`${styles.arrowSvg} ${styles.continueClone}`}
            aria-hidden="true"
            width={16}
            height={16}
          />
        </span>
      </button>

    </div>
  )
}
