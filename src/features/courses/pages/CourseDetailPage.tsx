import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  Lock,
  PlayCircle,
  Target,
} from "lucide-react"

import { getCourseById } from "../services/courseApi"
import { getLessonsByCourseId } from "@/services/lessonService"
import type { Course, Lesson } from "@/types"
import { AppLayout } from "@/components/AppLayout"
import { Card, CardContent } from "@/shared/ui/Card"
import { Badge } from "@/shared/ui/Badge"
import { LoadingState } from "@/shared/ui/LoadingState"
import { EmptyState } from "@/shared/ui/EmptyState"
import { useAuthStore } from "@/store/authStore"

type CourseView = Course & {
  slug?: string | null
  summary?: string | null
  objectives?: string | string[] | null
  prerequisites?: string | string[] | null
  estimated_minutes?: number | null
}

type LessonView = Lesson & {
  slug?: string | null
  order_index?: number | null
  content?: string | null
  theory_content?: string | null
  video_url?: string | null
  embed_url?: string | null
  audio_url?: string | null
  practice_goal?: string | null
  difficulty?: string | null
}

function getLevelMeta(level?: string): {
  variant: "success" | "info" | "warning" | "primary"
  label: string
  bg: string
} {
  switch (level) {
    case "beginner":
      return { variant: "success", label: "Cơ bản", bg: "bg-emerald-50" }
    case "intermediate":
      return { variant: "info", label: "Trung cấp", bg: "bg-sky-50" }
    case "advanced":
      return { variant: "warning", label: "Cao cấp", bg: "bg-amber-50" }
    default:
      return { variant: "primary", label: "Khóa học", bg: "bg-blue-50" }
  }
}

