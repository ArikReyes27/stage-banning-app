import { useEffect, useRef, useState } from 'react'

const stages = ['hollow-bastion', 'small-battlefield', 'final-destination']
const stageUrl = (index: number) => `/images/stages/${stages[index]}.jpg`

export function StageHeroBackground() {
  const [frame, setFrame] = useState({ current: 0, previous: -1 })
  const [paused, setPaused] = useState(false)
  const index = useRef(0)

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let timer: ReturnType<typeof setTimeout>, cancelled = false, generation = 0
    const schedule = () => {
      clearTimeout(timer)
      const token = ++generation
      if (cancelled || paused || document.hidden || motion.matches) return
      timer = setTimeout(async () => {
        const next = (index.current + 1) % stages.length
        const image = new Image()
        image.src = stageUrl(next)
        try {
          await image.decode()
          if (cancelled || token !== generation) return
          setFrame(current => ({ current: next, previous: current.current }))
          index.current = next
        } catch {
          // Keep the last good image; the base gradient also covers initial failure.
          if (cancelled || token !== generation) return
          index.current = next
        }
        schedule()
      }, 7000)
    }
    schedule()
    document.addEventListener('visibilitychange', schedule)
    motion.addEventListener('change', schedule)
    return () => {
      cancelled = true; generation++; clearTimeout(timer)
      document.removeEventListener('visibilitychange', schedule)
      motion.removeEventListener('change', schedule)
    }
  }, [paused])

  return <>
    <div className="stage-hero-background" aria-hidden="true">
      {frame.previous >= 0 && <img key={`previous-${frame.previous}`} src={stageUrl(frame.previous)} alt="" className="stage-hero-image" onError={e => { e.currentTarget.style.visibility = 'hidden' }} />}
      <img key={frame.current} src={stageUrl(frame.current)} alt="" className="stage-hero-image stage-hero-current" fetchPriority="high" onError={e => { e.currentTarget.style.visibility = 'hidden' }} />
      <div className="stage-hero-overlay" />
    </div>
    <button type="button" className="hero-motion-control focus-ring" aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? 'Reanudar fondo' : 'Pausar fondo'}</button>
  </>
}
