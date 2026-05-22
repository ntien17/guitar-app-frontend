import { useEffect, useRef, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import ReactMarkdown from "react-markdown"
import { getLessonById, getLessonsByCourseId } from "@/services/lessonService"
import { getCourseById } from "@/features/courses/services/courseApi"
import { recordProgress, getProgressByLesson } from "@/services/progressService"
import type { Lesson, Course, LessonProgress } from "@/types"
import { AppLayout } from "@/components/AppLayout"
import { Card, CardContent } from "@/shared/ui/Card"
import { LoadingState } from "@/shared/ui/LoadingState"
import MediaPlayer from "@/widgets/MediaPlayer"
import { useAuthStore } from "@/store/authStore"
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Dumbbell,
  FileText,
  PlayCircle,
} from "lucide-react"

type LessonWithMeta = Lesson & {
  slug?: string | null
  content?: string | null
  embed_url?: string | null
  order_index?: number | null
  practice_goal?: string | null
  difficulty?: string | null
  lesson_type?: string | null
}

type CourseWithMeta = Course & {
  slug?: string | null
}

function normalizeMarkdown(value?: string | null) {
  if (!value) return ""

  return value
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .trim()
}

function unwrapLesson(result: unknown): LessonWithMeta | null {
  if (!result || typeof result !== "object") return null

  const maybeApiResponse = result as { data?: unknown }
  const value =
    maybeApiResponse.data && typeof maybeApiResponse.data === "object"
      ? maybeApiResponse.data
      : result

  if (!value || typeof value !== "object") return null

  const maybeLesson = value as Partial<LessonWithMeta>

  if (!maybeLesson.id || !maybeLesson.title) {
    return null
  }

  return maybeLesson as LessonWithMeta
}

function unwrapLessons(result: unknown): LessonWithMeta[] {
  if (Array.isArray(result)) {
    return result as LessonWithMeta[]
  }

  if (result && typeof result === "object") {
    const maybeApiResponse = result as { data?: unknown }

    if (Array.isArray(maybeApiResponse.data)) {
      return maybeApiResponse.data as LessonWithMeta[]
    }
  }

  return []
}

function getCoursePath(course?: CourseWithMeta | null) {
  if (!course) return "/courses"
  return `/courses/${course.slug || course.id}`
}

function getLessonPath(lesson: LessonWithMeta) {
  return `/lessons/${lesson.slug || lesson.id}`
}

function getLessonOrder(lesson: LessonWithMeta, index: number) {
  return lesson.order_index ?? lesson.order ?? index + 1
}

function getLessonSortValue(lesson: LessonWithMeta) {
  return lesson.order_index ?? lesson.order ?? 999
}

