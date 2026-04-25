import { useState } from 'react'
import styles from './NavButton.module.css'
import ArrowUp   from '@assets/svg/ui/Direction=Up.svg?react'
import ArrowDown from '@assets/svg/ui/Direction=Down.svg?react'

interface NavButtonProps {
  onBack:         () => void
  onContinue:     () => void
  backLabel?:     string
  continueLabel?: string
}

/**
 * Shared Back + Continue navigation button pair.
 *
 * Hover animation: the arrow "conveyor-belts" — slides out in the direction
 * it points while an identical clone slides in from the opposite side.
 *
 * Hover state is tracked via React state (not CSS :hover) so the two buttons
 * can never accidentally activate each other's animation.
 */
export default function NavButton({
  onBack,
  onContinue,
  backLabel     = 'Back',
  continueLabel = 'Continue',
}: NavButtonProps) {
  const [backHovered,     setBackHovered]     = useState(false)
  const [continueHovered, setContinueHovered] = useState(false)

  return (
    <div className={styles.wrap}>

      {/* Back — up arrow on the left */}
      <button
        className={`${styles.btn} ${backHovered ? styles.backActive : ''}`}
        onClick={onBack}
        onMouseEnter={() => setBackHovered(true)}
        onMouseLeave={() => setBackHovered(false)}
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

      {/* Continue — down arrow on the right */}
      <button
        className={`${styles.btn} ${continueHovered ? styles.continueActive : ''}`}
        onClick={onContinue}
        onMouseEnter={() => setContinueHovered(true)}
        onMouseLeave={() => setContinueHovered(false)}
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
