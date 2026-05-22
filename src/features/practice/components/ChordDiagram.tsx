import type { ChordInfo } from "../types"
import type { ChordDefinition } from "../chordLibrary"

type ChordDiagramProps = {
  chord: ChordInfo | ChordDefinition | null
}

const stringLabels = ["E", "B", "G", "D", "A", "E"]
const fretCount = 6

function parseFingering(fingering: string): Map<string, string> {
  const parts = fingering.split(/\s+/)
  const map = new Map<string, string>()

  for (const part of parts) {
    const [stringName, fret] = part.split("|")
    if (stringName && fret) {
      map.set(stringName.toUpperCase(), fret)
    }
  }

  return map
}

export function ChordDiagram({ chord }: ChordDiagramProps) {
  if (!chord) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500">
        Chọn một hợp âm để xem thế bấm.
      </div>
    )
  }

  const fingering = parseFingering(chord.fingering)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">{chord.name}</h3>
          <p className="text-sm text-slate-500">{chord.fullName}</p>
        </div>

        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          Độ khó {chord.difficulty}/5
        </span>
      </div>

      {/* Fretboard Grid Diagram */}
      <div className="mb-6 inline-block bg-gradient-to-b from-amber-50 to-amber-100 p-4 rounded-lg">
        {/* Nut indicator */}
        <div className="mb-2 h-1 bg-slate-800"></div>

        {/* Fretboard */}
        <div className="border-2 border-slate-400 bg-amber-100">
          {/* String labels at top */}
          <div className="flex border-b border-slate-300 bg-slate-100">
            {stringLabels.map((label, idx) => (
              <div
                key={`label-${idx}`}
                className="flex h-8 flex-1 items-center justify-center text-sm font-bold text-slate-700"
              >
                {label}
              </div>
            ))}
          </div>

          {/* Frets */}
          {Array.from({ length: fretCount }).map((_, fretIdx) => (
            <div key={`fret-${fretIdx}`} className="flex border-b border-slate-300">
              {stringLabels.map((stringLabel, stringIdx) => {
                const fretValue = fingering.get(stringLabel) ?? "-"
                const isMuted = fretValue === "x"
                const isOpen = fretValue === "0"
                const isPlayed = !isMuted && !isOpen && Number(fretValue) === fretIdx + 1

                return (
                  <div
                    key={`string-${stringIdx}-fret-${fretIdx}`}
                    className="relative flex flex-1 items-center justify-center border-r border-slate-300 bg-amber-100 py-6"
                  >
                    {/* Fret marker dots */}
                    <div className="absolute right-2 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-slate-400"></div>
                    <div className="absolute left-2 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-slate-400"></div>

                    {/* Played note circle */}
                    {isPlayed && (
                      <div className="absolute z-10 h-6 w-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-md flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {["1", "2", "3", "4"][Number(fretValue) - 1] || "·"}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Open/Muted indicators below fretboard */}
        <div className="mt-3 flex gap-2 text-xs font-semibold text-slate-700">
          {stringLabels.map((label, idx) => {
            const fretValue = fingering.get(label) ?? "-"
            const display =
              fretValue === "x" ? "✕" : fretValue === "0" ? "○" : fretValue

            return (
              <div key={`indicator-${idx}`} className="flex-1 text-center">
                {display}
              </div>
            )
          })}
        </div>
      </div>

      {/* Text Fingering Info */}
      <div className="mb-4 rounded-lg bg-slate-50 p-4">
        <h4 className="mb-2 text-sm font-semibold text-slate-700">Vị trí bấm:</h4>
        <div className="space-y-1 text-sm text-slate-600">
          {stringLabels.map((label) => {
            const fretValue = fingering.get(label) ?? "-"
            let description = ""
            if (fretValue === "x") description = "Không đánh"
            else if (fretValue === "0") description = "Dây mở"
            else description = `Ngăn ${fretValue}`

            return (
              <div key={`text-${label}`} className="flex justify-between">
                <span className="font-medium">Dây {label}:</span>
                <span>{description}</span>
              </div>
            )
          })}
        </div>
      </div>

      {chord.tips && (
        <div className="rounded-xl bg-amber-50 p-3 text-sm leading-6 text-amber-800 border border-amber-200">
          <strong className="text-amber-900">💡 Mẹo:</strong> {chord.tips}
        </div>
      )}
    </div>
  )
}
