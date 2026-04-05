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
      className="fixed right-0 top-0 bottom-0 z-[100] w-full sm:w-[450px] bg-white border-l border-zinc-200 shadow-2xl flex flex-col"
    >
      {/* Header */}
      <div className="flex items-start gap-5 px-8 py-8 border-b border-zinc-200 flex-shrink-0 bg-amber-50/50">
        <Sparkles className="h-5 w-5 text-amber-600 mt-1 flex-shrink-0 animate-pulse" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-700 mb-2">Neural Analysis</p>
          <p className="text-lg font-serif font-bold text-[#3e2723] line-clamp-2 leading-[1.1] tracking-tight">{article.title}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-3">{article.source}</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="text-zinc-400 hover:text-[#3e2723] transition-all hover:rotate-90 duration-300 flex-shrink-0 p-1">
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-10 space-y-8 scrollbar-none bg-[#FAFAFA]">
        {messages.length === 0 && (
          <div className="text-center py-12 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-8 border border-amber-200 shadow-sm">
              <MessageSquare className="h-8 w-8 text-amber-700" />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#3e2723] mb-8 max-w-[200px] leading-relaxed">
              Query the intelligence brief.
            </p>
            <div className="flex flex-col gap-3 w-full max-w-[280px]">
              {QUICK_QUESTIONS.map(q => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  className="text-[10px] font-bold uppercase tracking-widest px-6 py-4 border border-zinc-200 rounded-none bg-white text-zinc-600 hover:text-amber-800 hover:bg-amber-50 hover:border-amber-200 transition-all text-center shadow-sm"
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
              "max-w-[85%] rounded-none px-6 py-5 text-sm font-medium leading-relaxed tracking-tight shadow-sm border",
              msg.role === "user"
                ? "bg-amber-500 text-[#3e2723] ml-auto border-amber-500"
                : "bg-white border-zinc-200 text-zinc-700"
            )}
          >
            {msg.text}
          </motion.div>
        ))}

        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-amber-50 border border-amber-200 rounded-none px-5 py-4 max-w-[85%] flex items-center gap-3 shadow-sm"
          >
            <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#3e2723]">Processing Request...</span>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-8 pb-10 pt-6 border-t border-zinc-200 bg-white">
        <form onSubmit={e => { e.preventDefault(); send() }} className="flex gap-4">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Query intelligence..."
            className="flex-1 px-5 py-4 text-sm font-medium bg-zinc-50 border border-zinc-200 rounded-none focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all placeholder:text-zinc-400 tracking-tight text-zinc-900"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            aria-label="Send"
            className="flex-shrink-0 flex items-center justify-center h-14 w-14 bg-[#3e2723] text-white rounded-none hover:bg-amber-500 hover:text-[#3e2723] disabled:opacity-40 transition-all active:scale-90 shadow-md"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </form>
      </div>
    </motion.div>
  )
}
