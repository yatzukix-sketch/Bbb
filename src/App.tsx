import {
  Clapperboard,
  Film,
  Languages,
  Layers,
  Plus,
  Sparkles,
  Wand2,
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { AgentPanel } from './components/AgentPanel'
import { AssetLibrary } from './components/AssetLibrary'
import { GradePanel } from './components/GradePanel'
import { PreviewStage } from './components/PreviewStage'
import { PromptBar } from './components/PromptBar'
import { Timeline } from './components/Timeline'
import { useEditSession } from './hooks/useEditSession'
import { t } from './i18n'
import './App.css'

type Tab = 'create' | 'edit' | 'media'

export default function App() {
  const s = useEditSession('tr')
  const c = t(s.lang)
  const [tab, setTab] = useState<Tab>('create')
  const [booted, setBooted] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setBooted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  // Jump to Edit tab once plan is ready
  useEffect(() => {
    if (s.phase === 'ready' || s.phase === 'playing' || s.phase === 'done') {
      setTab('edit')
    }
  }, [s.phase])

  const busy = ['reading', 'analyzing', 'music', 'footage', 'timeline', 'grading'].includes(
    s.phase,
  )

  return (
    <div className={`ios-app ${booted ? 'booted' : ''}`}>
      {/* Status-bar friendly gradient orbs */}
      <div className="ios-orb o1" />
      <div className="ios-orb o2" />

      {/* Navigation bar */}
      <header className="ios-nav glass">
        <div className="ios-nav-inner">
          <div className="ios-brand">
            <div className="ios-logo">
              <Clapperboard size={16} strokeWidth={2.5} />
            </div>
            <div className="ios-brand-text">
              <strong>{c.brand}</strong>
              <span>{c.tagline}</span>
            </div>
          </div>
          <div className="ios-nav-actions">
            {s.plan && (
              <button
                type="button"
                className="ios-nav-btn pressable"
                onClick={() => {
                  s.newEdit()
                  setTab('create')
                }}
                aria-label={c.newEdit}
              >
                <Plus size={18} strokeWidth={2.4} />
              </button>
            )}
            <button
              type="button"
              className="ios-nav-btn pressable"
              onClick={s.toggleLang}
              aria-label="Language"
            >
              <Languages size={16} strokeWidth={2.2} />
              <em>{c.lang}</em>
            </button>
          </div>
        </div>
      </header>

      {/* Main content by tab */}
      <main className="ios-main">
        {tab === 'create' && (
          <div className="ios-page scroll">
            <div className="ios-large-title">
              <h1>{s.lang === 'tr' ? 'Yeni Edit' : 'New Edit'}</h1>
              <p>
                {s.lang === 'tr'
                  ? 'Prompt yaz, agent kessin.'
                  : 'Write a prompt, let the agent cut.'}
              </p>
            </div>

            <PromptBar
              lang={s.lang}
              prompt={s.prompt}
              phase={s.phase}
              onChange={s.setPrompt}
              onSubmit={(text) => s.runAgent(text)}
            />

            {(busy || s.plan) && (
              <div className="ios-section">
                <AgentPanel
                  lang={s.lang}
                  phase={s.phase}
                  progress={s.progress}
                  plan={s.plan}
                  logIndex={s.logIndex}
                />
              </div>
            )}

            {!busy && !s.plan && (
              <div className="ios-hero-card glass">
                <div className="ios-hero-icon">
                  <Wand2 size={28} strokeWidth={2} />
                </div>
                <h2>{c.emptyTitle}</h2>
                <p>{c.emptyBody}</p>
                <div className="ios-hero-flow">
                  <span>prompt</span>
                  <i />
                  <span>plan</span>
                  <i />
                  <span>cut</span>
                  <i />
                  <span>export</span>
                </div>
              </div>
            )}

            {s.plan && !busy && (
              <button
                type="button"
                className="ios-cta pressable"
                onClick={() => setTab('edit')}
              >
                <Sparkles size={18} />
                {s.lang === 'tr' ? 'Edit’e geç · Oynat' : 'Go to Edit · Play'}
              </button>
            )}
          </div>
        )}

        {tab === 'edit' && (
          <div className="ios-page ios-page-edit">
            {!s.plan ? (
              <div className="ios-empty-edit scroll">
                <div className="ios-empty-ring" />
                <h2>{s.lang === 'tr' ? 'Henüz edit yok' : 'No edit yet'}</h2>
                <p>
                  {s.lang === 'tr'
                    ? 'Önce Create sekmesinden bir prompt gönder.'
                    : 'Send a prompt from the Create tab first.'}
                </p>
                <button type="button" className="ios-cta pressable" onClick={() => setTab('create')}>
                  <Wand2 size={18} />
                  {s.lang === 'tr' ? 'Create’e git' : 'Go to Create'}
                </button>
              </div>
            ) : (
              <>
                <div className="ios-edit-preview">
                  <PreviewStage
                    lang={s.lang}
                    plan={s.plan}
                    currentTime={s.currentTime}
                    playing={s.playing}
                    exported={s.exported}
                    exportProgress={s.exportProgress}
                    phase={s.phase}
                    onPlay={s.play}
                    onPause={s.pause}
                    onReset={s.reset}
                    onSeek={s.seek}
                    onExport={s.exportEdit}
                  />
                </div>
                <div className="ios-edit-timeline scroll">
                  <Timeline
                    lang={s.lang}
                    plan={s.plan}
                    currentTime={s.currentTime}
                    onSeek={s.seek}
                  />
                  <GradePanel lang={s.lang} plan={s.plan} />
                  <div className="ios-tags">
                    {s.plan.tags.map((tag) => (
                      <span key={tag} className="ios-tag">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'media' && (
          <div className="ios-page scroll">
            <div className="ios-large-title">
              <h1>{c.assets}</h1>
              <p>
                {s.lang === 'tr'
                  ? 'Kullanılan klipler ve kütüphane'
                  : 'Used clips and library'}
              </p>
            </div>
            <AssetLibrary lang={s.lang} assets={s.assets} />
            {s.plan && (
              <div className="ios-section">
                <AgentPanel
                  lang={s.lang}
                  phase={s.phase}
                  progress={s.progress}
                  plan={s.plan}
                  logIndex={s.logIndex}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* iOS Tab Bar */}
      <nav className="ios-tabbar glass" aria-label="Tabs">
        <div className="ios-tabbar-inner">
          <TabBtn
            active={tab === 'create'}
            label={s.lang === 'tr' ? 'Oluştur' : 'Create'}
            onClick={() => setTab('create')}
            icon={<Wand2 size={22} strokeWidth={tab === 'create' ? 2.4 : 1.8} />}
            badge={busy ? '…' : undefined}
          />
          <TabBtn
            active={tab === 'edit'}
            label={s.lang === 'tr' ? 'Edit' : 'Edit'}
            onClick={() => setTab('edit')}
            icon={<Layers size={22} strokeWidth={tab === 'edit' ? 2.4 : 1.8} />}
            badge={s.plan ? String(s.plan.clips.length) : undefined}
          />
          <TabBtn
            active={tab === 'media'}
            label={s.lang === 'tr' ? 'Medya' : 'Media'}
            onClick={() => setTab('media')}
            icon={<Film size={22} strokeWidth={tab === 'media' ? 2.4 : 1.8} />}
          />
        </div>
        <div className="ios-home-indicator" />
      </nav>
    </div>
  )
}

function TabBtn({
  active,
  label,
  onClick,
  icon,
  badge,
}: {
  active: boolean
  label: string
  onClick: () => void
  icon: ReactNode
  badge?: string
}) {
  return (
    <button
      type="button"
      className={`ios-tab ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      <span className="ios-tab-ico">
        {icon}
        {badge && <em className="ios-tab-badge">{badge}</em>}
      </span>
      <span className="ios-tab-label">{label}</span>
    </button>
  )
}
