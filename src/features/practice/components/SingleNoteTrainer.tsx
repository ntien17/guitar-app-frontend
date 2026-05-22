import { useMemo, useState } from "react"
import { Music2, RotateCcw } from "lucide-react"
import type { PracticeResult } from "../types"

type SingleNoteTrainerProps = {
  onComplete: (result: PracticeResult) => void
}

const notes = [
  { name: "E", string: 1, fret: 0 },
  { name: "F", string: 1, fret: 1 },
  { name: "G", string: 1, fret: 3 },
  { name: "B", string: 2, fret: 0 },
  { name: "C", string: 2, fret: 1 },
  { name: "D", string: 2, fret: 3 },
  { name: "G", string: 3, fret: 0 },
  { name: "A", string: 3, fret: 2 },
  { name: "E", string: 6, fret: 0 },
  { name: "A", string: 6, fret: 5 },
]

export function SingleNoteTrainer({ onComplete }: SingleNoteTrainerProps) {
  const [noteIndex, setNoteIndex] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [startedAt] = useState(Date.now())

  const currentNote = notes[noteIndex]

  const next = () => {
    setNoteIndex(Math.floor(Math.random() * notes.length))
  }

  const mark = (isCorrect: boolean) => {
    setAttempts((value) => value + 1)
    if (isCorrect) setCorrect((value) => value + 1)
    next()
  }

  const accuracy = useMemo(() => {
    return attempts > 0 ? Math.round((correct / attempts) * 100) : 0
  }, [attempts, correct])

  const finish = () => {
    const durationSeconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000))
    onComplete({
      mode: "notes",
      durationSeconds,
      accuracyScore: accuracy,
      notes: `Luyện nhận diện nốt đơn: đúng ${correct}/${attempts}.`,
    })
  }

  const reset = () => {
    setCorrect(0)
    setAttempts(0)
    setNoteIndex(0)
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
        <Music2 className="text-blue-600" size={22} />
        Single Note Trainer
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Nhìn vị trí dây/ngăn, gọi tên nốt và tự kiểm tra độ chính xác.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-blue-50 p-6 text-center md:col-span-2">
          <p className="text-sm font-semibold text-blue-700">Nốt cần nhận diện</p>
          <p className="mt-3 text-7xl font-black text-blue-700">{currentNote.name}</p>
          <p className="mt-3 text-slate-600">
            Dây {currentNote.string}, ngăn {currentNote.fret}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-6 text-center">
          <p className="text-sm font-semibold text-slate-600">Độ chính xác</p>
          <p className="mt-3 text-5xl font-black text-slate-900">{accuracy}%</p>
          <p className="mt-2 text-xs text-slate-500">Đúng {correct}/{attempts}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button onClick={() => mark(true)} className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
          Tôi trả lời đúng
        </button>
        <button onClick={() => mark(false)} className="rounded-xl bg-red-50 px-5 py-2 text-sm font-semibold text-red-700 hover:bg-red-100">
          Tôi trả lời sai
        </button>
        <button onClick={next} className="rounded-xl bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
          Nốt khác
        </button>
        <button onClick={reset} className="flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
          <RotateCcw size={16} /> Reset
        </button>
        <button onClick={finish} className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          Hoàn thành & lưu
        </button>
      </div>
    </div>
  )
}
