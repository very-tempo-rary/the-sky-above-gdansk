import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import styles from './Frame23.module.css'
import NavButton from '../components/NavButton'
import { restartExperience } from '../utils/restartExperience'

import skylineImg from '@assets/images/gdansk/skyline.png'

export default function Frame23() {
  const scrollInnerRef = useRef<HTMLDivElement>(null)
  const overlayTopRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el  = scrollInnerRef.current
    const top = overlayTopRef.current
    if (!el || !top) return
    function onScroll() {
      top!.classList.toggle(styles.overlayTopVisible, el!.scrollTop > 8)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  function handleRestart() { restartExperience() }

  function handleBack() {
    const frame4 = document.getElementById('frame4')
    if (!frame4) return
    const absTop = Math.round(frame4.getBoundingClientRect().top + window.scrollY)
    document.body.style.backgroundColor = '#087BFF'
    window.scrollTo({ top: absTop, behavior: 'instant' })
    gsap.fromTo('#frame4-wrap',
      { opacity: 0 },
      {
        opacity: 1, duration: 0.6, ease: 'power1.out',
        clearProps: 'opacity',
        onComplete: () => { document.body.style.backgroundColor = '' },
      },
    )
  }

  return (
    <section id="frame23" className={styles.scene}>

      {/* ── Full-frame skyline background ────────────────────────────────── */}
      <img src={skylineImg} alt="" className={styles.skyline} draggable={false} />

      {/* ── Scrollable credits column ─────────────────────────────────────── */}
      <div className={styles.scrollContainer}>

        <div ref={overlayTopRef} className={styles.overlayTop} />

        <div ref={scrollInnerRef} className={styles.scrollInner}>
          <div className={styles.column}>

            <p className={styles.byLine}>Thank you!</p>
            <p className={styles.byLine}>Alicja Kot, 2026</p>
            <p className={styles.byLine}>All translations to English are my own.</p>

            {/* ── SOURCES ─────────────────────────────────────────────────── */}
            <div className={styles.section}>
              <p className={styles.sectionHeader}>Sources</p>

              {/* General Species Information */}
              <div className={styles.subsection}>
                <p className={styles.subsectionHeader}>General Species Information</p>
                <a className={styles.item} href="https://www.trojmiasto.pl/wiadomosci/Gdzie-sie-podzialy-wroble-Ptaki-znikaja-z-miast-n158874.html" target="_blank" rel="noreferrer">Trójmiasto.pl</a>
                <a className={styles.item} href="https://www.gdansk.pl/wiadomosci/Przypominamy-o-dokarmianiu-ptakow-zima-Zobacz-gdzie-w-Gdansku-pojawia-sie-nowe-karmniki,a,189803" target="_blank" rel="noreferrer">Gdańsk.pl</a>
                <a className={styles.item} href="https://www.ornis-polonica.pl/issues/OP_2024_2/OP_2024_2_2.pdf" target="_blank" rel="noreferrer">Ornis Polonica</a>
                <a className={styles.item} href="https://monitoringptakow.gios.gov.pl/strona-glowna.html" target="_blank" rel="noreferrer">Monitoring Ptaków Polski</a>
                <a className={styles.item} href="https://pecbms.info/results-of-bird-monitoring-in-poland-from-2021-to-2024/" target="_blank" rel="noreferrer">Paneuropean Common Bird Monitoring Scheme</a>
                <a className={styles.item} href="https://gdansk.gedanopedia.pl/gdansk/?title=PTAKI#" target="_blank" rel="noreferrer">Gedanopedia</a>
                <a className={styles.item} href="https://www.ptop.org.pl/images/stories/wydawnictwa/PTAKI_w_Miescie.pdf" target="_blank" rel="noreferrer">Polskie Towarzystwo Ochrony Ptaków</a>
                <a className={styles.item} href="https://www.researchgate.net/publication/387343696_Thermo-modernization_influences_nest_density_of_Common_Swifts_Apus_apus_determinants_of_nest_site_choices_in_Poznan_Poland" target="_blank" rel="noreferrer">Research Gate</a>
                <a className={styles.item} href="https://otop.org.pl/naszeprojekty/chronimy/czerwona-lista-ptakow-polski/" target="_blank" rel="noreferrer">Ogólnopolskie Towarzystwo Ochrony Ptaków</a>
                <p className={styles.item}>
                  {'Wikipedia ('}
                  <a className={styles.itemLink} href="https://en.wikipedia.org/wiki/European_herring_gull" target="_blank" rel="noreferrer">1</a>{', '}
                  <a className={styles.itemLink} href="https://en.wikipedia.org/wiki/Sandwich_tern" target="_blank" rel="noreferrer">2</a>{', '}
                  <a className={styles.itemLink} href="https://en.wikipedia.org/wiki/Mute_swan" target="_blank" rel="noreferrer">3</a>{', '}
                  <a className={styles.itemLink} href="https://en.wikipedia.org/wiki/Common_swift" target="_blank" rel="noreferrer">4</a>{', '}
                  <a className={styles.itemLink} href="https://en.wikipedia.org/wiki/Black_redstart" target="_blank" rel="noreferrer">5</a>{', '}
                  <a className={styles.itemLink} href="https://en.wikipedia.org/wiki/Western_jackdaw" target="_blank" rel="noreferrer">6</a>{', '}
                  <a className={styles.itemLink} href="https://en.wikipedia.org/wiki/Rook_(bird)" target="_blank" rel="noreferrer">7</a>{', '}
                  <a className={styles.itemLink} href="https://en.wikipedia.org/wiki/Common_kestrel" target="_blank" rel="noreferrer">8</a>{', '}
                  <a className={styles.itemLink} href="https://en.wikipedia.org/wiki/Peregrine_falcon" target="_blank" rel="noreferrer">9</a>{', '}
                  <a className={styles.itemLink} href="https://en.wikipedia.org/wiki/Common_wood_pigeon" target="_blank" rel="noreferrer">10</a>{', '}
                  <a className={styles.itemLink} href="https://en.wikipedia.org/wiki/House_sparrow" target="_blank" rel="noreferrer">11</a>{', '}
                  <a className={styles.itemLink} href="https://en.wikipedia.org/wiki/Western_house_martin" target="_blank" rel="noreferrer">12</a>
                  {')'}
                </p>
              </div>

              {/* Protection Initiatives */}
              <div className={styles.subsection}>
                <p className={styles.subsectionHeader}>Protection Initiatives</p>
                <p className={styles.item}>
                  {'Gdańsk.pl ('}
                  <a className={styles.itemLink} href="https://www.gdansk.pl/urzad-miejski/wiadomosci/nowe-domy-dla-ptakow-i-wiewiorek-oraz-ptasia-stolowka,a,233515" target="_blank" rel="noreferrer">1</a>{', '}
                  <a className={styles.itemLink} href="https://www.gdansk.pl/wiadomosci/Wyniki-glosowania-w-ramach-Budzetu-Obywatelskiego-2026,a,297235" target="_blank" rel="noreferrer">2</a>{', '}
                  <a className={styles.itemLink} href="https://www.gdansk.pl/budzet-obywatelski/Letnica-Jerzyki-w-walce-z-komarami-budki-legowe-w-Letnicy,a,298507" target="_blank" rel="noreferrer">3</a>{', '}
                  <a className={styles.itemLink} href="https://www.gdansk.pl/wiadomosci/Cztery-male-pustulki-z-gdanskiej-Kogi-polecialy-w-swiat-Gdanska-Agencja-Rozwoju-Gospodarczego-InvestGDA-Stowarzyszenie-Falco-gedanense-Justyna-Manuszewska,a,224032" target="_blank" rel="noreferrer">4</a>{', '}
                  <a className={styles.itemLink} href="https://www.gdansk.pl/wiadomosci/Suchanino-50-nowych-budek-dla-ptakow,a,287414" target="_blank" rel="noreferrer">5</a>{', '}
                  <a className={styles.itemLink} href="https://www.gdansk.pl/wiadomosci/Obraczkowanie-i-dokarmianie-ptakow-Akcji-Karmnik-w-gdanskim-ZOO,a,210660" target="_blank" rel="noreferrer">6</a>{', '}
                  <a className={styles.itemLink} href="https://www.gdansk.pl/wiadomosci/Zwierzeta-w-miescie-czy-i-jak-dokarmiac-zima-zyjace-w-Gdansku-ptaki-ROZMOWA,a,188206" target="_blank" rel="noreferrer">7</a>
                  {')'}
                </p>
                <a className={styles.item} href="https://gdansk.gedanopedia.pl/gdansk/?title=FALCO_GEDANENSE#" target="_blank" rel="noreferrer">Gedanopedia</a>
                <p className={styles.item}>
                  <a className={styles.itemLink} href="https://www.facebook.com/dlapustulek/?locale=pl_PL" target="_blank" rel="noreferrer">Dla Pustułek – Falco Gedanense</a>
                  {' / Facebook'}
                </p>
                <p className={styles.item}>
                  {'Trójmiasto.pl ('}
                  <a className={styles.itemLink} href="https://www.trojmiasto.pl/wiadomosci/Budka-dla-sokola-na-iglicy-najwyzszego-budynku-w-Trojmiescie-n165663.html" target="_blank" rel="noreferrer">1</a>{', '}
                  <a className={styles.itemLink} href="https://zwierzaki.trojmiasto.pl/Czekamy-na-sokoly-Sa-nowe-jajka-w-gniezdzie-na-kominie-gdynskiej-elektrocieplowni-n216774.html?strona=0#opinie" target="_blank" rel="noreferrer">2</a>{', '}
                  <a className={styles.itemLink} href="https://zwierzaki.trojmiasto.pl/Kawki-chca-zamieszkac-na-Suchaninie-Wykorzystuja-elewacje-do-budowania-gniazd-n201489.html" target="_blank" rel="noreferrer">3</a>
                  {')'}
                </p>
                <a className={styles.item} href="https://www.zawszepomorze.pl/artykul/2483,dom-legowy-sokola-wedrownego-na-szczycie-wiezowca-olivia-star" target="_blank" rel="noreferrer">Zawszepomorze.pl</a>
                <p className={styles.item}>
                  <a className={styles.itemLink} href="https://www.youtube.com/watch?v=p5K-sphKmp4" target="_blank" rel="noreferrer">Terka B</a>
                  {' / YouTube'}
                </p>
                <p className={styles.item}>
                  {'Peregrinus.pl ('}
                  <a className={styles.itemLink} href="https://peregrinus.pl/pl/peregrinus-forum/falco-peregrinus-inne-gniazda-w-polsce-oraz-obserwacje-w-naturze/30864-sokol-wedrowny-lotos-gdansk-2024" target="_blank" rel="noreferrer">1</a>{', '}
                  <a className={styles.itemLink} href="https://www.peregrinus.pl/pl/podglad-gniazd-na-zywo#" target="_blank" rel="noreferrer">2</a>
                  {')'}
                </p>
                <p className={styles.item}>
                  <a className={styles.itemLink} href="https://www.facebook.com/gdansk/posts/-%F0%9D%97%A1%F0%9D%97%BC%F0%9D%98%84%F0%9D%97%B2-%F0%9D%97%AF%F0%9D%98%82%F0%9D%97%B1%F0%9D%97%B8%F0%9D%97%B6-%F0%9D%97%B1%F0%9D%97%B9%F0%9D%97%AE-%F0%9D%97%BD%F0%9D%98%81%F0%9D%97%AE%F0%9D%97%B8%F0%9D%97%BC%CC%81%F0%9D%98%84-%F0%9D%98%84-%F0%9D%97%9A%F0%9D%97%B1%F0%9D%97%AE%F0%9D%97%BB%CC%81%F0%9D%98%80%F0%9D%97%B8%F0%9D%98%82-w-zielonym-pasie-mi%C4%99dzy-ul-kartusk%C4%85-starodwor/1130922795746730/" target="_blank" rel="noreferrer">Miasto Gdańsk</a>
                  {' / Facebook'}
                </p>
                <a className={styles.item} href="https://zoo.gdansk.pl/akcja-karmnik-2025-2026-2/" target="_blank" rel="noreferrer">Zoo Gdańsk</a>
                <a className={styles.item} href="https://monitoringptakow.gios.gov.pl/aktualnosci/rybitwa-czubata-z-sukcesem-legowym.html" target="_blank" rel="noreferrer">Monitoring Ptaków Polski</a>
              </div>
            </div>

            {/* ── VISUAL ASSETS CREDITS ─────────────────────────────────── */}
            <div className={styles.section}>
              <p className={styles.sectionHeader}>Visual Assets Credits</p>

              {/* Species Photos */}
              <div className={styles.subsection}>
                <p className={styles.subsectionHeader}>Species Photos</p>
                <a className={styles.item} href="https://commons.wikimedia.org/wiki/File:Larus_argentatus_Tuileries_20180324_t144644.jpg" target="_blank" rel="noreferrer">Marie-Lan Taÿ Pamart</a>
                <a className={styles.item} href="https://commons.wikimedia.org/wiki/File:G%E2%81%A0r%C3%A5m%C3%A5ke_-_L%E2%81%A0arus_argentatus_in_flight.jpg" target="_blank" rel="noreferrer">Marius Vassnes</a>
                <a className={styles.item} href="https://commons.wikimedia.org/wiki/File:Larus_argentatus,_Vaxholm,_Stockholm,_Sweden_(14923468303).jpg" target="_blank" rel="noreferrer">Bengt Nyman</a>
                <a className={styles.item} href="https://commons.wikimedia.org/wiki/File:Sandwich_tern_(Thalasseus_sandvicensis)_in_flight_with_lesser_sand_eel_(Ammodytes_tobianus)_Brownsea.jpg" target="_blank" rel="noreferrer">Charles J. Sharp (1, 2, 3, 4)</a>
                <a className={styles.item} href="https://commons.wikimedia.org/wiki/File:Eurasian_kestrel_2024_01_01_02.jpg" target="_blank" rel="noreferrer">Alexis Lours (1, 2, 3, 4)</a>
                <a className={styles.item} href="https://commons.wikimedia.org/wiki/File:Cygnus_olor_flirt_edit.jpg" target="_blank" rel="noreferrer">Richard Bartz</a>
                <a className={styles.item} href="https://commons.wikimedia.org/wiki/File:Mute_swan_Vrhnika.jpg" target="_blank" rel="noreferrer">Yerpo</a>
                <a className={styles.item} href="https://commons.wikimedia.org/wiki/File:CygneVaires.jpg" target="_blank" rel="noreferrer">Sanchezn</a>
                <a className={styles.item} href="https://commons.wikimedia.org/wiki/File:Apus_apus_-Barcelona,_Spain-8_(1).jpg" target="_blank" rel="noreferrer">pau.artigas</a>
                <a className={styles.item} href="https://commons.wikimedia.org/wiki/File:Common_Swift_by_opisska.jpg" target="_blank" rel="noreferrer">opisska</a>
                <a className={styles.item} href="https://commons.wikimedia.org/wiki/File:Black_Redstart_(Phoenicurus_ochruros)_(23012087279).jpg" target="_blank" rel="noreferrer">Imran Shah (1, 2)</a>
                <a className={styles.item} href="https://commons.wikimedia.org/wiki/File:Black_redstart_at_Nasirpur,_Patiala_01.jpg" target="_blank" rel="noreferrer">Satdeep Gill</a>
                <a className={styles.item} href="https://commons.wikimedia.org/wiki/File:Coloeus_monedula_(Eurasian_jackdaw)_Moscow_Russia_2017_Oct.jpg" target="_blank" rel="noreferrer">Alexey V. Kurochkin</a>
                <a className={styles.item} href="https://commons.wikimedia.org/wiki/File:Jackdaw_In_Flight.jpg" target="_blank" rel="noreferrer">Jaiiiiiiii</a>
                <a className={styles.item} href="https://commons.wikimedia.org/wiki/File:Jackdaw_(Corvus_monedula),_Baltasound_-_geograph.org.uk_-_2669590.jpg" target="_blank" rel="noreferrer">Mike Pennington</a>
                <a className={styles.item} href="https://commons.wikimedia.org/wiki/File:2009-10-30_(6)_Rook,_Saatkr%C3%A4he,_Corvus_frugilegus.JPG" target="_blank" rel="noreferrer">Vera Buhl</a>
                <a className={styles.item} href="https://www.pexels.com/photo/majestic-crow-perched-on-wire-fence-35103126/" target="_blank" rel="noreferrer">Bejan Adrian</a>
                <a className={styles.item} href="https://commons.wikimedia.org/wiki/File:Eurasian_Kestrel_by_Tisha_Mukherjee_01.jpg" target="_blank" rel="noreferrer">Tisha Mukherjee</a>
                <a className={styles.item} href="https://commons.wikimedia.org/wiki/File:Common_kestrel_(Falco_tinnunculus)_2016.jpg" target="_blank" rel="noreferrer">TRinaud</a>
                <a className={styles.item} href="https://commons.wikimedia.org/wiki/File:Peregrine_falcon_birding_bombay_hook_9.29.18DSC_0666.jpg" target="_blank" rel="noreferrer">lwolfartist</a>
                <a className={styles.item} href="https://commons.wikimedia.org/wiki/File:Falco_peregrinus_Beachy_Head_3.jpg" target="_blank" rel="noreferrer">Ron Knight</a>
                <a className={styles.item} href="https://commons.wikimedia.org/wiki/File:Male_Peregrine_Falcon_(7172188034).jpg" target="_blank" rel="noreferrer">U.S. Fish and Wildlife Service Headquarters</a>
                <a className={styles.item} href="https://commons.wikimedia.org/wiki/File:NZ8_5130_(53095029397).jpg" target="_blank" rel="noreferrer">Bengt Nyman</a>
                <a className={styles.item} href="https://commons.wikimedia.org/wiki/File:Para_go%C5%82%C4%99bi_grzywaczy_w_Krakowie,_20210410_1907_6269.jpg" target="_blank" rel="noreferrer">Jakub Hałun</a>
                <a className={styles.item} href="https://commons.wikimedia.org/wiki/File:Sparrow_Silhouette.svg" target="_blank" rel="noreferrer">Andreas Plank</a>
                <a className={styles.item} href="https://commons.wikimedia.org/wiki/File:Passer_domesticus_-_Karlsruhe_Zoo_01.jpg" target="_blank" rel="noreferrer">H. Zell</a>
                <a className={styles.item} href="https://unsplash.com/photos/a-group-of-birds-sitting-on-a-wire-a3kpXra6Q8g" target="_blank" rel="noreferrer">Natalia Etcheverry Arrepol</a>
                <a className={styles.item} href="https://commons.wikimedia.org/wiki/File:Common_house_martin,_Delichon_urbicum,_Hussvala.jpg" target="_blank" rel="noreferrer">blondinrikard</a>
                <a className={styles.item} href="https://commons.wikimedia.org/wiki/File:House_Martin_-_Delichon_urbicum_-_B%C3%A6jasvala.jpg" target="_blank" rel="noreferrer">Ómar Runólfsson</a>
                <a className={styles.item} href="https://commons.wikimedia.org/wiki/File:Sunrise_seagull_silhouette_(Unsplash).jpg" target="_blank" rel="noreferrer">Alex Wigan</a>
                <a className={styles.item} href="https://commons.wikimedia.org/wiki/File:Stork_silhouette.svg" target="_blank" rel="noreferrer">Nevit Dilmen</a>
                <a className={styles.item} href="https://commons.wikimedia.org/wiki/File:Front_view_of_a_barn_owl_-_Tyto_alba_-_in_flight.jpg" target="_blank" rel="noreferrer">Dannymoore1973</a>
                <a className={styles.item} href="https://commons.wikimedia.org/wiki/File:NZ8_5130_(53095029397).jpg" target="_blank" rel="noreferrer">Bengt Nyman</a>
                <a className={styles.item} href="https://commons.wikimedia.org/wiki/File:Hirundo_rustica_-flying_-Chicago_-USA-8.jpg" target="_blank" rel="noreferrer">Steve Stearns</a>
                <a className={styles.item} href="https://commons.wikimedia.org/wiki/File:Mottled_Duck_in_flight.jpg" target="_blank" rel="noreferrer">Dominic Sherony</a>
                <a className={styles.item} href="https://commons.wikimedia.org/wiki/File:Eurasian-Tree-Sparrow.jpg" target="_blank" rel="noreferrer">Mildeep</a>
              </div>

              {/* Nesting Sites Photos (Illustrative) */}
              <div className={styles.subsection}>
                <p className={styles.subsectionHeader}>Nesting Sites Photos (Illustrative)</p>
                <a className={styles.item} href="https://unsplash.com/@liliess" target="_blank" rel="noreferrer">Lidia Stawinska (1, 2)</a>
                <a className={styles.item} href="https://unsplash.com/photos/smoke-billows-from-the-stacks-of-smoke-stacks-WoIpdmBKCLc" target="_blank" rel="noreferrer">Kaptured by Kasia</a>
                <a className={styles.item} href="https://unsplash.com/photos/aerial-photography-of-buildings-PX598-EEZFA" target="_blank" rel="noreferrer">Jacek Dylag</a>
                <a className={styles.item} href="https://unsplash.com/photos/shore-during-day-PrYLIjOx0Hk" target="_blank" rel="noreferrer">Mathias Reding</a>
              </div>

              {/* Apartment Block SVG */}
              <div className={styles.subsection}>
                <p className={styles.subsectionHeader}>Apartment Block SVG</p>
                <p className={styles.item}>
                  <a className={styles.itemLink} href="https://www.magnific.com/free-vector/city-buildings-2-banners-isometric-composition_3813231.htm#fromView=search&page=1&position=15&uuid=2aa024df-5533-47c5-9ff8-4c645d08b424&query=apartment+block+old+new+isometric" target="_blank" rel="noreferrer">Macrovector</a>
                  {' / Magnific (with own modifications)'}
                </p>
              </div>

              {/* Initiatives Photos */}
              <div className={styles.subsection}>
                <p className={styles.subsectionHeader}>Initiatives Photos</p>
                <a className={styles.item} href="https://commons.wikimedia.org/wiki/File:Berlin_mauersegler_sch%C3%B6neberg_24.07.2012_21-07-11.jpg" target="_blank" rel="noreferrer">Dirk Ingo Franke</a>
                <a className={styles.item} href="https://commons.wikimedia.org/wiki/File:Thalasseus_sandvicensis_(34305979372).jpg" target="_blank" rel="noreferrer">Jac. Janssen</a>
                <a className={styles.item} href="https://commons.wikimedia.org/wiki/File:Gda%C5%84sk_Oliwa_-_Zoo_61.JPG" target="_blank" rel="noreferrer">Gdaniec</a>
                <a className={styles.item} href="https://commons.wikimedia.org/wiki/File:Olivia_Star.jpg" target="_blank" rel="noreferrer">Deway</a>
                <a className={styles.item} href="https://www.pexels.com/pl-pl/zdjecie/dwa-kosy-siedzace-na-drewnianym-plocie-o-zachodzie-slonca-35279510/" target="_blank" rel="noreferrer">Alexander Popadin</a>
                <a className={styles.item} href="https://commons.wikimedia.org/wiki/File:Danzig_Johanniskirche.jpg" target="_blank" rel="noreferrer">Julian Nyča</a>
                <a className={styles.item} href="https://commons.wikimedia.org/wiki/File:Wyspa_Sobieszewska,_Gda%C5%84sk,_Poland_-_panoramio_(153).jpg" target="_blank" rel="noreferrer">Arkadiusz Markiewicz</a>
              </div>

              {/* Gdańsk Map */}
              <div className={styles.subsection}>
                <p className={styles.subsectionHeader}>Gdańsk Map</p>
                <a className={styles.item} href="https://commons.wikimedia.org/wiki/File:Districts_of_Gdansk.svg" target="_blank" rel="noreferrer">Oruniak</a>
              </div>

              {/* Gdańsk Skyline */}
              <div className={styles.subsection}>
                <p className={styles.subsectionHeader}>Gdańsk Skyline</p>
                <a className={styles.item} href="https://commons.wikimedia.org/wiki/File:Gdansk_wieze.jpg" target="_blank" rel="noreferrer">Andrzej Otrębski</a>
              </div>

            </div>

          </div>
        </div>

        {/* ── Bottom fade overlay ─────────────────────────────────────────── */}
        <div className={styles.overlay} />
      </div>

      {/* ── Navigation (Restart + Back only) ────────────────────────────── */}
      <div className={styles.navBtnWrap}>
        <NavButton
          onBack={handleBack}
          onContinue={() => {}}
          onRestart={handleRestart}
          hideContinue
        />
      </div>

    </section>
  )
}
