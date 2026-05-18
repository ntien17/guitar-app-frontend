import { useState } from "react"
import { askAssistant } from "../services/assistantApi"
import ReactMarkdown from "react-markdown"
import { Loader2, AlertCircle, MessageCircle, Zap, BookOpen } from "lucide-react"

interface ChatMessage {
  id: string
  text: string
  reply: string
  source: "gemini" | "fallback" | "error"
  timestamp: Date
}

export default function AssistantPage() {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleAsk = async () => {
    const trimmedMessage = message.trim()

    if (!trimmedMessage) {
      setError("Vui lòng nhập câu hỏi trước khi gửi")
      return
    }

    try {
      setLoading(true)
      setError("")

      const result = await askAssistant(trimmedMessage)

      console.log("Assistant API result:", result)

      const reply = result?.data?.reply || result?.reply || "Không có phản hồi."
      const source = result?.data?.source || result?.source || "fallback"

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          text: trimmedMessage,
          reply,
          source: source as "gemini" | "fallback",
          timestamp: new Date(),
        },
      ])

      setMessage("")
    } catch (err) {
      console.error(err)
      setError("Không thể kết nối backend. Vui lòng kiểm tra server đang chạy trên cổng 5000 không.")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleAsk()
    }
  }

  const handleClearChat = () => {
    setMessages([])
    setMessage("")
    setError("")
  }

  const getSourceBadge = (source: "gemini" | "fallback" | "error") => {
    switch (source) {
      case "gemini":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-950/50 text-blue-300 px-3 py-1 text-xs font-medium border border-blue-700">
            <Zap size={14} />
            🤖 Gemini AI
          </span>
        )
      case "fallback":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-950/50 text-purple-300 px-3 py-1 text-xs font-medium border border-purple-700">
            <BookOpen size={14} />
            📚 Fallback Rule-Based
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-950/50 text-red-300 px-3 py-1 text-xs font-medium border border-red-700">
            <AlertCircle size={14} />
            ❌ Error
          </span>
        )
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <MessageCircle size={32} className="text-blue-400" />
            Trợ lý guitar AI
          </h1>

          <p className="mt-3 text-slate-400">
            Hỏi về lộ trình học guitar, hợp âm, fingerstyle, barre chord hoặc cách luyện tập. Trợ lý sẽ trả lời dựa trên AI hoặc quy tắc tích hợp.
          </p>
        </div>

        {/* Chat history */}
        {messages.length > 0 && (
          <div className="mb-8 space-y-4 max-h-96 overflow-y-auto">
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-2">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="max-w-xs rounded-lg bg-blue-600 px-4 py-3">
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>

                {/* Assistant reply */}
                <div className="flex justify-start">
                  <div className="max-w-md rounded-lg border border-slate-700 bg-slate-900 px-4 py-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs text-slate-400">Trợ lý</span>
                      {getSourceBadge(msg.source)}
                    </div>
                    <div className="prose prose-invert prose-sm max-w-none text-slate-200">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                          li: ({ children }) => <li className="ml-2">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                          em: ({ children }) => <em className="italic text-slate-300">{children}</em>,
                          code: ({ children }) => (
                            <code className="bg-slate-800 rounded px-2 py-1 font-mono text-sm text-yellow-300">
                              {children}
                            </code>
                          ),
                        }}
                      >
                        {msg.reply}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {messages.length === 0 && !error && (
          <div className="mb-8 rounded-lg border border-dashed border-slate-700 bg-slate-900/50 p-8 text-center">
            <MessageCircle size={40} className="mx-auto text-slate-500 mb-3" />
            <p className="text-slate-400">Chưa có cuộc trò chuyện nào. Hãy đặt câu hỏi đầu tiên của bạn!</p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-600 bg-red-950/30 p-4 flex items-start gap-3">
            <AlertCircle className="flex-shrink-0 text-red-400 mt-0.5" size={20} />
            <div>
              <p className="text-red-300 font-medium">Lỗi</p>
              <p className="text-red-200 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Input section */}
        <div className="space-y-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ví dụ: Tôi mới học guitar nên bắt đầu từ đâu? (Nhấn Ctrl+Enter hoặc Cmd+Enter để gửi)"
            className="min-h-28 w-full rounded-xl border border-slate-700 bg-slate-900 p-4 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
            disabled={loading}
          />

          <div className="flex gap-3">
            <button
              onClick={handleAsk}
              disabled={loading || !message.trim()}
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? "Đang xử lý..." : "Gửi câu hỏi"}
            </button>

            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                disabled={loading}
                className="rounded-xl bg-slate-700 px-6 py-3 font-semibold hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Làm mới
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}