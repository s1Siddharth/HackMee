import { create } from 'zustand'

interface ThemeState {
  isDark: boolean
  toggleTheme: () => void
  initTheme: () => void
}

const getInitialTheme = (): boolean => {
  if (typeof window === 'undefined') return true
  const saved = localStorage.getItem('aia_theme')
  if (saved !== null) {
    return saved === 'dark'
  }
  // Check system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: true,

  initTheme: () => {
    const isDark = getInitialTheme()
    set({ isDark })
    if (isDark) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    }
  },

  toggleTheme: () => {
    set((state) => {
      const nextIsDark = !state.isDark
      if (nextIsDark) {
        document.documentElement.classList.add('dark')
        document.documentElement.classList.remove('light')
        localStorage.setItem('aia_theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        document.documentElement.classList.add('light')
        localStorage.setItem('aia_theme', 'light')
      }
      return { isDark: nextIsDark }
    })
  },
}))
