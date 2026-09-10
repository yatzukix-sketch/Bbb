import { Clapperboard, Languages, Plus } from 'lucide-react'
import { AgentPanel } from './components/AgentPanel'
import { AssetLibrary } from './components/AssetLibrary'
import { GradePanel } from './components/GradePanel'
import { PreviewStage } from './components/PreviewStage'
import { PromptBar } from './components/PromptBar'
import { Timeline } from './components/Timeline'
import { useEditSession } from './hooks/useEditSession'
import { t } from './i18n'
import './App.css'

export default function App() {
  const s = useEditSession('tr')
  const c = t(s.lang)

  return (
    <div className="app">
      <div className="bg-orb a" />
      <div className="bg-orb b" />
      <div className="bg-noise" />

      <header className="topbar">
        <div className="brand">
          <div className="logo">
            <Clapperboard size={18} strokeWidth={2.4} />
          </div>
          <div>
            <strong>{c.brand}</strong>
            <span>{c.tagline}</span>
          </div>
        </div>

        <div className="top-actions">
          {s.plan && (
            <button type="button" className="btn-ghost" onClick={s.newEdit}>
              <Plus size={15} />
              {c.newEdit}
            </button>
          )}
          <button type="button" className="btn-ghost lang" onClick={s.toggleLang}>
            <Languages size={15} />
            {c.lang}
          </button>
        </div>
      </header>

      <main className="workspace">
        <div className="col-left">
          <PromptBar
            lang={s.lang}
            prompt={s.prompt}
            phase={s.phase}
            onChange={s.setPrompt}
            onSubmit={(text) => s.runAgent(text)}
          />
          <AgentPanel
            lang={s.lang}
            phase={s.phase}
            progress={s.progress}
            plan={s.plan}
            logIndex={s.logIndex}
          />
        </div>

        <div className="col-center">
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
          {s.plan && (
            <Timeline
              lang={s.lang}
              plan={s.plan}
              currentTime={s.currentTime}
              onSeek={s.seek}
            />
          )}
        </div>

        <div className="col-right">
          <AssetLibrary lang={s.lang} assets={s.assets} />
          {s.plan && <GradePanel lang={s.lang} plan={s.plan} />}
          {s.plan && (
            <div className="tags-panel">
              {s.plan.tags.map((tag) => (
                <span key={tag} className="tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="foot">
        <span>EditFlow · AI Video Agent</span>
        <span className="mono">prompt → plan → cut → grade → export</span>
      </footer>
    </div>
  )
}
