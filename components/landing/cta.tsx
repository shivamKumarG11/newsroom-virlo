"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CTA() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-foreground text-background"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
                backgroundSize: '32px 32px'
              }}
            />
          </div>

          <div className="relative px-8 py-16 md:px-16 md:py-24 text-center">
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-balance max-w-3xl mx-auto">
              Ready to Experience the Future of News?
            </h2>
            <p className="mt-6 text-lg text-background/70 max-w-xl mx-auto">
              Join thousands of readers who get their news powered by real-time social intelligence.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="h-12 px-8 bg-background text-foreground hover:bg-background/90 gap-2"
              >
                <Link href="/news">
                  Start Reading
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 px-8 border-background/20 text-background hover:bg-background/10 hover:text-background"
              >
                <Link href="/trends">
                  Explore Trends
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
