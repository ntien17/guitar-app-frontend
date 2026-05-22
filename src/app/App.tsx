import { useEffect } from "react"
import AppRoutes from "@/routes/AppRoutes"
import { useAuthStore } from "@/store/authStore"

export default function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth)

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  return <AppRoutes />
}