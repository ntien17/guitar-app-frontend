export type PracticeMode = "guide" | "tempo" | "chords" | "chord-quiz" | "rhythm" | "notes" | "ear-training"

export type PracticeSessionPayload = {
  userId: string
  lessonId?: string | null
  practiceMinutes: number
  accuracyScore?: number | null
  notes?: string
  practiceType?: string
  practiceTitle?: string
  bpm?: number
  chordName?: string
  rhythmPattern?: string
  noteName?: string
} 

export type PracticeResult = {
  mode: PracticeMode
  durationSeconds: number
  accuracyScore: number
  notes: string
}

export type ChordInfo = {
  name: string
  fullName: string
  difficulty: 1 | 2 | 3 | 4 | 5
  fingering: string
  tips?: string
}
