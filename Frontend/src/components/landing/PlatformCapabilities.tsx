import React from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Wand2,
  BarChart3,
  Filter,
  AlertTriangle,
  TrendingUp,
  Bot,
  CheckCircle,
  ArrowUpRight
} from 'lucide-react'

interface CapabilityItem {
  id: string
  emoji: string
  title: string
  subtitle: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: {
    badge: string
    border: string
    hoverBorder: string
    bg: string
    iconBg: string
    iconText: string
    glow: string
  }
  tags: string[]
}

const CAPABILITIES: CapabilityItem[] = [
  {
    id: 'cleaning',
    emoji: '🧹',
    title: 'Automated Data Cleaning',
    subtitle: 'Self-healing tabular pipelines',
    description: 'Deduplication, robust type conversion, and intelligent missing value imputation using KNN and median models.',
    icon: Wand2,
    color: {
      badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      border: 'border-emerald-500/20',
      hoverBorder: 'hover:border-emerald-500/50',
      bg: 'from-emerald-500/5 to-transparent',
      iconBg: 'bg-emerald-500/15 border-emerald-500/30',
      iconText: 'text-emerald-400',
      glow: 'rgba(16, 185, 129, 0.15)'
    },
    tags: ['KNN Imputer', 'Deduplication', 'Type Casting']
  },
  {
    id: 'profiling',
    emoji: '📊',
    title: 'Deep Dataset Profiling',
    subtitle: 'Comprehensive schema intelligence',
    description: 'Quality scoring, column semantic classification (numeric, categorical, temporal), and automated health alerts.',
    icon: BarChart3,
    color: {
      badge: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      border: 'border-indigo-500/20',
      hoverBorder: 'hover:border-indigo-500/50',
      bg: 'from-indigo-500/5 to-transparent',
      iconBg: 'bg-indigo-500/15 border-indigo-500/30',
      iconText: 'text-indigo-400',
      glow: 'rgba(99, 102, 241, 0.15)'
    },
    tags: ['Quality Score', 'Schema Detection', 'Null Ratio']
  },
  {
    id: 'filtering',
    emoji: '🔍',
    title: 'Dynamic Filtering',
    subtitle: 'Multi-dimensional data slicing',
    description: 'Multi-condition search, categorical slicers, and numeric range filtering to slice and isolate subsets instantly.',
    icon: Filter,
    color: {
      badge: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      border: 'border-cyan-500/20',
      hoverBorder: 'hover:border-cyan-500/50',
      bg: 'from-cyan-500/5 to-transparent',
      iconBg: 'bg-cyan-500/15 border-cyan-500/30',
      iconText: 'text-cyan-400',
      glow: 'rgba(6, 182, 212, 0.15)'
    },
    tags: ['Multi-Condition', 'Range Sliders', 'Categorical Slicers']
  },
  {
    id: 'anomaly',
    emoji: '🚨',
    title: 'ML Anomaly Detection',
    subtitle: 'Dual-layer statistical screening',
    description: 'Statistical IQR outlier boundaries and Scikit-Learn Isolation Forest machine learning for multi-dimensional anomaly flags.',
    icon: AlertTriangle,
    color: {
      badge: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      border: 'border-rose-500/20',
      hoverBorder: 'hover:border-rose-500/50',
      bg: 'from-rose-500/5 to-transparent',
      iconBg: 'bg-rose-500/15 border-rose-500/30',
      iconText: 'text-rose-400',
      glow: 'rgba(244, 63, 94, 0.15)'
    },
    tags: ['Isolation Forest', 'IQR Boundaries', 'Z-Score Fences']
  },
  {
    id: 'visualization',
    emoji: '📈',
    title: 'Interactive Visualizations',
    subtitle: 'High-performance visual rendering',
    description: 'Dynamic charts optimized for large datasets with smart recommendations, multi-variable correlation heatmaps, and trend projections.',
    icon: TrendingUp,
    color: {
      badge: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      border: 'border-amber-500/20',
      hoverBorder: 'hover:border-amber-500/50',
      bg: 'from-amber-500/5 to-transparent',
      iconBg: 'bg-amber-500/15 border-amber-500/30',
      iconText: 'text-amber-400',
      glow: 'rgba(245, 158, 11, 0.15)'
    },
    tags: ['Recharts/Plotly', 'Correlation Matrix', 'Adaptive Binning']
  },
  {
    id: 'ai-analyst',
    emoji: '🤖',
    title: 'AI Data Analyst',
    subtitle: 'Automated executive narrative',
    description: 'Autonomous plain-language narrative synthesis, statistical evidence extraction, and actionable business takeaways.',
    icon: Bot,
    color: {
      badge: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      border: 'border-purple-500/20',
      hoverBorder: 'hover:border-purple-500/50',
      bg: 'from-purple-500/5 to-transparent',
      iconBg: 'bg-purple-500/15 border-purple-500/30',
      iconText: 'text-purple-400',
      glow: 'rgba(168, 85, 247, 0.15)'
    },
    tags: ['Executive Bullets', 'Evidence Extraction', 'Actionable Insights']
  }
]

export const PlatformCapabilities: React.FC = () => {
  return (
    <section className="w-full max-w-6xl mx-auto mt-28 text-left scroll-mt-24">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 text-xs font-medium mb-4 shadow-sm"
        >
          <span className="text-sm">🚀</span>
          <span>Core Capabilities</span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--text-primary)] font-['Space_Grotesk',sans-serif]"
        >
          What This Platform Provides
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-sm sm:text-base text-[var(--text-secondary)] mt-3 leading-relaxed"
        >
          An autonomous intelligence layer engineered to replace hours of manual data wrangling, statistical validation, and presentation prep.
        </motion.p>
      </div>

      {/* 6 Capabilities Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CAPABILITIES.map((item, index) => {
          const Icon = item.icon

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                duration: 0.45,
                delay: index * 0.08,
                ease: [0.21, 0.47, 0.32, 0.98]
              }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={`group relative rounded-3xl border border-[var(--border-subtle)] ${item.color.hoverBorder} bg-[var(--bg-card)] p-6 sm:p-7 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden`}
              style={{
                boxShadow: undefined
              }}
            >
              {/* Top ambient highlight line on hover */}
              <div
                className="absolute inset-x-8 -top-px h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: `linear-gradient(to right, transparent, ${item.color.glow}, transparent)`
                }}
              />

              {/* Radial gradient background splash on hover */}
              <div
                className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
                style={{ background: item.color.glow }}
              />

              <div>
                {/* Header: Icon & Tag */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl ${item.color.iconBg} ${item.color.iconText} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-inner`}
                    >
                      <Icon className="w-5 h-5 stroke-[1.8]" />
                    </div>
                    <span className="text-xl select-none">{item.emoji}</span>
                  </div>

                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${item.color.badge}`}
                  >
                    Active
                  </span>
                </div>

                {/* Title and Subtitle */}
                <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-white transition-colors tracking-tight">
                  {item.title}
                </h3>
                <div className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 mt-0.5 mb-2">
                  {item.subtitle}
                </div>

                {/* Description */}
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>

              {/* Bottom Feature Tags */}
              <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex flex-wrap gap-1.5">
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
