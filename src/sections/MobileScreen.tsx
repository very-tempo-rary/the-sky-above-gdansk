import styles from './MobileScreen.module.css'
import monitorIcon from '@assets/svg/ui/pixelarticons_monitor-sharp.svg'
import bgSvg       from '@assets/svg/additional/add-bird-7.svg'

export default function MobileScreen() {
  return (
    <div className={styles.overlay}>
      <img src={bgSvg} alt="" className={styles.background} draggable={false} />
      <div className={styles.column}>
        <img src={monitorIcon} alt="" className={styles.icon} draggable={false} />
        <p className={styles.text}>
          This site needs more space to spread its wings!
          Please switch to a computer screen or resize the browser window.
        </p>
        <p className={styles.text}>
          Mobile experience coming later in the year.
        </p>
      </div>
    </div>
  )
}
