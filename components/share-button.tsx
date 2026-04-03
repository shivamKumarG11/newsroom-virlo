"use client"

import { useState } from "react"
import { Share2, Check, Link2, Twitter, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ShareButtonProps {
  title: string
  url?: string
}

export function ShareButton({ title, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "")

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`
    window.open(twitterUrl, "_blank")
  }

  const handleLinkedInShare = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    window.open(linkedInUrl, "_blank")
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: shareUrl,
        })
      } catch (err) {
        // User cancelled or error
      }
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleCopyLink} className="gap-2">
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-500" />
              Copied!
            </>
          ) : (
            <>
              <Link2 className="h-4 w-4" />
              Copy link
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleTwitterShare} className="gap-2">
          <Twitter className="h-4 w-4" />
          Share on X
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLinkedInShare} className="gap-2">
          <Linkedin className="h-4 w-4" />
          Share on LinkedIn
        </DropdownMenuItem>
        {typeof navigator !== "undefined" && navigator.share && (
          <DropdownMenuItem onClick={handleNativeShare} className="gap-2">
            <Share2 className="h-4 w-4" />
            More options
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
