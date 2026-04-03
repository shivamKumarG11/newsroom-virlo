import { VirloProvider } from "@/lib/virlo-context"
import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/landing/hero"
import { IntelligenceEngine } from "@/components/landing/intelligence-engine"
import { VirloFeatures } from "@/components/landing/virlo-features"
import { CTA } from "@/components/landing/cta"
import { Footer } from "@/components/footer"

export default function LandingPage() {
  return (
    <VirloProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <Hero />
          <IntelligenceEngine />
          <VirloFeatures />
          <CTA />
        </main>
        <Footer />
      </div>
    </VirloProvider>
  )
}
