import { api } from "@/lib/axios"
import type { ApiResponse, PracticeSession } from "@/types"

export type PracticeSessionPayload = {
  userId: string
  lessonId?: string | null
  practiceType?: string
  practiceTitle?: string
  practiceMinutes: number
  accuracyScore?: number | null
  bpm?: number | null
  chordName?: string | null
  rhythmPattern?: string | null
  noteName?: string | null
  notes?: string | null
}

export type PracticeStats = {
  totalMinutes: number
  avgAccuracy: number
  sessionsCount: number
  byType?: Record<string, number>
  latestSession?: PracticeSession | null
}

export async function recordPracticeSession(
  payload: PracticeSessionPayload
): Promise<PracticeSession | null> {
  const response = await api.post<ApiResponse<PracticeSession>>("/practice", {
    userId: payload.userId,
    lessonId: payload.lessonId ?? null,
    practiceType: payload.practiceType ?? "general",
    practiceTitle: payload.practiceTitle ?? "Practice Session",
    practiceMinutes: payload.practiceMinutes,
    accuracyScore: payload.accuracyScore ?? null,
    bpm: payload.bpm ?? null,
    chordName: payload.chordName ?? null,
    rhythmPattern: payload.rhythmPattern ?? null,
    noteName: payload.noteName ?? null,
    notes: payload.notes ?? null,
  })

  return response.data.data ?? null
}

export async function getUserPracticeSessions(
  userId: string
): Promise<PracticeSession[]> {
  const response = await api.get<ApiResponse<PracticeSession[]>>(
    `/practice/${userId}/sessions`
  )

  return response.data.data ?? []
}

export async function getUserPracticeStats(
  userId: string
): Promise<PracticeStats> {
  const response = await api.get<ApiResponse<PracticeStats>>(
    `/practice/${userId}/stats`
  )

  return (
    response.data.data ?? {
      totalMinutes: 0,
      avgAccuracy: 0,
      sessionsCount: 0,
      byType: {},
      latestSession: null,
    }
  )
}