import { Activity, Brain, CheckCircle2, Clapperboard, Disc3, Film, Palette, ScanSearch } from 'lucide-react'
import type { AgentPhase, EditPlan, Lang } from '../types'
import { t } from '../i18n'

const PHASE_META: {
  key: AgentPhase
  icon: typeof Brain
}[] = [
  { key: 'reading', icon: ScanSearch },
  { key: 'analyzing', icon: Brain },
  { key: 'music', icon: Disc3 },
  { key: 'footage', icon: Film },
  { key: 'timeline', icon: Clapperboard },
  { key: 'grading', icon: Palette },
  { key: 'ready', icon: CheckCircle2 },
]

interface Props {
  lang: Lang
  phase: AgentPhase
  progress: number
  plan: EditPlan | null
  logIndex: number
}

export function AgentPanel({ lang, phase, progress, plan, logIndex }: Props) {
  const c = t(lang)
  const activeIdx = PHASE_META.findIndex((p) => p.key === phase)
  const isWorking = activeIdx >= 0 && phase !== 'ready' && phase !== 'playing' && phase !== 'done' && phase !== 'exporting'

  return (
    <aside className="agent-panel">
      <header className="panel-head">
        <div className="panel-title">
          <Activity size={15} />
          <h2>{c.agent}</h2>
        </div>
        <span className={`phase-pill ${isWorking ? 'live' : ''}`}>
          {c.phase[phase] ?? phase}
        </span>
      </header>

      {(isWorking || progress > 0) && phase !== 'idle' && (
        <div className="agent-progress">
          <div className="agent-progress-bar" style={{ width: `${progress}%` }} />
        </div>
      )}

      <ol className="agent-steps">
        {PHASE_META.map((step, i) => {
          const Icon = step.icon
          const done = activeIdx > i || phase === 'ready' || phase === 'playing' || phase === 'done' || phase === 'exporting'
          const current = step.key === phase || (phase === 'playing' && step.key === 'ready')
          return (
            <li key={step.key} className={`${done ? 'done' : ''} ${current ? 'current' : ''}`}>
              <span className="step-ico">
                <Icon size={14} />
              </span>
              <span className="step-label">{c.phase[step.key]}</span>
              {current && isWorking && <span className="step-pulse" />}
              {done && !current && <CheckCircle2 size={12} className="step-check" />}
            </li>
          )
        })}
      </ol>

      {plan && (
        <div className="agent-notes">
          <h3>{c.notes}</h3>
          <ul>
            {plan.agentNotes.slice(0, Math.max(1, logIndex)).map((n, i) => (
              <li key={i}>
                <span className="note-idx">{String(i + 1).padStart(2, '0')}</span>
                <p>{lang === 'tr' ? n.tr : n.en}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {plan && (
        <div className="agent-meta-grid">
          <Meta label={c.music} value={`${plan.music.artist}`} sub={`${plan.music.bpm} ${c.bpm} · ${plan.music.key}`} />
          <Meta label={c.subject} value={plan.subject.name} sub={lang === 'tr' ? plan.subject.category : plan.subject.categoryEn} />
          <Meta label={c.style} value={lang === 'tr' ? plan.style : plan.styleEn} sub={lang === 'tr' ? plan.mood : plan.moodEn} />
          <Meta label={c.grade} value={lang === 'tr' ? plan.grade.name : plan.grade.nameEn} sub={`sat ${plan.grade.saturation.toFixed(2)} · con ${plan.grade.contrast.toFixed(2)}`} />
        </div>
      )}
    </aside>
  )
}

function Meta({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="meta-card">
      <span className="meta-label">{label}</span>
      <strong>{value}</strong>
      {sub && <span className="meta-sub">{sub}</span>}
    </div>
  )
}
