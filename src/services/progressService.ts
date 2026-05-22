import { api } from "@/lib/axios"
import type { ApiResponse, LessonProgress } from "@/types"

function unwrapProgress(payload: unknown): LessonProgress | null {
  if (!payload || typeof payload !== "object") return null

  const response = payload as ApiResponse<LessonProgress>

  if (response.data) {
    return response.data
  }

  const maybeProgress = payload as Partial<LessonProgress>

  if (maybeProgress.id && maybeProgress.lesson_id) {
    return maybeProgress as LessonProgress
  }

  return null
}

function unwrapProgressList(payload: unknown): LessonProgress[] {
  if (Array.isArray(payload)) {
    return payload as LessonProgress[]
  }

  if (payload && typeof payload === "object") {
    const response = payload as ApiResponse<LessonProgress[]>

    if (Array.isArray(response.data)) {
      return response.data
    }
  }

  return []
}

export async function recordProgress(
  lessonId: string,
  completionPercent: number,
  watchTimeSeconds: number,
  lastPositionSeconds: number,
  completed: boolean,
  userId: string
): Promise<LessonProgress | null> {
  if (!userId) {
    throw new Error("User ID is required to record progress")
  }

  if (!lessonId) {
    throw new Error("Lesson ID is required to record progress")
  }

  const response = await api.post<ApiResponse<LessonProgress>>("/progress", {
    // Dạng camelCase cho controller mới
    userId,
    lessonId,
    completionPercent,
    watchTimeSeconds,
    lastPositionSeconds,
    completed,

    // Dạng snake_case để tương thích nếu backend cũ vẫn dùng
    user_id: userId,
    lesson_id: lessonId,
    completion_percent: completionPercent,
    watch_time_seconds: watchTimeSeconds,
    last_position_seconds: lastPositionSeconds,
  })

  return unwrapProgress(response.data)
}

export async function getUserProgress(userId: string): Promise<LessonProgress[]> {
  if (!userId) {
    throw new Error("User ID is required to fetch progress")
  }

  const response = await api.get<ApiResponse<LessonProgress[]> | LessonProgress[]>(
    `/progress/${userId}`
  )

  return unwrapProgressList(response.data)
}

export async function getProgressByLesson(
  lessonId: string,
  userId: string
): Promise<LessonProgress | null> {
  if (!userId) {
    throw new Error("User ID is required to fetch lesson progress")
  }

  if (!lessonId) {
    throw new Error("Lesson ID is required to fetch lesson progress")
  }

  try {
    const response = await api.get<ApiResponse<LessonProgress | null>>(
      `/progress/${userId}/lesson/${lessonId}`
    )

    return unwrapProgress(response.data)
  } catch (error) {
    console.warn(
      "Could not fetch progress by lesson endpoint. Falling back to user progress list.",
      error
    )

    const allProgress = await getUserProgress(userId)

    return (
      allProgress.find((progress) => {
        return progress.lesson_id === lessonId
      }) || null
    )
  }
}