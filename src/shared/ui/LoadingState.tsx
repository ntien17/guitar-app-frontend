import React from 'react'
import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  message?: string
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Đang tải...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
      <p className="text-slate-600 text-center">{message}</p>
    </div>
  )
}
