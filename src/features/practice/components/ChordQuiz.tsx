import { useEffect, useMemo, useState } from "react"
import { CheckCircle2, RotateCcw, Volume2 } from "lucide-react"
import { getChordsByDifficulty, getRandomChord } from "../chordLibrary"
import { playChordArpeggio } from "../audioEngine"
import type { ChordDefinition } from "../chordLibrary"
import type { PracticeResult } from "../types"

type ChordQuizProps = {
  onComplete: (result: PracticeResult) => void
}

export function ChordQuiz({ onComplete }: ChordQuizProps) {
  const [currentChord, setCurrentChord] = useState<ChordDefinition | null>(
    () => getRandomChord(3)
  )
  const [options, setOptions] = useState<ChordDefinition[]>([])
  const [correct, setCorrect] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [startedAt, setStartedAt] = useState<number | null>(Date.now())
  const [playing, setPlaying] = useState(false)
  const [showFeedback, setShowFeedback] = useState<boolean | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [difficulty, setDifficulty] = useState(2)

  // Generate options when chord changes
  useEffect(() => {
    if (!currentChord) return

    const allChords = getChordsByDifficulty(difficulty)
    const wrongChords = allChords
      .filter((c) => c.name !== currentChord.name)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)

    const shuffle = [currentChord, ...wrongChords].sort(
      () => Math.random() - 0.5
    )
    setOptions(shuffle)
    setShowFeedback(null)
    setSelectedAnswer(null)
  }, [currentChord, difficulty])

  const playCurrentChord = async () => {
    if (!currentChord || playing) return

    setPlaying(true)
    try {
      const notes = ["C", "E", "G"]
      await playChordArpeggio(notes, 0.3, 4)
    } catch (error) {
      console.error("Error playing chord:", error)
    } finally {
      setPlaying(false)
    }
  }

  const handleAnswer = (selectedChord: ChordDefinition) => {
    const isCorrect = selectedChord.name === currentChord?.name
    setSelectedAnswer(selectedChord.name)
    setShowFeedback(isCorrect)
    setAttempts((prev) => prev + 1)
    if (isCorrect) setCorrect((prev) => prev + 1)
  }

  const nextQuestion = () => {
    setCurrentChord(getRandomChord(difficulty))
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
    const accuracyScore =
      attempts > 0 ? Math.round((correct / attempts) * 100) : 0

    onComplete({
      mode: "chords",
      durationSeconds,
      accuracyScore,
      notes: `Quiz nghe hợp âm: đúng ${correct}/${attempts}, độ khó tối đa ${difficulty}/5.`,
    })
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <Volume2 className="text-blue-600" size={22} />
            Quiz Nghe Hợp Âm
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Nghe âm thanh hợp âm, chọn tên hợp âm đúng từ 4 lựa chọn.
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 px-4 py-2 text-sm text-slate-600">
          Đúng: <strong className="text-slate-900">{correct}</strong> / {attempts}
        </div>
      </div>

      {/* Difficulty selector */}
      <div className="mt-6">
        <label className="text-sm font-semibold text-slate-700">
          Độ khó: {difficulty}/5
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

      {/* Play button */}
      <div className="mt-6 text-center">
        <button
          onClick={playCurrentChord}
          disabled={playing}
          className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-base font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
        >
          <Volume2 size={20} /> Phát Âm Thanh
        </button>
      </div>

      {/* Answer options */}
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {options.map((chord) => {
          const isSelected = selectedAnswer === chord.name
          const isCorrectAnswer = chord.name === currentChord?.name
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
              key={chord.name}
              onClick={() => handleAnswer(chord)}
              disabled={showFeedback !== null}
              className={`rounded-xl border-2 p-4 text-left transition ${bgClass}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{chord.name}</p>
                  <p className="text-sm text-slate-600">{chord.fullName}</p>
                </div>
                {showFeedback !== null && isSelected && (
                  <div
                    className={`text-2xl ${
                      showFeedback ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {showFeedback ? "✓" : "✗"}
                  </div>
                )}
                {showFeedback === false && isCorrectAnswer && (
                  <div className="text-2xl text-emerald-600">✓</div>
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
