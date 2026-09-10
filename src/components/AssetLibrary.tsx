import { Film, Music2, Upload } from 'lucide-react'
import type { Lang, MediaAsset } from '../types'
import { t } from '../i18n'

interface Props {
  lang: Lang
  assets: MediaAsset[]
}

export function AssetLibrary({ lang, assets }: Props) {
  const c = t(lang)
  const used = assets.filter((a) => a.used)
  const library = assets.filter((a) => !a.used)

  return (
    <aside className="asset-library">
      <header className="panel-head">
        <div className="panel-title">
          <Film size={15} />
          <h2>{c.assets}</h2>
        </div>
      </header>

      <div className="dropzone">
        <Upload size={18} />
        <p>{c.dropHint}</p>
      </div>

      {used.length > 0 && (
        <div className="asset-group">
          <h3>{c.usedAssets}</h3>
          <ul>
            {used.map((a) => (
              <AssetRow key={a.id} asset={a} />
            ))}
          </ul>
        </div>
      )}

      {library.length > 0 && (
        <div className="asset-group dim">
          <h3>{c.library}</h3>
          <ul>
            {library.map((a) => (
              <AssetRow key={a.id} asset={a} />
            ))}
          </ul>
        </div>
      )}

      {assets.length === 0 && (
        <p className="asset-empty">{lang === 'tr' ? 'Agent çalışınca medya burada listelenir.' : 'Media appears here after the agent runs.'}</p>
      )}
    </aside>
  )
}

function AssetRow({ asset }: { asset: MediaAsset }) {
  const isAudio = asset.kind === 'audio'
  return (
    <li className="asset-row">
      <span className="asset-swatch" style={{ background: asset.color }}>
        {isAudio ? <Music2 size={12} /> : <Film size={12} />}
      </span>
      <div className="asset-info">
        <strong>{asset.name}</strong>
        <span>
          {asset.kind} · {asset.duration.toFixed(1)}s
        </span>
      </div>
      {asset.used && <span className="asset-used">in</span>}
    </li>
  )
}
