import React from 'react'
import { motion } from 'framer-motion'
import {
  Wand2,
  BarChart3,
  Filter,
  AlertTriangle,
  TrendingUp,
  Bot,
  Sparkles
} from 'lucide-react'

interface CapabilityItem {
  id: string
  emoji: string
  secondaryEmoji: string
  title: string
  subtitle: string
  description: React.ReactNode
  icon: React.ComponentType<{ className?: string }>
  theme: {
    badgeBg: string
    badgeText: string
    badgeBorder: string
    iconBg: string
    iconColor: string
    cardBorderHover: string
    glowColor: string
    tagBg: string
    tagBorder: string
    tagText: string
  }
  tags: string[]
}

const CAPABILITIES: CapabilityItem[] = [
  {
    id: 'cleaning',
    emoji: '🪄',
    secondaryEmoji: '🧹',
    title: 'Automated Data Cleaning',
    subtitle: 'Self-healing tabular pipelines',
    description: (
      <>
        <strong>Deduplication</strong>, type casting, and smart <strong>missing value imputation</strong> via KNN & median models.
      </>
    ),
    icon: Wand2,
    theme: {
      badgeBg: 'bg-emerald-500/15',
      badgeText: 'text-emerald-400',
      badgeBorder: 'border-emerald-500/30',
      iconBg: 'bg-emerald-500/10 border-emerald-500/25',
      iconColor: 'text-emerald-400',
      cardBorderHover: 'hover:border-emerald-500/50',
      glowColor: 'rgba(16, 185, 129, 0.2)',
      tagBg: 'bg-emerald-500/10',
      tagBorder: 'border-emerald-500/20',
      tagText: 'text-emerald-300'
    },
    tags: ['KNN Imputer', 'Deduplication', 'Type Casting']
  },
  {
    id: 'profiling',
    emoji: '🧬',
    secondaryEmoji: '📊',
    title: 'Deep Dataset Profiling',
    subtitle: 'Comprehensive schema intelligence',
    description: (
      <>
        <strong>0–100 Quality Score</strong>, semantic type tagging (numeric/date), and automated <strong>null ratio alerts</strong>.
      </>
    ),
    icon: BarChart3,
    theme: {
      badgeBg: 'bg-indigo-500/15',
      badgeText: 'text-indigo-400',
      badgeBorder: 'border-indigo-500/30',
      iconBg: 'bg-indigo-500/10 border-indigo-500/25',
      iconColor: 'text-indigo-400',
      cardBorderHover: 'hover:border-indigo-500/50',
      glowColor: 'rgba(99, 102, 241, 0.2)',
      tagBg: 'bg-indigo-500/10',
      tagBorder: 'border-indigo-500/20',
      tagText: 'text-indigo-300'
    },
    tags: ['Quality Score', 'Schema Detection', 'Null Ratio']
  },
  {
    id: 'filtering',
    emoji: '🎛️',
    secondaryEmoji: '🔍',
    title: 'Dynamic Filtering',
    subtitle: 'Multi-dimensional data slicing',
    description: (
      <>
        <strong>Global search</strong>, multi-select category chips, and <strong>numeric range sliders</strong> with live updates.
      </>
    ),
    icon: Filter,
    theme: {
      badgeBg: 'bg-cyan-500/15',
      badgeText: 'text-cyan-400',
      badgeBorder: 'border-cyan-500/30',
      iconBg: 'bg-cyan-500/10 border-cyan-500/25',
      iconColor: 'text-cyan-400',
      cardBorderHover: 'hover:border-cyan-500/50',
      glowColor: 'rgba(6, 182, 212, 0.2)',
      tagBg: 'bg-cyan-500/10',
      tagBorder: 'border-cyan-500/20',
      tagText: 'text-cyan-300'
    },
    tags: ['Multi-Condition', 'Range Sliders', 'Categorical Slicers']
  },
  {
    id: 'anomaly',
    emoji: '🚨',
    secondaryEmoji: '🛡️',
    title: 'ML Anomaly Detection',
    subtitle: 'Dual-layer statistical screening',
    description: (
      <>
        <strong>IQR statistical fences</strong> and Scikit-Learn <strong>Isolation Forest ML</strong> for anomaly flags.
      </>
    ),
    icon: AlertTriangle,
    theme: {
      badgeBg: 'bg-rose-500/15',
      badgeText: 'text-rose-400',
      badgeBorder: 'border-rose-500/30',
      iconBg: 'bg-rose-500/10 border-rose-500/25',
      iconColor: 'text-rose-400',
      cardBorderHover: 'hover:border-rose-500/50',
      glowColor: 'rgba(244, 63, 94, 0.2)',
      tagBg: 'bg-rose-500/10',
      tagBorder: 'border-rose-500/20',
      tagText: 'text-rose-300'
    },
    tags: ['Isolation Forest', 'IQR Boundaries', 'Z-Score Fences']
  },
  {
    id: 'visualization',
    emoji: '📈',
    secondaryEmoji: '💎',
    title: 'Interactive Visualizations',
    subtitle: 'High-performance visual rendering',
    description: (
      <>
        Dynamic <strong>Recharts</strong>, interactive <strong>Pearson correlation heatmap</strong>, and 1-click PDF/PNG export.
      </>
    ),
    icon: TrendingUp,
    theme: {
      badgeBg: 'bg-amber-500/15',
      badgeText: 'text-amber-400',
      badgeBorder: 'border-amber-500/30',
      iconBg: 'bg-amber-500/10 border-amber-500/25',
      iconColor: 'text-amber-400',
      cardBorderHover: 'hover:border-amber-500/50',
      glowColor: 'rgba(245, 158, 11, 0.2)',
      tagBg: 'bg-amber-500/10',
      tagBorder: 'border-amber-500/20',
      tagText: 'text-amber-300'
    },
    tags: ['Recharts/Plotly', 'Correlation Matrix', 'Adaptive Binning']
  },
  {
    id: 'ai-analyst',
    emoji: '🧠',
    secondaryEmoji: '🤖',
    title: 'AI Data Analyst',
    subtitle: 'Automated executive narrative',
    description: (
      <>
        Plain-language <strong>executive summary</strong> and <strong>streaming AI chat</strong> with visible reasoning.
      </>
    ),
    icon: Bot,
    theme: {
      badgeBg: 'bg-purple-500/15',
      badgeText: 'text-purple-400',
      badgeBorder: 'border-purple-500/30',
      iconBg: 'bg-purple-500/10 border-purple-500/25',
      iconColor: 'text-purple-400',
      cardBorderHover: 'hover:border-purple-500/50',
      glowColor: 'rgba(168, 85, 247, 0.2)',
      tagBg: 'bg-purple-500/10',
      tagBorder: 'border-purple-500/20',
      tagText: 'text-purple-300'
    },
    tags: ['Executive Bullets', 'Evidence Extraction', 'Actionable Insights']
  }
]

