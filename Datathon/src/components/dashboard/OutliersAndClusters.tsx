import React from 'react'
import {
  ShieldAlert,
  Compass
} from 'lucide-react'
import { ClusterPoint, OutlierPoint } from '../../api/types'
import { Badge } from '../common/Badge'

interface OutliersAndClustersProps {
  clusters?: ClusterPoint[]
  outliers?: OutlierPoint[]
}

export const OutliersAndClusters: React.FC<OutliersAndClustersProps> = ({
  clusters = [],
  outliers = [],
}) => {
  if (clusters.length === 0 && outliers.length === 0) {
    return null
  }

  const getSeverityBadge = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return <Badge variant="rose" size="sm">High Severity</Badge>
      case 'medium':
        return <Badge variant="amber" size="sm">Medium</Badge>
      default:
        return <Badge variant="default" size="sm">Mild</Badge>
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Outlier Diagnostics */}
      {outliers.length > 0 && (
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500">
                <ShieldAlert className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
                Statistical Anomalies & Outliers
              </h4>
            </div>
            <Badge variant="rose" size="sm">{outliers.length} Flagged</Badge>
          </div>

          <div className="space-y-2.5">
            {outliers.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-subtle)] hover:border-[var(--border-hover)] transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 font-mono text-xs text-[var(--text-secondary)]">
                    <span className="font-semibold text-[var(--text-primary)]">{item.id}</span>
                    <span className="text-[var(--text-muted)]">•</span>
                    <span className="text-indigo-500">{item.column}</span>
                    <span className="font-bold text-rose-600 dark:text-rose-300">({item.value})</span>
                  </div>
                  {getSeverityBadge(item.severity)}
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {item.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cluster Cohorts */}
      {clusters.length > 0 && (
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-500">
                <Compass className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
                Identified Cluster Centroids
              </h4>
            </div>
            <Badge variant="purple" size="sm">{clusters.length} Segments</Badge>
          </div>

          <div className="space-y-2.5">
            {clusters.map((c, i) => (
              <div
                key={i}
                className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-subtle)] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-indigo-500" />
                  <div>
                    <div className="text-xs font-medium text-[var(--text-primary)]">{c.label || `Cluster ${c.cluster + 1}`}</div>
                    <div className="text-[11px] text-[var(--text-muted)] font-mono">
                      Centroid: ({c.x.toFixed(1)}, {c.y.toFixed(1)})
                    </div>
                  </div>
                </div>
                <Badge variant="outline" size="sm">Segment #{c.cluster}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
