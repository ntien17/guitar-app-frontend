import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import ReactMarkdown from "react-markdown"
import {
  AlertCircle,
  Bot,
  Guitar,
  Loader2,
  MessageCircle,
  Send,
  Sparkles,
  Trash2,
  User,
  TrendingUp,
  Clock,
  Music,
} from "lucide-react"

import { AppLayout } from "@/components/AppLayout"
import { PageHeader } from "@/shared/ui/PageHeader"
import { Card, CardContent } from "@/shared/ui/Card"
import { Badge } from "@/shared/ui/Badge"
import { useAuthStore } from "@/store/authStore"
import {
  askAssistant,
  clearAssistantHistory,
  getAssistantHistory,
} from "../services/assistantApi"
import { getUserProgress } from "@/services/progressService"
import {
  getUserPracticeSessions,
  getUserPracticeStats,
} from "@/features/practice/services/practiceApi"

type AssistantSource = "gemini" | "fallback" | "error" | "user"

type AssistantHistoryRow = {
  id: string
  user_id: string
  role: "user" | "assistant"
  message: string
  source: AssistantSource
  created_at: string
}

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  source: AssistantSource
  createdAt: string
}

type UserProgressSummary = {
  completedLessons: number
  totalLessons: number
  avgCompletion: number
  practiceMinutes: number
  avgAccuracy: number
  totalSessions: number
}

const suggestedQuestions = [
  "Tôi mới học guitar nên bắt đầu từ đâu?",
  "Tôi yếu chuyển hợp âm thì luyện thế nào?",
  "Cách luyện quạt chả nhịp 4/4?",
  "Làm sao để bấm hợp âm F không bị rè?",
]

function getSourceBadge(source: AssistantSource) {
  if (source === "gemini") {
    return <Badge variant="info">✨ Gemini AI</Badge>
  }

  if (source === "fallback") {
    return <Badge variant="primary">📚 Rule-Based</Badge>
  }

  if (source === "error") {
    return <Badge variant="danger">Lỗi</Badge>
  }

  return null
}

function mapHistoryRows(rows: AssistantHistoryRow[]): ChatMessage[] {
  return rows.map((row) => ({
    id: row.id,
    role: row.role,
    content: row.message,
    source: row.source || (row.role === "user" ? "user" : "fallback"),
    createdAt: row.created_at,
  }))
}

