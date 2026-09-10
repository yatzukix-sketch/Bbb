import type { EditPlan, Lang } from '../types'
import { t } from '../i18n'

interface Props {
  lang: Lang
  plan: EditPlan
}

export function GradePanel({ lang, plan }: Props) {
  const c = t(lang)
  const g = plan.grade

  return (
    <div className="grade-panel">
      <header className="panel-head tight">
        <div className="panel-title">
          <h2>{c.grade}</h2>
        </div>
        <span className="grade-name">{lang === 'tr' ? g.name : g.nameEn}</span>
      </header>

      <div
        className="grade-preview"
        style={{
          background: `linear-gradient(135deg, ${g.shadows}, ${g.mids} 45%, ${g.highlights})`,
        }}
      />

      <div className="grade-sliders">
        <Slider label="Saturation" value={g.saturation} min={0} max={2} />
        <Slider label="Contrast" value={g.contrast} min={0.5} max={2} />
        <Slider label="Vignette" value={g.vignette} min={0} max={1} />
      </div>

      <div className="grade-swatches">
        <Swatch label="Shadows" color={g.shadows} />
        <Swatch label="Mids" color={g.mids} />
        <Swatch label="Highs" color={g.highlights} />
      </div>
    </div>
  )
}

function Slider({ label, value, min, max }: { label: string; value: number; min: number; max: number }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <label className="g-slider">
      <span>
        {label}
        <b>{value.toFixed(2)}</b>
      </span>
      <div className="g-track">
        <div className="g-fill" style={{ width: `${pct}%` }} />
        <div className="g-thumb" style={{ left: `${pct}%` }} />
      </div>
    </label>
  )
}

function Swatch({ label, color }: { label: string; color: string }) {
  return (
    <div className="g-swatch">
      <i style={{ background: color }} />
      <div>
        <span>{label}</span>
        <code>{color}</code>
      </div>
    </div>
  )
}
