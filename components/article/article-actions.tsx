"use client"

import { ShareButton } from "@/components/share-button"
import { BookmarkButton } from "@/components/bookmark-button"

interface ArticleActionsProps {
  slug: string
  title: string
}

export function ArticleActions({ slug, title }: ArticleActionsProps) {
  return (
    <div className="flex items-center gap-2 mt-6">
      <BookmarkButton slug={slug} />
      <ShareButton title={title} />
    </div>
  )
}
