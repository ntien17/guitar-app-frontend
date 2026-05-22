import { useState } from "react"
import { useForm } from "react-hook-form"
import { Course } from "@/types"
import { AppLayout } from "@/components/AppLayout"
import { PageHeader } from "@/shared/ui/PageHeader"
import { Card, CardContent, CardHeader } from "@/shared/ui/Card"
import { Badge } from "@/shared/ui/Badge"
import { Plus, Edit2, Trash2, Settings } from "lucide-react"

interface CourseFormData {
  title: string
  description: string
  level: "beginner" | "intermediate" | "advanced"
  is_published: boolean
}

export default function AdminPage() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CourseFormData>({
    defaultValues: {
      level: "beginner",
      is_published: false,
    },
  })

  const [courses, setCourses] = useState<Course[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState("")
  const [warningMessage, setWarningMessage] = useState(
    "⚠️ Admin page hiện là UI demo. Backend endpoint POST/PUT /api/courses cần được tạo trước khi có thể thực sự lưu khóa học."
  )

  const onSubmit = async (data: CourseFormData) => {
    try {
      setWarningMessage(
        "⚠️ Admin page hiện là UI demo. Dữ liệu không được lưu. Hãy implement POST /api/courses endpoint ở backend để thực hiện tính năng này."
      )
      setSuccessMessage("")

      const newCourse: Course = {
        id: editingId || `temp-${Date.now()}`,
        title: data.title,
        description: data.description,
        level: data.level,
        is_published: data.is_published,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      if (editingId) {
        setCourses(courses.map((c) => (c.id === editingId ? newCourse : c)))
        setEditingId(null)
        setSuccessMessage("✅ Cập nhật khóa học thành công (demo)")
      } else {
        setCourses([...courses, newCourse])
        setSuccessMessage("✅ Thêm khóa học thành công (demo)")
      }

      reset()
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Error submitting form:", error)
      setWarningMessage("❌ Lỗi khi lưu dữ liệu")
    }
  }

  const handleEdit = (course: Course) => {
    setEditingId(course.id)
    reset({
      title: course.title,
      description: course.description,
      level: course.level,
      is_published: course.is_published,
    })
  }

  const handleDelete = (id: string) => {
    setCourses(courses.filter((c) => c.id !== id))
    setSuccessMessage("✅ Xóa khóa học thành công (demo)")
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  const handleCancel = () => {
    setEditingId(null)
    reset()
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <PageHeader
          title="Quản lý khóa học"
          subtitle="Ghi chú: Đây là UI demo. Để hoàn thành tính năng này, backend cần implement POST/PUT/DELETE endpoints."
          icon={<Settings size={32} className="text-blue-600" />}
        />

        {warningMessage && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent>
              <p className="text-amber-800">{warningMessage}</p>
            </CardContent>
          </Card>
        )}

        {successMessage && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent>
              <p className="text-green-800">{successMessage}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Form */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-slate-900">
                {editingId ? "✏️ Sửa khóa học" : "➕ Thêm khóa học"}
              </h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tên khóa học *
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Guitar cơ bản cho người mới"
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 placeholder-slate-500 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    {...register("title", {
                      required: "Tên khóa học là bắt buộc",
                      minLength: { value: 3, message: "Tên phải dài ít nhất 3 ký tự" },
                    })}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Mô tả *
                  </label>
                  <textarea
                    placeholder="Mô tả chi tiết về khóa học"
                    rows={4}
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 placeholder-slate-500 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 resize-none"
                    {...register("description", {
                      required: "Mô tả là bắt buộc",
                      minLength: { value: 10, message: "Mô tả phải dài ít nhất 10 ký tự" },
                    })}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Trình độ *
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    {...register("level")}
                  >
                    <option value="beginner">Cơ bản</option>
                    <option value="intermediate">Trung cấp</option>
                    <option value="advanced">Nâng cao</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_published"
                    className="rounded border-slate-200 text-blue-600"
                    {...register("is_published")}
                  />
                  <label htmlFor="is_published" className="text-sm font-medium text-slate-700">
                    Công khai
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    {editingId ? (
                      <>
                        <Edit2 size={16} />
                        Cập nhật
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Thêm
                      </>
                    )}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 rounded-lg border border-slate-200 text-slate-700 px-4 py-2 font-medium hover:bg-slate-50 transition-colors"
                    >
                      Hủy
                    </button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Info */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-slate-900">Backend TODO</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="font-semibold text-slate-900 mb-1">1. POST /api/courses</p>
                  <p className="text-xs text-slate-600">
                    Request: &#123; title, description, level, is_published &#125;
                    <br />
                    Response: Course object
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="font-semibold text-slate-900 mb-1">2. PUT /api/courses/:id</p>
                  <p className="text-xs text-slate-600">
                    Update course fields
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="font-semibold text-slate-900 mb-1">3. Database constraint</p>
                  <p className="text-xs text-slate-600">
                    - course_id UUID unique<br />
                    - title max 255 chars<br />
                    - level enum<br />
                    - is_published default false
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* List */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold text-slate-900">Danh sách khóa học (Demo)</h2>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <p className="text-slate-600 text-center py-8">
                Chưa có khóa học nào. Hãy thêm khóa học mới.
              </p>
            ) : (
              <div className="space-y-3">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{course.title}</h3>
                      <p className="text-sm text-slate-600 mt-1 line-clamp-1">
                        {course.description}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Badge variant={course.level === "beginner" ? "success" : course.level === "intermediate" ? "info" : "warning"}>
                          {course.level === "beginner"
                            ? "Cơ bản"
                            : course.level === "intermediate"
                            ? "Trung cấp"
                            : "Nâng cao"}
                        </Badge>
                        {course.is_published && (
                          <Badge variant="primary">Công khai</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(course)}
                        className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                        title="Sửa"
                      >
                        <Edit2 size={18} className="text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
