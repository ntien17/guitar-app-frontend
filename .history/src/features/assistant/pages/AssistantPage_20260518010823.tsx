import { useState } from "react"
import { askAssistant } from "../services/assistantApi"
import ReactMarkdown from "react-markdown"

export default function AssistantPage() {
  const [message, setMessage] = useState("")
  const [reply, setReply] = useState("")
  const [source, setSource] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAsk = async () => {
    if (!message.trim()) return

    try {
      setLoading(true)
      setReply("")
      setSource("")

      const result = await askAssistant(message)

      console.log("Assistant API result:", result)

      setReply(result?.data?.reply || result?.reply || "Không có phản hồi.")
      setSource(result?.data?.source || result?.source || "unknown")
    } catch (error) {
      console.error(error)
      setReply("Không gọi được backend. Hãy kiểm tra backend có đang chạy ở cổng 5000 không.")
      setSource("error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold">Trợ lý guitar AI</h1>

        <p className="mt-3 text-slate-300">
          Hỏi về lộ trình học guitar, hợp âm, fingerstyle, barre chord hoặc cách luyện tập.
        </p>

        <div className="mt-8 space-y-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ví dụ: Tôi mới học guitar nên bắt đầu từ đâu?"
            className="min-h-36 w-full rounded-xl border border-slate-700 bg-slate-900 p-4 text-white outline-none focus:border-blue-500"
          />

          <button
            onClick={handleAsk}
            disabled={loading}
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500 disabled:opacity-60"
          >
            {loading ? "Đang phân tích..." : "Hỏi trợ lý"}
          </button>

          {reply && (
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-blue-400">Gợi ý từ trợ lý:</h2>

                {source && (
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
                    source: {source}
                  </span>
                )}
              </div>

              <div className="mt-3 prose prose-invert max-w-none text-slate-200">
  <             ReactMarkdown>{reply}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}