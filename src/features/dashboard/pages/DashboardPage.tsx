import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getUserProgress } from "@/services/progressService"
import { getRecommendations } from "@/services/recommendationService"
import { getCourses } from "@/features/courses/services/courseApi"
import { Recommendation, Course, LessonProgress } from "@/types"
import { TrendingUp, Zap, BookOpen } from "lucide-react"

const DEMO_USER_ID = "demo-user"

export default function DashboardPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [progress, setProgress] = useState<LessonProgress[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setError("")
        const [recsData, progressData, coursesData] = await Promise.all([
          getRecommendations(DEMO_USER_ID),
          getUserProgress(DEMO_USER_ID),
          getCourses(),
        ])

        setRecommendations(recsData)
        setProgress(progressData)
        setCourses(coursesData.data || [])
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err)
        setError("Không thể tải dữ liệu dashboard")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const stats = {
    completedLessons: progress.filter((p) => p.completed).length,
    averageCompletion: progress.length
      ? Math.round(progress.reduce((sum, p) => sum + p.completion_percent, 0) / progress.length)
      : 0,
    totalWatchTime: progress.reduce((sum, p) => sum + p.watch_time_seconds, 0),
  }

  const priorityRecommendations = recommendations
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
    .slice(0, 3)

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case "lesson":
        return "📚"
      case "practice":
        return "🎸"
      case "schedule":
        return "📅"
      case "technique":
        return "🎯"
      default:
        return "💡"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-600 bg-red-950/30 text-red-300"
      case "medium":
        return "border-yellow-600 bg-yellow-950/30 text-yellow-300"
      case "low":
        return "border-green-600 bg-green-950/30 text-green-300"
      default:
        return "border-slate-600 bg-slate-900"
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-8">
        <div className="mx-auto max-w-5xl">
          <div className="h-8 w-32 rounded bg-slate-700 animate-pulse" />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded bg-slate-700 animate-pulse" />
            ))}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">📊 Dashboard học tập</h1>
          <p className="mt-2 text-slate-300">Xin chào, {DEMO_USER_ID}!</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-600 bg-red-950/30 p-4">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Bài học hoàn thành</span>
              <BookOpen className="text-blue-400" size={24} />
            </div>
            <p className="text-3xl font-bold">{stats.completedLessons}</p>
            <p className="mt-1 text-sm text-slate-400">
              từ {progress.length} bài học
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Tiến độ trung bình</span>
              <TrendingUp className="text-green-400" size={24} />
            </div>
            <p className="text-3xl font-bold">{stats.averageCompletion}%</p>
            <p className="mt-1 text-sm text-slate-400">
              {stats.averageCompletion >= 80
                ? "Rất tốt!"
                : stats.averageCompletion >= 50
                ? "Đang tiến bộ"
                : "Còn nhiều việc phải làm"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Tổng thời gian</span>
              <Zap className="text-yellow-400" size={24} />
            </div>
            <p className="text-3xl font-bold">
              {Math.round(stats.totalWatchTime / 60)}m
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {stats.totalWatchTime} giây
            </p>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">💡 Gợi ý học tập</h2>
          {priorityRecommendations.length === 0 ? (
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-6 text-center text-slate-400">
              <p>Bạn đang học tập đều đặn, tuyệt vời!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {priorityRecommendations.map((rec) => (
                <div
                  key={rec.id}
                  className={`rounded-xl border p-4 ${getPriorityColor(rec.priority)}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-1">{getRecommendationIcon(rec.type)}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{rec.title}</h3>
                      <p className="text-sm mb-2">{rec.description}</p>
                      <p className="text-xs opacity-75">📍 {rec.reason}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">⚡ Nhanh</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <button
              onClick={() => navigate("/courses")}
              className="rounded-xl border border-slate-700 bg-slate-900 p-4 hover:border-blue-500 hover:bg-slate-800 transition-all text-left"
            >
              <p className="font-semibold mb-1">🎓 Xem khóa học</p>
              <p className="text-sm text-slate-400">Có {courses.length} khóa học</p>
            </button>

            <button
              onClick={() => navigate("/assistant")}
              className="rounded-xl border border-slate-700 bg-slate-900 p-4 hover:border-blue-500 hover:bg-slate-800 transition-all text-left"
            >
              <p className="font-semibold mb-1">🤖 Hỏi trợ lý</p>
              <p className="text-sm text-slate-400">Nhận lời khuyên từ AI</p>
            </button>
          </div>
        </div>

        {/* Progress List */}
        {progress.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">📈 Tiến độ chi tiết</h2>
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {progress
                  .sort((a, b) => b.completion_percent - a.completion_percent)
                  .slice(0, 5)
                  .map((p) => (
                    <div key={p.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">Lesson {p.lesson_id.slice(0, 8)}</span>
                        <span className={p.completed ? "text-green-400" : "text-slate-400"}>
                          {p.completion_percent}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            p.completed ? "bg-green-500" : "bg-blue-500"
                          }`}
                          style={{ width: `${p.completion_percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
