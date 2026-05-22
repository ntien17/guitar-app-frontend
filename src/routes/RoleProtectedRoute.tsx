import { Navigate } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"

type RoleProtectedRouteProps = {
  children: React.ReactNode
  allowedRoles: Array<"student" | "admin">
}

export default function RoleProtectedRoute({
  children,
  allowedRoles,
}: RoleProtectedRouteProps) {
  const loading = useAuthStore((state) => state.loading)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const profile = useAuthStore((state) => state.profile)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-600">Đang kiểm tra quyền truy cập...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!profile || !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}