function toList(value?: string | string[] | null) {
  if (!value) return []

  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter(Boolean)
  }

  return value
    .split(/\n|;/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function getLessonOrder(lesson: LessonView, index: number) {
  return lesson.order_index ?? lesson.order ?? index + 1
}

function getLessonSortValue(lesson: LessonView) {
  return lesson.order_index ?? lesson.order ?? 999
}

function getLessonPath(lesson: LessonView) {
  return `/lessons/${lesson.slug || lesson.id}`
}

function getLessonDuration(lesson: LessonView) {
  if (!lesson.duration_seconds) return "Linh hoạt"
  return `${Math.round(lesson.duration_seconds / 60)} phút`
}

function unwrapCourse(result: unknown): CourseView | null {
  if (!result || typeof result !== "object") return null

  const maybeApiResponse = result as { data?: unknown }
  const value =
    maybeApiResponse.data && typeof maybeApiResponse.data === "object"
      ? maybeApiResponse.data
      : result

  if (!value || typeof value !== "object") return null

  const maybeCourse = value as Partial<CourseView>

  if (!maybeCourse.id || !maybeCourse.title) {
    return null
  }

  return maybeCourse as CourseView
}

function unwrapLessons(result: unknown): LessonView[] {
  if (Array.isArray(result)) {
    return result as LessonView[]
  }

  if (result && typeof result === "object") {
    const maybeApiResponse = result as { data?: unknown }

    if (Array.isArray(maybeApiResponse.data)) {
      return maybeApiResponse.data as LessonView[]
    }
  }

  return []
}

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const [course, setCourse] = useState<CourseView | null>(null)
  const [lessons, setLessons] = useState<LessonView[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchCourseData() {
      if (!courseId) {
        setError("Thiếu mã khóa học.")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError("")
        setCourse(null)
        setLessons([])

        const courseResult = await getCourseById(courseId)
        const currentCourse = unwrapCourse(courseResult)

        if (!currentCourse) {
          setError("Không tìm thấy khóa học.")
          return
        }

        setCourse(currentCourse)

        const lessonsResult = await getLessonsByCourseId(
          currentCourse.slug || currentCourse.id
        )

        const validLessons = unwrapLessons(lessonsResult).filter(
          (lesson) => lesson.id && (lesson.slug || lesson.id)
        )

        const sortedLessons = [...validLessons].sort((a, b) => {
          const orderDiff = getLessonSortValue(a) - getLessonSortValue(b)

          if (orderDiff !== 0) return orderDiff

          return a.title.localeCompare(b.title)
        })

        setLessons(sortedLessons)
      } catch (err) {
        console.error("Failed to fetch course data:", err)
        setError("Không thể tải khóa học này. Vui lòng kiểm tra backend/API.")
      } finally {
        setLoading(false)
      }
    }

    fetchCourseData()
  }, [courseId])

  const level = getLevelMeta(course?.level)

  const totalMinutes = useMemo(() => {
    return lessons.reduce(
      (sum, lesson) => sum + Math.round((lesson.duration_seconds || 0) / 60),
      0
    )
  }, [lessons])

  const objectiveList = useMemo(() => {
    return toList(course?.objectives)
  }, [course?.objectives])

  const prerequisiteList = useMemo(() => {
    return toList(course?.prerequisites)
  }, [course?.prerequisites])

  const handleOpenLesson = (lesson: LessonView) => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: getLessonPath(lesson),
        },
      })
      return
    }

    navigate(getLessonPath(lesson))
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-5xl">
          <Card>
            <CardContent>
              <LoadingState message="Đang tải nội dung khóa học..." />
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  if (error || !course) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-5xl">
          <button
            onClick={() => navigate("/courses")}
            className="mb-4 font-medium text-blue-600 hover:text-blue-700"
          >
            ← Quay lại danh sách khóa học
          </button>

          <Card className="border-red-200 bg-red-50">
            <CardContent>
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                <p className="text-red-700">
                  {error || "Khóa học không tìm thấy"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => navigate("/courses")}
          className="mb-6 font-medium text-blue-600 hover:text-blue-700"
        >
          ← Quay lại danh sách khóa học
        </button>

        <Card className={`mb-6 ${level.bg}`}>
          <CardContent>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <Badge variant={level.variant}>{level.label}</Badge>

                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
                    <BookOpen size={14} />
                    {lessons.length} bài học
                  </span>

                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
                    <Clock size={14} />
                    {course.estimated_minutes || totalMinutes || "Linh hoạt"} phút
                  </span>
                </div>

                <h1 className="text-3xl font-bold text-slate-950 md:text-4xl">
                  {course.title}
                </h1>

                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700">
                  {course.summary || course.description}
                </p>

                {course.summary && course.description ? (
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                    {course.description}
                  </p>
                ) : null}
              </div>

              <div className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm lg:w-72">
                <p className="text-sm font-semibold text-slate-900">
                  Trạng thái truy cập
                </p>

                {isAuthenticated ? (
                  <div className="mt-3 flex items-start gap-2 text-sm text-emerald-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4" />
                    Bạn đã đăng nhập, có thể mở bài học và lưu tiến độ.
                  </div>
                ) : (
                  <div className="mt-3 space-y-3">
                    <div className="flex items-start gap-2 text-sm text-amber-700">
                      <Lock className="mt-0.5 h-4 w-4" />
                      Bạn có thể xem lộ trình, nhưng cần đăng nhập để học bài.
                    </div>

                    <Link
                      to="/login"
                      className="inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Đăng nhập để học
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent>
              <div className="mb-3 flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                <h2 className="font-bold text-slate-950">Mục tiêu khóa học</h2>
              </div>

              {objectiveList.length > 0 ? (
                <ul className="space-y-2 text-sm text-slate-700">
                  {objectiveList.map((objective) => (
                    <li key={objective} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-600">
                  Hoàn thành lý thuyết, xem video và luyện tập theo từng bài để
                  cải thiện kỹ năng.
                </p>
              )}

              {prerequisiteList.length > 0 ? (
                <div className="mt-5 rounded-xl bg-slate-50 p-3">
                  <p className="mb-2 text-sm font-semibold text-slate-800">
                    Điều kiện nên có
                  </p>

                  <ul className="space-y-1 text-sm text-slate-600">
                    {prerequisiteList.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <h2 className="font-bold text-slate-950">Nội dung học</h2>
              </div>

              <p className="text-sm leading-6 text-slate-600">
                Mỗi bài học gồm phần lý thuyết, video/audio nếu có, mục tiêu
                luyện tập và cập nhật tiến độ. Sau khi học, bạn có thể sang
                Practice để lưu phiên luyện tập.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-slate-950">
            Danh sách bài học
          </h2>

          <span className="text-sm text-slate-500">
            Đường dẫn bài học dùng slug theo tên, không dùng UUID demo.
          </span>
        </div>

        {lessons.length === 0 ? (
          <Card>
            <CardContent>
              <EmptyState
                icon={<BookOpen className="h-12 w-12 text-slate-400" />}
                title="Khóa học này chưa có bài học"
                description="Hãy kiểm tra bảng lessons trong Supabase hoặc API /api/lessons/course/:courseId."
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {lessons.map((lesson, index) => {
              const hasMedia = Boolean(
                lesson.video_url || lesson.embed_url || lesson.audio_url
              )

              return (
                <button
                  key={lesson.id}
                  onClick={() => handleOpenLesson(lesson)}
                  className="w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-50 font-bold text-blue-700">
                        {getLessonOrder(lesson, index)}
                      </div>

                      <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-950">
                            {lesson.title}
                          </h3>

                          {hasMedia ? (
                            <Badge variant="info">Có video/audio</Badge>
                          ) : (
                            <Badge variant="primary">Lý thuyết</Badge>
                          )}

                          {lesson.difficulty ? (
                            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                              {lesson.difficulty}
                            </span>
                          ) : null}
                        </div>

                        <p className="line-clamp-2 text-sm leading-6 text-slate-600">
                          {lesson.description}
                        </p>

                        {lesson.practice_goal ? (
                          <p className="mt-2 text-sm font-medium text-blue-700">
                            Mục tiêu luyện tập: {lesson.practice_goal}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-shrink-0 items-center gap-3 text-sm text-slate-500">
                      {hasMedia ? (
                        <PlayCircle className="h-5 w-5 text-blue-600" />
                      ) : null}

                      <Clock className="h-4 w-4" />
                      {getLessonDuration(lesson)}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}