export default function LessonDetailPage() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const navigate = useNavigate()

  const progressTrackingRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  )

  const user = useAuthStore((state) => state.user)
  const authLoading = useAuthStore((state) => state.loading)
  const userId = user?.id

  const [lesson, setLesson] = useState<LessonWithMeta | null>(null)
  const [course, setCourse] = useState<CourseWithMeta | null>(null)
  const [lessonProgress, setLessonProgress] =
    useState<LessonProgress | null>(null)
  const [allLessons, setAllLessons] = useState<LessonWithMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [savingProgress, setSavingProgress] = useState(false)
  const [error, setError] = useState("")
  const [mediaCurrentTime, setMediaCurrentTime] = useState(0)
  const [mediaDuration, setMediaDuration] = useState(0)

  useEffect(() => {
    async function fetchLessonData() {
      if (!lessonId) {
        setError("Thiếu mã bài học.")
        setLoading(false)
        return
      }

      if (authLoading) return

      if (!userId) {
        navigate("/login", {
          replace: true,
          state: { from: `/lessons/${lessonId}` },
        })
        return
      }

      try {
        setLoading(true)
        setError("")
        setLesson(null)
        setCourse(null)
        setAllLessons([])

        const lessonResult = await getLessonById(lessonId)
        const lessonData = unwrapLesson(lessonResult)

        if (!lessonData) {
          setError("Bài học không tìm thấy.")
          return
        }

        setLesson(lessonData)

        if (lessonData.course_id) {
          const courseResult = await getCourseById(lessonData.course_id)
          const courseData = courseResult.data as CourseWithMeta | null

          if (courseData) {
            setCourse(courseData)
          }

          const lessonsResult = await getLessonsByCourseId(
            courseData?.slug || lessonData.course_id
          )

          const sortedLessons = unwrapLessons(lessonsResult)
            .filter((item) => item.id && (item.slug || item.id))
            .sort((a, b) => {
              const orderDiff = getLessonSortValue(a) - getLessonSortValue(b)

              if (orderDiff !== 0) return orderDiff

              return a.title.localeCompare(b.title)
            })

          setAllLessons(sortedLessons)
        }

        const progress = await getProgressByLesson(lessonData.id, userId)
        setLessonProgress(progress)
      } catch (err) {
        console.error("Failed to fetch lesson data:", err)
        setError("Không thể tải bài học này. Vui lòng kiểm tra API/backend.")
      } finally {
        setLoading(false)
      }
    }

    fetchLessonData()
  }, [lessonId, userId, authLoading, navigate])

  useEffect(() => {
    if (!lesson || !userId) return

    const trackProgress = async () => {
      if (mediaCurrentTime <= 0 || mediaDuration <= 0) return

      const completion = Math.min(
        100,
        Math.round((mediaCurrentTime / mediaDuration) * 100)
      )
      const isCompleted = completion >= 90

      try {
        await recordProgress(
          lesson.id,
          completion,
          Math.round(mediaCurrentTime),
          Math.round(mediaCurrentTime),
          isCompleted,
          userId
        )

        setLessonProgress((prev) => ({
          id: prev?.id || `progress-${lesson.id}`,
          user_id: userId,
          lesson_id: lesson.id,
          completion_percent: completion,
          watch_time_seconds: Math.round(mediaCurrentTime),
          last_position_seconds: Math.round(mediaCurrentTime),
          completed: isCompleted,
          rewatch_count: prev?.rewatch_count || 0,
          created_at: prev?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }))
      } catch (err) {
        console.error("Failed to track progress:", err)
      }
    }

    progressTrackingRef.current = setInterval(trackProgress, 5000)

    return () => {
      if (progressTrackingRef.current) {
        clearInterval(progressTrackingRef.current)
      }
    }
  }, [lesson, userId, mediaCurrentTime, mediaDuration])

  const handleMarkComplete = async () => {
    if (!lesson || !userId) {
      setError("Bạn cần đăng nhập để lưu tiến độ học.")
      return
    }

    try {
      setSavingProgress(true)
      setError("")

      const completedSeconds =
        mediaDuration || lesson.duration_seconds || mediaCurrentTime || 0

      await recordProgress(
        lesson.id,
        100,
        Math.round(completedSeconds),
        Math.round(completedSeconds),
        true,
        userId
      )

      setLessonProgress((prev) => ({
        id: prev?.id || `progress-${lesson.id}`,
        user_id: userId,
        lesson_id: lesson.id,
        completion_percent: 100,
        watch_time_seconds: Math.round(completedSeconds),
        last_position_seconds: Math.round(completedSeconds),
        completed: true,
        rewatch_count: prev?.rewatch_count || 0,
        created_at: prev?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))
    } catch (err) {
      console.error("Failed to mark lesson complete:", err)
      setError("Không thể cập nhật tiến độ bài học. Hãy kiểm tra API /api/progress.")
    } finally {
      setSavingProgress(false)
    }
  }

  if (loading || authLoading) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-5xl">
          <Card>
            <CardContent>
              <LoadingState message="Đang tải bài học..." />
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  if (error || !lesson) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-5xl">
          <button
            onClick={() => navigate("/courses")}
            className="mb-4 font-medium text-blue-600 hover:text-blue-700"
          >
            ← Quay lại khóa học
          </button>

          <Card className="border-red-200 bg-red-50">
            <CardContent>
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
                <p className="text-red-700">
                  {error || "Bài học không tìm thấy."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  const currentIndex = allLessons.findIndex((item) => item.id === lesson.id)
  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson =
    currentIndex >= 0 && currentIndex < allLessons.length - 1
      ? allLessons[currentIndex + 1]
      : null

  const completionPercent = lessonProgress?.completion_percent || 0
  const lessonOrder = getLessonOrder(lesson, currentIndex >= 0 ? currentIndex : 0)

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => navigate(getCoursePath(course))}
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            ← Quay lại khóa học
          </button>

          {course && (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
              {course.title}
            </span>
          )}
        </div>

        {error ? (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent>
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
                <p className="text-red-700">{error}</p>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <div className="mb-8 grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          <Card>
            <CardContent>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                  Bài {lessonOrder}
                </span>

                {lesson.lesson_type && (
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
                    {lesson.lesson_type}
                  </span>
                )}

                {lesson.difficulty && (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700">
                    {lesson.difficulty}
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-slate-950">
                {lesson.title}
              </h1>

              <p className="mt-3 text-lg leading-7 text-slate-600">
                {lesson.description}
              </p>

              <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-600">
                {lesson.duration_seconds ? (
                  <span className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                    <Clock size={16} />
                    {Math.round(lesson.duration_seconds / 60)} phút
                  </span>
                ) : null}

                {lesson.practice_goal ? (
                  <span className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                    <Dumbbell size={16} />
                    Có mục tiêu luyện tập
                  </span>
                ) : null}
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-700">
                    Tiến độ bài học
                  </span>
                  <span className="font-semibold text-slate-900">
                    {completionPercent}%
                  </span>
                </div>

                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full transition-all ${
                      completionPercent >= 90 ? "bg-green-500" : "bg-blue-600"
                    }`}
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h2 className="mb-3 flex items-center gap-2 font-bold text-slate-900">
                <CheckCircle size={20} className="text-green-600" />
                Trạng thái học
              </h2>

              <p className="text-sm leading-6 text-slate-600">
                {completionPercent >= 90
                  ? "Bạn đã hoàn thành bài học này. Có thể chuyển sang bài tiếp theo hoặc vào Practice để luyện thêm."
                  : "Hãy xem video, đọc lý thuyết và bấm hoàn thành khi bạn đã nắm nội dung."}
              </p>

              <button
                onClick={handleMarkComplete}
                disabled={savingProgress}
                className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {savingProgress ? "Đang lưu..." : "Đánh dấu hoàn thành"}
              </button>

              <Link
                to={`/practice?lessonId=${lesson.id}`}
                className="mt-3 block rounded-xl border border-slate-200 px-4 py-2 text-center font-medium text-slate-700 hover:bg-slate-50"
              >
                Sang trang luyện tập
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8 space-y-6">
          {lesson.embed_url ? (
            <Card>
              <CardContent>
                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900">
                  <PlayCircle size={22} className="text-blue-600" />
                  Video bài học
                </h2>

                <div className="aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
                  <iframe
                    src={lesson.embed_url}
                    title={lesson.title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </CardContent>
            </Card>
          ) : lesson.video_url ? (
            <Card>
              <CardContent>
                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900">
                  <PlayCircle size={22} className="text-blue-600" />
                  Video bài học
                </h2>

                <MediaPlayer
                  src={lesson.video_url}
                  type="video"
                  onProgressUpdate={(current: number, duration: number) => {
                    setMediaCurrentTime(current)
                    setMediaDuration(duration)
                  }}
                />
              </CardContent>
            </Card>
          ) : null}

          {lesson.audio_url ? (
            <Card>
              <CardContent>
                <h2 className="mb-4 text-xl font-bold text-slate-900">
                  Audio minh họa
                </h2>

                <MediaPlayer
                  src={lesson.audio_url}
                  type="audio"
                  onProgressUpdate={(current: number, duration: number) => {
                    setMediaCurrentTime(current)
                    setMediaDuration(duration)
                  }}
                />
              </CardContent>
            </Card>
          ) : null}

          {lesson.content ? (
            <Card>
              <CardContent>
                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900">
                  <FileText size={22} className="text-blue-600" />
                  Lý thuyết bài học
                </h2>

                <div className="prose prose-slate max-w-none">
                  <ReactMarkdown>{normalizeMarkdown(lesson.content)}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {lesson.practice_goal ? (
            <Card className="border-blue-100 bg-blue-50">
              <CardContent>
                <h2 className="mb-2 flex items-center gap-2 text-xl font-bold text-slate-900">
                  <Dumbbell size={22} className="text-blue-600" />
                  Mục tiêu luyện tập
                </h2>
                <p className="text-slate-700">{lesson.practice_goal}</p>
              </CardContent>
            </Card>
          ) : null}
        </div>

        {previousLesson || nextLesson ? (
          <div className="grid gap-4 md:grid-cols-2">
            {previousLesson ? (
              <button
                onClick={() => navigate(getLessonPath(previousLesson))}
                className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:bg-slate-50"
              >
                <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                  <ChevronLeft size={18} />
                  Bài trước
                </div>
                <p className="font-semibold text-slate-900 group-hover:text-blue-600">
                  {previousLesson.title}
                </p>
              </button>
            ) : (
              <div />
            )}

            {nextLesson ? (
              <button
                onClick={() => navigate(getLessonPath(nextLesson))}
                className="group rounded-2xl border border-slate-200 bg-white p-5 text-right shadow-sm transition hover:bg-slate-50"
              >
                <div className="mb-2 flex items-center justify-end gap-2 text-sm text-slate-500">
                  Bài tiếp theo
                  <ChevronRight size={18} />
                </div>
                <p className="font-semibold text-slate-900 group-hover:text-blue-600">
                  {nextLesson.title}
                </p>
              </button>
            ) : (
              <div />
            )}
          </div>
        ) : null}
      </div>
    </AppLayout>
  )
}