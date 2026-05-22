import { useEffect, useRef, useState } from "react"
import { Pause, Play, Square, Timer } from "lucide-react"
import { playClick } from "../audioEngine"
import type { PracticeResult } from "../types"

type TempoTrainerProps = {
  onComplete: (result: PracticeResult) => void
}

const progressions = [
  { name: "Pop cơ bản", chords: ["C", "G", "Am", "F"] },
  { name: "Ballad Việt", chords: ["Am", "F", "C", "G"] },
  { name: "Dân ca", chords: ["C", "Am", "Dm", "G"] },
  { name: "Beginner", chords: ["Em", "Am", "C", "G"] },
]

export function TempoTrainer({ onComplete }: TempoTrainerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [bpm, setBpm] = useState(80)
  const [beat, setBeat] = useState(1)
  const [progressionIndex, setProgressionIndex] = useState(0)
  const [chordIndex, setChordIndex] = useState(0)
  const startTimeRef = useRef<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const progression = progressions[progressionIndex]
  const currentChord = progression.chords[chordIndex]

  const playMetronomeClick = (accent: boolean) => {
    playClick(accent ? 1100 : 760, 0.06)
  }

  useEffect(() => {
    if (!isPlaying) return

    intervalRef.current = setInterval(() => {
      setBeat((prev) => {
        const nextBeat = prev >= 4 ? 1 : prev + 1
        playMetronomeClick(nextBeat === 1)

        if (nextBeat === 1) {
          setChordIndex((index) => (index + 1) % progression.chords.length)
        }

        return nextBeat
      })
    }, 60000 / bpm)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying, bpm, progression.chords.length])

  const start = () => {
    setIsPlaying(true)
    startTimeRef.current = Date.now()
    playMetronomeClick(true)
  }

  const pause = () => setIsPlaying(false)

  const stop = () => {
    setIsPlaying(false)
    const durationSeconds = startTimeRef.current
      ? Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000))
      : 0

    onComplete({
      mode: "tempo",
      durationSeconds,
      accuracyScore: Math.min(100, 65 + Math.round(durationSeconds / 10)),
      notes: `Luyện metronome ${bpm} BPM với vòng ${progression.name}.`,
    })

    setBeat(1)
    setChordIndex(0)
    startTimeRef.current = null
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <Timer className="text-blue-600" size={22} />
            Tempo Trainer
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Luyện giữ nhịp, đổi hợp âm theo ô nhịp và phát triển cảm giác tempo.
          </p>
        </div>

        <select
          value={progressionIndex}
          onChange={(e) => {
            setProgressionIndex(Number(e.target.value))
            setChordIndex(0)
          }}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          {progressions.map((item, index) => (
            <option key={item.name} value={index}>{item.name}</option>
          ))}
        </select>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-blue-50 p-5 text-center">
          <p className="text-sm font-medium text-blue-700">BPM</p>
          <p className="mt-2 text-4xl font-bold text-blue-700">{bpm}</p>
          <input
            type="range"
            min="40"
            max="180"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="mt-4 w-full"
          />
        </div>

        <div className="rounded-2xl bg-slate-50 p-5 text-center">
          <p className="text-sm font-medium text-slate-600">Phách</p>
          <div className="mt-4 flex justify-center gap-2">
            {[1, 2, 3, 4].map((item) => (
              <span
                key={item}
                className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold ${
                  item === beat ? "bg-blue-600 text-white" : "bg-white text-slate-500"
                }`}
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 p-5 text-center">
          <p className="text-sm font-medium text-slate-600">Hợp âm hiện tại</p>
          <p className="mt-2 text-5xl font-bold text-slate-900">{currentChord}</p>
          <p className="mt-2 text-xs text-slate-500">{progression.chords.join(" → ")}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {!isPlaying ? (
          <button onClick={start} className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            <Play size={16} /> Bắt đầu
          </button>
        ) : (
          <button onClick={pause} className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-600">
            <Pause size={16} /> Tạm dừng
          </button>
        )}

        <button onClick={stop} className="flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
          <Square size={16} /> Hoàn thành & lưu
        </button>
      </div>
    </div>
  )
}
