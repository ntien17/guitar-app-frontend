export interface EarTrainingExercise {
  id: string
  type: "interval" | "chord" | "scale"
  name: string
  description: string
  notes: string[]
  difficulty: 1 | 2 | 3
}

export const earTrainingData: EarTrainingExercise[] = [
  // Intervals - easy
  {
    id: "interval-minor-second",
    type: "interval",
    name: "Bán độ (Minor Second)",
    description: "Khoảng cách nhỏ nhất, âm rất gần nhau",
    notes: ["C", "C#"],
    difficulty: 1,
  },
  {
    id: "interval-major-second",
    type: "interval",
    name: "Toàn bộ (Major Second)",
    description: "Khoảng cách giữa hai nốt liền nhau",
    notes: ["C", "D"],
    difficulty: 1,
  },
  {
    id: "interval-major-third",
    type: "interval",
    name: "Ba (Major Third)",
    description: "Khoảng cách tạo cảm giác sáng sủa",
    notes: ["C", "E"],
    difficulty: 1,
  },
  {
    id: "interval-perfect-fourth",
    type: "interval",
    name: "Quarte (Perfect Fourth)",
    description: "Khoảng cách cân bằng, hay dùng trong harmonic",
    notes: ["C", "F"],
    difficulty: 1,
  },
  {
    id: "interval-perfect-fifth",
    type: "interval",
    name: "Quinte (Perfect Fifth)",
    description: "Khoảng cách hoàn hảo, hay dùng nhất",
    notes: ["C", "G"],
    difficulty: 1,
  },
  {
    id: "interval-major-sixth",
    type: "interval",
    name: "Sáu (Major Sixth)",
    description: "Khoảng cách dịu dàng, thường dùng trong điệu ballad",
    notes: ["C", "A"],
    difficulty: 2,
  },
  {
    id: "interval-major-seventh",
    type: "interval",
    name: "Bảy (Major Seventh)",
    description: "Khoảng cách gần bằng, tạo cảm giác chưa hoàn tất",
    notes: ["C", "B"],
    difficulty: 2,
  },
  {
    id: "interval-octave",
    type: "interval",
    name: "Quãng Tám (Octave)",
    description: "Cùng một nốt ở độ cao khác nhau",
    notes: ["C", "C"],
    difficulty: 2,
  },

  // Chords - easy
  {
    id: "chord-major",
    type: "chord",
    name: "Hợp âm Lớn (Major)",
    description: "Sáng sủa, vui vẻ, dùng nhất trong nhạc",
    notes: ["C", "E", "G"],
    difficulty: 1,
  },
  {
    id: "chord-minor",
    type: "chord",
    name: "Hợp âm Nhỏ (Minor)",
    description: "Buồn, mênh mang",
    notes: ["C", "D#", "G"],
    difficulty: 1,
  },
  {
    id: "chord-dominant7",
    type: "chord",
    name: "Thất Trưởng (Dominant 7)",
    description: "Blues, sôi động, chưa hoàn tất",
    notes: ["C", "E", "G", "A#"],
    difficulty: 2,
  },
  {
    id: "chord-major7",
    type: "chord",
    name: "Lớn Thất (Major 7)",
    description: "Hiện đại, jazz, mềm mại",
    notes: ["C", "E", "G", "B"],
    difficulty: 2,
  },

  // Scales - easy
  {
    id: "scale-major",
    type: "scale",
    name: "Gam Major",
    description: "Gam cơ bản, sáng sủa",
    notes: ["C", "D", "E", "F", "G", "A", "B", "C"],
    difficulty: 1,
  },
  {
    id: "scale-minor-natural",
    type: "scale",
    name: "Gam Minor Tự Nhiên",
    description: "Gam buồn, hoàn toàn tự nhiên",
    notes: ["C", "D", "D#", "F", "G", "G#", "A#", "C"],
    difficulty: 2,
  },
  {
    id: "scale-pentatonic-major",
    type: "scale",
    name: "Gam Pentatonic Major",
    description: "5 nốt, hay dùng trong solo",
    notes: ["C", "D", "E", "G", "A", "C"],
    difficulty: 2,
  },
  {
    id: "scale-pentatonic-minor",
    type: "scale",
    name: "Gam Pentatonic Minor",
    description: "5 nốt buồn, thường dùng trong blues",
    notes: ["C", "D#", "F", "G", "A#", "C"],
    difficulty: 2,
  },
  {
    id: "scale-blues",
    type: "scale",
    name: "Gam Blues",
    description: "6 nốt, sắc thái nhạc xanh",
    notes: ["C", "D#", "F", "F#", "G", "A#", "C"],
    difficulty: 3,
  },
]

export function getExercisesByType(type: "interval" | "chord" | "scale"): EarTrainingExercise[] {
  return earTrainingData.filter((ex) => ex.type === type)
}

export function getExercisesByDifficulty(maxDifficulty: number): EarTrainingExercise[] {
  return earTrainingData.filter((ex) => ex.difficulty <= maxDifficulty)
}

export function getRandomExercise(maxDifficulty: number = 2): EarTrainingExercise {
  const filtered = getExercisesByDifficulty(maxDifficulty)
  return filtered[Math.floor(Math.random() * filtered.length)]
}

export function getExerciseById(id: string): EarTrainingExercise | undefined {
  return earTrainingData.find((ex) => ex.id === id)
}
