import { useEffect, useRef, useState } from "react"
import { Pause, Play, Square, Waves } from "lucide-react"
import type { PracticeResult } from "../types"

type RhythmPatternTrainerProps = {
  onComplete: (result: PracticeResult) => void
}

const patterns = [
  { id: "basic", name: "Đệm cơ bản", description: "D - D U - U D U", steps: ["D", "D", "U", "U", "D", "U"], difficulty: 1 },
  { id: "ballad", name: "Ballad", description: "D - - D - U D U", steps: ["D", "D", "U", "D", "U"], difficulty: 1 },
  { id: "folk", name: "Folk", description: "D D U D U", steps: ["D", "D", "U", "D", "U"], difficulty: 2 },
  { id: "rock", name: "Rock mute", description: "D X D U X D U", steps: ["D", "X", "D", "U", "X", "D", "U"], difficulty: 3 },
]

export function RhythmPatternTrainer({ onComplete }: RhythmPatternTrainerProps) {
  const [patternIndex, setPatternIndex] = useState(0)
  const [bpm, setBpm] = useState(75)
  const [isPlaying, setIsPlaying] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const startedAtRef = useRef<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const pattern = patterns[patternIndex]

  useEffect(() => {
    if (!isPlaying) return

    intervalRef.current = setInterval(() => {
      setStepIndex((value) => (value + 1) % pattern.steps.length)
    }, 60000 / bpm)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying, bpm, pattern.steps.length])

  const start = () => {
    setIsPlaying(true)
    startedAtRef.current = Date.now()
  }

  const stop = () => {
    setIsPlaying(false)
    const durationSeconds = startedAtRef.current ? Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000)) : 0

    onComplete({
      mode: "rhythm",
      durationSeconds,
      accuracyScore: Math.min(100, 70 + Math.round(durationSeconds / 12)),
      notes: `Luyện tiết tấu ${pattern.name} ở ${bpm} BPM.`,
    })

    setStepIndex(0)
    startedAtRef.current = null
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <Waves className="text-blue-600" size={22} />
            Rhythm Pattern Trainer
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Luyện quạt lên/xuống, giữ nhịp đều và không dừng tay phải khi đổi hợp âm.
          </p>
        </div>

        <select
          value={patternIndex}
          onChange={(e) => {
            setPatternIndex(Number(e.target.value))
            setStepIndex(0)
          }}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          {patterns.map((item, index) => (
            <option value={index} key={item.id}>{item.name}</option>
          ))}
        </select>
      </div>

      <div className="mt-6 rounded-2xl bg-slate-50 p-5">
        <div className="flex flex-wrap justify-center gap-3">
          {pattern.steps.map((step, index) => (
            <div
              key={`${step}-${index}`}
              className={`flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-black transition ${
                index === stepIndex
                  ? "scale-105 bg-blue-600 text-white shadow-lg"
                  : "bg-white text-slate-500"
              }`}
            >
              {step}
            </div>
          ))}
        </div>

        <p className="mt-4 text-center text-sm text-slate-600">
          D = quạt xuống, U = quạt lên, X = chặn/mute
        </p>
      </div>

      <div className="mt-6">
        <label className="text-sm font-semibold text-slate-700">BPM: {bpm}</label>
        <input
          type="range"
          min="45"
          max="160"
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          className="mt-3 w-full"
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {!isPlaying ? (
          <button onClick={start} className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            <Play size={16} /> Bắt đầu
          </button>
        ) : (
          <button onClick={() => setIsPlaying(false)} className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-600">
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
