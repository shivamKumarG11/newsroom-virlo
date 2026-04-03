"use client"

import { useState, useEffect, useCallback } from "react"

const BOOKMARKS_KEY = "pulse_bookmarks"

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>([])

  useEffect(() => {
    const stored = localStorage.getItem(BOOKMARKS_KEY)
    if (stored) {
      try {
        setBookmarks(JSON.parse(stored))
      } catch {
        setBookmarks([])
      }
    }
  }, [])

  const addBookmark = useCallback((slug: string) => {
    setBookmarks((prev) => {
      const updated = [...prev, slug]
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const removeBookmark = useCallback((slug: string) => {
    setBookmarks((prev) => {
      const updated = prev.filter((s) => s !== slug)
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const toggleBookmark = useCallback((slug: string) => {
    setBookmarks((prev) => {
      const isBookmarked = prev.includes(slug)
      const updated = isBookmarked
        ? prev.filter((s) => s !== slug)
        : [...prev, slug]
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const isBookmarked = useCallback(
    (slug: string) => bookmarks.includes(slug),
    [bookmarks]
  )

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    isBookmarked,
  }
}
