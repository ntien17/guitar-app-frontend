import { api } from "@/lib/axios";
import { Lesson } from "@/types";

export async function getLessonById(lessonId: string): Promise<Lesson | null> {
  try {
    const response = await api.get(`/lessons/${lessonId}`);
    return response.data.data || null;
  } catch (error) {
    console.error("Failed to fetch lesson:", error);
    return null;
  }
}

export async function getLessonsByCourseId(courseId: string): Promise<Lesson[]> {
  try {
    const response = await api.get(`/lessons/course/${courseId}`);
    return response.data.data || [];
  } catch (error) {
    console.error("Failed to fetch lessons:", error);
    return [];
  }
}
