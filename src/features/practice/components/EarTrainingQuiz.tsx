import { useState, useEffect } from "react"
import { CheckCircle2, RotateCcw, Volume2 } from "lucide-react"
import {
  getRandomExercise,
  getExercisesByDifficulty,
  type EarTrainingExercise,
} from "../earTrainingData"
import { playChordArpeggio, playSequence } from "../audioEngine"
import type { PracticeResult } from "../types"

type EarTrainingQuizProps = {
  onComplete: (result: PracticeResult) => void
}

export function EarTrainingQuiz({ onComplete }: EarTrainingQuizProps) {
  const [currentExercise, setCurrentExercise] = useState<EarTrainingExercise | null>(
    () => getRandomExercise(2)
  )
  const [options, setOptions] = useState<EarTrainingExercise[]>([])
  const [correct, setCorrect] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [startedAt, setStartedAt] = useState<number | null>(Date.now())
  const [playing, setPlaying] = useState(false)
  const [showFeedback, setShowFeedback] = useState<boolean | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [difficulty, setDifficulty] = useState(2)

  // Generate options when exercise changes
  useEffect(() => {
    if (!currentExercise) return

    const allExercises = getExercisesByDifficulty(difficulty)
    const wrongExercises = allExercises
      .filter((e) => e.id !== currentExercise.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)

    const shuffle = [currentExercise, ...wrongExercises].sort(
      () => Math.random() - 0.5
    )
    setOptions(shuffle)
    setShowFeedback(null)
    setSelectedId(null)
  }, [currentExercise, difficulty])

  const playCurrentExercise = async () => {
    if (!currentExercise || playing) return

    setPlaying(true)
    try {
      if (currentExercise.type === "chord") {
        await playChordArpeggio(currentExercise.notes, 0.3, 4)
      } else {
        await playSequence(currentExercise.notes, 0.4, 4)
      }
    } catch (error) {
      console.error("Error playing exercise:", error)
    } finally {
      setPlaying(false)
    }
  }

  const handleAnswer = (selectedExercise: EarTrainingExercise) => {
    const isCorrect = selectedExercise.id === currentExercise?.id
    setSelectedId(selectedExercise.id)
    setShowFeedback(isCorrect)
    setAttempts((prev) => prev + 1)
    if (isCorrect) setCorrect((prev) => prev + 1)
  }

  const nextQuestion = () => {
    setCurrentExercise(getRandomExercise(difficulty))
  }

  const reset = () => {
    setCorrect(0)
    setAttempts(0)
    setCurrentExercise(getRandomExercise(difficulty))
    setStartedAt(Date.now())
  }

  const finish = () => {
    const durationSeconds = startedAt
      ? Math.max(1, Math.round((Date.now() - startedAt) / 1000))
      : 0
    const accuracyScore =
      attempts > 0 ? Math.round((correct / attempts) * 100) : 0

    onComplete({
      mode: "notes",
      durationSeconds,
      accuracyScore,
      notes: `Quiz cảm âm: đúng ${correct}/${attempts}, độ khó ${difficulty}/3.`,
    })
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <Volume2 className="text-blue-600" size={22} />
            Luyện Cảm Âm (Ear Training)
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Nghe quãng, hợp âm hoặc gam, chọn đúng từ 4 lựa chọn.
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 px-4 py-2 text-sm text-slate-600">
          Đúng: <strong className="text-slate-900">{correct}</strong> / {attempts}
        </div>
      </div>

      {/* Difficulty selector */}
      <div className="mt-6">
        <label className="text-sm font-semibold text-slate-700">
          Độ khó: {difficulty}/3
        </label>
        <input
          type="range"
          min="1"
          max="3"
          value={difficulty}
          onChange={(e) => setDifficulty(Number(e.target.value))}
          className="mt-3 w-full"
        />
      </div>

      {/* Play button */}
      <div className="mt-6 text-center">
        <button
          onClick={playCurrentExercise}
          disabled={playing}
          className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-base font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
        >
          <Volume2 size={20} /> Phát Âm Thanh
        </button>
        {currentExercise && (
          <p className="mt-3 text-sm text-slate-600">
            Loại: <strong>{currentExercise.type}</strong>
          </p>
        )}
      </div>

      {/* Answer options */}
      <div className="mt-6 space-y-3">
        {options.map((exercise) => {
          const isSelected = selectedId === exercise.id
          const isCorrectAnswer = exercise.id === currentExercise?.id
          let bgClass = "border-slate-200 bg-white hover:bg-blue-50"

          if (showFeedback !== null && isSelected) {
            bgClass = showFeedback
              ? "border-emerald-300 bg-emerald-50"
              : "border-red-300 bg-red-50"
          } else if (showFeedback === false && isCorrectAnswer) {
            bgClass = "border-emerald-300 bg-emerald-50"
          }

          return (
            <button
              key={exercise.id}
              onClick={() => handleAnswer(exercise)}
              disabled={showFeedback !== null}
              className={`block w-full rounded-xl border-2 p-4 text-left transition ${bgClass}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-bold text-slate-900">{exercise.name}</p>
                  <p className="text-sm text-slate-600">
                    {exercise.description}
                  </p>
                </div>
                {showFeedback !== null && isSelected && (
                  <div
                    className={`ml-4 text-2xl ${
                      showFeedback ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {showFeedback ? "✓" : "✗"}
                  </div>
                )}
                {showFeedback === false && isCorrectAnswer && (
                  <div className="ml-4 text-2xl text-emerald-600">✓</div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex flex-wrap gap-3">
        {showFeedback !== null && (
          <button
            onClick={nextQuestion}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <CheckCircle2 size={16} /> Tiếp tục
          </button>
        )}

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
  )
}
