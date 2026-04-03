"use client"

import { Bookmark, BookmarkCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useBookmarks } from "@/hooks/use-bookmarks"
import { cn } from "@/lib/utils"

interface BookmarkButtonProps {
  slug: string
  className?: string
}

export function BookmarkButton({ slug, className }: BookmarkButtonProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks()
  const bookmarked = isBookmarked(slug)

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => toggleBookmark(slug)}
      className={cn("gap-2", className)}
    >
      {bookmarked ? (
        <>
          <BookmarkCheck className="h-4 w-4 text-accent" />
          Saved
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4" />
          Save
        </>
      )}
    </Button>
  )
}
