import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './Frame2.module.css'
import BirdsLayer from './BirdsLayer'

import polandSvg  from '@assets/svg/intro/poland-vector.svg'
import gdanskSvg  from '@assets/svg/intro/gdansk-vector.svg'
import Cracked    from '@assets/svg/intro/gdansk-vector-cracked.svg?react'
import CrackedAlt from '@assets/svg/intro/gdansk-vector-cracked-alt.svg?react'

gsap.registerPlugin(ScrollTrigger)

export default function Frame2() {
  const wrapperRef     = useRef<HTMLDivElement>(null)
  const statRef        = useRef<HTMLParagraphElement>(null)
  const dividerRef     = useRef<HTMLDivElement>(null)
  const textGroupRef   = useRef<HTMLDivElement>(null)
  const para2Ref       = useRef<HTMLParagraphElement>(null)
  const para3Ref       = useRef<HTMLParagraphElement>(null)
  // Egg
  const eggRef         = useRef<HTMLDivElement>(null)
  const polandRef      = useRef<HTMLImageElement>(null)
  const gdanskRef      = useRef<HTMLImageElement>(null)
  const labelPolandRef = useRef<HTMLDivElement>(null)
  const labelGdanskRef = useRef<HTMLDivElement>(null)
  const voronoiRef        = useRef<HTMLDivElement>(null)
  const voronoiLabelsRef  = useRef<HTMLDivElement>(null)
  // Two cracked-egg layers for the mid-zoom swap
  const crackedOrigRef    = useRef<HTMLDivElement>(null)
  const crackedAltRef     = useRef<HTMLDivElement>(null)
  // Zoom-phase text group (Frames 9–10)
  const zoomGroupRef      = useRef<HTMLDivElement>(null)
  const zoomTitleRef      = useRef<HTMLHeadingElement>(null)
  const zoomBodyRef       = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const wrapper        = wrapperRef.current
    const stat           = statRef.current
    const divider        = dividerRef.current
    const textGroup      = textGroupRef.current
    const para2          = para2Ref.current
    const para3          = para3Ref.current
    const egg            = eggRef.current
    const poland         = polandRef.current
    const gdansk         = gdanskRef.current
    const labelPoland    = labelPolandRef.current
    const labelGdansk    = labelGdanskRef.current
    const voronoi        = voronoiRef.current
    const voronoiLabels  = voronoiLabelsRef.current
    const crackedOrig    = crackedOrigRef.current
    const crackedAlt     = crackedAltRef.current
    const zoomGroup      = zoomGroupRef.current
    const zoomTitle      = zoomTitleRef.current
    const zoomBody       = zoomBodyRef.current
    if (!wrapper || !stat || !divider || !textGroup || !para2 || !para3 ||
        !egg || !poland || !gdansk || !labelPoland || !labelGdansk ||
        !voronoi || !voronoiLabels || !crackedOrig || !crackedAlt ||
        !zoomGroup || !zoomTitle || !zoomBody) return

    // ── Initial states ──────────────────────────────────────────────────────
    // Zoom target: city-outline crack — the complex boundary between the two
    // white pieces in gdansk-vector-cracked-alt.
    // At y=140: path2 inner edge ≈ x=214.7, path3 inner edge ≈ x=219.3
    //   → gap ≈ 4.6px, centre ≈ x=217.  Simple-crack gap here ≈ 3.9px.
    //   Δgap ≈ 0.7px (vs 2.8px at y=142) — minimises zoom-back on SVG swap.
    //   Also sits at the widest deviation of path2's city-outline excursion,
    //   and is "a bit higher" than the old y=142 pivot.
    const vpW     = window.innerWidth
    const vpH     = window.innerHeight
    const CRACK_X = 217  // crack centre in original egg coords (450 × 609)
    const CRACK_Y = 140

    // ── Dynamic egg sizing ──────────────────────────────────────────────────
    // Rules: top edge = eggTopGap from viewport top; bottom edge = eggToStatGap
    // above the stat label; stat label centred horizontally with the egg.
    // Horizontally the egg lives in the left half — max width = half viewport
    // minus one eggTopGap margin on each side.  Whichever axis is tighter wins;
    // the 450∶609 aspect ratio is always preserved.
    const statScaledH  = 45 * 1.1          // visual height of stat at scale 45/82 ≈ 49.5 px
    const eggTopGap    = 40
    const eggToStatGap = 40

    // Available horizontal space to the left of the text panel
    // (text panel CSS: left: calc(75% − 320px)) minus 40 px breathing gap.
    // Centering the egg in this space keeps it visually balanced at all widths.
    const textPanelLeft  = Math.round(vpW * 0.75 - 320)
    const leftPanelAvail = textPanelLeft - 40
    const maxEggW        = leftPanelAvail - 2 * eggTopGap  // 40 px margin each side

    const maxEggHByVH = vpH - eggTopGap - eggToStatGap - statScaledH - 40  // 40 px stat-bottom gap
    const eggWFromH   = maxEggHByVH * (450 / 609)

    let eggH: number, eggW: number
    if (eggWFromH <= maxEggW) {
      eggH = maxEggHByVH
      eggW = eggWFromH
    } else {
      eggW = Math.max(maxEggW, 40)
      eggH = eggW * (609 / 450)
    }

    // Centre the egg in the visual left half of the viewport (0 → vpW/2).
    // The divider sits at vpW/2, so the left panel's midpoint is vpW/4.
    // leftPanelAvail / maxEggW still cap the size; only the centre changes.
    const eggCentreX = Math.round(vpW / 4)
    const eggLeft    = Math.round(eggCentreX - eggW / 2)
    const eggTop     = eggTopGap

    // Scale crack coords proportionally to the resized egg
    const CRACK_X_NEW = Math.round(CRACK_X * eggW / 450)
    const CRACK_Y_NEW = Math.round(CRACK_Y * eggH / 609)

    // stat final position: exactly eggToStatGap below the egg's bottom edge,
    // expressed as a GSAP y-offset from the CSS anchor (top:50%, yPercent:-50)
    const statFinalY = (eggTop + eggH + eggToStatGap + statScaledH / 2) - vpH / 2

    // Zoom translations
    const zoomCenterX = vpW / 2 - eggCentreX
    const zoomCenterY = vpH / 2 - (eggTop + eggH / 2)
    const zoomCrackX  = vpW / 2 - (eggLeft + CRACK_X_NEW)
    const zoomCrackY  = vpH / 2 - (eggTop  + CRACK_Y_NEW)

    gsap.set(stat,        { xPercent: -50, yPercent: -50 })
    gsap.set(divider,     { scaleY: 0, transformOrigin: 'center center' })
    gsap.set(textGroup,   { yPercent: -50, y: 113, opacity: 0 })
    gsap.set(para2,       { opacity: 0 })
    gsap.set(para3,       { opacity: 0 })
    gsap.set(egg, { left: eggLeft, top: eggTop, width: eggW, height: eggH,
                    opacity: 0, scale: 0.5, transformOrigin: '50% 100%' })
    gsap.set(labelPoland, { opacity: 0 })
    gsap.set(labelGdansk, { opacity: 0 })
    gsap.set(gdansk,      { top: '13.41%', left: '6.66%', width: '86.72%', height: '86.59%' })
    gsap.set(voronoi,     { opacity: 0 })
    gsap.set(voronoiLabels, { opacity: 0 })
    // crackedAlt starts hidden; crackedOrig is visible inside the voronoi group
    gsap.set(crackedAlt,  { opacity: 0 })
    // Zoom text group: xPercent/yPercent centre the full block; y:89 shifts it
    // down so the title (half-height ≈33px) sits at viewport centre while the
    // body (≈130px) + gap (48px) are still invisible.
    // When body fades in, y→0 re-centres the full 245px block.
    gsap.set(zoomGroup,   { xPercent: -50, yPercent: -50, y: 89 })
    gsap.set(zoomTitle,   { opacity: 0 })
    gsap.set(zoomBody,    { opacity: 0 })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrapper,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.8,
      },
    })

    // ── t=0→2: dwell — "339 species" centred, birds fly in/out ─────────────
    // Birds handled by BirdsLayer (separate ScrollTrigger). Stat is still.
    // Birds exit before t=2; only then does the stat start moving.

    // ── Phase 2→3: stat + divider slide in ──────────────────────────────────
    const targetX = eggCentreX - window.innerWidth / 2
    tl
      .to(stat,      { x: targetX, y: 80, scale: 45 / 82, duration: 1 }, 2)
      .to(divider,   { scaleY: 1, duration: 0.6 },                        2.7)
      .to(textGroup, { opacity: 1, duration: 0.5 },                       3.3)

    // ── Phase 3→4: egg rises ─────────────────────────────────────────────────
      .to(stat, { y: statFinalY, duration: 1 },                           3)
      .to(egg,  { opacity: 1, scale: 1, ease: 'power1.inOut', duration: 1 }, 3)

    // ── Dead gap t=4→6: hold at egg chart — labels fade in after egg ─────────
      .to(labelPoland, { opacity: 1, duration: 0.4 },                      4.2)
      .to(labelGdansk, { opacity: 1, duration: 0.4 },                      4.5)

    // ── Phase 6→6.6: zoom-in transition ─────────────────────────────────────
      .to(gdansk, { top: '0%', left: '0%', width: '100%', height: '100%',
                    ease: 'power1.inOut', duration: 0.6 },                 6)
      .to(poland, { scale: 1.8, opacity: 0, ease: 'power1.in',
                    duration: 0.6, transformOrigin: '50% 50%' },           6)
      .to(labelPoland, { opacity: 0, duration: 0.25 },                    6)
      .to(labelGdansk, { opacity: 0, duration: 0.25 },                    6.1)

    // ── t=6.6: crack ─────────────────────────────────────────────────────────
      .to(gdansk,  { opacity: 0, duration: 0.05 },                        6.6)
      .to(voronoi, { opacity: 1, duration: 0.05 },                        6.6)

    // ── t=6.8: voronoi labels fade in ────────────────────────────────────────
      .to(voronoiLabels, { opacity: 1, duration: 0.4 },                   6.8)

    // ── Phase 6.6→7.5: Frame 6 text ──────────────────────────────────────────
      .to(textGroup, { y: 0, duration: 0.5 },                             6.6)
      .to(para2,     { opacity: 1, duration: 0.5 },                       6.6)
      .to(para3,     { opacity: 1, duration: 0.5 },                       8.5)

    // ── Dead gap t=9→9.5: reading pause on complete Frame 6 ──────────────────
    // Pause on 2-para view (para2 done t≈7.1, para3 starts t=8.5) = 1.4 units.
    // Pause on 3-para view (para3 done t=9.0, zoom starts t=9.5) = 0.5 units.

    // ── t=9.5: switch pivot from bottom-centre to city-outline crack ──────────
    tl.set(egg, { transformOrigin: `${CRACK_X_NEW}px ${CRACK_Y_NEW}px` }, 9.5)

    // ── Phase 9.5→10.5: fade out UI + slide egg to screen centre ─────────────
    tl
      .to(stat,         { opacity: 0, duration: 0.4 },                   9.5)
      .to(divider,      { opacity: 0, duration: 0.4 },                   9.5)
      .to(textGroup,    { opacity: 0, duration: 0.4 },                   9.5)
      .to(voronoiLabels,{ opacity: 0, duration: 0.3 },                   9.5)
      .to(egg, { x: zoomCenterX, y: zoomCenterY,
                 ease: 'power2.out', duration: 1 },                      9.5)

    // ── Phase 10.5→20.5: zoom into city-outline crack ────────────────────────
      .to(egg, { x: zoomCrackX, y: zoomCrackY, scale: 1500,
                 ease: 'power2.in', duration: 10 },                      10.5)

    // ── t=14: hard-cut swap ───────────────────────────────────────────────────
    // progress through zoom tween: (14-10.5)/10 = 0.35 → eased 0.35²≈0.1225
    tl.set(crackedOrig, { opacity: 1 },                                  14.499)
    tl.set(crackedAlt,  { opacity: 0 },                                  14.499)
    tl.set(crackedOrig, { opacity: 0 },                                  14.5)
    tl.set(crackedAlt,  { opacity: 1 },                                  14.5)

    // ── t=17: title fades in ──────────────────────────────────────────────────
    // progress (17-10.5)/10=0.65 → eased 0.65²≈0.42 → scale≈634: walls off.
    tl.to(zoomTitle, { opacity: 1, duration: 0.6 },                      17)

    // ── t=18.5: body fades in + group shifts up to re-centre full block ───────
    tl.to(zoomBody,  { opacity: 1, duration: 0.6 },                      18.5)
    tl.to(zoomGroup, { y: 0, ease: 'power1.out', duration: 0.6 },        18.5)

    // ── Phase 20.5→21.5: egg + text dissolve ─────────────────────────────────
    tl.to(egg,       { opacity: 0, duration: 1 },                        20.5)
    tl.to(zoomGroup, { opacity: 0, duration: 1 },                        20.5)

    return () => { tl.scrollTrigger?.kill() }
  }, [])

  return (
    <div className={styles.wrapper} ref={wrapperRef} id="frame2">
      <div className={styles.scene}>

        {/* ── Ambient bird flock ───────────────────────────────────────── */}
        <BirdsLayer />

        {/* ── "339 species" stat ───────────────────────────────────────── */}
        <p className={styles.stat} ref={statRef}>339 species</p>

        {/* ── Vertical divider ─────────────────────────────────────────── */}
        <div className={styles.divider} ref={dividerRef} />

        {/* ── Right panel: text group ───────────────────────────────────── */}
        <div className={styles.textGroup} ref={textGroupRef}>
          <p className={styles.paragraphGroupItem}>
            In the years 1800–2010, 339 species of birds have been observed
            in Gdańsk (which means 75% of all bird species in Poland).
          </p>
          <p className={styles.paragraphGroupItem} ref={para2Ref}>
            Half of them are tied to aquatic ecosystems, 30% live in forests,
            and the rest prefer open fields and urban areas.
          </p>
          <p className={styles.paragraphGroupItem} ref={para3Ref}>
            This last group is the one we'll be taking a closer look at.
          </p>
        </div>

        {/* ── Zoom-phase text group (Frames 9–10) ─────────────────────── */}
        <div className={styles.zoomGroup} ref={zoomGroupRef}>
          <h2 className={styles.zoomTitle} ref={zoomTitleRef}>
            Twelve ways to live<br />in the city
          </h2>
          <p className={styles.zoomBody} ref={zoomBodyRef}>
            There are several species that chose Gdańsk precisely{' '}
            <em>for</em> the city's unique conditions, not in spite of them.
            <br />Let's have a closer look.
          </p>
        </div>

        {/* ── Egg chart ─────────────────────────────────────────────────── */}
        <div className={styles.egg} ref={eggRef}>

          <img src={polandSvg} className={styles.polandSvg} ref={polandRef}
            alt="" aria-hidden="true" draggable={false} />

          <img src={gdanskSvg} className={styles.gdanskSvg} ref={gdanskRef}
            alt="" aria-hidden="true" draggable={false} />

          <div className={styles.labelPoland} ref={labelPolandRef}>
            <span>Poland</span>
            <span>100%</span>
          </div>
          <div className={styles.labelGdansk} ref={labelGdanskRef}>
            <span>Gdańsk</span>
            <span>75%</span>
          </div>

          {/* ── Cracked egg section ───────────────────────────────────── */}
          <div className={styles.voronoi} ref={voronoiRef}>

            {/* Frame 6–7: gdansk-vector-cracked (simple cracks) */}
            <div ref={crackedOrigRef} className={styles.crackedLayer}>
              <Cracked className={styles.crackedSvg} aria-hidden="true" />
            </div>

            {/* Swaps in mid-zoom (~Frame 7→8): gdansk-vector-cracked-alt */}
            <div ref={crackedAltRef} className={styles.crackedLayer}>
              <CrackedAlt className={styles.crackedSvg} aria-hidden="true" />
            </div>

            {/* Labels fade in slightly after the crack */}
            <div className={styles.voronoiLabels} ref={voronoiLabelsRef}>
              <div className={styles.labelWater}>
                <span className={styles.labelPct}>50%</span>
                <span className={styles.labelName}>Water Habitats</span>
              </div>
              <div className={styles.labelUrban}>
                <span className={styles.labelPct}>20%</span>
                <span className={styles.labelName}>Open / Urban<br />Areas</span>
              </div>
              <div className={styles.labelForests}>
                <span className={styles.labelPct}>30%</span>
                <span className={styles.labelName}>Forests</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
