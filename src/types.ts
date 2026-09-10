export type Lang = 'tr' | 'en'

export type ClipKind = 'broll' | 'detail' | 'drive' | 'night' | 'static' | 'interior' | 'exhaust'

export type EffectKind =
  | 'speed-ramp'
  | 'flash'
  | 'zoom-punch'
  | 'glitch'
  | 'color-grade'
  | 'shake'
  | 'slow-mo'
  | 'whip-pan'
  | 'text-overlay'
  | 'beat-cut'

export type AgentPhase =
  | 'idle'
  | 'reading'
  | 'analyzing'
  | 'music'
  | 'footage'
  | 'timeline'
  | 'grading'
  | 'ready'
  | 'playing'
  | 'exporting'
  | 'done'

export interface BeatMarker {
  time: number
  intensity: number
  label?: string
}

export interface TimelineClip {
  id: string
  kind: ClipKind
  label: string
  labelEn: string
  start: number
  duration: number
  speed: number
  effect?: EffectKind
  effectLabel?: string
  color: string
  gradient: string
  icon: string
}

export interface EditPlan {
  title: string
  titleEn: string
  style: string
  styleEn: string
  mood: string
  moodEn: string
  music: {
    track: string
    artist: string
    bpm: number
    energy: number
    key: string
  }
  subject: {
    name: string
    category: string
    categoryEn: string
    color: string
  }
  duration: number
  aspectRatio: string
  grade: {
    name: string
    nameEn: string
    shadows: string
    mids: string
    highlights: string
    saturation: number
    contrast: number
    vignette: number
  }
  beats: BeatMarker[]
  clips: TimelineClip[]
  agentNotes: { tr: string; en: string }[]
  tags: string[]
}

export interface PromptInsight {
  music?: string
  artist?: string
  car?: string
  style?: string
  pace?: 'tight' | 'cinematic' | 'chaotic' | 'smooth'
  night?: boolean
  raw: string
}

export interface MediaAsset {
  id: string
  name: string
  kind: ClipKind | 'audio'
  duration: number
  color: string
  used: boolean
}
