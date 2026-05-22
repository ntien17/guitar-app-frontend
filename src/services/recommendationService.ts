import { api } from "@/lib/axios"
import type { ApiResponse, Recommendation } from "@/types"

function normalizeRecommendationText(value?: string | null) {
  if (!value) return ""

  return value
    .replace(/\$\{stats\.avgAccuracy\.toFixed\(1\)\}/g, "độ chính xác hiện tại")
    .replace(/\$\{stats\.totalMinutes\}/g, "thời gian luyện tập hiện tại")
    .replace(/\$\{stats\.sessionsCount\}/g, "số phiên luyện tập hiện tại")
    .replace(/\$\{.*?\}/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function normalizeRecommendation(item: Recommendation): Recommendation {
  return {
    ...item,
    description: normalizeRecommendationText(item.description),
    reason: normalizeRecommendationText(item.reason),
  }
}

function unwrapRecommendations(payload: unknown): Recommendation[] {
  if (Array.isArray(payload)) {
    return payload.map((item) => normalizeRecommendation(item as Recommendation))
  }

  if (payload && typeof payload === "object") {
    const response = payload as ApiResponse<Recommendation[]>

    if (Array.isArray(response.data)) {
      return response.data.map((item) => normalizeRecommendation(item))
    }
  }

  return []
}

export async function getRecommendations(userId?: string): Promise<Recommendation[]> {
  if (!userId) {
    return []
  }

  try {
    const response = await api.get<ApiResponse<Recommendation[]>>(
      `/recommendations/${userId}`
    )

    return unwrapRecommendations(response.data)
  } catch (error) {
    console.error("Failed to fetch recommendations:", error)
    return []
  }
}