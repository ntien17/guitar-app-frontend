import { useState } from "react"
import { useForm } from "react-hook-form"
import { Course } from "@/types"
import { Plus, Edit2, Trash2 } from "lucide-react"

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

      // Simulate local demo
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
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">⚙️ Admin - Quản lý khóa học</h1>
        <p className="text-slate-300 mb-8">
          Ghi chú: Đây là UI demo. Để hoàn thành tính năng này, backend cần implement:
          <br />
          • POST /api/courses - Tạo khóa học mới
          <br />
          • PUT /api/courses/:id - Cập nhật khóa học
          <br />
          • DELETE /api/courses/:id - Xóa khóa học (nếu cần)
        </p>

        {warningMessage && (
          <div className="mb-6 rounded-xl border border-yellow-600 bg-yellow-950/30 p-4">
            <p className="text-yellow-300">{warningMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 rounded-xl border border-green-600 bg-green-950/30 p-4">
            <p className="text-green-300">{successMessage}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Form */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-2xl font-bold mb-6">
              {editingId ? "✏️ Sửa khóa học" : "➕ Thêm khóa học"}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tên khóa học *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Guitar cơ bản cho người mới"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  {...register("title", {
                    required: "Tên khóa học là bắt buộc",
                    minLength: { value: 3, message: "Tên phải dài ít nhất 3 ký tự" },
                  })}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mô tả *</label>
                <textarea
                  placeholder="Mô tả chi tiết về khóa học"
                  rows={4}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  {...register("description", {
                    required: "Mô tả là bắt buộc",
                    minLength: { value: 10, message: "Mô tả phải dài ít nhất 10 ký tự" },
                  })}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Trình độ *</label>
                <select
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                  className="rounded border-slate-700"
                  {...register("is_published")}
                />
                <label htmlFor="is_published" className="text-sm font-medium">
                  Công khai
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
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
                    className="flex-1 rounded-lg border border-slate-700 px-4 py-2 font-medium hover:bg-slate-800 transition-colors"
                  >
                    Hủy
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Info */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-2xl font-bold mb-4">📝 Backend TODO</h2>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="p-3 rounded bg-slate-800/50 border border-slate-700">
                <p className="font-semibold mb-1">1. POST /api/courses</p>
                <p className="text-xs text-slate-400">
                  Request: &#123; title, description, level, is_published &#125;
                  <br />
                  Response: Course object
                </p>
              </div>
              <div className="p-3 rounded bg-slate-800/50 border border-slate-700">
                <p className="font-semibold mb-1">2. PUT /api/courses/:id</p>
                <p className="text-xs text-slate-400">
                  Update course fields
                </p>
              </div>
              <div className="p-3 rounded bg-slate-800/50 border border-slate-700">
                <p className="font-semibold mb-1">3. Database constraint</p>
                <p className="text-xs text-slate-400">
                  - course_id UUID unique<br />
                  - title max 255 chars<br />
                  - level enum<br />
                  - is_published default false
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-2xl font-bold mb-4">Danh sách khóa học (Demo)</h2>
          {courses.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              Chưa có khóa học nào. Hãy thêm khóa học mới.
            </p>
          ) : (
            <div className="space-y-3">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{course.title}</h3>
                    <p className="text-sm text-slate-400 mt-1 line-clamp-1">
                      {course.description}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs bg-blue-900/30 text-blue-300 px-2 py-1 rounded">
                        {course.level === "beginner"
                          ? "Cơ bản"
                          : course.level === "intermediate"
                          ? "Trung cấp"
                          : "Nâng cao"}
                      </span>
                      {course.is_published && (
                        <span className="text-xs bg-green-900/30 text-green-300 px-2 py-1 rounded">
                          Công khai
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(course)}
                      className="p-2 hover:bg-slate-700 rounded transition-colors"
                      title="Sửa"
                    >
                      <Edit2 size={18} className="text-blue-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="p-2 hover:bg-slate-700 rounded transition-colors"
                      title="Xóa"
                    >
                      <Trash2 size={18} className="text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
