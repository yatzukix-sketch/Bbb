import type {
  BeatMarker,
  ClipKind,
  EditPlan,
  EffectKind,
  MediaAsset,
  PromptInsight,
  TimelineClip,
} from '../types'

const CAR_PATTERNS: { re: RegExp; name: string; color: string }[] = [
  { re: /cls\s*63|cls63|mercedes\s*cls/i, name: 'Mercedes-AMG CLS 63', color: '#c0c4cc' },
  { re: /c\s*63|c63|amg\s*c/i, name: 'Mercedes-AMG C 63', color: '#1a1a1a' },
  { re: /g\s*63|g63|g-?wagen/i, name: 'Mercedes-AMG G 63', color: '#2a2a2a' },
  { re: /gt\s*63|amg\s*gt/i, name: 'Mercedes-AMG GT 63', color: '#8b0000' },
  { re: /m4|bmw\s*m4/i, name: 'BMW M4 Competition', color: '#1c3a6e' },
  { re: /m3|bmw\s*m3/i, name: 'BMW M3', color: '#0d2b5e' },
  { re: /m5|bmw\s*m5/i, name: 'BMW M5 CS', color: '#111111' },
  { re: /911|gt3\s*rs|porsche/i, name: 'Porsche 911 GT3 RS', color: '#e6392e' },
  { re: /rs6|audi\s*rs/i, name: 'Audi RS6 Avant', color: '#2c2c2c' },
  { re: /r8|audi\s*r8/i, name: 'Audi R8 V10', color: '#c41230' },
  { re: /supra|toyota/i, name: 'Toyota GR Supra', color: '#d4a017' },
  { re: /mustang|gt500/i, name: 'Ford Mustang GT', color: '#b22222' },
  { re: /lambo|huracan|aventador|urus/i, name: 'Lamborghini Huracán', color: '#ffd700' },
  { re: /ferrari|488|sf90/i, name: 'Ferrari 488 Pista', color: '#dc143c' },
  { re: /nissan|gtr|gt-r/i, name: 'Nissan GT-R Nismo', color: '#708090' },
  { re: /tesla|model\s*s|plaid/i, name: 'Tesla Model S Plaid', color: '#e8e8e8' },
]

const ARTIST_PATTERNS: { re: RegExp; artist: string; track: string; bpm: number; key: string }[] = [
  { re: /rajab/i, artist: 'Rajab', track: 'Rajab — Selected Drop', bpm: 140, key: 'F# min' },
  { re: /travis|sicko|fe!n|feign/i, artist: 'Travis Scott', track: 'FE!N', bpm: 148, key: 'C# min' },
  { re: /metro|future/i, artist: 'Future & Metro', track: 'Like That', bpm: 135, key: 'D min' },
  { re: /playboi|carti|vamp/i, artist: 'Playboi Carti', track: 'Stop Breathing', bpm: 151, key: 'A min' },
  { re: /the\s*weeknd|blinding/i, artist: 'The Weeknd', track: 'Blinding Lights', bpm: 171, key: 'F min' },
  { re: /kanye|ye\b|yeezy/i, artist: 'Kanye West', track: 'On Sight', bpm: 128, key: 'E min' },
  { re: /drake/i, artist: 'Drake', track: 'Nonstop', bpm: 154, key: 'Bb min' },
  { re: /opium|ken\s*carson|destroy/i, artist: 'Ken Carson', track: 'Yale', bpm: 150, key: 'G min' },
  { re: /don\s*toliver/i, artist: 'Don Toliver', track: 'After Party', bpm: 130, key: 'C min' },
  { re: /asap|rocky/i, artist: 'A$AP Rocky', track: 'Praise The Lord', bpm: 146, key: 'F min' },
]

