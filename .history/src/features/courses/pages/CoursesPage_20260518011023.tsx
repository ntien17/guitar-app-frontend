import { useEffect, useState } from "react"
import { getCourses } from "../services/courseApi"

type Course = {
  id: string
  title: string
  description: string
  level: string
  is_published: boolean
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCourses() {
      try {
        const result = await getCourses()
        setCourses(result.data || [])
      } catch (error) {
        console.error("Failed to fetch courses:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold">Khóa học guitar</h1>
        <p className="mt-3 text-slate-300">
          Chọn khóa học phù hợp với trình độ của bạn.
        </p>

        {loading ? (
          <p className="mt-8 text-slate-400">Đang tải khóa học...</p>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <div
                key={course.id}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
              >
                <span className="rounded-full bg-blue-600/20 px-3 py-1 text-sm text-blue-300">
                  {course.level}
                </span>

                <h2 className="mt-4 text-xl font-bold">{course.title}</h2>

                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {course.description}
                </p>

                <button className="mt-5 rounded-xl bg-blue-600 px-4 py-2 font-medium hover:bg-blue-500">
                  Xem khóa học
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}