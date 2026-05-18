import { supabase } from "@/lib/supabase"
import { AuthError, Session, User } from "@supabase/supabase-js"

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

export const authService = {
  // Sign up with email and password
  async signUpWithEmail({ email, password, fullName }: SignUpData): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      return {
        user: data.user,
        session: data.session,
        error,
      }
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error as AuthError,
      }
    }
  },

  // Sign in with email and password
  async signInWithEmail({ email, password }: SignInData): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      return {
        user: data.user,
        session: data.session,
        error,
      }
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error as AuthError,
      }
    }
  },

  // Sign in with Google
  async signInWithGoogle(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  },

  // Sign out
  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.getUser()
      if (error) return null
      return data.user
    } catch {
      return null
    }
  },

  // Get current session
  async getSession(): Promise<Session | null> {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) return null
      return data.session
    } catch {
      return null
    }
  },

  // Listen to auth state changes
  onAuthStateChange(
    callback: (user: User | null, session: Session | null) => void
  ) {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user ?? null
      callback(user, session)
    })

    return subscription
  },

  // Get error message in Vietnamese
  getErrorMessage(error: AuthError | null): string {
    if (!error) return ""

    const errorMessages: Record<string, string> = {
      "User already registered": "Email này đã được đăng ký rồi",
      "Invalid login credentials": "Email hoặc mật khẩu không đúng",
      "Email not confirmed": "Vui lòng xác nhận email của bạn",
      "Password should be at least 6 characters": "Mật khẩu phải có ít nhất 6 ký tự",
      "Invalid email": "Email không hợp lệ",
    }

    return errorMessages[error.message] || error.message || "Có lỗi xảy ra"
  },
}
