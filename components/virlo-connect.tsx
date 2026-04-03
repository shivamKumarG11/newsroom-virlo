"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Key, Check, X, Loader2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useVirlo } from "@/lib/virlo-context"
import { cn } from "@/lib/utils"

export function VirloConnect() {
  const { isConnected, isValidating, connect, disconnect } = useVirlo()
  const [apiKey, setApiKey] = useState("")
  const [error, setError] = useState("")
  const [showInput, setShowInput] = useState(false)

  const handleConnect = async () => {
    if (!apiKey.trim()) {
      setError("Please enter your API key")
      return
    }
    
    setError("")
    const success = await connect(apiKey)
    
    if (success) {
      setApiKey("")
      setShowInput(false)
    } else {
      setError("Invalid API key. Please check and try again.")
    }
  }

  return (
    <div className="w-full max-w-md">
      <AnimatePresence mode="wait">
        {isConnected ? (
          <motion.div
            key="connected"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between gap-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <Check className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Virlo Connected</p>
                <p className="text-xs text-muted-foreground">Real-time intelligence active</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={disconnect}
              className="text-muted-foreground hover:text-foreground"
            >
              Disconnect
            </Button>
          </motion.div>
        ) : showInput ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <div className="relative">
              <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Enter your Virlo API key"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value)
                  setError("")
                }}
                onKeyDown={(e) => e.key === "Enter" && handleConnect()}
                className={cn(
                  "pl-10 pr-4 h-12 bg-card border-border",
                  error && "border-destructive"
                )}
              />
            </div>
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-destructive flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                {error}
              </motion.p>
            )}
            <div className="flex gap-2">
              <Button
                onClick={handleConnect}
                disabled={isValidating}
                className="flex-1 h-11 bg-foreground text-background hover:bg-foreground/90"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  "Connect"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowInput(false)
                  setError("")
                  setApiKey("")
                }}
                className="h-11"
              >
                Cancel
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Get your API key at{" "}
              <a
                href="https://usevirlo.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline inline-flex items-center gap-1"
              >
                usevirlo.com
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Button
              onClick={() => setShowInput(true)}
              variant="outline"
              className="w-full h-12 border-border bg-card hover:bg-secondary gap-2"
            >
              <Key className="h-4 w-4" />
              Connect Virlo API
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
