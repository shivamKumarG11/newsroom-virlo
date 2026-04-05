import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/landing/hero"
import { WorkflowSection } from "@/components/landing/workflow"
import { ArchiveSection } from "@/components/landing/archive-reports"
import { TrendingHashtags } from "@/components/landing/trending-hashtags"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <main>
        <Hero />
        <WorkflowSection />
        <ArchiveSection />
        <TrendingHashtags />
      </main>
    </div>
  )
}
