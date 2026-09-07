import React from 'react'
import { motion } from 'framer-motion'
import {
  Wand2,
  BarChart3,
  Filter,
  AlertTriangle,
  TrendingUp,
  Bot,
  Sparkles,
  Layers,
  Activity,
  SlidersHorizontal,
  ShieldAlert,
  PieChart,
  BrainCircuit,
  CheckCircle2
} from 'lucide-react'

interface CapabilityItem {
  id: string
  emoji: string
  secondaryEmoji: string
  title: string
  subtitle: string
  highlight: string
  bullets: string[]
  icon: React.ComponentType<{ className?: string }>
  theme: {
    accentGradient: string
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
    highlight: 'Instant multi-format normalization & repair',
    bullets: [
      'Automatic deduplication & text whitespace stripping',
      'Intelligent missing value imputation via KNN & median models',
      'Automatic datetime conversion across diverse schemas',
      'Audit log with side-by-side Before vs. After diff viewer'
    ],
    icon: Wand2,
    theme: {
      accentGradient: 'from-emerald-400 to-teal-400',
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
    tags: ['KNN Imputer', 'Deduplication', 'Type Casting', 'Diff Viewer']
  },
  {
    id: 'profiling',
    emoji: '🧬',
    secondaryEmoji: '📊',
    title: 'Deep Dataset Profiling',
    subtitle: 'Comprehensive schema intelligence',
    highlight: 'Automated statistical scanning & health metrics',
    bullets: [
      '0–100 Data Quality Health Score calculation',
      'Semantic column classification (# Numeric, 🔤 Categorical, 📅 Date)',
      'Distribution dynamics, null percentages & cardinality metrics',
      'Automated schema alerts for missing values and skewness'
    ],
    icon: BarChart3,
    theme: {
      accentGradient: 'from-indigo-400 to-blue-400',
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
    tags: ['Quality Score', 'Schema Detection', 'Null Ratio', 'Cardinality']
  },
  {
    id: 'filtering',
    emoji: '🎛️',
    secondaryEmoji: '🔍',
    title: 'Dynamic Filtering',
    subtitle: 'Multi-dimensional data slicing',
    highlight: 'Real-time interactive segment exploration',
    bullets: [
      'Instant global keyword search across all attributes',
      'Categorical multi-select slicers with live count recalculation',
      'Numeric range sliders with dual min/max bounds',
      'Reactive recalculation of all charts upon filter changes'
    ],
    icon: Filter,
    theme: {
      accentGradient: 'from-cyan-400 to-sky-400',
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
    tags: ['Multi-Condition', 'Range Sliders', 'Categorical Slicers', 'Instant Search']
  },
  {
    id: 'anomaly',
    emoji: '🚨',
    secondaryEmoji: '🛡️',
    title: 'ML Anomaly Detection',
    subtitle: 'Dual-layer statistical screening',
    highlight: 'Unsupervised machine learning & IQR boundaries',
    bullets: [
      'Statistical IQR outlier fencing (1.5x interquartile fences)',
      'Scikit-Learn Isolation Forest multi-variable anomaly scoring',
      'Extreme value impact assessment on column standard deviations',
      'Data drift and skewness boundary warnings'
    ],
    icon: AlertTriangle,
    theme: {
      accentGradient: 'from-rose-400 to-pink-400',
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
    tags: ['Isolation Forest', 'IQR Boundaries', 'Z-Score Fences', 'Drift Alerts']
  },
  {
    id: 'visualization',
    emoji: '📈',
    secondaryEmoji: '💎',
    title: 'Interactive Visualizations',
    subtitle: 'High-performance visual rendering',
    highlight: 'Optimized Recharts & Pearson correlation heatmaps',
    bullets: [
      'Dynamic Recharts (Bar, Line, Scatter, Area, Distributions)',
      'Interactive Pearson Correlation Matrix with hover tooltips',
      'Adaptive binning & smart chart recommendation heuristics',
      'Export full analytical dashboards as high-resolution PDF or PNG'
    ],
    icon: TrendingUp,
    theme: {
      accentGradient: 'from-amber-400 to-orange-400',
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
    tags: ['Recharts/Plotly', 'Correlation Matrix', 'Adaptive Binning', 'PDF Export']
  },
  {
    id: 'ai-analyst',
    emoji: '🧠',
    secondaryEmoji: '🤖',
    title: 'AI Data Analyst',
    subtitle: 'Automated executive narrative',
    highlight: 'Zero-hallucination insights with streaming chat',
    bullets: [
      'Structured Executive Summary, Key Findings, Risks & Actions',
      'Grounded strictly on computed statistical evidence JSON',
      'SSE streaming conversational assistant with dataset memory',
      'Live <thinking> transparent reasoning step-by-step display'
    ],
    icon: Bot,
    theme: {
      accentGradient: 'from-purple-400 to-fuchsia-400',
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
    tags: ['Executive Bullets', 'Evidence Extraction', 'Actionable Insights', 'SSE Stream']
  }
]

export const PlatformCapabilities: React.FC = () => {
  return (
    <section id="capabilities" className="w-full max-w-7xl mx-auto mt-28 px-4 text-left scroll-mt-24">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-500 dark:text-indigo-300 text-xs font-semibold mb-4 shadow-sm backdrop-blur-md"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>AUTONOMOUS INTELLIGENCE LAYER</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--text-primary)] font-['Space_Grotesk',sans-serif]"
        >
          What This Platform{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Provides
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-sm sm:text-base text-[var(--text-secondary)] mt-4 leading-relaxed font-normal"
        >
          An autonomous intelligence suite engineered to replace hours of manual data wrangling, statistical validation, and executive presentation preparation.
        </motion.p>
      </div>

      {/* 6 Capabilities Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
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
              className={`group relative rounded-3xl border border-[var(--border-subtle)] ${item.theme.cardBorderHover} bg-[var(--bg-card)] p-7 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden backdrop-blur-sm`}
            >
              {/* Top ambient highlight line on hover */}
              <div
                className="absolute inset-x-8 -top-px h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: `linear-gradient(to right, transparent, ${item.theme.glowColor}, transparent)`
                }}
              />

              {/* Radial gradient background splash on hover */}
              <div
                className="absolute -top-24 -right-24 w-52 h-52 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none"
                style={{ background: item.theme.glowColor }}
              />

              <div>
                {/* Header: Icon, Dual Emojis & Active Pulse Badge */}
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl border ${item.theme.iconBg} ${item.theme.iconColor} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-inner`}
                    >
                      <Icon className="w-6 h-6 stroke-[2]" />
                    </div>
                    <div className="flex items-center gap-1.5 text-2xl select-none">
                      <span>{item.emoji}</span>
                      <span>{item.secondaryEmoji}</span>
                    </div>
                  </div>

                  {/* Active Status Badge with Pulsing Green Dot */}
                  <span
                    className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${item.theme.badgeBg} ${item.theme.badgeText} ${item.theme.badgeBorder} shadow-sm`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    ACTIVE
                  </span>
                </div>

                {/* Title and Subtitle */}
                <h3 className="text-xl font-bold text-[var(--text-primary)] group-hover:text-white transition-colors tracking-tight">
                  {item.title}
                </h3>
                <div className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 mt-1 mb-2.5">
                  {item.subtitle}
                </div>

                {/* Highlight Badge */}
                <div className="inline-block text-[11px] font-medium text-[var(--text-secondary)] bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] px-2.5 py-1 rounded-lg mb-4">
                  ⚡ <span className="font-semibold text-[var(--text-primary)]">{item.highlight}</span>
                </div>

                {/* Detailed Bullet Points */}
                <ul className="space-y-2 mt-1 mb-4 text-xs text-[var(--text-secondary)]">
                  {item.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2 leading-relaxed">
                      <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${item.theme.iconColor}`} />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bottom Feature Tags */}
              <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex flex-wrap gap-1.5">
                {item.tags.map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className={`px-2.5 py-1 rounded-md border text-[10px] font-mono font-medium ${item.theme.tagBg} ${item.theme.tagBorder} ${item.theme.tagText} transition-all`}
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
