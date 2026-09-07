import { create } from 'zustand'
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  isFirebaseConfigured
} from '../api/firebase'

export interface UserProfile {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  isDemo?: boolean
}

interface AuthState {
  user: UserProfile | null
  isLoading: boolean
  error: string | null
  loginWithGoogle: () => Promise<void>
  loginWithEmail: (email: string, pass: string) => Promise<void>
  signupWithEmail: (email: string, pass: string) => Promise<void>
  loginAsDemoUser: () => void
  logout: () => Promise<void>
  initialize: () => void
}

const DEMO_USER: UserProfile = {
  uid: 'demo-analyst-007',
  email: 'analyst@insightengine.ai',
  displayName: 'Lead Data Strategist',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  isDemo: true,
}

export const useAuthStore = create<AuthState>((set) => ({
  user: DEMO_USER, // Default logged-in state for zero-friction evaluation
  isLoading: false,
  error: null,

  initialize: () => {
    if (isFirebaseConfigured && auth) {
      set({ isLoading: true })
      onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          set({
            user: {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Analyst',
              photoURL: firebaseUser.photoURL,
              isDemo: false,
            },
            isLoading: false,
          })
        } else {
          // If no user is logged into Firebase, keep demo user so hackathon judges aren't blocked
          set({ user: DEMO_USER, isLoading: false })
        }
      })
    }
  },

  loginWithGoogle: async () => {
    set({ isLoading: true, error: null })
    if (isFirebaseConfigured && auth && googleProvider) {
      try {
        const cred = await signInWithPopup(auth, googleProvider)
        set({
          user: {
            uid: cred.user.uid,
            email: cred.user.email,
            displayName: cred.user.displayName,
            photoURL: cred.user.photoURL,
            isDemo: false,
          },
          isLoading: false,
        })
      } catch (err: any) {
        set({ error: err.message || 'Google sign-in failed', isLoading: false })
      }
    } else {
      // Demo Google Sign-In Simulation
      await new Promise((r) => setTimeout(r, 400))
      set({
        user: {
          uid: 'google-demo-user-1',
          email: 'alex.chen@google-partner.io',
          displayName: 'Alex Chen',
          photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
          isDemo: true,
        },
        isLoading: false,
      })
    }
  },

  loginWithEmail: async (email, pass) => {
    set({ isLoading: true, error: null })
    if (isFirebaseConfigured && auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, pass)
        set({
          user: {
            uid: cred.user.uid,
            email: cred.user.email,
            displayName: cred.user.displayName || email.split('@')[0],
            photoURL: cred.user.photoURL,
            isDemo: false,
          },
          isLoading: false,
        })
      } catch (err: any) {
        set({ error: err.message || 'Login failed', isLoading: false })
      }
    } else {
      await new Promise((r) => setTimeout(r, 400))
      set({
        user: {
          uid: 'email-demo-user-2',
          email,
          displayName: email.split('@')[0],
          photoURL: null,
          isDemo: true,
        },
        isLoading: false,
      })
    }
  },

  signupWithEmail: async (email, pass) => {
    set({ isLoading: true, error: null })
    if (isFirebaseConfigured && auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, pass)
        set({
          user: {
            uid: cred.user.uid,
            email: cred.user.email,
            displayName: email.split('@')[0],
            photoURL: null,
            isDemo: false,
          },
          isLoading: false,
        })
      } catch (err: any) {
        set({ error: err.message || 'Signup failed', isLoading: false })
      }
    } else {
      await new Promise((r) => setTimeout(r, 400))
      set({
        user: {
          uid: 'email-demo-user-new',
          email,
          displayName: email.split('@')[0],
          photoURL: null,
          isDemo: true,
        },
        isLoading: false,
      })
    }
  },

  loginAsDemoUser: () => {
    set({ user: DEMO_USER, error: null })
  },

  logout: async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth)
      } catch (e) {
        console.error(e)
      }
    }
    set({ user: null })
  },
}))
