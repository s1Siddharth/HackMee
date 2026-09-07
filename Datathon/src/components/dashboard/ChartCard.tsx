import React, { useState } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  Legend
} from 'recharts'
import {
  Maximize2,
  Minimize2,
  TrendingUp,
  BarChart3,
  ScatterChart as ScatterIcon,
  Sparkles,
  Info,
  Layers,
  AlertTriangle
} from 'lucide-react'
import { ChartItem } from '../../api/types'
import { Badge } from '../common/Badge'

interface ChartCardProps {
  chart: ChartItem
  isHighlighted?: boolean
}

// Cluster and theme palettes
const CLUSTER_COLORS = ['#6366F1', '#06B6D4', '#10B981', '#F59E0B', '#EC4899']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3 shadow-2xl backdrop-blur-md text-xs z-50">
        <div className="font-semibold text-[var(--text-primary)] mb-1 border-b border-[var(--border-subtle)] pb-1">
          {label || payload[0]?.payload?.name || payload[0]?.payload?.label || 'Point Details'}
        </div>
        {payload.map((item: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between gap-4 py-0.5 text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: item.color || '#6366f1' }}
              />
              <span className="capitalize">{item.name || 'Value'}:</span>
            </span>
            <span className="font-mono font-medium text-[var(--text-primary)]">
              {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
            </span>
          </div>
        ))}
        {payload[0]?.payload?.isOutlier && (
          <div className="mt-1.5 pt-1 border-t border-rose-500/20 text-[11px] text-rose-500 font-medium flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Statistical Outlier</span>
          </div>
        )}
      </div>
    )
  }
  return null
}

