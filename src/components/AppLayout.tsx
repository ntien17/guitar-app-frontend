import type { ReactNode } from "react"
import { Sidebar } from "@/components/Sidebar"

interface AppLayoutProps {
  children: ReactNode
  hideOnAuth?: boolean
}

export function AppLayout({ children, hideOnAuth = false }: AppLayoutProps) {
  if (hideOnAuth) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar />

        <main className="min-h-screen min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}