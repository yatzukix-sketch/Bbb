import { Download, Pause, Play, RotateCcw, Share2 } from 'lucide-react'
import { useMemo } from 'react'
import type { EditPlan, Lang, TimelineClip } from '../types'
import { t } from '../i18n'

interface Props {
  lang: Lang
  plan: EditPlan | null
  currentTime: number
  playing: boolean
  exported: boolean
  exportProgress: number
  phase: string
  onPlay: () => void
  onPause: () => void
  onReset: () => void
  onSeek: (t: number) => void
  onExport: () => void
}

function clipAt(plan: EditPlan, time: number): TimelineClip | null {
  for (let i = plan.clips.length - 1; i >= 0; i--) {
    const c = plan.clips[i]
    if (time >= c.start && time < c.start + c.duration) return c
  }
  return plan.clips[plan.clips.length - 1] ?? null
}

function fmt(t: number) {
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  const f = Math.floor((t % 1) * 10)
  return `${m}:${String(s).padStart(2, '0')}.${f}`
}

export function PreviewStage({
  lang,
  plan,
  currentTime,
  playing,
  exported,
  exportProgress,
  phase,
  onPlay,
  onPause,
  onReset,
  onSeek,
  onExport,
}: Props) {
  const c = t(lang)
  const clip = plan ? clipAt(plan, currentTime) : null
  const beatFlash = useMemo(() => {
    if (!plan) return 0
    const near = plan.beats.find((b) => Math.abs(b.time - currentTime) < 0.08 && b.intensity > 0.8)
    return near ? near.intensity : 0
  }, [plan, currentTime])

  const localT = clip ? (currentTime - clip.start) / Math.max(0.01, clip.duration) : 0
  const speedScale =
    clip?.effect === 'zoom-punch'
      ? 1 + localT * 0.12
      : clip?.effect === 'slow-mo'
        ? 1.04
        : clip?.speed && clip.speed !== 1
          ? 1 + (1 - clip.speed) * 0.08
          : 1

  const shake =
    clip?.effect === 'shake' && playing
      ? { x: Math.sin(currentTime * 40) * 3, y: Math.cos(currentTime * 37) * 2 }
      : { x: 0, y: 0 }

  const glitch = clip?.effect === 'glitch' && playing

  return (
    <section className="preview-stage">
      <header className="panel-head">
        <div className="panel-title">
          <span className="rec-dot" data-live={playing} />
          <h2>{c.preview}</h2>
        </div>
        {plan && (
          <div className="preview-stats">
            <span>{plan.aspectRatio}</span>
            <span>{plan.duration.toFixed(1)}{c.seconds}</span>
            <span>{plan.music.bpm} {c.bpm}</span>
          </div>
        )}
      </header>

      <div className="preview-frame-wrap">
        {!plan ? (
          <div className="preview-empty">
            <div className="empty-ring" />
            <h3>{c.emptyTitle}</h3>
            <p>{c.emptyBody}</p>
          </div>
        ) : (
          <div
            className={`preview-frame ${glitch ? 'glitch' : ''} ${clip?.effect === 'flash' && localT < 0.12 ? 'flash' : ''}`}
            style={{
              ['--grade-shadow' as string]: plan.grade.shadows,
              ['--grade-mid' as string]: plan.grade.mids,
              ['--grade-high' as string]: plan.grade.highlights,
              ['--vignette' as string]: String(plan.grade.vignette),
              ['--beat' as string]: String(beatFlash),
            }}
          >
            <div
              className="preview-scene"
              style={{
                background: clip?.gradient ?? plan.grade.mids,
                transform: `translate(${shake.x}px, ${shake.y}px) scale(${speedScale})`,
                filter: `contrast(${plan.grade.contrast}) saturate(${plan.grade.saturation})`,
              }}
            >
              <div className="scene-grid" />
              <div className="scene-car" style={{ ['--car' as string]: plan.subject.color }}>
                <div className="car-body">
                  <div className="car-cabin" />
                  <div className="car-hood" />
                  <div className="car-wheel w-l" />
                  <div className="car-wheel w-r" style={{ animationDuration: `${0.4 / (clip?.speed || 1)}s` }} />
                  <div className="car-light l" />
                  <div className="car-light r" />
                  <div className="car-stripe" />
                </div>
                {(clip?.kind === 'drive' || clip?.kind === 'exhaust') && (
                  <div className="speed-lines">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <span key={i} style={{ top: `${12 + i * 10}%`, animationDelay: `${i * 0.07}s` }} />
                    ))}
                  </div>
                )}
                {clip?.kind === 'night' && <div className="neon-glow" />}
              </div>

              <div className="scene-hud">
                <div className="hud-top">
                  <span className="hud-brand">EDITFLOW</span>
                  <span className="hud-clip">
                    {clip?.icon} {lang === 'tr' ? clip?.label : clip?.labelEn}
                  </span>
                </div>
                <div className="hud-center">
                  {clip?.effect === 'text-overlay' && localT < 0.7 && (
                    <div className="title-card">
                      <span className="tc-sub">{plan.music.artist.toUpperCase()}</span>
                      <h2>{plan.subject.name}</h2>
                      <span className="tc-tag">{lang === 'tr' ? plan.style : plan.styleEn}</span>
                    </div>
                  )}
                </div>
                <div className="hud-bottom">
                  <span>{clip?.effectLabel ?? 'cut'}</span>
                  <span>{(clip?.speed ?? 1).toFixed(2)}x</span>
                  <span>{plan.music.bpm} BPM</span>
                </div>
              </div>

              <div className="vignette" />
              <div className="film-grain" />
              {glitch && (
                <>
                  <div className="glitch-r" />
                  <div className="glitch-b" />
                </>
              )}
              <div className="beat-flash" />
            </div>

            <div className="preview-chrome">
              <span>{plan.title}</span>
              <span>
                {fmt(currentTime)} / {fmt(plan.duration)}
              </span>
            </div>
          </div>
        )}
      </div>

      {plan && (
        <>
          <div className="transport">
            <button type="button" className="icon-btn" onClick={onReset} title={c.reset}>
              <RotateCcw size={16} />
            </button>
            <button
              type="button"
              className="play-btn pressable"
              onClick={() => (playing ? onPause() : onPlay())}
              aria-label={playing ? c.pause : c.play}
            >
              {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
              <span>{playing ? c.pause : c.play}</span>
            </button>
            <input
              type="range"
              min={0}
              max={plan.duration}
              step={0.01}
              value={currentTime}
              onChange={(e) => onSeek(Number(e.target.value))}
              className="seek"
            />
            <button
              type="button"
              className="btn-export"
              onClick={onExport}
              disabled={phase === 'exporting'}
            >
              <Download size={15} />
              {phase === 'exporting' ? `${c.exporting} ${Math.round(exportProgress)}%` : exported ? c.exported : c.export}
            </button>
            {exported && (
              <button type="button" className="icon-btn" title={c.share}>
                <Share2 size={16} />
              </button>
            )}
          </div>

          {phase === 'exporting' && (
            <div className="export-bar">
              <div style={{ width: `${exportProgress}%` }} />
            </div>
          )}
          {exported && (
            <div className="export-done">
              <CheckBadge />
              <div>
                <strong>{plan.title.replace(/\s+/g, '_')}_EditFlow.mp4</strong>
                <span>1080×1920 · H.264 · {plan.music.bpm >= 140 ? '48' : '30'}fps · ~{(plan.duration * 2.4).toFixed(0)} MB</span>
              </div>
              <button type="button" className="btn-ghost">
                {c.downloadMp4}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}

function CheckBadge() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" stroke="#22c55e" strokeWidth="2" />
      <path d="M7 12.5l3 3 7-7" stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
