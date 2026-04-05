import Link from "next/link"

function VirloMark() {
  return (
    <svg width="60" height="18" viewBox="0 0 80 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Virlo" className="text-foreground">
      <path d="M2 4L8 18L14 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="20" cy="4.5" r="1.25" fill="currentColor"/>
      <line x1="20" y1="8" x2="20" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="25" y1="8" x2="25" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M25 11C25 11 27 8 30 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="35" y1="3" x2="35" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <rect x="40" y="7.5" width="9" height="11" rx="4.5" stroke="currentColor" strokeWidth="2"/>
    </svg>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-12">
          {/* Brand */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="hover:opacity-70 transition-opacity">
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                VIRLO
              </span>
            </Link>
            <p className="text-xs font-medium text-zinc-500 max-w-xs leading-relaxed uppercase tracking-widest">
              Aggregated intelligence from 30+ global sources. Sourced, verified, and distilled in real-time.
            </p>
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap items-center gap-x-12 gap-y-4">
            {[
              { href: "/news", label: "News" },
              { href: "/search", label: "Search" },
              { href: "/trends", label: "Trends" },
              { href: "/deep-dives", label: "Deep Dives" },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
            © {new Date().getFullYear()} Virlo. All articles link directly to original publications.
          </p>
          <div className="flex items-center gap-8">
            <Link href="#" className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
