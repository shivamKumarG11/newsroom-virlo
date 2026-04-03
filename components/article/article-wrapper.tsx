"use client"

import { ArticlePipeline } from "./article-pipeline"

interface ArticleWrapperProps {
  children: React.ReactNode
  articleTitle: string
}

export function ArticleWrapper({ children, articleTitle }: ArticleWrapperProps) {
  return (
    <>
      <ArticlePipeline articleTitle={articleTitle} />
      {children}
    </>
  )
}
