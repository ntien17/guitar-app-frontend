import { useMemo, useState } from "react"
import { CheckCircle2, RotateCcw, Shuffle, Play } from "lucide-react"
import { ChordDiagram } from "./ChordDiagram"
import { getChordsByDifficulty, getRandomChord } from "../chordLibrary"
import { playChordArpeggio } from "../audioEngine"
import type { ChordDefinition } from "../chordLibrary"
import type { PracticeResult } from "../types"

type RandomChordTrainerProps = {
  onComplete: (result: PracticeResult) => void
}

const DEFAULT_DIFFICULTY = 3

export function RandomChordTrainer({ onComplete }: RandomChordTrainerProps) {
  const [currentChord, setCurrentChord] = useState<ChordDefinition | null>(() =>
    getRandomChord(DEFAULT_DIFFICULTY)
  )
  const [correct, setCorrect] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [difficulty, setDifficulty] = useState(DEFAULT_DIFFICULTY)
  const [startedAt, setStartedAt] = useState<number | null>(Date.now())
  const [playing, setPlaying] = useState(false)

  const filteredChords = useMemo(
    () => getChordsByDifficulty(difficulty),
    [difficulty]
  )

  const nextChord = () => {
    if (filteredChords.length === 0) return
    const next =
      filteredChords[Math.floor(Math.random() * filteredChords.length)]
    setCurrentChord(next)
  }

  const playCurrentChord = async () => {
    if (!currentChord || playing) return

    setPlaying(true)
    try {
      const notes = currentChord.fingering
        .split(/\s+/)
        .filter((part) => {
          const [_, fret] = part.split("|")
          return fret && fret !== "x" && fret !== "0"
        })
        .map((part) => {
          const [string, fret] = part.split("|")
          // Map strings to notes (simplified - E2,B2,G3,D3,A2,E3)
          const stringNotes: Record<string, string> = {
            E: "E",
            B: "B",
            G: "G",
            D: "D",
            A: "A",
          }
          const baseNote = stringNotes[string.toUpperCase()] || "C"
          return baseNote
        })

      await playChordArpeggio(notes.slice(0, 6), 0.3, 4)
    } catch (error) {
      console.error("Error playing chord:", error)
    } finally {
      setPlaying(false)
    }
  }

  const markAnswer = (isCorrect: boolean) => {
    setAttempts((value) => value + 1)
    if (isCorrect) setCorrect((value) => value + 1)
    nextChord()
  }

  const reset = () => {
    setCorrect(0)
    setAttempts(0)
    setCurrentChord(getRandomChord(difficulty))
    setStartedAt(Date.now())
  }

  const finish = () => {
    const durationSeconds = startedAt
      ? Math.max(1, Math.round((Date.now() - startedAt) / 1000))
      : 0
    const accuracyScore = attempts > 0 ? Math.round((correct / attempts) * 100) : 0

    onComplete({
      mode: "chords",
      durationSeconds,
      accuracyScore,
      notes: `Luyện hợp âm ngẫu nhiên: đúng ${correct}/${attempts}, độ khó tối đa ${difficulty}/5.`,
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <Shuffle className="text-blue-600" size={22} />
              Luyện Hợp Âm Ngẫu Nhiên
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Hệ thống đưa hợp âm ngẫu nhiên, bạn tự bấm trên đàn rồi đánh dấu đúng/sai.
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 px-4 py-2 text-sm text-slate-600">
            Đúng: <strong className="text-slate-900">{correct}</strong> / {attempts}
          </div>
        </div>

        <div className="mt-6 rounded-3xl bg-blue-50 p-8 text-center">
          <p className="text-sm font-semibold text-blue-700">Hợp âm cần bấm</p>
          <p className="mt-3 text-7xl font-black text-blue-700">
            {currentChord?.name}
          </p>
          <p className="mt-2 text-slate-600">{currentChord?.fullName}</p>
        </div>

        <div className="mt-6">
          <label className="text-sm font-semibold text-slate-700">
            Độ khó tối đa: {difficulty}/5
          </label>
          <input
            type="range"
            min="1"
            max="5"
            value={difficulty}
            onChange={(e) => setDifficulty(Number(e.target.value))}
            className="mt-3 w-full"
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={playCurrentChord}
            disabled={playing}
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
          >
            <Play size={16} /> Phát âm (nếu có)
          </button>

          <button
            onClick={() => markAnswer(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <CheckCircle2 size={16} /> Đúng
          </button>

          <button
            onClick={() => markAnswer(false)}
            className="rounded-xl bg-red-50 px-5 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
          >
            Sai / Chưa sạch tiếng
          </button>

          <button
            onClick={nextChord}
            className="rounded-xl bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
          >
            Hợp âm khác
          </button>

          <button
            onClick={reset}
            className="flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
          >
            <RotateCcw size={16} /> Reset
          </button>

          <button
            onClick={finish}
            className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Hoàn thành & lưu
          </button>
        </div>
      </div>

      <ChordDiagram chord={currentChord} />
    </div>
  )
}
