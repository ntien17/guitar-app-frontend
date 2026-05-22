import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  AlertCircle,
  BookOpen,
  Clock,
  Filter,
  GraduationCap,
  PlayCircle,
  Search,
  Sparkles,
} from "lucide-react"

import { getCourses } from "../services/courseApi"
import type { Course } from "@/types"
import { AppLayout } from "@/components/AppLayout"
import { PageHeader } from "@/shared/ui/PageHeader"
import { Card, CardContent } from "@/shared/ui/Card"
import { Badge } from "@/shared/ui/Badge"
import { LoadingState } from "@/shared/ui/LoadingState"
import { EmptyState } from "@/shared/ui/EmptyState"

type CourseLevel = "all" | "beginner" | "intermediate" | "advanced"

type CourseView = Course & {
  slug?: string | null
  thumbnail_url?: string | null
  summary?: string | null
  estimated_minutes?: number | null
  lessons_count?: number | null
  order_index?: number | null
  is_published: boolean
}

const levelTabs: Array<{
  value: CourseLevel
  label: string
  description: string
}> = [
  {
    value: "all",
    label: "Tất cả",
    description: "Toàn bộ lộ trình",
  },
  {
    value: "beginner",
    label: "Cơ bản",
    description: "Làm quen đàn, hợp âm nền tảng",
  },
  {
    value: "intermediate",
    label: "Trung cấp",
    description: "Đệm hát, tiết tấu, chuyển hợp âm",
  },
  {
    value: "advanced",
    label: "Cao cấp",
    description: "Fingerstyle, barre chord, biểu diễn",
  },
]

function getLevelMeta(level?: string): {
  variant: "success" | "info" | "warning" | "primary"
  label: string
  border: string
  bg: string
} {
  switch (level) {
    case "beginner":
      return {
        variant: "success",
        label: "Cơ bản",
        border: "border-emerald-200",
        bg: "bg-emerald-50",
      }
    case "intermediate":
      return {
        variant: "info",
        label: "Trung cấp",
        border: "border-sky-200",
        bg: "bg-sky-50",
      }
    case "advanced":
      return {
        variant: "warning",
        label: "Cao cấp",
        border: "border-amber-200",
        bg: "bg-amber-50",
      }
    default:
      return {
        variant: "primary",
        label: "Khóa học",
        border: "border-blue-200",
        bg: "bg-blue-50",
      }
  }
}

function isValidPublishedCourse(course: CourseView) {
  return Boolean(course.id && course.slug && course.is_published)
}

function getCoursePath(course: CourseView) {
  return `/courses/${course.slug}`
}

