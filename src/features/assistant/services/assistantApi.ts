import { api } from "@/lib/axios"

export async function askAssistant(message: string, userId?: string) {
  const response = await api.post("/assistant/ask", {
    message,
    userId,
  })

  return response.data
}   
