"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, Send, Loader2, Sparkles, X, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Article } from "@/lib/mock-data"

interface AIAssistantProps {
  article: Article
}

interface Message {
  role: "user" | "assistant"
  content: string
}

const suggestedQuestions = [
  "What are the key takeaways?",
  "What are opposing viewpoints?",
  "Summarize in 3 bullet points",
  "What does this mean for the future?"
]

export function AIAssistant({ article }: AIAssistantProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (question: string) => {
    if (!question.trim() || isLoading) return

    const userMessage: Message = { role: "user", content: question }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response - in production, this would call the AI API
    await new Promise(resolve => setTimeout(resolve, 1500))

    let response = ""
    
    if (question.toLowerCase().includes("key takeaway") || question.toLowerCase().includes("takeaway")) {
      response = `Based on "${article.title}":\n\n1. **Main Point**: ${article.excerpt.slice(0, 100)}...\n\n2. **Trend Signal**: Virlo data shows a ${article.virloData?.trendScore || 80}% trend score, indicating high public interest.\n\n3. **Sentiment**: The overall sentiment around this topic is ${article.virloData?.sentiment || 'neutral'}, with significant discussion across social platforms.`
    } else if (question.toLowerCase().includes("opposing") || question.toLowerCase().includes("viewpoint")) {
      response = `**Alternative Perspectives on This Story:**\n\n1. **Skeptics argue** that the pace of change may be overstated, citing historical precedents where transformations took longer than predicted.\n\n2. **Critics point out** potential negative consequences that aren't fully addressed in the mainstream narrative.\n\n3. **Industry insiders** suggest the real impact may be more nuanced, varying significantly by sector and region.`
    } else if (question.toLowerCase().includes("summarize") || question.toLowerCase().includes("bullet")) {
      response = `**Quick Summary:**\n\n• ${article.excerpt}\n\n• The trend has a ${article.virloData?.trendScore || 80}% score on Virlo, indicating significant social momentum.\n\n• Key related topics: ${article.virloData?.relatedTopics?.join(", ") || article.tags.join(", ")}`
    } else if (question.toLowerCase().includes("future") || question.toLowerCase().includes("mean")) {
      response = `**Future Implications:**\n\nBased on current trend data and sentiment analysis, we can expect:\n\n1. **Short-term** (6 months): Continued acceleration of the trends discussed, with increasing mainstream attention.\n\n2. **Medium-term** (1-2 years): Potential regulatory responses and industry adaptation.\n\n3. **Long-term**: Fundamental shifts in how the affected sectors operate, with both opportunities and challenges emerging.`
    } else {
      response = `That's an interesting question about "${article.title}". Based on the article and Virlo intelligence data:\n\n${article.excerpt}\n\nThe current trend score is ${article.virloData?.trendScore || 80}%, suggesting significant public interest. Would you like me to elaborate on any specific aspect?`
    }

    const assistantMessage: Message = { role: "assistant", content: response }
    setMessages(prev => [...prev, assistantMessage])
    setIsLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-border bg-card overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent/60">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-foreground">Ask AI About This Story</h3>
            <p className="text-xs text-muted-foreground">Get context, analysis, and insights</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border"
          >
            <div className="p-5 space-y-4">
              {/* Suggested Questions */}
              {messages.length === 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Suggested questions:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.map((q) => (
                      <button
                        key={q}
                        onClick={() => handleSubmit(q)}
                        className="text-xs px-3 py-1.5 rounded-full border border-border bg-secondary/30 hover:bg-secondary transition-colors text-foreground"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              {messages.length > 0 && (
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}
                    >
                      {message.role === "assistant" && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 flex-shrink-0">
                          <Sparkles className="h-4 w-4 text-accent" />
                        </div>
                      )}
                      <div
                        className={`rounded-xl px-4 py-3 max-w-[85%] ${
                          message.role === "user"
                            ? "bg-accent text-accent-foreground"
                            : "bg-secondary/50 text-foreground"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      {message.role === "user" && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary flex-shrink-0">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 flex-shrink-0">
                        <Sparkles className="h-4 w-4 text-accent" />
                      </div>
                      <div className="rounded-xl bg-secondary/50 px-4 py-3">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Input */}
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit(input)}
                  placeholder="Ask a question about this article..."
                  className="flex-1 h-10 bg-secondary/30 border-border"
                  disabled={isLoading}
                />
                <Button
                  onClick={() => handleSubmit(input)}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="h-10 w-10 bg-accent hover:bg-accent/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* Clear */}
              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3 w-3" />
                  Clear conversation
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
