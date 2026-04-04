# Landing Page Design Spec: "Modern Intelligence"

## Overview
The Landing Page of "Newsroom Virlo" must deliver a "million-star" first impression. The aesthetic is "Modern Premium Intelligence"—a high-end, authoritative dark-themed design that feels like a cross between a prestigious newsroom and a cutting-edge AI lab.

## Global Aesthetic Constraints
- **Single Theme:** Deep dark mode only. No light mode toggle. The base background will be `zinc-950` (near black).
- **Typography:**
  - **Headlines:** A commanding, elegant Serif font (e.g., `Playfair Display` or similar system serif).
  - **Body/UI:** A clinical, highly legible Sans-serif (e.g., `Inter` or `Geist`).
  - **Data/Stats:** A monospace font (e.g., `JetBrains Mono` or `Geist Mono`) for pipeline numbers and statistics.
- **Surfaces & Borders:** Glassmorphism (translucent, blurred backgrounds) with ultra-thin `1px` borders (`white/10`) to create a structured grid without heavy boxes.
- **Accents:** Minimal. Using "Electric Emerald" (`emerald-500`) sparingly for "live" data indicators and success states.

## Component-by-Component Breakdown

### 1. Navbar
- **Positioning:** Fixed, floating at the top with a heavy `backdrop-blur`.
- **Border:** A delicate `border-b border-white/10`.
- **Links:** Subtle text (`zinc-400`) that turns white on hover, potentially with a minimal slide-in underline animation.
- **Actions:** The "Connect" or primary action button will be an outline button that fills on hover, keeping the nav light.

### 2. Hero Section (`/components/landing/hero.tsx`)
- **Headline:** Huge, centered text. We will apply a subtle text gradient shimmer (from stark white to `zinc-500`) to give it a premium metallic feel.
- **Background:** A massive, faint radial gradient behind the text (`blur-3xl`, very low opacity) to give the hero section depth and a subtle glow.
- **Primary CTA:** Stark white background with black text, sharp corners (`rounded-sm`), and a faint white outer glow. The hover state will slightly dim or shrink the button.
- **Secondary CTA:** A ghost button with a border that illuminates slightly on hover.

### 3. Intelligence Engine / How It Works (`/components/landing/intelligence-engine.tsx`)
- **Layout:** A highly structured, sophisticated grid (reminiscent of Linear or Vercel's feature grids).
- **Cards:** Each step ("Collect", "Deduplicate", etc.) is a card with a semi-transparent background (`bg-white/[0.02]`) and an ultra-thin border.
- **Typography Detail:** Large, outline-style numbers (e.g., "01", "02") placed in the background of each card at 5% opacity.
- **Interaction:** On hover, the card's border transitions smoothly to a glowing `emerald-500/30` or `white/30`, and the card lifts slightly.

### 4. Live Statistics (`/components/landing/intelligence-stats.tsx`)
- **Visual Style:** Styled like a high-tech terminal or ticker tape.
- **Typography:** Large monospace numbers.
- **The "Pulse":** A small, animated glowing emerald dot next to the "Live" indicator to show the system is actively fetching data.

### 5. Features Section (`/components/landing/virlo-features.tsx`)
- **Layout:** Bento-box style grid.
- **Styling:** Consistent with the Intelligence Engine cards—glassmorphism, thin borders, subtle interior glows on hover.

### 6. CTA / Footer (`/components/landing/cta.tsx`, `/components/footer.tsx`)
- **Bottom CTA:** A simplified, scaled-down version of the hero to drive final conversion.
- **Footer:** Ultra-minimalist. 3-column layout, small muted text (`zinc-500`), high-contrast links on hover, and clean Lucide icons.

## Execution Strategy
Every single element down to the smallest badge or border will be explicitly styled using Tailwind CSS, removing any default or unconsidered styles. The page will feel cohesive, premium, and highly engineered.