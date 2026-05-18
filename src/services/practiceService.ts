import { api } from "@/lib/axios"
import { PracticeSession } from "@/types"

const DEMO_USER_ID = "demo-user"

/**
 * Record a practice session with the backend.
 * Called after completing a practice exercise (TempoTrainer, RandomChordTrainer, etc.)
 * 
 * @param lessonId - ID of the lesson being practiced
 * @param practiceMinutes - Duration of practice in minutes
 * @param accuracyScore - Accuracy percentage (0-100)
 * @param notes - Optional notes about the practice session
 * @param userId - User ID (defaults to demo-user)
 */
export async function recordPractice(
  lessonId: string,
  practiceMinutes: number,
  accuracyScore: number,
  notes?: string,
  userId: string = DEMO_USER_ID
): Promise<PracticeSession> {
  const response = await api.post("/practice", {
    user_id: userId,
    lesson_id: lessonId,
    practice_minutes: practiceMinutes,
    accuracy_score: Math.round(accuracyScore),
    notes: notes || "",
  })

  return response.data.data
}

/**
 * Get all practice sessions for a user
 */
export async function getUserPracticeSessions(userId: string = DEMO_USER_ID): Promise<PracticeSession[]> {
  const response = await api.get(`/practice?userId=${userId}`)
  return response.data.data || []
}

/**
 * Get practice sessions for a specific lesson
 */
export async function getLessonPracticeSessions(
  lessonId: string,
  userId: string = DEMO_USER_ID
): Promise<PracticeSession[]> {
  const allSessions = await getUserPracticeSessions(userId)
  return allSessions.filter((s) => s.lesson_id === lessonId)
}

/**
 * Get total practice time for a user across all sessions
 */
export async function getTotalPracticeTime(userId: string = DEMO_USER_ID): Promise<number> {
  const sessions = await getUserPracticeSessions(userId)
  return sessions.reduce((total, session) => total + (session.practice_minutes || 0), 0)
}

/**
 * Get average accuracy for a user across all practice sessions
 */
export async function getAverageAccuracy(userId: string = DEMO_USER_ID): Promise<number> {
  const sessions = await getUserPracticeSessions(userId)
  if (sessions.length === 0) return 0
  
  const totalAccuracy = sessions.reduce((total, session) => total + (session.accuracy_score || 0), 0)
  return Math.round(totalAccuracy / sessions.length)
}
