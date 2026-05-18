// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string | object;
}

// Database Models
export interface Course {
  id: string;
  title: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced";
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string;
  video_url?: string;
  audio_url?: string;
  duration_seconds?: number;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completion_percent: number;
  watch_time_seconds: number;
  last_position_seconds: number;
  completed: boolean;
  rewatch_count: number;
  created_at: string;
  updated_at: string;
}

export interface PracticeSession {
  id: string;
  user_id: string;
  lesson_id?: string;
  practice_minutes: number;
  accuracy_score?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: "lesson" | "practice" | "schedule" | "technique";
  priority: "high" | "medium" | "low";
  reason: string;
}

export interface AssistantRequest {
  message: string;
  userId?: string;
}

export interface AssistantResponse {
  reply: string;
  source: "gemini" | "fallback";
}

// UI State Types
export interface MediaPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isLoading: boolean;
}

export interface DashboardStats {
  totalLessonsCompleted: number;
  totalWatchTime: number;
  averageCompletion: number;
  streak: number;
}
