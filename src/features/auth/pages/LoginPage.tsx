import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Music } from "lucide-react"
import { useAuthStore } from "@/store/authStore"

type LocationState = {
  from?: string
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const login = useAuthStore((state) => state.login)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const authLoading = useAuthStore((state) => state.loading)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const from = (location.state as LocationState | null)?.from || "/"

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [authLoading, isAuthenticated, navigate, from])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setError("")

    if (!email.trim()) {
      setError("Vui lòng nhập email.")
      return
    }

    if (!password.trim()) {
      setError("Vui lòng nhập mật khẩu.")
      return
    }

    try {
      setLoading(true)
      await login(email.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      console.error("Login error:", err)

      const message =
        err instanceof Error
          ? err.message
          : "Đăng nhập thất bại. Vui lòng thử lại."

      if (
        message.toLowerCase().includes("invalid login credentials") ||
        message.toLowerCase().includes("invalid")
      ) {
        setError("Email hoặc mật khẩu không đúng.")
      } else if (message.toLowerCase().includes("email not confirmed")) {
        setError("Tài khoản chưa xác nhận email. Vui lòng kiểm tra hộp thư.")
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
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
            Đăng nhập
          </h2>

          <p className="mb-6 text-center text-sm text-slate-600">
            Đăng nhập để xem bài học, lưu tiến độ và luyện tập cá nhân hóa.
          </p>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
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
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 placeholder-slate-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
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
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 placeholder-slate-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-lg bg-blue-600 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Chưa có tài khoản?{" "}
              <Link
                to="/register"
                className="font-medium text-blue-600 underline hover:text-blue-700"
              >
                Tạo tài khoản
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