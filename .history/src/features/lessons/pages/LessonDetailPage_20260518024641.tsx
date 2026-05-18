import { useEffect, useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getLessonById, getLessonsByCourseId } from "@/services/lessonService"
import { getCourseById } from "@/features/courses/services/courseApi"
import { recordProgress, getProgressByLesson } from "@/services/progressService"
import { Lesson, Course, LessonProgress } from "@/types"
import MediaPlayer from "@/widgets/MediaPlayer"
import { ChevronLeft, ChevronRight } from "lucide-react"

const DEMO_USER_ID = "demo-user"

export default function LessonDetailPage() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const navigate = useNavigate()
  const progressTrackingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [course, setCourse] = useState<Course | null>(null)
  const [lessonProgress, setLessonProgress] = useState<LessonProgress | null>(null)
  const [allLessons, setAllLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [mediaCurrentTime, setMediaCurrentTime] = useState(0)
  const [mediaDuration, setMediaDuration] = useState(0)

  useEffect(() => {
    async function fetchLessonData() {
      if (!lessonId) return

      try {
        setError("")

        const lessonData = await getLessonById(lessonId)
        if (!lessonData) {
          setError("Bài học không tìm thấy")
          return
        }

        setLesson(lessonData)

        const courseData = await getCourseById(lessonData.course_id)
        if (courseData?.data) {
          setCourse(courseData.data)
          const lessons = await getLessonsByCourseId(lessonData.course_id)
          setAllLessons(lessons)
        }

        const progress = await getProgressByLesson(lessonId, DEMO_USER_ID)
        setLessonProgress(progress)
      } catch (err) {
        console.error("Failed to fetch lesson data:", err)
        setError("Không thể tải bài học này")
      } finally {
        setLoading(false)
      }
    }

    fetchLessonData()
  }, [lessonId])

  // Track progress periodically
  useEffect(() => {
    if (!lesson) return

    const trackProgress = async () => {
      if (mediaCurrentTime > 0 && mediaDuration > 0) {
        const completion = Math.round((mediaCurrentTime / mediaDuration) * 100)
        const isCompleted = completion >= 90

        try {
          await recordProgress(
            lesson.id,
            completion,
            Math.round(mediaCurrentTime),
            Math.round(mediaCurrentTime),
            isCompleted,
            DEMO_USER_ID
          )

          setLessonProgress({
            id: lessonProgress?.id || `progress-${lesson.id}`,
            user_id: DEMO_USER_ID,
            lesson_id: lesson.id,
            completion_percent: completion,
            watch_time_seconds: Math.round(mediaCurrentTime),
            last_position_seconds: Math.round(mediaCurrentTime),
            completed: isCompleted,
            rewatch_count: lessonProgress?.rewatch_count || 0,
            created_at: lessonProgress?.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        } catch (err) {
          console.error("Failed to track progress:", err)
        }
      }
    }

    progressTrackingRef.current = setInterval(trackProgress, 5000)

    return () => {
      if (progressTrackingRef.current) {
        clearInterval(progressTrackingRef.current)
      }
    }
  }, [lesson, mediaCurrentTime, mediaDuration, lessonProgress])

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-8">
        <div className="mx-auto max-w-4xl">
          <div className="h-8 w-32 rounded bg-slate-700 animate-pulse" />
          <div className="mt-8 h-64 rounded bg-slate-700 animate-pulse" />
        </div>
      </main>
    )
  }

  if (error || !lesson) {
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
            <p className="text-red-300">{error || "Bài học không tìm thấy"}</p>
          </div>
        </div>
      </main>
    )
  }

  const currentIndex = allLessons.findIndex((l) => l.id === lesson.id)
  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null
  const hasVideo = lesson.video_url
  const hasAudio = lesson.audio_url
  const completionPercent = lessonProgress?.completion_percent || 0

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(`/courses/${lesson.course_id}`)}
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            ← Quay lại khóa học
          </button>
          {course && (
            <span className="text-sm text-slate-400">{course.title}</span>
          )}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 mb-8">
          <h1 className="text-4xl font-bold mb-3">{lesson.order}. {lesson.title}</h1>
          <p className="text-slate-300 text-lg mb-6">{lesson.description}</p>

          {lesson.duration_seconds && (
            <p className="text-sm text-slate-400">
              ⏱️ Thời lượng: {Math.round(lesson.duration_seconds / 60)} phút
            </p>
          )}

          {completionPercent > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Tiến độ:</span>
                <span className={completionPercent >= 90 ? "text-green-400" : "text-slate-300"}>
                  {completionPercent}%
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    completionPercent >= 90 ? "bg-green-500" : "bg-blue-500"
                  }`}
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8 mb-8">
          {hasVideo && (
            <div>
              <h2 className="text-xl font-bold mb-4">Video bài học</h2>
              <MediaPlayer
                src={lesson.video_url}
                type="video"
                onProgressUpdate={(current, duration) => {
                  setMediaCurrentTime(current)
                  setMediaDuration(duration)
                }}
              />
            </div>
          )}

          {hasAudio && (
            <div>
              <h2 className="text-xl font-bold mb-4">Audio minh họa</h2>
              <MediaPlayer
                src={lesson.audio_url}
                type="audio"
                onProgressUpdate={(current, duration) => {
                  setMediaCurrentTime(current)
                  setMediaDuration(duration)
                }}
              />
            </div>
          )}

          {!hasVideo && !hasAudio && (
            <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-6 text-center text-slate-400">
              <p>Bài học này hiện chưa có video hoặc audio</p>
            </div>
          )}
        </div>

        {(previousLesson || nextLesson) && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            {previousLesson ? (
              <button
                onClick={() => navigate(`/lessons/${previousLesson.id}`)}
                className="rounded-xl border border-slate-700 bg-slate-900 p-4 hover:border-blue-500 hover:bg-slate-800 transition-all text-left"
              >
                <div className="flex items-center gap-2 mb-2">
                  <ChevronLeft size={18} />
                  <span className="text-sm text-slate-400">Bài trước</span>
                </div>
                <p className="font-semibold line-clamp-1">{previousLesson.title}</p>
              </button>
            ) : (
              <div />
            )}

            {nextLesson ? (
              <button
                onClick={() => navigate(`/lessons/${nextLesson.id}`)}
                className="rounded-xl border border-slate-700 bg-slate-900 p-4 hover:border-blue-500 hover:bg-slate-800 transition-all text-right"
              >
                <div className="flex items-center justify-end gap-2 mb-2">
                  <span className="text-sm text-slate-400">Bài tiếp theo</span>
                  <ChevronRight size={18} />
                </div>
                <p className="font-semibold line-clamp-1">{nextLesson.title}</p>
              </button>
            ) : (
              <div />
            )}
          </div>
        )}

        {completionPercent >= 90 && (
          <div className="rounded-xl border border-green-600 bg-green-950/30 p-4 text-center">
            <p className="text-green-300 font-medium">
              ✅ Bạn đã hoàn thành bài học này!
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
