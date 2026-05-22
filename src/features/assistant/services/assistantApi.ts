import { api } from "@/lib/axios"

export async function askAssistant(message: string, userId: string) {
  const response = await api.post("/assistant/ask", {
    message,
    userId,
  })

  return response.data
}

export async function getAssistantHistory(userId: string) {
  const response = await api.get(`/assistant/history/${userId}`)
  return response.data
}

export async function clearAssistantHistory(userId: string) {
  const response = await api.delete(`/assistant/history/${userId}`)
  return response.data
}