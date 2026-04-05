"use client"

import { getSourceCredibility, getSourceAbbreviation } from "@/lib/source-credibility"
import { cn } from "@/lib/utils"
import { ExternalLink } from "lucide-react"

interface SourceBadgeProps {
  source: string
  url?: string
  size?: 'sm' | 'md'
  showIcon?: boolean
  className?: string
}

export function SourceBadge({
  source,
  url,
  size = 'sm',
  showIcon = false,
  className,
}: SourceBadgeProps) {
  const cred = getSourceCredibility(source)
  const abbrev = getSourceAbbreviation(source)

  const badge = (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        size === 'sm' ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        cred.bgColor,
        cred.borderColor,
        cred.color,
        className
      )}
      title={`${source} — ${cred.description}`}
    >
      <span className="opacity-70">{cred.icon}</span>
      {abbrev}
      {showIcon && url && (
        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
      )}
    </span>
  )

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex hover:opacity-80 transition-opacity"
        onClick={e => e.stopPropagation()}
      >
        {badge}
      </a>
    )
  }

  return badge
}

/** Row of source badges for multiple sources */
export function SourceBadgeList({
  sources,
  max = 4,
  className,
}: {
  sources: { name: string; url?: string }[]
  max?: number
  className?: string
}) {
  const visible = sources.slice(0, max)
  const overflow = sources.length - max

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {visible.map((s, i) => (
        <SourceBadge key={i} source={s.name} url={s.url} size="sm" />
      ))}
      {overflow > 0 && (
        <span className="text-[10px] text-muted-foreground">+{overflow} more</span>
      )}
    </div>
  )
}
