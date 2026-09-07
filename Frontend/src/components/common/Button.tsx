import React from 'react'
import { clsx } from 'clsx'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  icon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      icon,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed select-none'

    const sizeStyles = {
      sm: 'text-xs px-2.5 py-1.5 gap-1.5',
      md: 'text-sm px-3.5 py-2 gap-2',
      lg: 'text-base px-5 py-2.5 gap-2.5',
    }

    const variantStyles = {
      primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30 border border-indigo-500/30 active:scale-[0.98]',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-200 dark:bg-white/10 dark:hover:bg-white/15 dark:text-gray-100 dark:border-white/10 active:scale-[0.98]',
      outline: 'border border-[var(--border-default)] hover:border-[var(--border-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] bg-transparent active:scale-[0.98]',
      ghost: 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] active:scale-[0.98]',
      danger: 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 dark:text-rose-300 border border-rose-500/30 active:scale-[0.98]',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(base, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          icon
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
