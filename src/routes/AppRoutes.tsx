import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from '@/features/dashboard/pages/HomePage'
import DashboardPage from '@/features/dashboard/pages/DashboardPage'
import LoginPage from '@/features/auth/pages/LoginPage'
import CoursesPage from '@/features/courses/pages/CoursesPage'
import CourseDetailPage from '@/features/courses/pages/CourseDetailPage'
import LessonDetailPage from '@/features/lessons/pages/LessonDetailPage'
import AssistantPage from '@/features/assistant/pages/AssistantPage'
import AdminPage from '@/features/admin/pages/AdminPage'

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:courseId" element={<CourseDetailPage />} />
        <Route path="/lessons/:lessonId" element={<LessonDetailPage />} />
        <Route path="/assistant" element={<AssistantPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  )
}