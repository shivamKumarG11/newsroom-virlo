import { VirloProvider } from "@/lib/virlo-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <VirloProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-16">
          {children}
        </main>
        <Footer />
      </div>
    </VirloProvider>
  )
}
