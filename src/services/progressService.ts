import { api } from "@/lib/axios";
import { LessonProgress } from "@/types";

const DEMO_USER_ID = "demo-user";

export async function recordProgress(
  lessonId: string,
  completionPercent: number,
  watchTimeSeconds: number,
  lastPositionSeconds: number,
  completed: boolean,
  userId: string = DEMO_USER_ID
): Promise<LessonProgress> {
  const response = await api.post("/progress", {
    user_id: userId,
    lesson_id: lessonId,
    completion_percent: completionPercent,
    watch_time_seconds: watchTimeSeconds,
    last_position_seconds: lastPositionSeconds,
    completed,
  });

  return response.data.data;
}

export async function getUserProgress(userId: string = DEMO_USER_ID): Promise<LessonProgress[]> {
  const response = await api.get(`/progress/${userId}`);
  return response.data.data || [];
}

export async function getProgressByLesson(
  lessonId: string,
  userId: string = DEMO_USER_ID
): Promise<LessonProgress | null> {
  const allProgress = await getUserProgress(userId);
  return allProgress.find((p) => p.lesson_id === lessonId) || null;
}
