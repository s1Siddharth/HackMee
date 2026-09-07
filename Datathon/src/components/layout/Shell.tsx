import React from 'react'
import { Navbar } from './Navbar'
import { ParticleNetworkBg } from '../common/ParticleNetworkBg'

interface ShellProps {
  children: React.ReactNode
  fullWidth?: boolean
}

export const Shell: React.FC<ShellProps> = ({ children, fullWidth = false }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)] relative transition-colors duration-200 overflow-x-hidden">
      {/* Target UI Background: Multi-orb Ambient Radial Gradients & Interactive Particle Network */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Deep Ambient Top-Center Glow Orbs like ContextFlow */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[950px] h-[550px] bg-[radial-gradient(ellipse_at_center,rgba(30,64,175,0.35)_0%,rgba(14,116,144,0.18)_40%,transparent_75%)] blur-[90px] rounded-full pointer-events-none" />
        <div className="absolute -top-20 left-1/4 -translate-x-1/2 w-[550px] h-[400px] bg-[radial-gradient(circle,rgba(34,211,238,0.18)_0%,transparent_70%)] blur-[90px] rounded-full animate-float-slow pointer-events-none" />
        <div className="absolute -top-20 right-1/4 translate-x-1/2 w-[550px] h-[400px] bg-[radial-gradient(circle,rgba(124,58,237,0.2)_0%,transparent_70%)] blur-[100px] rounded-full animate-float-reverse pointer-events-none" />

        {/* Interactive Constellation / Particle Network Canvas */}
        <ParticleNetworkBg />

        {/* Subtle 32px tech grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-50 dark:opacity-30 pointer-events-none" />

        {/* Radial Vignette mask for depth and focus */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,var(--bg-page)_95%)] pointer-events-none" />

        {/* Top subtle highlight beam */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/35 via-purple-500/35 to-transparent pointer-events-none" />
      </div>

      {/* Main Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className={`flex-1 relative z-10 ${fullWidth ? 'w-full' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full'}`}>
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-glass)] py-6 text-center text-xs text-[var(--text-secondary)] backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[var(--text-primary)]">INSIGHTFY</span>
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">
            Dark / Light Theme Supported • Production Frontend
          </div>
        </div>
      </footer>
    </div>
  )
}
