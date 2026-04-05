"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { X, Send, Loader2, MessageSquare, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import type { NormalizedNewsItem } from "@/app/api/news/route"

interface Message {
  role: "user" | "assistant"
  text: string
}

interface StoryQAProps {
  article: NormalizedNewsItem
  onClose: () => void
}

const QUICK_QUESTIONS = [
  "What's the background?",
  "Who are the key actors?",
  "Why does this matter?",
]

export function StoryQA({ article, onClose }: StoryQAProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function send(question?: string) {
    const q = (question ?? input).trim()
    if (!q || loading) return
    setInput("")
    setMessages(prev => [...prev, { role: "user", text: q }])
    setLoading(true)

    try {
      const res = await fetch("/api/report/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articles: [{
            title: article.title,
            description: article.description,
            source: article.source,
            publishedAt: article.publishedAt,
            url: article.url,
          }],
          mode: "qa",
          question: q,
          articleContext: `Title: ${article.title}\nSource: ${article.source}\n${article.description ?? ""}${article.content ? `\n${article.content.slice(0, 1500)}` : ""}`,
        }),
      })
      const data = await res.json()
      setMessages(prev => [
        ...prev,
        { role: "assistant", text: data.report ?? data.error ?? "No response." },
      ])
    } catch {
      setMessages(prev => [...prev, { role: "assistant", text: "Network error — please try again." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="fixed right-0 top-0 bottom-0 z-[100] w-full sm:w-[450px] bg-black border-l border-white/5 shadow-2xl flex flex-col glass"
    >
      {/* Header */}
      <div className="flex items-start gap-5 px-8 py-8 border-b border-white/5 flex-shrink-0 bg-black/40 backdrop-blur-md">
        <Sparkles className="h-5 w-5 text-primary mt-1 flex-shrink-0 animate-pulse shadow-emerald" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-2">Neural Analysis</p>
          <p className="text-lg font-serif font-bold text-white line-clamp-2 leading-[1.1] tracking-tight">{article.title}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-2">{article.source}</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="text-zinc-500 hover:text-white transition-all hover:rotate-90 duration-300 flex-shrink-0">
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-10 space-y-8 scrollbar-none">
        {messages.length === 0 && (
          <div className="text-center py-12 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full glass-emerald flex items-center justify-center mb-8 border border-primary/20 shadow-emerald/10">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-8 max-w-[200px] leading-relaxed">
              Ask any question about this intelligence report.
            </p>
            <div className="flex flex-col gap-3 w-full max-w-[280px]">
              {QUICK_QUESTIONS.map(q => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  className="text-[10px] font-bold uppercase tracking-widest px-6 py-3 border border-white/5 rounded-sm text-zinc-400 hover:text-white hover:bg-white/5 hover:border-primary/20 transition-all text-center"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn(
              "max-w-[85%] rounded-sm px-5 py-4 text-sm font-medium leading-relaxed tracking-tight",
              msg.role === "user"
                ? "bg-primary text-primary-foreground ml-auto shadow-emerald/20"
                : "glass border-white/10 text-zinc-200"
            )}
          >
            {msg.text}
          </motion.div>
        ))}

        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-emerald border-primary/20 rounded-sm px-5 py-4 max-w-[85%] flex items-center gap-3"
          >
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Neural Processing...</span>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-8 pb-10 pt-6 border-t border-white/5 bg-black/40 backdrop-blur-md">
        <form onSubmit={e => { e.preventDefault(); send() }} className="flex gap-4">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Query intelligence..."
            className="flex-1 px-5 py-4 text-sm font-medium bg-zinc-900/50 border border-white/5 rounded-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-zinc-600 tracking-tight"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            aria-label="Send"
            className="flex-shrink-0 flex items-center justify-center h-12 w-12 bg-primary text-primary-foreground rounded-sm hover:opacity-90 disabled:opacity-40 transition-all active:scale-90 shadow-emerald/20"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      </div>
    </motion.div>
  )
}
