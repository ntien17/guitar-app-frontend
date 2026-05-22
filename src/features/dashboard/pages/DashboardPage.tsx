import { useCallback, useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  Dumbbell,
  Music,
  RefreshCw,
  TrendingUp,
  Zap,
} from "lucide-react"

import { api } from "@/lib/axios"
import { getUserProgress } from "@/services/progressService"
import { getRecommendations } from "@/services/recommendationService"
import { getCourses } from "@/features/courses/services/courseApi"
import {
  getUserPracticeSessions,
  getUserPracticeStats,
} from "@/features/practice/services/practiceApi"
import { useAuthStore } from "@/store/authStore"

import type {
  ApiResponse,
  Course,
  LessonProgress,
  PracticeSession,
  Recommendation,
} from "@/types"

import { AppLayout } from "@/components/AppLayout"
import { PageHeader } from "@/shared/ui/PageHeader"
import { Card, CardContent, CardHeader } from "@/shared/ui/Card"
import { Badge } from "@/shared/ui/Badge"
import { LoadingState } from "@/shared/ui/LoadingState"

type PracticeStats = {
  totalMinutes: number
  avgAccuracy: number
  sessionsCount: number
  byType?: Record<string, number>
  latestSession?: PracticeSession | null
}

type LessonMeta = {
  id: string
  title: string
  slug?: string | null
}

type LessonMetaMap = Record<string, LessonMeta>

const EMPTY_STATS: PracticeStats = {
  totalMinutes: 0,
  avgAccuracy: 0,
  sessionsCount: 0,
  byType: {},
  latestSession: null,
}

function formatMinutesFromSeconds(seconds: number) {
  const minutes = Math.round(seconds / 60)

  if (minutes < 60) {
    return `${minutes} phút`
  }

  const hours = Math.floor(minutes / 60)
  const restMinutes = minutes % 60

  return restMinutes > 0 ? `${hours} giờ ${restMinutes} phút` : `${hours} giờ`
}

function formatDate(dateValue?: string | null) {
  if (!dateValue) return "Chưa có dữ liệu"

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateValue))
}

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

function priorityRank(priority?: string) {
  switch (priority) {
    case "high":
      return 0
    case "medium":
      return 1
    case "low":
      return 2
    default:
      return 3
  }
}

function getPriorityBadge(priority: string): "danger" | "warning" | "success" {
  switch (priority) {
    case "high":
      return "danger"
    case "medium":
      return "warning"
    case "low":
      return "success"
    default:
      return "warning"
  }
}

function getPriorityLabel(priority: string) {
  switch (priority) {
    case "high":
      return "Cao"
    case "medium":
      return "Trung bình"
    case "low":
      return "Thấp"
    default:
      return "Gợi ý"
  }
}

function unwrapLessonMeta(payload: unknown): LessonMeta | null {
  if (!payload || typeof payload !== "object") return null

  const response = payload as ApiResponse<LessonMeta>
  const value = response.data || payload

  if (!value || typeof value !== "object") return null

  const lesson = value as Partial<LessonMeta>

  if (!lesson.id || !lesson.title) return null

  return {
    id: lesson.id,
    title: lesson.title,
    slug: lesson.slug || null,
  }
}

async function fetchLessonMeta(lessonId: string): Promise<LessonMeta | null> {
  try {
    const response = await api.get<ApiResponse<LessonMeta>>(`/lessons/${lessonId}`)
    return unwrapLessonMeta(response.data)
  } catch (error) {
    console.warn(`Could not fetch lesson meta for ${lessonId}:`, error)
    return null
  }
}

async function fetchLessonMetaMap(progress: LessonProgress[]) {
  const lessonIds = Array.from(
    new Set(progress.map((item) => item.lesson_id).filter(Boolean))
  )

  const lessonMetas = await Promise.all(
    lessonIds.map(async (lessonId) => {
      const meta = await fetchLessonMeta(lessonId)
      return [lessonId, meta] as const
    })
  )

  return lessonMetas.reduce<LessonMetaMap>((map, [lessonId, meta]) => {
    if (meta) {
      map[lessonId] = meta
    }

    return map
  }, {})
}

