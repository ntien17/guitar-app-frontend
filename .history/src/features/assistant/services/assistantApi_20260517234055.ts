import { api } from "@/lib/axios"

export async function askAssistant(message: string) {
  const response = await api.post("/assistant/ask", {
    message,
  })

  return response.data
}