export const ChartCard: React.FC<ChartCardProps> = ({ chart, isHighlighted = false }) => {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const getChartTypeBadge = () => {
    switch (chart.type) {
      case 'line':
        return { label: 'Time Series', variant: 'amber' as const, icon: TrendingUp }
      case 'bar':
        return { label: 'Categorical', variant: 'cyan' as const, icon: BarChart3 }
      case 'scatter':
        return { label: 'Correlation', variant: 'indigo' as const, icon: ScatterIcon }
      case 'cluster':
        return { label: 'K-Means Cluster', variant: 'purple' as const, icon: Layers }
      case 'outlier':
        return { label: 'Outlier Detection', variant: 'rose' as const, icon: AlertTriangle }
      default:
        return { label: 'Distribution', variant: 'default' as const, icon: Sparkles }
    }
  }

  const { label: badgeLabel, variant: badgeVariant, icon: BadgeIcon } = getChartTypeBadge()

  // Render chart content according to type
  const renderChartVisual = (height: number) => {
    if (!chart.data || chart.data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-xs text-[var(--text-muted)]">
          No chart data returned by analysis engine
        </div>
      )
    }

    switch (chart.type) {
      case 'line': {
        const first = chart.data[0] || {}
        const keys = Object.keys(first).filter((k) => typeof first[k] === 'number')
        const xKey = chart.xAxisKey || Object.keys(first)[0] || 'date'

        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={chart.data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${chart.id || 'primary'}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(150, 150, 150, 0.12)" vertical={false} />
              <XAxis
                dataKey={xKey}
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'rgba(150, 150, 150, 0.2)' }}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
              />
              <Tooltip content={<CustomTooltip />} />
              {keys.map((key, i) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={i === 0 ? '#6366f1' : '#06b6d4'}
                  strokeWidth={2}
                  fill={i === 0 ? `url(#grad-${chart.id || 'primary'})` : 'transparent'}
                  dot={false}
                  activeDot={{ r: 5, fill: '#fff', stroke: i === 0 ? '#6366f1' : '#06b6d4', strokeWidth: 2 }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )
      }

      case 'bar': {
        const first = chart.data[0] || {}
        const xKey = chart.xAxisKey || Object.keys(first)[0] || 'category'
        const numericKeys = Object.keys(first).filter((k) => typeof first[k] === 'number')

        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={chart.data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(150, 150, 150, 0.12)" vertical={false} />
              <XAxis
                dataKey={xKey}
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'rgba(150, 150, 150, 0.2)' }}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(150, 150, 150, 0.08)' }} />
              {numericKeys.map((k, idx) => (
                <Bar
                  key={k}
                  dataKey={k}
                  fill={idx === 0 ? '#6366f1' : '#06b6d4'}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )
      }

      case 'scatter': {
        const xKey = chart.xAxisKey || 'ad_spend'
        const yKey = chart.yAxisKey || 'revenue'

        return (
          <ResponsiveContainer width="100%" height={height}>
            <ScatterChart margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(150, 150, 150, 0.12)" />
              <XAxis
                type="number"
                dataKey={xKey}
                name={xKey}
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'rgba(150, 150, 150, 0.2)' }}
                tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
              />
              <YAxis
                type="number"
                dataKey={yKey}
                name={yKey}
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter name="Data Points" data={chart.data} fill="#6366f1">
                {chart.data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill="#6366f1" />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        )
      }

      case 'cluster': {
        const xKey = chart.xAxisKey || 'clv_score'
        const yKey = chart.yAxisKey || 'margin_pct'

        return (
          <ResponsiveContainer width="100%" height={height}>
            <ScatterChart margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(150, 150, 150, 0.12)" />
              <XAxis
                type="number"
                dataKey={xKey}
                name={xKey}
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'rgba(150, 150, 150, 0.2)' }}
                tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
              />
              <YAxis
                type="number"
                dataKey={yKey}
                name={yKey}
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter name="Clusters" data={chart.data}>
                {chart.data.map((entry, index) => {
                  const clusterIndex = entry.cluster ?? 0
                  const color = CLUSTER_COLORS[clusterIndex % CLUSTER_COLORS.length]
                  return <Cell key={`cluster-cell-${index}`} fill={color} />
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        )
      }

      case 'outlier': {
        const xKey = chart.xAxisKey || 'ad_spend'
        const yKey = chart.yAxisKey || 'revenue'

        return (
          <ResponsiveContainer width="100%" height={height}>
            <ScatterChart margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(150, 150, 150, 0.12)" />
              <XAxis
                type="number"
                dataKey={xKey}
                name={xKey}
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'rgba(150, 150, 150, 0.2)' }}
              />
              <YAxis
                type="number"
                dataKey={yKey}
                name={yKey}
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter name="Observations" data={chart.data}>
                {chart.data.map((entry, index) => (
                  <Cell
                    key={`outlier-cell-${index}`}
                    fill={entry.isOutlier ? '#f43f5e' : '#4f46e5'}
                    stroke={entry.isOutlier ? '#fda4af' : undefined}
                    strokeWidth={entry.isOutlier ? 2 : 0}
                    r={entry.isOutlier ? 8 : 4}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        )
      }

      default:
        return (
          <div className="flex items-center justify-center h-full text-xs text-[var(--text-muted)]">
            Preview unavailable
          </div>
        )
    }
  }

  return (
    <>
      {/* Standard Card */}
      <div
        className={`flex flex-col justify-between rounded-2xl border bg-[var(--bg-card)] p-5 transition-all duration-200 hover:border-[var(--border-hover)] shadow-sm ${
          isHighlighted ? 'ring-2 ring-indigo-500/50 border-indigo-500/40' : 'border-[var(--border-subtle)]'
        }`}
      >
        {/* Header */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <Badge variant={badgeVariant} size="sm">
              <BadgeIcon className="w-3 h-3" />
              <span>{badgeLabel}</span>
            </Badge>

            <button
              onClick={() => setIsFullscreen(true)}
              className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors"
              title="Expand to Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <h3 className="text-sm sm:text-base font-semibold text-[var(--text-primary)] tracking-tight">
            {chart.title}
          </h3>

          <p className="text-xs text-[var(--text-secondary)] mt-1 mb-4 leading-relaxed line-clamp-2">
            {chart.caption}
          </p>
        </div>

        {/* Visual Chart Container */}
        <div className="w-full h-56 pt-2 pb-1">
          {renderChartVisual(220)}
        </div>
      </div>

      {/* Fullscreen Modal View */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-5xl rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-[var(--border-subtle)]">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge variant={badgeVariant} size="sm">
                    <BadgeIcon className="w-3 h-3" />
                    <span>{badgeLabel}</span>
                  </Badge>
                  <span className="text-xs text-[var(--text-muted)]">Expanded Inspection View</span>
                </div>
                <h2 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">{chart.title}</h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-3xl">{chart.caption}</p>
              </div>

              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 w-full min-h-[420px] py-4">
              {renderChartVisual(420)}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