const STYLE_WORDS: { re: RegExp; style: string; styleEn: string; pace: PromptInsight['pace'] }[] = [
  { re: /s[iı]k|tight|fast\s*cut|aggressive|agresif|heavy/i, style: 'Sık kesim / street', styleEn: 'Tight cuts / street', pace: 'tight' },
  { re: /cinematic|sinematik|film|moody/i, style: 'Sinematik', styleEn: 'Cinematic', pace: 'cinematic' },
  { re: /chaotic|glitch|kaotik/i, style: 'Kaotik glitch', styleEn: 'Chaotic glitch', pace: 'chaotic' },
  { re: /smooth|ak[iı]c[iı]|flow/i, style: 'Akıcı', styleEn: 'Smooth flow', pace: 'smooth' },
  { re: /night|gece|nocturnal|dark/i, style: 'Gece sürüşü', styleEn: 'Night drive', pace: 'cinematic' },
  { re: /roll\s*race|drag/i, style: 'Roll race', styleEn: 'Roll race', pace: 'tight' },
]

function hashSeed(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function parsePrompt(raw: string): PromptInsight {
  const insight: PromptInsight = { raw, pace: 'tight' }

  for (const c of CAR_PATTERNS) {
    if (c.re.test(raw)) {
      insight.car = c.name
      break
    }
  }
  if (!insight.car && /mercedes|amg|benz/i.test(raw)) insight.car = 'Mercedes-AMG CLS 63'
  if (!insight.car && /bmw/i.test(raw)) insight.car = 'BMW M4 Competition'
  if (!insight.car && /araba|car|vehicle|auto/i.test(raw)) insight.car = 'Mercedes-AMG CLS 63'

  for (const a of ARTIST_PATTERNS) {
    if (a.re.test(raw)) {
      insight.artist = a.artist
      insight.music = a.track
      break
    }
  }
  if (!insight.artist && /şark[ıi]|track|beat|müzik|music|song/i.test(raw)) {
    insight.artist = 'Rajab'
    insight.music = 'Rajab — Selected Drop'
  }

  for (const s of STYLE_WORDS) {
    if (s.re.test(raw)) {
      insight.style = s.styleEn
      insight.pace = s.pace
      break
    }
  }
  if (/night|gece|dark|nocturnal/i.test(raw)) insight.night = true

  return insight
}

function buildBeats(bpm: number, duration: number, pace: PromptInsight['pace'], rnd: () => number): BeatMarker[] {
  const beatDur = 60 / bpm
  const beats: BeatMarker[] = []
  let t = 0
  let i = 0
  while (t < duration) {
    const isDownbeat = i % 4 === 0
    const isDrop = Math.abs(t - duration * 0.35) < beatDur * 2 || Math.abs(t - duration * 0.7) < beatDur * 2
    let intensity = isDownbeat ? 0.85 : 0.45
    if (isDrop) intensity = 1
    if (pace === 'tight' && i % 2 === 0) intensity = Math.min(1, intensity + 0.15)
    if (pace === 'chaotic') intensity = 0.5 + rnd() * 0.5
    beats.push({
      time: +t.toFixed(3),
      intensity,
      label: isDrop ? 'DROP' : isDownbeat ? '●' : undefined,
    })
    t += beatDur
    i++
  }
  return beats
}

const CLIP_POOL: {
  kind: ClipKind
  label: string
  labelEn: string
  color: string
  gradient: string
  icon: string
  baseDur: number
}[] = [
  { kind: 'static', label: 'Statik hero', labelEn: 'Static hero', color: '#3d4450', gradient: 'linear-gradient(135deg,#1a1d24,#4a5568)', icon: '▣', baseDur: 1.4 },
  { kind: 'detail', label: 'Far detay', labelEn: 'Headlight detail', color: '#c9a227', gradient: 'linear-gradient(135deg,#1a1200,#c9a227)', icon: '◉', baseDur: 0.6 },
  { kind: 'detail', label: 'Jant close-up', labelEn: 'Wheel close-up', color: '#6b7280', gradient: 'linear-gradient(135deg,#111,#6b7280)', icon: '◎', baseDur: 0.55 },
  { kind: 'detail', label: 'Egzoz / amblem', labelEn: 'Exhaust / badge', color: '#8b5a2b', gradient: 'linear-gradient(135deg,#1a0f00,#8b5a2b)', icon: '◆', baseDur: 0.5 },
  { kind: 'drive', label: 'Yan tracking', labelEn: 'Side tracking', color: '#2563eb', gradient: 'linear-gradient(135deg,#0a1628,#2563eb)', icon: '▶', baseDur: 1.8 },
  { kind: 'drive', label: 'Ön chase', labelEn: 'Front chase', color: '#1d4ed8', gradient: 'linear-gradient(135deg,#061018,#1d4ed8)', icon: '▷', baseDur: 1.5 },
  { kind: 'drive', label: 'Roll-by', labelEn: 'Roll-by', color: '#0ea5e9', gradient: 'linear-gradient(135deg,#04141c,#0ea5e9)', icon: '⇄', baseDur: 1.2 },
  { kind: 'night', label: 'Gece neon', labelEn: 'Night neon', color: '#a855f7', gradient: 'linear-gradient(135deg,#0c0618,#a855f7)', icon: '✦', baseDur: 1.6 },
  { kind: 'night', label: 'City lights bokeh', labelEn: 'City lights bokeh', color: '#ec4899', gradient: 'linear-gradient(135deg,#140018,#ec4899)', icon: '✧', baseDur: 1.0 },
  { kind: 'interior', label: 'Kokpit POV', labelEn: 'Cockpit POV', color: '#14b8a6', gradient: 'linear-gradient(135deg,#041412,#14b8a6)', icon: '▣', baseDur: 1.1 },
  { kind: 'interior', label: 'Direksiyon / pantograph', labelEn: 'Wheel / pantograph', color: '#0d9488', gradient: 'linear-gradient(135deg,#03100e,#0d9488)', icon: '◐', baseDur: 0.7 },
  { kind: 'exhaust', label: 'Launch / flame', labelEn: 'Launch / flame', color: '#ef4444', gradient: 'linear-gradient(135deg,#1a0505,#ef4444)', icon: '▲', baseDur: 0.8 },
  { kind: 'broll', label: 'Asfalt texture', labelEn: 'Asphalt texture', color: '#52525b', gradient: 'linear-gradient(135deg,#0a0a0a,#52525b)', icon: '▤', baseDur: 0.45 },
  { kind: 'broll', label: 'Skyline / sky', labelEn: 'Skyline / sky', color: '#64748b', gradient: 'linear-gradient(135deg,#0b1220,#64748b)', icon: '☁', baseDur: 0.9 },
  { kind: 'static', label: 'Wide establishing', labelEn: 'Wide establishing', color: '#374151', gradient: 'linear-gradient(135deg,#0c0e12,#374151)', icon: '▢', baseDur: 1.3 },
]

const EFFECTS: { kind: EffectKind; label: string; when: (i: number, pace: PromptInsight['pace']) => boolean }[] = [
  { kind: 'speed-ramp', label: 'Speed ramp', when: (i, p) => i % 5 === 2 || p === 'cinematic' },
  { kind: 'flash', label: 'White flash', when: (i) => i % 4 === 3 },
  { kind: 'zoom-punch', label: 'Zoom punch', when: (i, p) => p === 'tight' && i % 3 === 1 },
  { kind: 'glitch', label: 'RGB glitch', when: (i, p) => p === 'chaotic' || i % 7 === 0 },
  { kind: 'shake', label: 'Cam shake', when: (i) => i % 6 === 4 },
  { kind: 'slow-mo', label: 'Slow-mo', when: (i, p) => p === 'cinematic' && i % 4 === 0 },
  { kind: 'whip-pan', label: 'Whip pan', when: (i, p) => p === 'tight' && i % 5 === 0 },
  { kind: 'beat-cut', label: 'Beat cut', when: () => true },
  { kind: 'color-grade', label: 'Grade hit', when: (i) => i === 0 },
  { kind: 'text-overlay', label: 'Title card', when: (i) => i === 0 },
]

function pickGrade(night: boolean | undefined, pace: PromptInsight['pace']) {
  if (night) {
    return {
      name: 'Neon Noir',
      nameEn: 'Neon Noir',
      shadows: '#0a0614',
      mids: '#3b1d6e',
      highlights: '#ff6bcb',
      saturation: 1.15,
      contrast: 1.25,
      vignette: 0.55,
    }
  }
  if (pace === 'cinematic') {
    return {
      name: 'Teal & Orange',
      nameEn: 'Teal & Orange',
      shadows: '#0d2a2e',
      mids: '#4a5a5c',
      highlights: '#e8a060',
      saturation: 0.95,
      contrast: 1.15,
      vignette: 0.35,
    }
  }
  if (pace === 'chaotic') {
    return {
      name: 'Crushed Street',
      nameEn: 'Crushed Street',
      shadows: '#0a0a0a',
      mids: '#2a2a2a',
      highlights: '#f0f0f0',
      saturation: 0.7,
      contrast: 1.4,
      vignette: 0.4,
    }
  }
  return {
    name: 'AMG Graphite',
    nameEn: 'AMG Graphite',
    shadows: '#0c0c0e',
    mids: '#3a3d45',
    highlights: '#d4d8e0',
    saturation: 0.85,
    contrast: 1.3,
    vignette: 0.45,
  }
}

function carColor(name: string): string {
  const found = CAR_PATTERNS.find((c) => c.name === name)
  return found?.color ?? '#c0c4cc'
}

function resolveMusic(insight: PromptInsight) {
  for (const a of ARTIST_PATTERNS) {
    if (insight.artist && a.artist === insight.artist) {
      return { track: a.track, artist: a.artist, bpm: a.bpm, key: a.key, energy: 0.88 }
    }
  }
  return {
    track: insight.music ?? 'Rajab — Selected Drop',
    artist: insight.artist ?? 'Rajab',
    bpm: 140,
    key: 'F# min',
    energy: 0.9,
  }
}

export function generateEditPlan(rawPrompt: string): EditPlan {
  const insight = parsePrompt(rawPrompt || 'sık mercedes cls 63 amg rajab edit')
  const seed = hashSeed(rawPrompt.toLowerCase().trim() || 'default-cls63')
  const rnd = mulberry32(seed)

  const pace = insight.pace ?? 'tight'
  const music = resolveMusic(insight)
  const car = insight.car ?? 'Mercedes-AMG CLS 63'
  const duration = pace === 'cinematic' ? 28 : pace === 'smooth' ? 24 : 18
  const beats = buildBeats(music.bpm, duration, pace, rnd)

  // Build tight beat-synced clips
  const clips: TimelineClip[] = []
  let t = 0
  let idx = 0
  const targetCuts = pace === 'tight' ? 22 : pace === 'chaotic' ? 28 : pace === 'smooth' ? 12 : 14

  // Opening title
  const open = CLIP_POOL[0]
  clips.push({
    id: `c-${idx++}`,
    kind: open.kind,
    label: open.label,
    labelEn: open.labelEn,
    start: 0,
    duration: pace === 'tight' ? 0.85 : 1.4,
    speed: 1,
    effect: 'text-overlay',
    effectLabel: 'Title card',
    color: open.color,
    gradient: open.gradient,
    icon: open.icon,
  })
  t = clips[0].duration

  while (t < duration - 0.4 && clips.length < targetCuts) {
    // Snap start to nearest strong beat
    const strong = beats.filter((b) => b.intensity >= 0.8 && b.time >= t - 0.05)
    const snap = strong[0]?.time ?? t
    const start = Math.max(t, snap)

    const poolIdx = Math.floor(rnd() * CLIP_POOL.length)
    let pick = CLIP_POOL[poolIdx]
    // Bias night clips
    if (insight.night && rnd() > 0.4) {
      const nightPool = CLIP_POOL.filter((c) => c.kind === 'night' || c.kind === 'drive')
      pick = nightPool[Math.floor(rnd() * nightPool.length)] ?? pick
    }
    // Bias drive in middle
    if (start > duration * 0.3 && start < duration * 0.75 && rnd() > 0.35) {
      const drivePool = CLIP_POOL.filter((c) => c.kind === 'drive' || c.kind === 'exhaust')
      pick = drivePool[Math.floor(rnd() * drivePool.length)] ?? pick
    }

    let dur = pick.baseDur * (0.7 + rnd() * 0.6)
    if (pace === 'tight') dur *= 0.55 + rnd() * 0.35
    if (pace === 'chaotic') dur *= 0.4 + rnd() * 0.4
    if (pace === 'cinematic') dur *= 1.1 + rnd() * 0.5
    // End on beat
    const endCandidates = beats.filter((b) => b.time > start + 0.25 && b.time < start + dur + 0.5)
    const endBeat = endCandidates.find((b) => b.intensity >= 0.8) ?? endCandidates[endCandidates.length - 1]
    if (endBeat) dur = endBeat.time - start
    dur = Math.max(0.28, Math.min(dur, duration - start))

    let speed = 1
    let effect: EffectKind | undefined
    let effectLabel: string | undefined
    for (const e of EFFECTS) {
      if (e.kind === 'beat-cut') continue
      if (e.when(clips.length, pace) && rnd() > 0.35) {
        effect = e.kind
        effectLabel = e.label
        if (e.kind === 'slow-mo') speed = 0.45
        if (e.kind === 'speed-ramp') speed = 0.7 + rnd() * 0.9
        if (e.kind === 'zoom-punch') speed = 1.15
        break
      }
    }
    if (!effect) {
      effect = 'beat-cut'
      effectLabel = 'Beat cut'
    }

    clips.push({
      id: `c-${idx++}`,
      kind: pick.kind,
      label: pick.label,
      labelEn: pick.labelEn,
      start: +start.toFixed(3),
      duration: +dur.toFixed(3),
      speed: +speed.toFixed(2),
      effect,
      effectLabel,
      color: pick.color,
      gradient: pick.gradient,
      icon: pick.icon,
    })
    t = start + dur
  }

  // Closing hold
  if (t < duration) {
    const last = CLIP_POOL[14]
    clips.push({
      id: `c-${idx++}`,
      kind: last.kind,
      label: 'Kapanış hold',
      labelEn: 'Closing hold',
      start: +t.toFixed(3),
      duration: +(duration - t).toFixed(3),
      speed: 0.85,
      effect: 'slow-mo',
      effectLabel: 'Slow-mo hold',
      color: last.color,
      gradient: last.gradient,
      icon: last.icon,
    })
  }

  const grade = pickGrade(insight.night, pace)
  const styleTr =
    STYLE_WORDS.find((s) => s.pace === pace)?.style ??
    (pace === 'tight' ? 'Sık kesim / street' : 'Sinematik')
  const styleEn =
    STYLE_WORDS.find((s) => s.pace === pace)?.styleEn ??
    (pace === 'tight' ? 'Tight cuts / street' : 'Cinematic')

  const moodTr = insight.night ? 'Karanlık · neon · gece' : pace === 'tight' ? 'Agresif · bass-heavy · street' : 'Soğuk · prestij · filmik'
  const moodEn = insight.night ? 'Dark · neon · night' : pace === 'tight' ? 'Aggressive · bass-heavy · street' : 'Cool · prestige · filmic'

  const notes = [
    {
      tr: `Prompt çözüldü → konu: ${car}, müzik: ${music.artist}, tempo hedefi: ${music.bpm} BPM.`,
      en: `Prompt parsed → subject: ${car}, music: ${music.artist}, target tempo: ${music.bpm} BPM.`,
    },
    {
      tr: `${beats.filter((b) => b.intensity >= 0.85).length} güçlü beat işaretlendi; kesimler downbeat’lere kilitlendi.`,
      en: `${beats.filter((b) => b.intensity >= 0.85).length} strong beats marked; cuts locked to downbeats.`,
    },
    {
      tr: `${clips.length} klip dizildi · ${clips.filter((c) => c.effect && c.effect !== 'beat-cut').length} efekt katmanı · grade: ${grade.name}.`,
      en: `${clips.length} clips laid · ${clips.filter((c) => c.effect && c.effect !== 'beat-cut').length} effect layers · grade: ${grade.nameEn}.`,
    },
    {
      tr: pace === 'tight'
        ? 'Sık kesim modu: ortalama shot süresi ~0.6–0.9 sn, zoom-punch ve whip-pan drop’larda.'
        : pace === 'cinematic'
          ? 'Sinematik mod: uzun hold’lar, speed-ramp giriş/çıkış, teal-orange grade.'
          : 'Akış moduna göre pacing ve efekt ağırlığı ayarlandı.',
      en: pace === 'tight'
        ? 'Tight-cut mode: avg shot length ~0.6–0.9s, zoom-punch & whip-pan on drops.'
        : pace === 'cinematic'
          ? 'Cinematic mode: longer holds, speed-ramp in/out, teal-orange grade.'
          : 'Pacing and effect weight tuned to flow mode.',
    },
    {
      tr: `Önerilen export: 1080×1920 (9:16) veya 1920×1080 · ${music.bpm >= 140 ? '48' : '30'} fps · H.264 high.`,
      en: `Suggested export: 1080×1920 (9:16) or 1920×1080 · ${music.bpm >= 140 ? '48' : '30'} fps · H.264 high.`,
    },
  ]

  return {
    title: `${car.split(' ').slice(-2).join(' ')} × ${music.artist}`,
    titleEn: `${car.split(' ').slice(-2).join(' ')} × ${music.artist}`,
    style: styleTr,
    styleEn,
    mood: moodTr,
    moodEn,
    music: {
      track: music.track,
      artist: music.artist,
      bpm: music.bpm,
      energy: music.energy,
      key: music.key,
    },
    subject: {
      name: car,
      category: 'Performance sedan',
      categoryEn: 'Performance sedan',
      color: carColor(car),
    },
    duration,
    aspectRatio: '9:16',
    grade,
    beats,
    clips,
    agentNotes: notes,
    tags: [
      music.artist,
      car.split(' ')[0],
      pace ?? 'tight',
      insight.night ? 'night' : 'day',
      'amg-edit',
      'beat-sync',
    ],
  }
}

export function planToAssets(plan: EditPlan): MediaAsset[] {
  const seen = new Set<string>()
  const assets: MediaAsset[] = []
  for (const c of plan.clips) {
    const key = `${c.kind}-${c.labelEn}`
    if (seen.has(key)) continue
    seen.add(key)
    assets.push({
      id: `a-${assets.length}`,
      name: c.labelEn,
      kind: c.kind,
      duration: c.duration,
      color: c.color,
      used: true,
    })
  }
  assets.push({
    id: 'a-audio',
    name: `${plan.music.artist} — stem`,
    kind: 'audio',
    duration: plan.duration,
    color: '#ff3d5a',
    used: true,
  })
  // unused library fillers
  const fillers: MediaAsset[] = [
    { id: 'lib-1', name: 'Parking garage B-roll', kind: 'broll', duration: 4.2, color: '#3f3f46', used: false },
    { id: 'lib-2', name: 'Rain on hood', kind: 'detail', duration: 2.8, color: '#1e3a5f', used: false },
    { id: 'lib-3', name: 'Tunnel pass', kind: 'drive', duration: 3.5, color: '#312e81', used: false },
    { id: 'lib-4', name: 'Cabin ambient mic', kind: 'audio', duration: 12, color: '#7f1d1d', used: false },
  ]
  return [...assets, ...fillers]
}

export const AGENT_STEPS: { phase: EditPlan extends never ? never : import('../types').AgentPhase; ms: number }[] = [
  { phase: 'reading', ms: 700 },
  { phase: 'analyzing', ms: 900 },
  { phase: 'music', ms: 1100 },
  { phase: 'footage', ms: 1000 },
  { phase: 'timeline', ms: 1200 },
  { phase: 'grading', ms: 800 },
  { phase: 'ready', ms: 400 },
]