export default function AssistantPage() {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const authLoading = useAuthStore((state) => state.loading)

  const userId = user?.id

  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [progressLoading, setProgressLoading] = useState(false)
  const [error, setError] = useState("")
  const [userProgress, setUserProgress] = useState<UserProgressSummary | null>(
    null
  )

  const canSend = useMemo(() => {
    return Boolean(isAuthenticated && userId && message.trim() && !loading)
  }, [isAuthenticated, userId, message, loading])

  // Load assistant history and user progress
  useEffect(() => {
    async function loadHistory() {
      if (!isAuthenticated || !userId) return

      try {
        setHistoryLoading(true)
        setError("")

        const result = await getAssistantHistory(userId)
        const rows = result?.data || []

        setMessages(mapHistoryRows(rows))
      } catch (err) {
        console.error("Load assistant history error:", err)
        setError("Không thể tải lịch sử trò chuyện.")
      } finally {
        setHistoryLoading(false)
      }
    }

    loadHistory()
  }, [isAuthenticated, userId])

  // Load user progress and stats for personalization
  useEffect(() => {
    async function loadUserProgress() {
      if (!isAuthenticated || !userId) {
        setUserProgress(null)
        return
      }

      try {
        setProgressLoading(true)

        const [progressData, practiceSessionsData, practiceStatsData] =
          await Promise.all([
            getUserProgress(userId).catch(() => []),
            getUserPracticeSessions(userId).catch(() => []),
            getUserPracticeStats(userId).catch(() => ({
              totalMinutes: 0,
              avgAccuracy: 0,
              sessionsCount: 0,
            })),
          ])

        const completedLessons = (progressData || []).filter(
          (p: any) => p.completed || p.completion_percent >= 90
        ).length

        const avgCompletion =
          (progressData || []).length > 0
            ? Math.round(
                (progressData || []).reduce(
                  (sum: number, p: any) =>
                    sum + Number(p.completion_percent || 0),
                  0
                ) / (progressData || []).length
              )
            : 0

        setUserProgress({
          completedLessons,
          totalLessons: (progressData || []).length,
          avgCompletion,
          practiceMinutes: Math.round(
            (practiceStatsData?.totalMinutes || 0) / 60
          ),
          avgAccuracy: Math.round(practiceStatsData?.avgAccuracy || 0),
          totalSessions: practiceStatsData?.sessionsCount || 0,
        })
      } catch (err) {
        console.error("Load user progress error:", err)
        setUserProgress(null)
      } finally {
        setProgressLoading(false)
      }
    }

    loadUserProgress()
  }, [isAuthenticated, userId])

  const handleAsk = async () => {
    const trimmedMessage = message.trim()

    if (!trimmedMessage) {
      setError("Vui lòng nhập câu hỏi trước khi gửi.")
      return
    }

    if (!isAuthenticated || !userId) {
      setError("Bạn cần đăng nhập để sử dụng trợ lý AI và lưu lịch sử hỏi đáp.")
      return
    }

    const userMessage: ChatMessage = {
      id: `local-user-${Date.now()}`,
      role: "user",
      content: trimmedMessage,
      source: "user",
      createdAt: new Date().toISOString(),
    }

    try {
      setLoading(true)
      setError("")
      setMessages((prev) => [...prev, userMessage])
      setMessage("")

      const result = await askAssistant(trimmedMessage, userId)

      const reply = result?.data?.reply || result?.reply || "Không có phản hồi."
      const source = result?.data?.source || result?.source || "fallback"

      const assistantMessage: ChatMessage = {
        id: `local-assistant-${Date.now()}`,
        role: "assistant",
        content: reply,
        source,
        createdAt: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      console.error("Ask assistant error:", err)

      setMessages((prev) => [
        ...prev,
        {
          id: `local-error-${Date.now()}`,
          role: "assistant",
          content:
            "Không thể kết nối backend. Vui lòng kiểm tra backend đang chạy ở cổng 5000.",
          source: "error",
          createdAt: new Date().toISOString(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleClearChat = async () => {
    if (!userId) return

    try {
      setLoading(true)
      await clearAssistantHistory(userId)
      setMessages([])
      setMessage("")
      setError("")
    } catch (err) {
      console.error("Clear assistant history error:", err)
      setError("Không thể xóa lịch sử trò chuyện.")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleAsk()
    }
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl">
        <PageHeader
          title="Trợ lý guitar AI"
          subtitle="Chỉ hỗ trợ các câu hỏi về âm nhạc, guitar và việc học guitar."
          icon={<MessageCircle size={32} className="text-blue-600" />}
        />

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent>
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-blue-100 p-2 text-blue-700">
                  <Guitar size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">
                    Phạm vi hỗ trợ
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Guitar, hợp âm, fingerstyle, tiết tấu, lộ trình học và luyện tập.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-sky-100 p-2 text-sky-700">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">
                    Cá nhân hóa
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Khi có dữ liệu học tập, trợ lý sẽ gợi ý theo tiến độ của bạn.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">
                    Lịch sử hỏi đáp
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Mỗi học viên có lịch sử riêng, lưu trong Supabase.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {!authLoading && !isAuthenticated ? (
          <Card>
            <CardContent>
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6 text-center">
                <Bot className="mx-auto h-12 w-12 text-blue-600" />
                <h2 className="mt-4 text-xl font-bold text-slate-900">
                  Đăng nhập để dùng trợ lý AI
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
                  Bạn cần đăng nhập để hỏi trợ lý, lưu lịch sử từng tài khoản và nhận gợi ý học guitar cá nhân hóa.
                </p>
                <div className="mt-5 flex justify-center gap-3">
                  <Link
                    to="/login"
                    className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Tạo tài khoản
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* User Progress Context */}
            {!progressLoading && userProgress && (
              <Card className="mb-6 border-blue-100 bg-blue-50">
                <CardContent>
                  <div className="mb-4">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                      <TrendingUp size={20} className="text-blue-600" />
                      Tiến độ học của bạn
                    </h3>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg bg-white p-3">
                      <p className="text-xs font-medium text-slate-600">
                        Bài học hoàn thành
                      </p>
                      <p className="mt-1 text-2xl font-bold text-slate-900">
                        {userProgress.completedLessons}
                        <span className="text-sm text-slate-500">
                          /{userProgress.totalLessons}
                        </span>
                      </p>
                    </div>

                    <div className="rounded-lg bg-white p-3">
                      <p className="flex items-center gap-1 text-xs font-medium text-slate-600">
                        <Clock size={14} />
                        Luyện tập
                      </p>
                      <p className="mt-1 text-2xl font-bold text-slate-900">
                        {userProgress.practiceMinutes}
                        <span className="text-sm text-slate-500"> phút</span>
                      </p>
                    </div>

                    <div className="rounded-lg bg-white p-3">
                      <p className="flex items-center gap-1 text-xs font-medium text-slate-600">
                        <Music size={14} />
                        Độ chính xác
                      </p>
                      <p className="mt-1 text-2xl font-bold text-slate-900">
                        {userProgress.avgAccuracy}
                        <span className="text-sm text-slate-500">%</span>
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-700">
                    {userProgress.totalSessions === 0
                      ? "Bạn chưa có phiên luyện tập nào. Hãy vào Practice để bắt đầu và tôi sẽ gợi ý những bài học phù hợp nhất!"
                      : userProgress.avgCompletion >= 80
                        ? `Tuyệt vời! Bạn đã hoàn thành ${userProgress.avgCompletion}% bài học. Tiếp tục học để nâng cao kỹ năng.`
                        : userProgress.avgCompletion >= 50
                          ? `Bạn đã hoàn thành ${userProgress.avgCompletion}% bài học. Hãy tiếp tục để nắm vững kiến thức cơ bản.`
                          : `Bạn đã bắt đầu học. Hãy tiếp tục học bài và luyện tập để có tiến độ tốt hơn.`}
                  </p>
                </CardContent>
              </Card>
            )}

            <Card className="mb-6">
              <CardContent>
                {historyLoading ? (
                  <div className="flex items-center justify-center py-16 text-slate-500">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Đang tải lịch sử trò chuyện...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-6">
                    <div className="text-center">
                      <Bot className="mx-auto h-12 w-12 text-slate-400" />
                      <h3 className="mt-3 text-lg font-semibold text-slate-900">
                        Chưa có cuộc trò chuyện nào
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        Hãy bắt đầu bằng một câu hỏi về học guitar.
                      </p>
                    </div>

                    <div className="mt-6 grid gap-3 md:grid-cols-2">
                      {suggestedQuestions.map((question) => (
                        <button
                          key={question}
                          onClick={() => setMessage(question)}
                          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="max-h-[560px] space-y-5 overflow-y-auto pr-2">
                    {messages.map((item) => (
                      <div
                        key={item.id}
                        className={`flex ${
                          item.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-sm ${
                            item.role === "user"
                              ? "bg-blue-600 text-white"
                              : "border border-slate-200 bg-slate-50 text-slate-800"
                          }`}
                        >
                          <div className="mb-2 flex items-center gap-2">
                            {item.role === "user" ? (
                              <>
                                <User size={16} />
                                <span className="text-xs font-medium opacity-90">
                                  Bạn
                                </span>
                              </>
                            ) : (
                              <>
                                <Bot size={16} />
                                <span className="text-xs font-medium text-slate-600">
                                  Trợ lý
                                </span>
                                {getSourceBadge(item.source)}
                              </>
                            )}
                          </div>

                          {item.role === "assistant" ? (
                            <div className="prose prose-sm max-w-none text-slate-700">
                              <ReactMarkdown>{item.content}</ReactMarkdown>
                            </div>
                          ) : (
                            <p className="whitespace-pre-line text-sm">
                              {item.content}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}

                    {loading && (
                      <div className="flex justify-start">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                          <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                          Trợ lý đang phân tích...
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {error && (
              <Card className="mb-6 border-red-200 bg-red-50">
                <CardContent>
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                    <div>
                      <p className="font-medium text-red-900">Lỗi</p>
                      <p className="mt-1 text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent>
                <div className="space-y-4">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Hỏi về guitar, hợp âm, fingerstyle, lộ trình học... Nhấn Ctrl+Enter để gửi."
                    className="min-h-28 w-full resize-none rounded-xl border border-slate-200 bg-white p-4 text-slate-900 outline-none placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    disabled={loading}
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-slate-500">
                      Trợ lý chỉ trả lời các chủ đề liên quan đến âm nhạc và học guitar.
                    </p>

                    <div className="flex gap-3">
                      {messages.length > 0 && (
                        <button
                          onClick={handleClearChat}
                          disabled={loading}
                          className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                          Xóa lịch sử
                        </button>
                      )}

                      <button
                        onClick={handleAsk}
                        disabled={!canSend}
                        className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {loading ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Send size={16} />
                        )}
                        {loading ? "Đang xử lý..." : "Gửi câu hỏi"}
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  )
}