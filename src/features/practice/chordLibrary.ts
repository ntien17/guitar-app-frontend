export interface ChordDefinition {
  name: string
  rootNote: string
  chordType: string
  fullName: string
  fingering: string
  difficulty: 1 | 2 | 3 | 4 | 5
  tips?: string
}

const rootNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

const chordPatterns: Record<string, (root: string) => Omit<ChordDefinition, 'rootNote'>> = {
  major: (root) => ({
    name: root,
    chordType: "major",
    fullName: `${root} Major`,
    fingering: "E|0 B|2 G|2 D|2 A|0 e|0",
    difficulty: 1,
  }),
  minor: (root) => ({
    name: `${root}m`,
    chordType: "minor",
    fullName: `${root} Minor`,
    fingering: "E|0 B|1 G|2 D|2 A|0 e|0",
    difficulty: 1,
  }),
  dominant7: (root) => ({
    name: `${root}7`,
    chordType: "dominant7",
    fullName: `${root} Dominant 7`,
    fingering: "E|0 B|2 G|2 D|1 A|0 e|0",
    difficulty: 2,
  }),
  major7: (root) => ({
    name: `${root}M7`,
    chordType: "major7",
    fullName: `${root} Major 7`,
    fingering: "E|0 B|2 G|1 D|2 A|0 e|0",
    difficulty: 2,
  }),
  minor7: (root) => ({
    name: `${root}m7`,
    chordType: "minor7",
    fullName: `${root} Minor 7`,
    fingering: "E|0 B|1 G|1 D|0 A|0 e|0",
    difficulty: 2,
  }),
  dim: (root) => ({
    name: `${root}°`,
    chordType: "dim",
    fullName: `${root} Diminished`,
    fingering: "E|0 B|1 G|0 D|1 A|x e|x",
    difficulty: 3,
  }),
  sus2: (root) => ({
    name: `${root}sus2`,
    chordType: "sus2",
    fullName: `${root} Suspended 2`,
    fingering: "E|0 B|2 G|2 D|2 A|0 e|0",
    difficulty: 2,
  }),
  sus4: (root) => ({
    name: `${root}sus4`,
    chordType: "sus4",
    fullName: `${root} Suspended 4`,
    fingering: "E|0 B|3 G|2 D|2 A|0 e|0",
    difficulty: 2,
  }),
  add9: (root) => ({
    name: `${root}add9`,
    chordType: "add9",
    fullName: `${root} Add 9`,
    fingering: "E|0 B|2 G|2 D|2 A|2 e|0",
    difficulty: 2,
  }),
}

export function generateChordLibrary(): ChordDefinition[] {
  const chords: ChordDefinition[] = []

  for (const root of rootNotes) {
    for (const [chordType, pattern] of Object.entries(chordPatterns)) {
      const patternData = pattern(root)
      chords.push({ rootNote: root, ...patternData })
    }
  }

  const realFingerings: Record<string, Partial<ChordDefinition>> = {
    "C": { fingering: "E|0 B|1 G|0 D|2 A|3 e|x", difficulty: 1 },
    "Cm": { fingering: "E|0 B|1 G|3 D|3 A|x e|x", difficulty: 2 },
    "G": { fingering: "E|3 B|0 G|0 D|0 A|2 e|3", difficulty: 2 },
    "Gm": { fingering: "E|3 B|x G|0 D|0 A|3 e|3", difficulty: 3 },
    "D": { fingering: "E|x B|0 G|0 D|0 A|x e|2", difficulty: 2 },
    "Dm": { fingering: "E|x B|0 G|0 D|0 A|x e|1", difficulty: 1 },
    "A": { fingering: "E|0 B|0 G|0 D|2 A|2 e|2", difficulty: 2 },
    "Am": { fingering: "E|0 B|0 G|0 D|2 A|2 e|0", difficulty: 1 },
    "E": { fingering: "E|0 B|0 G|1 D|2 A|2 e|0", difficulty: 1 },
    "Em": { fingering: "E|0 B|0 G|0 D|2 A|2 e|0", difficulty: 1 },
    "F": { fingering: "E|1 B|1 G|2 D|3 A|3 e|1", difficulty: 4 },
    "Fmaj7": { fingering: "E|0 B|1 G|2 D|3 A|x e|x", difficulty: 2 },
    "B": { fingering: "E|2 B|2 G|3 D|4 A|4 e|2", difficulty: 5 },
    "Bm": { fingering: "E|2 B|0 G|0 D|0 A|2 e|2", difficulty: 3 },
    "G7": { fingering: "E|3 B|0 G|0 D|0 A|2 e|1", difficulty: 2 },
    "D7": { fingering: "E|x B|0 G|0 D|0 A|x e|2", difficulty: 2 },
    "A7": { fingering: "E|0 B|0 G|0 D|2 A|2 e|0", difficulty: 2 },
    "E7": { fingering: "E|0 B|0 G|1 D|2 A|2 e|0", difficulty: 1 },
    "C7": { fingering: "E|0 B|1 G|0 D|2 A|3 e|x", difficulty: 1 },
  }

  for (const chord of chords) {
    const key = chord.name
    if (key in realFingerings) {
      Object.assign(chord, realFingerings[key])
    }
  }

  return chords
}

let cachedLibrary: ChordDefinition[] | null = null

export function getChordLibrary(): ChordDefinition[] {
  if (!cachedLibrary) {
    cachedLibrary = generateChordLibrary()
  }
  return cachedLibrary
}

export function getChordByName(name: string): ChordDefinition | undefined {
  return getChordLibrary().find((chord) => chord.name === name)
}

export function getChordsByDifficulty(maxDifficulty: number): ChordDefinition[] {
  return getChordLibrary().filter((chord) => chord.difficulty <= maxDifficulty)
}

export function getRandomChord(maxDifficulty: number = 5): ChordDefinition {
  const filtered = getChordsByDifficulty(maxDifficulty)
  return filtered[Math.floor(Math.random() * filtered.length)]
}

export const CHORD_TYPES = Object.keys(chordPatterns)
export const ROOT_NOTES = rootNotes
