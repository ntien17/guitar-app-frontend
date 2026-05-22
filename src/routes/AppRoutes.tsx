import { BrowserRouter, Routes, Route } from "react-router-dom"

import HomePage from "@/features/dashboard/pages/HomePage"
import DashboardPage from "@/features/dashboard/pages/DashboardPage"
import LoginPage from "@/features/auth/pages/LoginPage"
import RegisterPage from "@/features/auth/pages/RegisterPage"
import CoursesPage from "@/features/courses/pages/CoursesPage"
import CourseDetailPage from "@/features/courses/pages/CourseDetailPage"
import LessonDetailPage from "@/features/lessons/pages/LessonDetailPage"
import AssistantPage from "@/features/assistant/pages/AssistantPage"
import AdminPage from "@/features/admin/pages/AdminPage"
import PracticePage from "@/features/practice/pages/PracticePage"

import ProtectedRoute from "@/routes/ProtectedRoute"
import RoleProtectedRoute from "@/routes/RoleProtectedRoute"

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes: ai cũng xem được giao diện tổng thể */}
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:courseId" element={<CourseDetailPage />} />
        <Route path="/assistant" element={<AssistantPage />} />
        <Route path="/practice" element={<PracticePage />} />
        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Student protected routes: phải đăng nhập mới thao tác học */}
        <Route
          path="/lessons/:lessonId"
          element={
            <ProtectedRoute>
              <LessonDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Admin protected route: chỉ admin được vào */}
        <Route
          path="/admin"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AdminPage />
            </RoleProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}