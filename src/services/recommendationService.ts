import { api } from "@/lib/axios";
import { Recommendation } from "@/types";

const DEMO_USER_ID = "demo-user";

export async function getRecommendations(userId: string = DEMO_USER_ID): Promise<Recommendation[]> {
  try {
    const response = await api.get(`/recommendations/${userId}`);
    return response.data.data || [];
  } catch (error) {
    console.error("Failed to fetch recommendations:", error);
    return [];
  }
}
