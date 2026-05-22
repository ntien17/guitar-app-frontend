import React from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  actions?: React.ReactNode
}

export const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ title, subtitle, icon, actions, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('mb-8 flex items-start justify-between gap-4', className)}
        {...props}
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {icon && <div className="text-blue-600">{icon}</div>}
            <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
          </div>
          {subtitle && <p className="text-slate-600">{subtitle}</p>}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    )
  }
)

PageHeader.displayName = 'PageHeader'
