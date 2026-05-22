import { useEffect, useMemo, useState } from "react"
import {
  BarChart3,
  CheckCircle2,
  Dumbbell,
  Guitar,
  Music2,
  Timer,
  Waves,
  Volume2,
} from "lucide-react"

import { AppLayout } from "@/components/AppLayout"
import { PageHeader } from "@/shared/ui/PageHeader"
import { Card, CardContent } from "@/shared/ui/Card"
import { Badge } from "@/shared/ui/Badge"
import { useAuthStore } from "@/store/authStore"
import type { PracticeSession } from "@/types"

import {
  PracticeGuide,
  RandomChordTrainer,
  RhythmPatternTrainer,
  SingleNoteTrainer,
  TempoTrainer,
  ChordQuiz,
  EarTrainingQuiz,
} from "../components"
import {
  getUserPracticeSessions,
  getUserPracticeStats,
  recordPracticeSession,
} from "../services/practiceApi"
import type { PracticeMode, PracticeResult } from "../types"

const DEFAULT_PRACTICE_LESSON_ID = null

const practiceModes: Array<{
  id: PracticeMode
  title: string
  description: string
  icon: typeof Guitar
}> = [
  {
    id: "guide",
    title: "Hướng dẫn",
    description: "Quy trình luyện tập chuẩn cho học viên.",
    icon: Dumbbell,
  },
  {
    id: "tempo",
    title: "Tempo",
    description: "Metronome và đổi hợp âm theo nhịp.",
    icon: Timer,
  },
  {
    id: "chords",
    title: "Luyện Hợp Âm",
    description: "Hợp âm ngẫu nhiên và kiểm tra tiếng sạch.",
    icon: Guitar,
  },
  {
    id: "chord-quiz",
    title: "Quiz Hợp Âm",
    description: "Nghe hợp âm và chọn tên từ 4 lựa chọn.",
    icon: Volume2,
  },
  {
    id: "rhythm",
    title: "Tiết Tấu",
    description: "Mẫu quạt xuống/lên và giữ nhịp.",
    icon: Waves,
  },
  {
    id: "notes",
    title: "Luyện Nốt Đơn",
    description: "Nhận diện nốt theo dây và ngăn đàn.",
    icon: Music2,
  },
  {
    id: "ear-training",
    title: "Cảm Âm",
    description: "Nghe quãng, hợp âm, gam và chọn đúng.",
    icon: Volume2,
  },
]