export const PlatformCapabilities: React.FC = () => {
  return (
    <section id="capabilities" className="w-full max-w-6xl mx-auto mt-20 px-4 text-left scroll-mt-24">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-500 dark:text-indigo-300 text-xs font-semibold mb-3 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Core Capabilities</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] font-['Space_Grotesk',sans-serif]"
        >
          What This Platform Provides
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 font-normal"
        >
          An autonomous intelligence layer engineered to replace hours of manual data wrangling, statistical validation, and presentation prep.
        </motion.p>
      </div>

      {/* 6 Compact Capabilities Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {CAPABILITIES.map((item, index) => {
          const Icon = item.icon

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{
                duration: 0.35,
                delay: index * 0.05,
                ease: 'easeOut'
              }}
              whileHover={{ y: -4, transition: { duration: 0.15 } }}
              className={`group relative rounded-2xl border border-[var(--border-subtle)] ${item.theme.cardBorderHover} bg-[var(--bg-card)] p-5 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden`}
            >
              {/* Top ambient highlight line on hover */}
              <div
                className="absolute inset-x-6 -top-px h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: `linear-gradient(to right, transparent, ${item.theme.glowColor}, transparent)`
                }}
              />

              <div>
                {/* Header: Icon, Emojis & Active Tag */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl border ${item.theme.iconBg} ${item.theme.iconColor} flex items-center justify-center transition-transform group-hover:scale-105`}
                    >
                      <Icon className="w-4 h-4 stroke-[2]" />
                    </div>
                    <div className="flex items-center gap-1 text-lg select-none">
                      <span>{item.emoji}</span>
                      <span>{item.secondaryEmoji}</span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${item.theme.badgeBg} ${item.theme.badgeText} ${item.theme.badgeBorder}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    ACTIVE
                  </span>
                </div>

                {/* Title and Subtitle */}
                <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-white transition-colors tracking-tight">
                  {item.title}
                </h3>
                <div className="text-[11px] font-medium text-indigo-500 dark:text-indigo-400 mb-2">
                  {item.subtitle}
                </div>

                {/* Compact Description with Bold Key Terms */}
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Bottom Feature Tags */}
              <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex flex-wrap gap-1.5">
                {item.tags.map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="px-2 py-0.5 rounded-md bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
