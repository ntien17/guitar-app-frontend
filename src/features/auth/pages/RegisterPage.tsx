import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Music } from "lucide-react"
import { useAuthStore } from "@/store/authStore"

function getRegisterErrorMessage(error: unknown) {
  if (error instanceof Error) {
    const name = error.name || ""
    const message = error.message || ""

    if (
      name.includes("AuthRetryableFetchError") ||
      message.includes("504") ||
      message.toLowerCase().includes("gateway") ||
      message.toLowerCase().includes("failed to fetch")
    ) {
      return "Supabase Auth đang timeout khi tạo tài khoản. Nếu đang dùng email provider mặc định, hãy tắt Confirm email khi test local hoặc chờ vài phút rồi thử lại."
    }

    if (
      message.includes("429") ||
      message.toLowerCase().includes("rate limit") ||
      message.toLowerCase().includes("too many requests")
    ) {
      return "Bạn đã gửi quá nhiều yêu cầu đăng ký. Vui lòng chờ vài phút rồi thử lại."
    }

    if (
      message.toLowerCase().includes("already registered") ||
      message.toLowerCase().includes("user already registered") ||
      message.toLowerCase().includes("already")
    ) {
      return "Email này đã được đăng ký. Vui lòng đăng nhập."
    }

    if (
      message.toLowerCase().includes("password") &&
      message.toLowerCase().includes("6")
    ) {
      return "Mật khẩu phải có ít nhất 6 ký tự."
    }

    if (message.toLowerCase().includes("invalid email")) {
      return "Email không hợp lệ."
    }

    return message || "Đăng ký thất bại. Vui lòng thử lại."
  }

  if (typeof error === "object" && error !== null) {
    return "Đăng ký thất bại do lỗi kết nối hoặc cấu hình Supabase. Hãy kiểm tra Network tab trong DevTools."
  }

  return "Đăng ký thất bại. Vui lòng thử lại."
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const register = useAuthStore((state) => state.register)

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setError("")
    setSuccessMessage("")

    const trimmedFullName = fullName.trim()
    const trimmedEmail = email.trim()

    if (!trimmedFullName) {
      setError("Vui lòng nhập họ tên.")
      return
    }

    if (!trimmedEmail) {
      setError("Vui lòng nhập email.")
      return
    }

    if (!password.trim()) {
      setError("Vui lòng nhập mật khẩu.")
      return
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.")
      return
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.")
      return
    }

    try {
      setLoading(true)

      const hasSession = await register(trimmedEmail, password, trimmedFullName)

      if (hasSession) {
        navigate("/", { replace: true })
        return
      }

      setSuccessMessage(
        "Tạo tài khoản thành công. Vui lòng kiểm tra email để xác nhận tài khoản trước khi đăng nhập."
      )

      setFullName("")
      setEmail("")
      setPassword("")
      setConfirmPassword("")
    } catch (err) {
      console.error("Register error:", err)
      setError(getRegisterErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8 flex items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
              <Music className="h-6 w-6 text-white" />
            </div>

            <div>
              <h1 className="text-lg font-bold text-slate-900">Guitar</h1>
              <p className="text-xs text-slate-500">Learning Platform</p>
            </div>
          </div>

          <h2 className="mb-2 text-center text-2xl font-bold text-slate-900">
            Tạo tài khoản
          </h2>

          <p className="mb-6 text-center text-sm text-slate-600">
            Đăng ký để học bài, lưu tiến độ và nhận lộ trình học cá nhân hóa.
          </p>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Họ tên
              </label>

              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                autoComplete="name"
                disabled={loading}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 placeholder-slate-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                autoComplete="email"
                disabled={loading}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 placeholder-slate-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Mật khẩu
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ít nhất 6 ký tự"
                autoComplete="new-password"
                disabled={loading}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 placeholder-slate-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Xác nhận mật khẩu
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                autoComplete="new-password"
                disabled={loading}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 placeholder-slate-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-lg bg-blue-600 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Đã có tài khoản?{" "}
              <Link
                to="/login"
                className="font-medium text-blue-600 underline hover:text-blue-700"
              >
                Đăng nhập
              </Link>
            </p>
          </div>

          <Link
            to="/"
            className="mt-4 block text-center text-sm text-slate-600 underline hover:text-slate-900"
          >
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  )
}