function getLessonTitle(item: LessonProgress, lessonMetaMap: LessonMetaMap) {
  return lessonMetaMap[item.lesson_id]?.title || `Bài học ${item.lesson_id.slice(0, 8)}`
}

function getLessonPath(item: LessonProgress, lessonMetaMap: LessonMetaMap) {
  const lesson = lessonMetaMap[item.lesson_id]
  return `/lessons/${lesson?.slug || item.lesson_id}`
}

function normalizeRecommendationText(
  value: string | null,
  stats: {
    avgAccuracy: number
    totalPracticeMinutes: number
    sessionsCount: number
  }
) {
  if (!value) return ""

  return value
    .replace(/\$\{stats\.avgAccuracy\.toFixed\(1\)\}/g, String(stats.avgAccuracy))
    .replace(/\$\{stats\.totalMinutes\}/g, String(stats.totalPracticeMinutes))
    .replace(/\$\{stats\.sessionsCount\}/g, String(stats.sessionsCount))
    .replace(/\$\{.*?\}/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

export default function DashboardPage() {
  const navigate = useNavigate()

  const user = useAuthStore((state) => state.user)
  const profile = useAuthStore((state) => state.profile)
  const authLoading = useAuthStore((state) => state.loading)

  const userId = user?.id

  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [progress, setProgress] = useState<LessonProgress[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [practiceSessions, setPracticeSessions] = useState<PracticeSession[]>([])
  const [practiceStats, setPracticeStats] = useState<PracticeStats>(EMPTY_STATS)
  const [lessonMetaMap, setLessonMetaMap] = useState<LessonMetaMap>({})
  const [error, setError] = useState("")

  const resetDashboard = useCallback(() => {
    setRecommendations([])
    setProgress([])
    setCourses([])
    setPracticeSessions([])
    setPracticeStats(EMPTY_STATS)
    setLessonMetaMap({})
    setError("")
    setLoading(false)
  }, [])

  const loadDashboardData = useCallback(
    async (currentUserId: string) => {
      try {
        setLoading(true)
        setError("")

        const [
          recommendationsData,
          progressData,
          coursesData,
          practiceSessionsData,
          practiceStatsData,
        ] = await Promise.all([
          getRecommendations(currentUserId).catch(() => []),
          getUserProgress(currentUserId).catch(() => []),
          getCourses().catch(() => ({ data: [] })),
          getUserPracticeSessions(currentUserId).catch(() => []),
          getUserPracticeStats(currentUserId).catch(() => EMPTY_STATS),
        ])

        const lessonMap = await fetchLessonMetaMap(progressData)

        setRecommendations(recommendationsData)
        setProgress(progressData)
        setCourses(coursesData.data || [])
        setPracticeSessions(practiceSessionsData)
        setPracticeStats(practiceStatsData || EMPTY_STATS)
        setLessonMetaMap(lessonMap)
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err)
        resetDashboard()
        setError(
          "Không thể tải dữ liệu dashboard. Hãy kiểm tra API /api/progress, /api/practice và /api/lessons."
        )
      } finally {
        setLoading(false)
      }
    },
    [resetDashboard]
  )

  useEffect(() => {
    if (authLoading) return

    if (!userId) {
      const resetTimer = window.setTimeout(() => {
        resetDashboard()
      }, 0)

      return () => window.clearTimeout(resetTimer)
    }

    loadDashboardData(userId)
  }, [authLoading, userId, loadDashboardData, resetDashboard])

  const stats = useMemo(() => {
    const completedLessons = progress.filter(
      (item) => item.completed || item.completion_percent >= 90
    ).length

    const averageCompletion = progress.length
      ? Math.round(
          progress.reduce(
            (sum, item) => sum + Number(item.completion_percent || 0),
            0
          ) / progress.length
        )
      : 0

    const totalWatchSeconds = progress.reduce(
      (sum, item) => sum + Number(item.watch_time_seconds || 0),
      0
    )

    const todayPracticeSessions = practiceSessions.filter((session) =>
      isToday(session.created_at)
    )

    const todayPracticeMinutes = todayPracticeSessions.reduce(
      (sum, session) => sum + Number(session.practice_minutes || 0),
      0
    )

    return {
      completedLessons,
      averageCompletion,
      totalWatchSeconds,
      todayPracticeSessions: todayPracticeSessions.length,
      todayPracticeMinutes,
      totalPracticeMinutes: Number(practiceStats.totalMinutes || 0),
      avgAccuracy: Math.round(Number(practiceStats.avgAccuracy || 0)),
      sessionsCount: Number(practiceStats.sessionsCount || 0),
    }
  }, [progress, practiceSessions, practiceStats])

  const priorityRecommendations = useMemo(() => {
    return [...recommendations]
      .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority))
      .slice(0, 3)
  }, [recommendations])

  const recentProgress = useMemo(() => {
    return [...progress]
      .sort(
        (a, b) =>
          new Date(b.updated_at || 0).getTime() -
          new Date(a.updated_at || 0).getTime()
      )
      .slice(0, 5)
  }, [progress])

  const recentPractice = useMemo(() => {
    return [...practiceSessions]
      .sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
      )
      .slice(0, 5)
  }, [practiceSessions])

  if (authLoading || loading) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-6xl">
          <Card>
            <CardContent>
              <LoadingState message="Đang tải dữ liệu tiến độ học tập..." />
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl">
        <PageHeader
          title="Dashboard học tập"
          subtitle={
            userId
              ? `Xin chào, ${profile?.full_name || user?.email || "học viên"}!`
              : "Đăng nhập để xem tiến độ học tập cá nhân."
          }
          icon={<TrendingUp size={32} className="text-blue-600" />}
        />

        {!userId ? (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent>
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                <div>
                  <p className="font-semibold text-amber-800">
                    Bạn chưa đăng nhập.
                  </p>
                  <p className="mt-1 text-sm text-amber-700">
                    Hệ thống chỉ lấy dữ liệu tiến độ thật sau khi người dùng đăng nhập.
                  </p>
                  <Link
                    to="/login"
                    className="mt-3 inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Đăng nhập
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {error ? (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent>
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                <p className="text-red-700">{error}</p>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">Học viên</p>
            <h2 className="text-xl font-bold text-slate-900">
              {profile?.full_name || user?.email || "Chưa đăng nhập"}
            </h2>
          </div>

          <button
            type="button"
            disabled={!userId || loading}
            onClick={() => userId && loadDashboardData(userId)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Cập nhật dữ liệu
          </button>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardContent>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">
                  Bài học hoàn thành
                </span>
                <BookOpen className="text-blue-600" size={20} />
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {stats.completedLessons}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                từ {progress.length} bài đã có tiến độ
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">
                  Tiến độ trung bình
                </span>
                <TrendingUp className="text-green-600" size={20} />
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {stats.averageCompletion}%
              </p>
              <p className="mt-2 text-xs text-slate-500">
                {stats.averageCompletion >= 80
                  ? "Rất tốt!"
                  : stats.averageCompletion >= 50
                    ? "Đang tiến bộ"
                    : "Cần học thêm bài mới"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">
                  Thời gian xem bài
                </span>
                <Clock className="text-amber-600" size={20} />
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {formatMinutesFromSeconds(stats.totalWatchSeconds)}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                {stats.totalWatchSeconds} giây
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">
                  Luyện hôm nay
                </span>
                <Dumbbell className="text-sky-600" size={20} />
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {stats.todayPracticeMinutes} phút
              </p>
              <p className="mt-2 text-xs text-slate-500">
                {stats.todayPracticeSessions} phiên hôm nay
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <Card>
            <CardContent>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">
                  Tổng phiên luyện tập
                </span>
                <Music className="text-blue-600" size={20} />
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {stats.sessionsCount}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                từ bảng practice_sessions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">
                  Tổng phút luyện
                </span>
                <Zap className="text-amber-600" size={20} />
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {stats.totalPracticeMinutes} phút
              </p>
              <p className="mt-2 text-xs text-slate-500">
                toàn bộ lịch sử luyện tập
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">
                  Độ chính xác TB
                </span>
                <BarChart3 className="text-green-600" size={20} />
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {stats.avgAccuracy}%
              </p>
              <p className="mt-2 text-xs text-slate-500">
                tính từ các phiên có điểm
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-lg font-bold text-slate-900">Gợi ý học tập</h2>
          </CardHeader>
          <CardContent>
            {priorityRecommendations.length === 0 ? (
              <p className="text-slate-600">
                Chưa có gợi ý cá nhân hóa. Hãy học bài và luyện tập thêm để hệ thống đề xuất chính xác hơn.
              </p>
            ) : (
              <div className="space-y-3">
                {priorityRecommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <Badge variant={getPriorityBadge(rec.priority)}>
                        {getPriorityLabel(rec.priority)}
                      </Badge>

                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">
                          {rec.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {normalizeRecommendationText(
                            rec.description,
                            stats
                          )}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                          Lý do: {normalizeRecommendationText(rec.reason, stats)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-slate-900">
                Tiến độ bài học gần đây
              </h2>
            </CardHeader>
            <CardContent>
              {recentProgress.length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                  Chưa có dữ liệu bài học. Hãy mở một bài học và bấm “Đánh dấu hoàn thành”.
                </p>
              ) : (
                <div className="space-y-4">
                  {recentProgress.map((item) => (
                    <div key={item.id} className="space-y-2">
                      <div className="flex justify-between gap-3 text-sm">
                        <Link
                          to={getLessonPath(item, lessonMetaMap)}
                          className="font-medium text-slate-700 hover:text-blue-600"
                        >
                          {getLessonTitle(item, lessonMetaMap)}
                        </Link>

                        <span
                          className={
                            item.completed
                              ? "font-semibold text-green-600"
                              : "text-slate-600"
                          }
                        >
                          {item.completion_percent}%
                        </span>
                      </div>

                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={
                            item.completed
                              ? "h-full bg-green-600"
                              : "h-full bg-blue-600"
                          }
                          style={{
                            width: `${Math.min(100, item.completion_percent)}%`,
                          }}
                        />
                      </div>

                      <p className="text-xs text-slate-500">
                        Cập nhật: {formatDate(item.updated_at)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-slate-900">
                Phiên luyện tập gần đây
              </h2>
            </CardHeader>
            <CardContent>
              {recentPractice.length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                  Chưa có phiên luyện tập. Hãy vào Practice và hoàn thành một bài luyện.
                </p>
              ) : (
                <div className="space-y-3">
                  {recentPractice.map((session) => (
                    <div
                      key={session.id}
                      className="rounded-xl border border-slate-200 bg-white p-4"
                    >
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {session.practice_title ||
                              session.practice_type ||
                              "Phiên luyện tập"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {formatDate(session.created_at)}
                          </p>
                        </div>

                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                          {session.practice_minutes || 0} phút
                        </span>

                        {session.accuracy_score !== null &&
                        session.accuracy_score !== undefined ? (
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                            Chính xác{" "}
                            {Math.round(Number(session.accuracy_score))}%
                          </span>
                        ) : null}

                        {session.bpm ? (
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                            {session.bpm} BPM
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold text-slate-900">Nhanh chóng</h2>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <button
                onClick={() => navigate("/courses")}
                className="rounded-lg border-2 border-slate-200 p-4 text-left transition-all hover:border-blue-600 hover:bg-blue-50"
              >
                <p className="font-semibold text-slate-900">Xem khóa học</p>
                <p className="text-sm text-slate-600">
                  Có {courses.length} khóa học đang mở
                </p>
              </button>

              <button
                onClick={() => navigate("/practice")}
                className="rounded-lg border-2 border-slate-200 p-4 text-left transition-all hover:border-blue-600 hover:bg-blue-50"
              >
                <p className="font-semibold text-slate-900">Luyện tập ngay</p>
                <p className="text-sm text-slate-600">
                  Luyện nhịp, hợp âm, tiết tấu và nốt đơn
                </p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}