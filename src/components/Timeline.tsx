import { useMemo, useRef } from 'react'
import type { EditPlan, Lang } from '../types'
import { t } from '../i18n'

interface Props {
  lang: Lang
  plan: EditPlan
  currentTime: number
  onSeek: (t: number) => void
}

export function Timeline({ lang, plan, currentTime, onSeek }: Props) {
  const c = t(lang)
  const trackRef = useRef<HTMLDivElement>(null)
  const dur = plan.duration

  const effectCount = useMemo(
    () => plan.clips.filter((x) => x.effect && x.effect !== 'beat-cut').length,
    [plan.clips],
  )

  const onClickTrack = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = trackRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    onSeek((x / rect.width) * dur)
  }

  return (
    <section className="timeline">
      <header className="panel-head">
        <div className="panel-title">
          <h2>{c.timeline}</h2>
        </div>
        <div className="timeline-stats">
          <span>
            <b>{plan.clips.length}</b> {c.clips}
          </span>
          <span>
            <b>{plan.clips.length - 1}</b> {c.cuts}
          </span>
          <span>
            <b>{effectCount}</b> {c.effects}
          </span>
          <span>
            <b>{plan.music.bpm}</b> {c.bpm}
          </span>
        </div>
      </header>

      <div className="tl-ruler">
        {Array.from({ length: Math.ceil(dur) + 1 }).map((_, i) => (
          <span key={i} style={{ left: `${(i / dur) * 100}%` }}>
            {i}s
          </span>
        ))}
      </div>

      <div className="tl-beats" ref={trackRef} onClick={onClickTrack}>
        {plan.beats.map((b, i) => (
          <i
            key={i}
            className={b.intensity > 0.85 ? 'strong' : b.intensity > 0.6 ? 'mid' : 'soft'}
            style={{
              left: `${(b.time / dur) * 100}%`,
              opacity: 0.35 + b.intensity * 0.65,
              height: `${30 + b.intensity * 70}%`,
            }}
            title={b.label}
          />
        ))}
        <div className="tl-playhead" style={{ left: `${(currentTime / dur) * 100}%` }}>
          <div className="tl-playhead-head" />
        </div>
      </div>

      <div className="tl-track-label">V1 · Video</div>
      <div className="tl-clips" onClick={onClickTrack}>
        {plan.clips.map((clip) => (
          <div
            key={clip.id}
            className={`tl-clip ${clip.effect ?? ''}`}
            style={{
              left: `${(clip.start / dur) * 100}%`,
              width: `${(clip.duration / dur) * 100}%`,
              background: clip.gradient,
              borderColor: clip.color,
            }}
            title={`${lang === 'tr' ? clip.label : clip.labelEn} · ${clip.effectLabel ?? ''} · ${clip.speed}x`}
            onClick={(e) => {
              e.stopPropagation()
              onSeek(clip.start)
            }}
          >
            <span className="tl-clip-ico">{clip.icon}</span>
            <span className="tl-clip-name">{lang === 'tr' ? clip.label : clip.labelEn}</span>
            {clip.effect && clip.effect !== 'beat-cut' && (
              <span className="tl-clip-fx">{clip.effectLabel}</span>
            )}
          </div>
        ))}
        <div className="tl-playhead thin" style={{ left: `${(currentTime / dur) * 100}%` }} />
      </div>

      <div className="tl-track-label audio">A1 · {plan.music.track}</div>
      <div className="tl-audio" onClick={onClickTrack}>
        <div className="tl-waveform">
          {Array.from({ length: 80 }).map((_, i) => {
            const t = (i / 80) * dur
            const beat = plan.beats.reduce((best, b) => {
              const d = Math.abs(b.time - t)
              return d < Math.abs(best.time - t) ? b : best
            }, plan.beats[0])
            const h = 20 + (beat?.intensity ?? 0.4) * 70 + Math.sin(i * 0.7) * 10
            return <span key={i} style={{ height: `${h}%` }} />
          })}
        </div>
        <div className="tl-audio-tag">
          {plan.music.artist} · {plan.music.key} · {plan.music.bpm} BPM
        </div>
        <div className="tl-playhead thin" style={{ left: `${(currentTime / dur) * 100}%` }} />
      </div>
    </section>
  )
}
