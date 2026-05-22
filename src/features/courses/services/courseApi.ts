import { api } from "@/lib/axios"
import type { ApiResponse, Course } from "@/types"

type CourseListResult = {
  data: Course[]
}

type CourseDetailResult = {
  data: Course | null
}

function unwrapCourseList(payload: unknown): Course[] {
  if (Array.isArray(payload)) {
    return payload as Course[]
  }

  if (payload && typeof payload === "object") {
    const response = payload as ApiResponse<Course[]>

    if (Array.isArray(response.data)) {
      return response.data
    }
  }

  return []
}

function unwrapCourse(payload: unknown): Course | null {
  if (!payload || typeof payload !== "object") {
    return null
  }

  const response = payload as ApiResponse<Course>

  if (response.data && typeof response.data === "object") {
    return response.data
  }

  const maybeCourse = payload as Partial<Course>

  if (maybeCourse.id && maybeCourse.title) {
    return maybeCourse as Course
  }

  return null
}

export async function getCourses(): Promise<CourseListResult> {
  try {
    const response = await api.get<ApiResponse<Course[]> | Course[]>("/courses")

    return {
      data: unwrapCourseList(response.data),
    }
  } catch (error) {
    console.error("Failed to fetch courses:", error)

    return {
      data: [],
    }
  }
}

/**
 * courseId can be either UUID or slug.
 * Backend should resolve both forms.
 */
export async function getCourseById(
  courseId: string
): Promise<CourseDetailResult> {
  try {
    const response = await api.get<ApiResponse<Course> | Course>(
      `/courses/${courseId}`
    )

    return {
      data: unwrapCourse(response.data),
    }
  } catch (error) {
    console.error("Failed to fetch course:", error)

    return {
      data: null,
    }
  }
}