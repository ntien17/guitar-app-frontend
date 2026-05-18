import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getCourses } from "../services/courseApi"
import { Course } from "@/types"
import { BookOpen, AlertCircle } from "lucide-react"

export default function CoursesPage() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchCourses() {
      try {
        setError("")
        const result = await getCourses()
        setCourses(result.data || [])
      } catch (err) {
        console.error("Failed to fetch courses:", err)
        setError("Không thể tải danh sách khóa học. Vui lòng kiểm tra kết nối backend.")
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  const getLevelBadge = (level: string) => {
    const styles: Record<string, { bg: string; text: string; label: string }> = {
      beginner: { bg: "bg-green-900/30", text: "text-green-300", label: "🟢 Cơ bản" },
      intermediate: { bg: "bg-blue-900/30", text: "text-blue-300", label: "🔵 Trung cấp" },
      advanced: { bg: "bg-purple-900/30", text: "text-purple-300", label: "🟣 Nâng cao" },
    }
    const style = styles[level] || styles.beginner
    return { ...style, label: styles[level]?.label || level }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen size={36} className="text-blue-400" />
            <h1 className="text-4xl font-bold">Khóa học guitar</h1>
          </div>
          <p className="text-slate-400 text-lg">
            Chọn khóa học phù hợp với trình độ của bạn và bắt đầu hành trình học guitar.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-600 bg-red-950/20 p-4 flex items-start gap-3">
            <AlertCircle className="flex-shrink-0 text-red-400 mt-0.5" size={20} />
            <div>
              <p className="text-red-300 font-medium">Lỗi tải khóa học</p>
              <p className="text-red-200 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="mt-8">
            <p className="text-slate-400 mb-6">Đang tải khóa học...</p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-700 bg-slate-900 p-6 animate-pulse"
                >
                  <div className="h-6 w-24 rounded bg-slate-700" />
                  <div className="mt-4 h-8 w-3/4 rounded bg-slate-700" />
                  <div className="mt-4 space-y-3">
                    <div className="h-4 rounded bg-slate-700" />
                    <div className="h-4 w-5/6 rounded bg-slate-700" />
                    <div className="h-4 w-4/5 rounded bg-slate-700" />
                  </div>
                  <div className="mt-6 h-10 rounded-lg bg-slate-700" />
                </div>
              ))}
            </div>
          </div>
        ) : courses.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-12 text-center">
            <BookOpen size={48} className="mx-auto text-slate-500 mb-4" />
            <p className="text-slate-400 text-lg">Hiện chưa có khóa học nào</p>
            <p className="text-slate-500 text-sm mt-2">Vui lòng kiểm tra lại sau hoặc liên hệ hỗ trợ.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => {
              const { bg, text, label } = getLevelBadge(course.level)
              return (
                <div
                  key={course.id}
                  className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 hover:border-slate-600 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
                >
                  <span className={`inline-block rounded-full ${bg} ${text} px-4 py-2 text-sm font-medium border border-current border-opacity-20`}>
                    {label}
                  </span>

                  <h2 className="mt-4 text-xl font-bold line-clamp-2 group-hover:text-blue-300 transition-colors">
                    {course.title}
                  </h2>

                  <p className="mt-3 text-sm leading-relaxed text-slate-400 line-clamp-3">
                    {course.description}
                  </p>

                  <button
                    onClick={() => navigate(`/courses/${course.id}`)}
                    className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold hover:bg-blue-500 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <BookOpen size={18} />
                    Xem khóa học
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}