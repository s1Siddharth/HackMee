import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Mail, Lock, ArrowRight, UserCheck } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, loginWithGoogle, loginWithEmail, signupWithEmail, loginAsDemoUser, isLoading, error } = useAuthStore()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    if (isSignUp) {
      await signupWithEmail(email, password)
    } else {
      await loginWithEmail(email, password)
    }
    onClose()
  }

  const handleGoogleSignIn = async () => {
    await loginWithGoogle()
    onClose()
  }

  const handleDemoSignIn = () => {
    loginAsDemoUser()
    onClose()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-2xl transition-colors"
        >
          {/* Ambient light ring */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-indigo-500/15 blur-3xl rounded-full pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-500 mb-3 shadow-inner">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
              {isSignUp ? 'Create Analyst Account' : 'Welcome to Insight Engine'}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              {isSignUp
                ? 'Sign up to persist dataset insights and team workspaces'
                : 'Sign in to access your automated reports and history'}
            </p>
          </div>

          {/* Error notice */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* Google Auth Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-card-hover)] text-sm font-medium text-[var(--text-primary)] transition-all duration-150 disabled:opacity-50 active:scale-[0.99] mb-4 shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border-subtle)]" />
            </div>
            <span className="relative px-3 text-[11px] uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-surface)]">
              Or with email
            </span>
          </div>

          {/* Email / Pass Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-[var(--text-primary)] mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@organization.com"
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm bg-[var(--input-bg)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-primary)] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm bg-[var(--input-bg)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isLoading}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              {isSignUp ? 'Create Free Account' : 'Sign In'}
            </Button>
          </form>

          {/* Toggle Login / SignUp */}
          <div className="text-center mt-4 text-xs text-[var(--text-secondary)]">
            {isSignUp ? (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                Need an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  Create one now
                </button>
              </span>
            )}
          </div>

          {/* One-click Demo Evaluator Bypass */}
          <div className="mt-5 pt-4 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={handleDemoSignIn}
              className="w-full flex items-center justify-between p-2.5 rounded-lg border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 transition-colors text-xs text-left"
            >
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-500" />
                <div>
                  <div className="font-medium text-[var(--text-primary)]">Live Evaluator Mode</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Skip login with pre-configured guest session</div>
                </div>
              </div>
              <Badge variant="indigo" size="sm">Quick Demo</Badge>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
