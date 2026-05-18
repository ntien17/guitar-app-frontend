import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from '@/features/dashboard/pages/HomePage'
import LoginPage from '@/features/auth/pages/LoginPage'
import CoursesPage from '@/features/courses/pages/CoursesPage'
import AssistantPage from '@/features/assistant/pages/AssistantPage'

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/assistant" element={<AssistantPage />} />
      </Routes>
    </BrowserRouter>
  )
}