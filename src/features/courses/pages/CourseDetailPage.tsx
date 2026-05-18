import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getCourseById } from "../services/courseApi"
import { getLessonsByCourseId } from "@/services/lessonService"
import { Course, Lesson } from "@/types"

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchCourseData() {
      if (!courseId) return

      try {
        setError("")
        const [courseResult, lessonsData] = await Promise.all([
          getCourseById(courseId),
          getLessonsByCourseId(courseId),
        ])

        if (courseResult?.data) {
          setCourse(courseResult.data)
        }
        setLessons(lessonsData)
      } catch (err) {
        console.error("Failed to fetch course data:", err)
        setError("Không thể tải khóa học này")
      } finally {
        setLoading(false)
      }
    }

    fetchCourseData()
  }, [courseId])

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-8">
        <div className="mx-auto max-w-4xl">
          <div className="h-8 w-32 rounded bg-slate-700 animate-pulse" />
          <div className="mt-4 h-32 rounded bg-slate-700 animate-pulse" />
        </div>
      </main>
    )
  }

  if (error || !course) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-8">
        <div className="mx-auto max-w-4xl">
          <button
            onClick={() => navigate("/courses")}
            className="mb-4 text-blue-400 hover:text-blue-300"
          >
            ← Quay lại
          </button>
          <div className="rounded-xl border border-red-600 bg-red-950/30 p-4">
            <p className="text-red-300">{error || "Khóa học không tìm thấy"}</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <div className="mx-auto max-w-4xl">
        <button
          onClick={() => navigate("/courses")}
          className="mb-6 text-blue-400 hover:text-blue-300 font-medium"
        >
          ← Quay lại khóa học
        </button>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 mb-8">
          <span className="inline-block rounded-full bg-blue-900/20 text-blue-300 px-3 py-1 text-sm font-medium mb-4">
            {course.level === "beginner"
              ? "Cơ bản"
              : course.level === "intermediate"
              ? "Trung cấp"
              : "Nâng cao"}
          </span>
          <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
          <p className="text-slate-300 text-lg">{course.description}</p>
        </div>

        <h2 className="text-2xl font-bold mb-4">Bài học ({lessons.length})</h2>

        {lessons.length === 0 ? (
          <div className="rounded-xl border border-slate-700 bg-slate-900 p-8 text-center">
            <p className="text-slate-400">Khóa học này chưa có bài học nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson) => (
              <button
                key={lesson.id}
                onClick={() => navigate(`/lessons/${lesson.id}`)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 p-4 hover:border-blue-500 hover:bg-slate-800 transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{lesson.order}. {lesson.title}</h3>
                    <p className="text-sm text-slate-400 mt-1 line-clamp-1">{lesson.description}</p>
                  </div>
                  {lesson.duration_seconds && (
                    <span className="ml-4 text-sm text-slate-400">
                      {Math.round(lesson.duration_seconds / 60)} phút
                    </span>
                  )}
                  <span className="ml-4 text-blue-400">→</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
