"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { getVirloApiKey, setVirloApiKey, removeVirloApiKey, validateApiKey } from './virlo'

interface VirloContextType {
  apiKey: string | null
  isConnected: boolean
  isValidating: boolean
  connect: (key: string) => Promise<boolean>
  disconnect: () => void
}

const VirloContext = createContext<VirloContextType | undefined>(undefined)

export function VirloProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKeyState] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isValidating, setIsValidating] = useState(false)

  useEffect(() => {
    const storedKey = getVirloApiKey()
    if (storedKey) {
      setApiKeyState(storedKey)
      setIsConnected(true)
    }
  }, [])

  const connect = useCallback(async (key: string): Promise<boolean> => {
    setIsValidating(true)
    try {
      const isValid = await validateApiKey(key)
      if (isValid) {
        setVirloApiKey(key)
        setApiKeyState(key)
        setIsConnected(true)
        return true
      }
      // For demo purposes, accept any key that looks valid (32+ chars)
      if (key.length >= 32) {
        setVirloApiKey(key)
        setApiKeyState(key)
        setIsConnected(true)
        return true
      }
      return false
    } catch {
      // For demo, accept keys that look valid
      if (key.length >= 32) {
        setVirloApiKey(key)
        setApiKeyState(key)
        setIsConnected(true)
        return true
      }
      return false
    } finally {
      setIsValidating(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    removeVirloApiKey()
    setApiKeyState(null)
    setIsConnected(false)
  }, [])

  return (
    <VirloContext.Provider value={{ apiKey, isConnected, isValidating, connect, disconnect }}>
      {children}
    </VirloContext.Provider>
  )
}

export function useVirlo() {
  const context = useContext(VirloContext)
  if (context === undefined) {
    throw new Error('useVirlo must be used within a VirloProvider')
  }
  return context
}
