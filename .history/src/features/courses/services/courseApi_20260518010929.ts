import { api } from "@/lib/axios"

export async function getCourses() {
  const response = await api.get("/courses")
  return response.data
}