function isToday(dateValue?: string | null) {
  if (!dateValue) return false

  const date = new Date(dateValue)
  const today = new Date()

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

function getLatestAccuracy(sessions: PracticeSession[], fallbackAccuracy = 0) {
  const latestSessionWithAccuracy = sessions.find(
    (session) =>
      session.accuracy_score !== null &&
      session.accuracy_score !== undefined
  )

  return Number(latestSessionWithAccuracy?.accuracy_score ?? fallbackAccuracy ?? 0)
}

export default function PracticePage() {
  const user = useAuthStore((state) => state.user)
  const authLoading = useAuthStore((state) => state.loading)
  const userId = user?.id

  const [activeMode, setActiveMode] = useState<PracticeMode>("guide")
  const [saving, setSaving] = useState(false)
  const [practiceLoading, setPracticeLoading] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")
  const [localStats, setLocalStats] = useState({
    sessions: 0,
    totalMinutes: 0,
    lastAccuracy: 0,
  })

  const activeModeInfo = useMemo(
    () => practiceModes.find((item) => item.id === activeMode),
    [activeMode]
  )

  async function loadPracticeSummary(currentUserId: string) {
    try {
      setPracticeLoading(true)

      const [sessions, stats] = await Promise.all([
        getUserPracticeSessions(currentUserId),
        getUserPracticeStats(currentUserId),
      ])

      const sessionsToday = sessions.filter((session) =>
        isToday(session.created_at)
      )

      const minutesToday = sessionsToday.reduce(
        (sum, session) => sum + Number(session.practice_minutes || 0),
        0
      )

      setLocalStats({
        sessions: sessionsToday.length,
        totalMinutes: minutesToday || Number(stats.totalMinutes || 0),
        lastAccuracy: Math.round(
          getLatestAccuracy(sessions, Number(stats.avgAccuracy || 0))
        ),
      })
    } catch (error) {
      console.error("Failed to load practice summary:", error)
      setSaveMessage(
        "Không tải được thống kê luyện tập. Hãy kiểm tra API /api/practice."
      )
    } finally {
      setPracticeLoading(false)
    }
  }

  // LOGIC 1: Xử lý trạng thái Đăng nhập / Chưa đăng nhập / Logout
  useEffect(() => {
    // Chỉ return sớm nếu app đang kiểm tra trạng thái auth
    if (authLoading) return

    if (!userId) {
      // Khi Chưa đăng nhập hoặc vừa Logout: Reset mọi thống kê về 0
      setLocalStats({
        sessions: 0,
        totalMinutes: 0,
        lastAccuracy: 0,
      })
      return
    }

    // Khi Đăng nhập: Gọi API lấy dữ liệu thực tế
    loadPracticeSummary(userId)
  }, [authLoading, userId])

  // LOGIC 2: Xử lý khi hoàn thành bài tập (Cập nhật UI ngay -> Gọi API -> Load lại)
  const handlePracticeComplete = async (result: PracticeResult) => {
    if (!userId) {
      setSaveMessage("Bạn cần đăng nhập để lưu phiên luyện tập.")
      return
    }

    const practiceMinutes = Math.max(1, Math.round(result.durationSeconds / 60))
    const newAccuracy = result.accuracyScore !== undefined 
      ? Math.round(result.accuracyScore) 
      : localStats.lastAccuracy;

    // --- BƯỚC 1: OPTIMISTIC UPDATE ---
    // Tăng phiên luyện tập, số phút và cập nhật % trên UI ngay lập tức
    setLocalStats((prev) => ({
      sessions: prev.sessions + 1,
      totalMinutes: prev.totalMinutes + practiceMinutes,
      lastAccuracy: newAccuracy,
    }))

    try {
      setSaving(true)
      setSaveMessage("")

      // --- BƯỚC 2: LƯU BACKEND ---
      await recordPracticeSession({
        userId,
        lessonId: DEFAULT_PRACTICE_LESSON_ID,
        practiceMinutes,
        accuracyScore: result.accuracyScore,
        notes: `${activeModeInfo?.title || "Practice"}: ${result.notes || ""}`,
      })

      // --- BƯỚC 3: LOAD LẠI TỪ DATABASE ---
      // Load lại để đảm bảo số liệu đồng bộ chính xác với backend
      await loadPracticeSummary(userId)

      setSaveMessage("Đã lưu phiên luyện tập vào hệ thống.")
    } catch (error) {
      console.error("Failed to save practice session:", error)
      setSaveMessage(
        "Chưa lưu được lên backend. Hãy kiểm tra API /api/practice, nhưng bạn vẫn có thể tiếp tục luyện tập."
      )
      // Nếu API lỗi, gọi lại loadPracticeSummary để roll-back UI về số liệu đúng từ DB
      await loadPracticeSummary(userId)
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl">
        <PageHeader
          title="Luyện tập guitar"
          subtitle="Chọn bài luyện tập phù hợp để rèn nhịp, hợp âm, tiết tấu và nhận diện nốt."
          icon={<Guitar size={32} className="text-blue-600" />}
        />

        {!userId && !authLoading ? (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent>
              <p className="text-sm font-medium text-amber-800">
                Bạn đang chưa đăng nhập. Bạn vẫn có thể xem bài luyện tập, nhưng cần đăng nhập để lưu phiên luyện tập và thống kê.
              </p>
            </CardContent>
          </Card>
        ) : null}

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent>
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-blue-100 p-2 text-blue-700">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Phiên hôm nay</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {/* Bỏ condition practiceLoading ở đây để Optimistic Update không bị giật nháy chớp */}
                    {localStats.sessions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
                  <Timer size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Thời gian luyện</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {localStats.totalMinutes} phút
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-sky-100 p-2 text-sky-700">
                  <BarChart3 size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Độ chính xác gần nhất</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {localStats.lastAccuracy}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6 grid gap-3 md:grid-cols-5">
          {practiceModes.map((mode) => {
            const Icon = mode.icon
            const active = mode.id === activeMode

            return (
              <button
                key={mode.id}
                onClick={() => {
                  setActiveMode(mode.id)
                  setSaveMessage("")
                }}
                className={`rounded-2xl border p-4 text-left transition ${
                  active
                    ? "border-blue-300 bg-blue-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/40"
                }`}
              >
                <Icon
                  size={22}
                  className={active ? "text-blue-600" : "text-slate-500"}
                />
                <h3 className="mt-3 font-bold text-slate-900">{mode.title}</h3>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  {mode.description}
                </p>
              </button>
            )
          })}
        </div>

        <Card className="mb-6">
          <CardContent>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">
                    {activeModeInfo?.title}
                  </h2>
                  <Badge variant="info">Practice</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {activeModeInfo?.description}
                </p>
              </div>

              {(saving || practiceLoading) && (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  {saving ? "Đang lưu..." : "Đang tải thống kê..."}
                </span>
              )}
            </div>

            {saveMessage && (
              <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                {saveMessage}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {activeMode === "guide" && <PracticeGuide />}
          {activeMode === "tempo" && (
            <TempoTrainer onComplete={handlePracticeComplete} />
          )}
          {activeMode === "chords" && (
            <RandomChordTrainer onComplete={handlePracticeComplete} />
          )}
          {activeMode === "chord-quiz" && (
            <ChordQuiz onComplete={handlePracticeComplete} />
          )}
          {activeMode === "rhythm" && (
            <RhythmPatternTrainer onComplete={handlePracticeComplete} />
          )}
          {activeMode === "notes" && (
            <SingleNoteTrainer onComplete={handlePracticeComplete} />
          )}
          {activeMode === "ear-training" && (
            <EarTrainingQuiz onComplete={handlePracticeComplete} />
          )}
        </div>
      </div>
    </AppLayout>
  )
}