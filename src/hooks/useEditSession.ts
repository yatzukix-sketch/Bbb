import { useCallback, useEffect, useRef, useState } from 'react'
import { AGENT_STEPS, generateEditPlan, planToAssets } from '../agent/engine'
import type { AgentPhase, EditPlan, Lang, MediaAsset } from '../types'

export function useEditSession(initialLang: Lang = 'tr') {
  const [lang, setLang] = useState<Lang>(initialLang)
  const [prompt, setPrompt] = useState('')
  const [phase, setPhase] = useState<AgentPhase>('idle')
  const [plan, setPlan] = useState<EditPlan | null>(null)
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exported, setExported] = useState(false)
  const [logIndex, setLogIndex] = useState(0)
  const raf = useRef<number | null>(null)
  const lastTs = useRef(0)
  const abortRef = useRef(false)
  const playingRef = useRef(false)
  const planRef = useRef<EditPlan | null>(null)

  useEffect(() => {
    planRef.current = plan
  }, [plan])

  const toggleLang = useCallback(() => {
    setLang((l) => (l === 'tr' ? 'en' : 'tr'))
  }, [])

  const stopPlayback = useCallback(() => {
    playingRef.current = false
    setPlaying(false)
    if (raf.current != null) {
      cancelAnimationFrame(raf.current)
      raf.current = null
    }
  }, [])

  const runAgent = useCallback(
    async (text?: string) => {
      const p = (text ?? prompt).trim()
      if (!p) return
      abortRef.current = false
      stopPlayback()
      setPrompt(p)
      setPlan(null)
      setAssets([])
      setCurrentTime(0)
      setExported(false)
      setExportProgress(0)
      setLogIndex(0)
      setProgress(0)

      const total = AGENT_STEPS.reduce((s, x) => s + x.ms, 0)
      let elapsed = 0

      for (const step of AGENT_STEPS) {
        if (abortRef.current) return
        setPhase(step.phase)
        const start = performance.now()
        await new Promise<void>((resolve) => {
          const tick = () => {
            if (abortRef.current) return resolve()
            const d = performance.now() - start
            const local = Math.min(1, d / step.ms)
            setProgress(((elapsed + local * step.ms) / total) * 100)
            if (step.phase === 'timeline' || step.phase === 'grading' || step.phase === 'music') {
              setLogIndex((i) => Math.min(i + (local > 0.5 ? 1 : 0), 4))
            }
            if (d >= step.ms) resolve()
            else requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        })
        elapsed += step.ms
        setLogIndex((i) => Math.min(i + 1, 4))
      }

      if (abortRef.current) return
      const next = generateEditPlan(p)
      setPlan(next)
      setAssets(planToAssets(next))
      setPhase('ready')
      setProgress(100)
      setLogIndex(5)
    },
    [prompt, stopPlayback],
  )

  const play = useCallback(() => {
    const p = planRef.current
    if (!p) return
    if (raf.current != null) cancelAnimationFrame(raf.current)

    setPhase('playing')
    setPlaying(true)
    playingRef.current = true
    lastTs.current = performance.now()

    setCurrentTime((t) => {
      if (t >= p.duration - 0.05) return 0
      return t
    })

    const loop = (ts: number) => {
      if (!playingRef.current) return
      const current = planRef.current
      if (!current) return

      const dt = (ts - lastTs.current) / 1000
      lastTs.current = ts

      setCurrentTime((t) => {
        const n = t + dt
        if (n >= current.duration) {
          playingRef.current = false
          setPlaying(false)
          setPhase('ready')
          raf.current = null
          return current.duration
        }
        return n
      })

      if (playingRef.current) {
        raf.current = requestAnimationFrame(loop)
      }
    }

    raf.current = requestAnimationFrame(loop)
  }, [])

  const pause = useCallback(() => {
    stopPlayback()
    setPhase(planRef.current ? 'ready' : 'idle')
  }, [stopPlayback])

  const seek = useCallback((t: number) => {
    const p = planRef.current
    if (!p) return
    setCurrentTime(Math.max(0, Math.min(p.duration, t)))
  }, [])

  const reset = useCallback(() => {
    stopPlayback()
    setCurrentTime(0)
    setPhase(planRef.current ? 'ready' : 'idle')
  }, [stopPlayback])

  const exportEdit = useCallback(async () => {
    if (!planRef.current) return
    stopPlayback()
    setPhase('exporting')
    setExported(false)
    setExportProgress(0)
    const start = performance.now()
    const dur = 2400
    await new Promise<void>((resolve) => {
      const tick = (ts: number) => {
        const prog = Math.min(100, ((ts - start) / dur) * 100)
        setExportProgress(prog)
        if (prog >= 100) resolve()
        else requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    })
    setExported(true)
    setPhase('done')
  }, [stopPlayback])

  const newEdit = useCallback(() => {
    abortRef.current = true
    stopPlayback()
    setPlan(null)
    setAssets([])
    setPhase('idle')
    setProgress(0)
    setCurrentTime(0)
    setExported(false)
    setExportProgress(0)
    setLogIndex(0)
  }, [stopPlayback])

  useEffect(() => {
    return () => {
      abortRef.current = true
      playingRef.current = false
      if (raf.current != null) cancelAnimationFrame(raf.current)
    }
  }, [])

  return {
    lang,
    toggleLang,
    prompt,
    setPrompt,
    phase,
    plan,
    assets,
    progress,
    currentTime,
    playing,
    exportProgress,
    exported,
    logIndex,
    runAgent,
    play,
    pause,
    seek,
    reset,
    exportEdit,
    newEdit,
  }
}
