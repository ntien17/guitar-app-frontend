// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  error?: string | object
}

// Database Models
export interface Course {
  id: string
  title: string
  description: string
  level: "beginner" | "intermediate" | "advanced"

  slug?: string | null
  summary?: string | null

  // Supabase hiện đang trả objectives/prerequisites dạng text.
  // Vẫn cho phép string[] để tương thích dữ liệu cũ.
  objectives?: string | string[] | null
  prerequisites?: string | string[] | null

  estimated_minutes?: number | null
  order_index?: number | null
  thumbnail_url?: string | null

  is_published: boolean
  created_at: string
  updated_at: string
}

export interface Lesson {
  id: string
  course_id: string
  title: string
  description: string

  slug?: string | null
  content?: string | null

  video_url?: string | null
  embed_url?: string | null
  audio_url?: string | null

  duration_seconds?: number | null

  lesson_type?: string | null
  difficulty?: string | null
  practice_goal?: string | null

  // Cột cũ trong database
  order?: number | null

  // Cột mới dùng để sắp xếp
  order_index?: number | null

  is_published?: boolean

  created_at: string
  updated_at: string
}

export interface LessonProgress {
  id: string
  user_id: string
  lesson_id: string

  completion_percent: number
  watch_time_seconds: number
  last_position_seconds: number
  completed: boolean
  rewatch_count: number

  lessons?: {
    id: string
    title: string
    slug?: string | null
    course_id?: string | null
    order_index?: number | null
  } | null

  created_at: string
  updated_at: string
}

export interface PracticeSession {
  id: string
  user_id: string

  // Có thể null nếu luyện tập chung, không gắn với bài học cụ thể
  lesson_id?: string | null

  practice_type?: string | null
  practice_title?: string | null

  practice_minutes: number
  accuracy_score?: number | null

  bpm?: number | null
  chord_name?: string | null
  rhythm_pattern?: string | null
  note_name?: string | null

  notes?: string | null

  created_at: string
  updated_at: string
}

export interface PracticeStats {
  totalMinutes: number
  avgAccuracy: number
  sessionsCount: number
  byType?: Record<string, number>
  latestSession?: PracticeSession | null
}

export interface PracticeSessionPayload {
  userId: string
  lessonId?: string | null

  practiceType?: string | null
  practiceTitle?: string | null

  practiceMinutes: number
  accuracyScore?: number | null

  bpm?: number | null
  chordName?: string | null
  rhythmPattern?: string | null
  noteName?: string | null

  notes?: string | null
}

export interface Recommendation {
  id: string
  user_id?: string | null

  title: string
  description: string | null

  type: "lesson" | "practice" | "schedule" | "technique" | string
  priority: "high" | "medium" | "low" | string

  reason: string | null
  created_at?: string
}

export interface AssistantRequest {
  message: string
  userId?: string
}

export interface AssistantResponse {
  reply: string
  source: "gemini" | "fallback"
}

// UI State Types
export interface MediaPlayerState {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isLoading: boolean
}

export interface DashboardStats {
  totalLessonsCompleted: number
  totalWatchTime: number
  averageCompletion: number
  streak: number
}