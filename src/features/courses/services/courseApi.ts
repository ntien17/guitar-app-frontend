import { api } from "@/lib/axios"
import { Course } from "@/types"

export async function getCourses(): Promise<{ data: Course[] }> {
  const response = await api.get("/courses")
  return response.data
}

export async function getCourseById(courseId: string): Promise<{ data: Course | null }> {
  try {
    const response = await api.get(`/courses/${courseId}`)
    return response.data
  } catch (error) {
    console.error("Failed to fetch course:", error)
    return { data: null }
  }
}