import React, { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Send,
  Bot,
  User,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { datasetService } from '../../api/service'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string          // final rendered content (no <think> tags)
  thinking?: string        // extracted <think>...</think> block
  isStreaming?: boolean
}

interface AIChatPanelProps {
  isOpen: boolean
  onClose: () => void
  datasetId: string | null
  datasetName?: string
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function parseThinking(raw: string): { thinking: string; content: string } {
  const thinkStart = raw.indexOf('<think>')
  const thinkEnd = raw.indexOf('</think>')

  if (thinkStart !== -1 && thinkEnd !== -1 && thinkEnd > thinkStart) {
    const thinking = raw.slice(thinkStart + 7, thinkEnd).trim()
    const content = (raw.slice(0, thinkStart) + raw.slice(thinkEnd + 8)).trim()
    return { thinking, content }
  }
  // Partial think tag — don't render yet
  if (thinkStart !== -1 && thinkEnd === -1) {
    return { thinking: '', content: '' }
  }
  return { thinking: '', content: raw.trim() }
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function ThinkingBlock({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  if (!text) return null
  return (
    <div className="mt-2 rounded-lg border border-indigo-500/20 bg-indigo-500/5 text-xs">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-1.5 px-3 py-2 text-indigo-400 hover:text-indigo-300 transition-colors"
      >
        <Sparkles className="w-3 h-3" />
        <span className="font-medium">Reasoning</span>
        {open ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <pre className="px-3 pb-3 whitespace-pre-wrap font-mono text-[11px] text-indigo-300/70 leading-relaxed">
              {text}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
          ${isUser
            ? 'bg-indigo-600 text-white'
            : 'bg-gradient-to-br from-violet-600 to-indigo-500 text-white'
          }`}
      >
        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap
            ${isUser
              ? 'bg-indigo-600 text-white rounded-tr-sm'
              : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-tl-sm'
            }`}
        >
          {msg.isStreaming && !msg.content ? (
            <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Thinking…</span>
            </span>
          ) : (
            msg.content || <span className="opacity-0">…</span>
          )}
        </div>

        {/* Thinking block (only for assistant) */}
        {!isUser && msg.thinking && <ThinkingBlock text={msg.thinking} />}
      </div>
    </motion.div>
  )
}

// ─── Main Panel ────────────────────────────────────────────────────────────────

export const AIChatPanel: React.FC<AIChatPanelProps> = ({
  isOpen,
  onClose,
  datasetId,
  datasetName,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: datasetId
        ? `Hi! I'm your AI Data Analyst. I have full context of **${datasetName || 'your dataset'}**.\n\nAsk me anything — patterns, anomalies, correlations, what to do next, or just "summarize this dataset".`
        : `Hi! Upload a dataset first, then I can answer specific questions about your data.`,
    },
  ])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const cancelStreamRef = useRef<(() => void) | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  const handleSend = useCallback(() => {
    const text = input.trim()
    if (!text || isStreaming) return

    setInput('')
    const userMsgId = `user-${Date.now()}`
    const assistantMsgId = `ai-${Date.now()}`

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: 'user', content: text },
      { id: assistantMsgId, role: 'assistant', content: '', isStreaming: true },
    ])
    setIsStreaming(true)

    let rawBuffer = ''

    const cancel = datasetService.streamChat(
      text,
      datasetId,
      // onToken
      (token) => {
        rawBuffer += token
        const { thinking, content } = parseThinking(rawBuffer)
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, content, thinking, isStreaming: true }
              : m
          )
        )
      },
      // onDone
      () => {
        const { thinking, content } = parseThinking(rawBuffer)
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, content: content || rawBuffer, thinking, isStreaming: false }
              : m
          )
        )
        setIsStreaming(false)
        cancelStreamRef.current = null
      },
      // onError
      (err) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, content: `⚠️ ${err}`, isStreaming: false }
              : m
          )
        )
        setIsStreaming(false)
        cancelStreamRef.current = null
      },
    )
    cancelStreamRef.current = cancel
  }, [input, isStreaming, datasetId])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClear = () => {
    if (isStreaming) cancelStreamRef.current?.()
    setIsStreaming(false)
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content: datasetId
          ? `Chat cleared. Still ready to answer questions about **${datasetName || 'your dataset'}**!`
          : 'Chat cleared. Upload a dataset to get started.',
      },
    ])
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Panel — floating card, not full-height */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="
              fixed bottom-20 right-20 z-50
              w-[370px]
              flex flex-col
              bg-[var(--bg-surface)] border border-[var(--border-subtle)]
              rounded-2xl shadow-2xl shadow-black/30
            "
            style={{ height: '540px' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-subtle)] flex-shrink-0 rounded-t-2xl">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">AI Data Analyst</h2>
                <p className="text-[11px] text-[var(--text-muted)] truncate">
                  {datasetId ? `Context: ${datasetName || datasetId}` : 'No dataset loaded'}
                </p>
              </div>
              <button
                onClick={handleClear}
                title="Clear chat"
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-[var(--border-subtle)] flex-shrink-0">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={datasetId ? 'Ask about your data…' : 'Upload a dataset first…'}
                  disabled={isStreaming}
                  rows={1}
                  className="
                    flex-1 resize-none rounded-xl border border-[var(--border-subtle)]
                    bg-[var(--bg-card)] px-3.5 py-2.5 text-sm text-[var(--text-primary)]
                    placeholder:text-[var(--text-muted)]
                    focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50
                    disabled:opacity-50 transition-all
                    max-h-32 overflow-y-auto
                  "
                  style={{ minHeight: '42px' }}
                  onInput={(e) => {
                    const el = e.currentTarget
                    el.style.height = 'auto'
                    el.style.height = `${Math.min(el.scrollHeight, 128)}px`
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isStreaming}
                  className="
                    w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl
                    bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40
                    text-white transition-all hover:scale-105 active:scale-95
                    disabled:hover:scale-100 disabled:cursor-not-allowed
                  "
                >
                  {isStreaming
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Send className="w-4 h-4" />
                  }
                </button>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] mt-1.5 text-center">
                Press Enter to send · Shift+Enter for new line
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
