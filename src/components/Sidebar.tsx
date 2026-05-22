import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  Home,
  BookOpen,
  Sparkles,
  Music,
  BarChart3,
  Settings,
  Menu,
  X,
  LogIn,
  LogOut,
  UserPlus,
  Shield,
} from "lucide-react"
import { useState } from "react"
import { useAuthStore } from "@/store/authStore"

const publicNavItems = [
  { label: "Overview", path: "/", icon: Home },
  { label: "Courses", path: "/courses", icon: BookOpen },
  { label: "AI Assistant", path: "/assistant", icon: Sparkles },
]

const studentNavItems = [
  { label: "Practice", path: "/practice", icon: Music },
  { label: "Dashboard", path: "/dashboard", icon: BarChart3 },
]

const adminNavItems = [
  { label: "Admin", path: "/admin", icon: Shield },
]

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const user = useAuthStore((state) => state.user)
  const profile = useAuthStore((state) => state.profile)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const logout = useAuthStore((state) => state.logout)

  const isAdmin = profile?.role === "admin"

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true
    if (path !== "/" && location.pathname.startsWith(path)) return true
    return false
  }

  const handleLogout = async () => {
    await logout()
    setIsOpen(false)
    navigate("/login", { replace: true })
  }

  const renderNavItem = (item: {
    label: string
    path: string
    icon: React.ElementType
  }) => {
    const Icon = item.icon
    const active = isActive(item.path)

    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={() => setIsOpen(false)}
        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
          active
            ? "bg-blue-100 text-blue-700"
            : "text-slate-600 hover:bg-white hover:text-slate-950"
        }`}
      >
        <Icon size={18} />
        <span>{item.label}</span>
      </Link>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-50 rounded-lg border border-slate-200 bg-white p-2 hover:bg-slate-50 lg:hidden"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-200 bg-blue-50/70 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-slate-200 px-6 py-8">
          <Link
            to="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-75"
            onClick={() => setIsOpen(false)}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
              <Music className="h-5 w-5 text-white" />
            </div>

            <div>
              <h1 className="text-lg font-bold text-slate-900">Guitar</h1>
              <p className="text-xs text-slate-500">Learning Platform</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <div className="space-y-2">
            {publicNavItems.map(renderNavItem)}

            {isAuthenticated && (
              <>
                <div className="px-4 pt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Học tập
                </div>
                {studentNavItems.map(renderNavItem)}
              </>
            )}

            {isAuthenticated && isAdmin && (
              <>
                <div className="px-4 pt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Quản trị
                </div>
                {adminNavItems.map(renderNavItem)}
              </>
            )}
          </div>
        </nav>

        <div className="border-t border-slate-200 bg-white p-4">
          {isAuthenticated ? (
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {profile?.full_name || user?.email || "Học viên"}
                </p>

                <p className="text-xs text-slate-500">
                  {isAdmin ? "Admin" : "Học viên"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
              >
                <LogOut size={18} />
                <span>Đăng xuất</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                <LogIn size={18} />
                <span>Đăng nhập</span>
              </Link>

              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
              >
                <UserPlus size={18} />
                <span>Tạo tài khoản</span>
              </Link>
            </div>
          )}

          {isAuthenticated && (
            <Link
              to="/settings"
              className="mt-3 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
              onClick={() => setIsOpen(false)}
            >
              <Settings size={18} />
              <span>Settings</span>
            </Link>
          )}
        </div>
      </aside>

      <div className="hidden w-64 flex-shrink-0 lg:block" />
    </>
  )
}