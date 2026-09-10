import { ArrowRight, Sparkles, Wand2 } from 'lucide-react'
import type { AgentPhase, Lang } from '../types'
import { t } from '../i18n'

const EXAMPLES = [
  {
    tr: 'Rajab şarkısını kullanarak sık bir Mercedes CLS 63 AMG editi yap',
    en: 'Tight Mercedes CLS 63 AMG edit using a Rajab track',
  },
  {
    tr: 'Gece sürüşü — BMW M4, dark trap beat, slow-mo',
    en: 'Night drive — BMW M4, dark trap beat, slow-mo',
  },
  {
    tr: 'Porsche 911 GT3 RS sinematik roll race editi',
    en: 'Porsche 911 GT3 RS cinematic roll race edit',
  },
  {
    tr: 'Agresif Audi RS6 Avant street edit, heavy bass',
    en: 'Aggressive Audi RS6 Avant street edit, heavy bass',
  },
]

interface Props {
  lang: Lang
  prompt: string
  phase: AgentPhase
  onChange: (v: string) => void
  onSubmit: (text?: string) => void
}

export function PromptBar({ lang, prompt, phase, onChange, onSubmit }: Props) {
  const c = t(lang)
  const busy = ['reading', 'analyzing', 'music', 'footage', 'timeline', 'grading'].includes(phase)

  return (
    <section className="prompt-bar">
      <div className="prompt-label">
        <Wand2 size={14} strokeWidth={2.2} />
        <span>{c.promptLabel}</span>
      </div>

      <form
        className="prompt-form"
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
      >
        <div className="prompt-input-wrap">
          <Sparkles className="prompt-icon" size={18} />
          <textarea
            value={prompt}
            onChange={(e) => onChange(e.target.value)}
            placeholder={c.promptPlaceholder}
            rows={2}
            disabled={busy}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                onSubmit()
              }
            }}
          />
        </div>
        <button type="submit" className="btn-primary" disabled={busy || !prompt.trim()}>
          {busy ? (
            <>
              <span className="spin" />
              {c.working}
            </>
          ) : (
            <>
              {c.generate}
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <div className="examples">
        <span className="examples-label">{c.examples}</span>
        <div className="example-chips">
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              type="button"
              className="chip"
              disabled={busy}
              onClick={() => {
                onChange(ex[lang])
                onSubmit(ex[lang])
              }}
            >
              {ex[lang]}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
