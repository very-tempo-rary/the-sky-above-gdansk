import { useState, useEffect } from 'react'
import { flushSync } from 'react-dom'
import './index.css'
import Frame1 from './sections/Frame1'
import Frame2 from './sections/Frame2'
import Frame3 from './sections/Frame3'
import Frame5 from './sections/Frame5'
import Frame6 from './sections/Frame6'
import Frame7 from './sections/Frame7'
import Frame21 from './sections/Frame21'
import Frame4 from './sections/Frame4'

export default function App() {
  // Incrementing this key forces Frame4 and Frame5 to fully remount on restart,
  // which is the only reliable way to guarantee their React state is wiped clean.
  const [restartCount, setRestartCount] = useState(0)

  useEffect(() => {
    function onRemount() { flushSync(() => setRestartCount(c => c + 1)) }
    window.addEventListener('restart:remount', onRemount)
    return () => window.removeEventListener('restart:remount', onRemount)
  }, [])

  return (
    <>
      <Frame1 />
      <Frame2 />
      <Frame3 />
      <Frame5 key={restartCount} />
      <Frame6 />
      <Frame7 />
      <Frame21 />
      <Frame4 key={restartCount} />
    </>
  )
}
