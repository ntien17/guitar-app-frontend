import { supabase } from "@/lib/supabase"
import type {
  AuthChangeEvent,
  AuthError,
  Session,
  User,
} from "@supabase/supabase-js"

export interface SignUpData {
  email: string
  password: string
  fullName: string
}

export interface SignInData {
  email: string
  password: string
}

export interface AuthResponse {
  user: User | null
  session: Session | null
  error: AuthError | null
}

export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string
) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${window.location.origin}/login`,
    },
  })
}

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({
    email,
    password,
  })
}

export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/`,
    },
  })
}

export async function signOut() {
  return supabase.auth.signOut()
}

export async function getCurrentUser() {
  return supabase.auth.getUser()
}

export async function getSession() {
  return supabase.auth.getSession()
}

export function onAuthStateChange(
  callback: (
    event: AuthChangeEvent,
    session: Session | null
  ) => void | Promise<void>
) {
  return supabase.auth.onAuthStateChange(callback)
}

export async function getProfile(userId: string) {
  return supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()
}

export function getErrorMessage(error: AuthError | null): string {
  if (!error) return ""

  const errorMessages: Record<string, string> = {
    "User already registered": "Email này đã được đăng ký rồi",
    "Invalid login credentials": "Email hoặc mật khẩu không đúng",
    "Email not confirmed": "Vui lòng xác nhận email của bạn",
    "Password should be at least 6 characters":
      "Mật khẩu phải có ít nhất 6 ký tự",
    "Invalid email": "Email không hợp lệ",
  }

  return errorMessages[error.message] || error.message || "Có lỗi xảy ra"
}

/**
 * Giữ object authService để nếu file cũ nào còn gọi authService.xxx
 * thì vẫn không bị hỏng.
 */
export const authService = {
  signUpWithEmail: async ({ email, password, fullName }: SignUpData) => {
    const { data, error } = await signUpWithEmail(email, password, fullName)

    return {
      user: data.user,
      session: data.session,
      error,
    }
  },

  signInWithEmail: async ({ email, password }: SignInData) => {
    const { data, error } = await signInWithEmail(email, password)

    return {
      user: data.user,
      session: data.session,
      error,
    }
  },

  signInWithGoogle,

  signOut,

  getCurrentUser: async () => {
    const { data, error } = await getCurrentUser()
    if (error) return null
    return data.user
  },

  getSession: async () => {
    const { data, error } = await getSession()
    if (error) return null
    return data.session
  },

  onAuthStateChange: (
    callback: (user: User | null, session: Session | null) => void
  ) => {
    const { data } = onAuthStateChange((_event, session) => {
      const user = session?.user ?? null
      callback(user, session)
    })

    return data.subscription
  },

  getErrorMessage,
}