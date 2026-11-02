import { useEffect, useRef, useState } from 'react'

export function GameTimer() {
  const accumulated = useRef(0)
  const startedAt = useRef<number | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!running) return
    const interval = window.setInterval(() => {
      if (startedAt.current !== null) {
        setElapsed(accumulated.current + performance.now() - startedAt.current)
      }
    }, 250)
    return () => window.clearInterval(interval)
  }, [running])

  const toggle = () => {
    if (startedAt.current !== null) {
      accumulated.current += performance.now() - startedAt.current
      startedAt.current = null
      setElapsed(accumulated.current)
      setRunning(false)
    } else {
      startedAt.current = performance.now()
      setRunning(true)
    }
  }

  const reset = () => {
    if ((startedAt.current !== null || accumulated.current > 0) &&
      !window.confirm('¿Reiniciar el cronómetro a cero?')) return
    startedAt.current = null
    accumulated.current = 0
    setElapsed(0)
    setRunning(false)
  }

  const seconds = Math.floor(elapsed / 1000)
  const time = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

  return (
    <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
      <p className="text-xs font-bold text-slate-400">Duración del juego</p>
      <p role="timer" aria-label="Tiempo transcurrido" className="my-3 text-5xl font-black tabular-nums text-white">{time}</p>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={toggle} className="focus-ring touch-target rounded-xl bg-cyan-300 px-4 py-3 font-black text-slate-950 hover:bg-cyan-200">
          {running ? 'Pausar' : elapsed > 0 ? 'Continuar' : 'Iniciar'}
        </button>
        <button type="button" onClick={reset} className="focus-ring touch-target rounded-xl border border-white/15 px-4 py-3 font-bold text-slate-200 hover:bg-white/8">Reiniciar</button>
      </div>
    </div>
  )
}
