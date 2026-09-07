import React, { useState } from 'react'
import {
  Share2,
  FileDown,
  FileImage,
  Copy,
  Check,
  Globe,
  Lock,
  Sparkles,
  X
} from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'

interface ExportMenuProps {
  datasetId: string
  datasetName?: string
  dashboardElementId?: string
}

export const ExportMenu: React.FC<ExportMenuProps> = ({
  datasetId,
  datasetName = 'Automated Insight Dashboard',
  dashboardElementId = 'dashboard-export-target',
}) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isExportingPDF, setIsExportingPDF] = useState(false)
  const [isExportingPNG, setIsExportingPNG] = useState(false)
  const [accessLevel, setAccessLevel] = useState<'public' | 'domain'>('public')

  const shareUrl = `${window.location.origin}/dashboard/${datasetId}?shared=true&token=ro_${datasetId.slice(0, 8)}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (e) {
      console.error('Failed to copy', e)
    }
  }

  const handleExportPNG = async () => {
    const el = document.getElementById(dashboardElementId)
    if (!el) return

    setIsExportingPNG(true)
    try {
      const canvas = await html2canvas(el, {
        backgroundColor: document.documentElement.classList.contains('dark') ? '#090a0f' : '#f8fafc',
        scale: 2,
        useCORS: true,
        logging: false,
      })

      const image = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = image
      link.download = `${datasetName.toLowerCase().replace(/\s+/g, '_')}_insight_report.png`
      link.click()
    } catch (err) {
      console.error('PNG Export failed', err)
    } finally {
      setIsExportingPNG(false)
    }
  }

  const handleExportPDF = async () => {
    const el = document.getElementById(dashboardElementId)
    if (!el) return

    setIsExportingPDF(true)
    try {
      const canvas = await html2canvas(el, {
        backgroundColor: document.documentElement.classList.contains('dark') ? '#090a0f' : '#f8fafc',
        scale: 1.5,
        useCORS: true,
        logging: false,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      })

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
      pdf.save(`${datasetName.toLowerCase().replace(/\s+/g, '_')}_executive_summary.pdf`)
    } catch (err) {
      console.error('PDF Export failed', err)
    } finally {
      setIsExportingPDF(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsShareModalOpen(true)}
          icon={<Share2 className="w-3.5 h-3.5 text-indigo-500" />}
        >
          Share
        </Button>

        <Button
          variant="outline"
          size="sm"
          isLoading={isExportingPNG}
          onClick={handleExportPNG}
          icon={<FileImage className="w-3.5 h-3.5 text-cyan-500" />}
          title="Download snapshot as PNG"
        >
          PNG
        </Button>

        <Button
          variant="primary"
          size="sm"
          isLoading={isExportingPDF}
          onClick={handleExportPDF}
          icon={<FileDown className="w-3.5 h-3.5" />}
        >
          Export PDF
        </Button>
      </div>

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-2xl transition-colors">
            <button
              onClick={() => setIsShareModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-500 flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[var(--text-primary)] tracking-tight">
                  Share Executive Dashboard
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">Generate secure read-only access link</p>
              </div>
            </div>

            {/* Access Level Selector */}
            <div className="space-y-2 mb-4">
              <label className="text-xs font-medium text-[var(--text-primary)]">Access Permissions</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAccessLevel('public')}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-colors flex items-center gap-2 ${
                    accessLevel === 'public'
                      ? 'border-indigo-500 bg-indigo-500/10 text-[var(--text-primary)]'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-indigo-500" />
                  <div>
                    <div className="font-medium">Anyone with link</div>
                    <div className="text-[10px] text-[var(--text-muted)]">Read-only view</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAccessLevel('domain')}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-colors flex items-center gap-2 ${
                    accessLevel === 'domain'
                      ? 'border-indigo-500 bg-indigo-500/10 text-[var(--text-primary)]'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 text-indigo-500" />
                  <div>
                    <div className="font-medium">Restricted Token</div>
                    <div className="text-[10px] text-[var(--text-muted)]">Workspace members</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Share Link Box */}
            <div className="mb-5">
              <label className="text-xs font-medium text-[var(--text-primary)] mb-1.5 block">
                Direct Read-Only Link
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 text-xs font-mono bg-[var(--input-bg)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] truncate select-all">
                  {shareUrl}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyLink}
                  icon={isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {isCopied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                <span>Interactive view with zero edit permissions</span>
              </div>
              <Badge variant="indigo" size="sm">Active Token</Badge>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
