'use client'

import { ReactNode } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { VirloProvider } from '@/lib/virlo-context'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <VirloProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </VirloProvider>
  )
}
