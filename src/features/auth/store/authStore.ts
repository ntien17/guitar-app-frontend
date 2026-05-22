import { create } from "zustand"
import type { Session, User } from "@supabase/supabase-js"
import {
  getProfile,
  getSession,
  onAuthStateChange,
  signInWithEmail,
  signOut,
  signUpWithEmail,
} from "@/features/auth/services/authService"

type Profile = {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  role: "student" | "admin"
  level: string | null
}

type AuthState = {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  isAuthenticated: boolean

  initializeAuth: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName: string) => Promise<boolean>
  logout: () => Promise<void>
  fetchProfile: (userId: string) => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  loading: true,
  isAuthenticated: false,

  initializeAuth: async () => {
    try {
      set({ loading: true })

      const { data, error } = await getSession()

      if (error) {
        throw error
      }

      const session = data.session
      const user = session?.user ?? null

      set({
        session,
        user,
        isAuthenticated: Boolean(user),
      })

      if (user) {
        await get().fetchProfile(user.id)
      }

      onAuthStateChange(async (_event, session) => {
        const user = session?.user ?? null

        set({
          session,
          user,
          isAuthenticated: Boolean(user),
        })

        if (user) {
          await get().fetchProfile(user.id)
        } else {
          set({ profile: null })
        }
      })
    } catch (error) {
      console.error("Initialize auth error:", error)
      set({
        user: null,
        session: null,
        profile: null,
        isAuthenticated: false,
      })
    } finally {
      set({ loading: false })
    }
  },

  login: async (email: string, password: string) => {
    const { data, error } = await signInWithEmail(email, password)

    if (error) {
      throw error
    }

    const user = data.user ?? null

    set({
      user,
      session: data.session,
      isAuthenticated: Boolean(user),
    })

    if (user) {
      await get().fetchProfile(user.id)
    }
  },

  register: async (email: string, password: string, fullName: string) => {
    const { data, error } = await signUpWithEmail(email, password, fullName)

    if (error) {
      throw error
    }

    const hasSession = Boolean(data.session)

    if (data.user) {
      set({
        user: data.user,
        session: data.session,
        isAuthenticated: hasSession,
      })

      if (hasSession) {
        await get().fetchProfile(data.user.id)
      }
    }

    return hasSession
  },

  logout: async () => {
    const { error } = await signOut()

    if (error) {
      throw error
    }

    set({
      user: null,
      session: null,
      profile: null,
      isAuthenticated: false,
    })
  },

  fetchProfile: async (userId: string) => {
    const { data, error } = await getProfile(userId)

    if (error) {
      console.warn("Could not fetch profile:", error.message)
      return
    }

    set({
      profile: data as Profile,
    })
  },
}))