export default function CoursesPage() {
  const navigate = useNavigate()

  const [courses, setCourses] = useState<CourseView[]>([])
  const [activeLevel, setActiveLevel] = useState<CourseLevel>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true)
        setError("")

        const result = await getCourses()
        const courseList = (result.data || []) as CourseView[]

        const normalizedCourses = courseList
          .filter(isValidPublishedCourse)
          .sort((a, b) => {
            const orderA = a.order_index ?? 999
            const orderB = b.order_index ?? 999

            if (orderA !== orderB) return orderA - orderB

            return a.title.localeCompare(b.title)
          })

        setCourses(normalizedCourses)
      } catch (err) {
        console.error("Failed to fetch courses:", err)
        setError(
          "Không thể tải danh sách khóa học. Vui lòng kiểm tra backend và Supabase."
        )
        setCourses([])
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  const filteredCourses = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase()

    return courses.filter((course) => {
      const matchLevel = activeLevel === "all" || course.level === activeLevel

      const matchSearch =
        !keyword ||
        course.title.toLowerCase().includes(keyword) ||
        course.description?.toLowerCase().includes(keyword) ||
        course.summary?.toLowerCase().includes(keyword)

      return matchLevel && matchSearch
    })
  }, [courses, activeLevel, searchTerm])

  const totalByLevel = useMemo(() => {
    return courses.reduce<Record<string, number>>((acc, course) => {
      const level = course.level || "unknown"
      acc[level] = (acc[level] || 0) + 1
      return acc
    }, {})
  }, [courses])

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl">
        <PageHeader
          title="Khóa học guitar"
          subtitle="Lộ trình học được chia theo cấp độ: cơ bản, trung cấp và cao cấp. Mỗi khóa học có bài lý thuyết, video, bài luyện tập và theo dõi tiến độ."
          icon={<BookOpen size={32} className="text-blue-600" />}
        />

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card className="border-blue-100 bg-blue-50">
            <CardContent>
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-blue-600 p-2 text-white">
                  <GraduationCap size={20} />
                </div>

                <div>
                  <p className="text-sm text-blue-700">Tổng khóa học</p>
                  <p className="mt-1 text-2xl font-bold text-slate-950">
                    {courses.length}
                  </p>
                  <p className="mt-1 text-xs text-blue-700">
                    chỉ tính khóa học đang xuất bản
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-100 bg-emerald-50">
            <CardContent>
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-emerald-600 p-2 text-white">
                  <Sparkles size={20} />
                </div>

                <div>
                  <p className="text-sm text-emerald-700">Cơ bản</p>
                  <p className="mt-1 text-2xl font-bold text-slate-950">
                    {totalByLevel.beginner || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-100 bg-amber-50">
            <CardContent>
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-amber-500 p-2 text-white">
                  <PlayCircle size={20} />
                </div>

                <div>
                  <p className="text-sm text-amber-700">Có video/bài tập</p>
                  <p className="mt-1 text-2xl font-bold text-slate-950">
                    Sẵn sàng
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardContent>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Tìm khóa học, hợp âm, fingerstyle..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto">
                <Filter className="h-4 w-4 shrink-0 text-slate-500" />

                {levelTabs.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setActiveLevel(tab.value)}
                    className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition ${
                      activeLevel === tab.value
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                    title={tab.description}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {error ? (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent>
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                <div>
                  <p className="font-medium text-red-900">Lỗi tải khóa học</p>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {loading ? (
          <Card>
            <CardContent>
              <LoadingState message="Đang tải khóa học..." />
            </CardContent>
          </Card>
        ) : filteredCourses.length === 0 ? (
          <Card>
            <CardContent>
              <EmptyState
                icon={<BookOpen className="h-12 w-12 text-slate-400" />}
                title="Không tìm thấy khóa học phù hợp"
                description="Hãy thử đổi từ khóa tìm kiếm hoặc chọn cấp độ khác."
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredCourses.map((course) => {
              const level = getLevelMeta(course.level)

              return (
                <Card
                  key={course.id}
                  clickable
                  className={`${level.border} overflow-hidden`}
                  onClick={() => navigate(getCoursePath(course))}
                >
                  <div className={`h-28 ${level.bg} px-6 py-5`}>
                    <div className="flex items-start justify-between gap-3">
                      <Badge variant={level.variant}>{level.label}</Badge>

                      {course.estimated_minutes ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-600">
                          <Clock size={14} />
                          {course.estimated_minutes} phút
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <CardContent>
                    <h2 className="mb-3 line-clamp-2 text-xl font-bold text-slate-950">
                      {course.title}
                    </h2>

                    <p className="mb-4 line-clamp-3 text-sm leading-6 text-slate-600">
                      {course.summary || course.description}
                    </p>

                    <div className="mb-5 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                      <p>
                        Nội dung gồm lý thuyết, video bài học và bài luyện tập
                        để lưu tiến độ cá nhân.
                      </p>
                    </div>

                    <button
                      onClick={(event) => {
                        event.stopPropagation()
                        navigate(getCoursePath(course))
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700 active:scale-[0.98]"
                    >
                      <BookOpen size={16} />
                      Xem lộ trình
                    </button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}