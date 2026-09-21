import os
import subprocess

os.makedirs('public/og', exist_ok=True)

# 1. Generate OG image SVG (1200x630)
og_svg = '''<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg-glow" cx="65%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#1B3E60" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#0B1A28" stop-opacity="1"/>
    </radialGradient>
    <linearGradient id="card-border" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4B7BA6" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#244463" stop-opacity="0.2"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="#0A1622" />
  <rect width="1200" height="630" fill="url(#bg-glow)" />

  <!-- Subtle Matrix grid lines -->
  <g opacity="0.15" stroke="#7BAED6" stroke-width="1">
    <line x1="100" y1="0" x2="100" y2="630" />
    <line x1="200" y1="0" x2="200" y2="630" />
    <line x1="300" y1="0" x2="300" y2="630" />
    <line x1="400" y1="0" x2="400" y2="630" />
    <line x1="500" y1="0" x2="500" y2="630" />
    <line x1="600" y1="0" x2="600" y2="630" />
    <line x1="700" y1="0" x2="700" y2="630" />
    <line x1="800" y1="0" x2="800" y2="630" />
    <line x1="900" y1="0" x2="900" y2="630" />
    <line x1="1000" y1="0" x2="1000" y2="630" />
    <line x1="1100" y1="0" x2="1100" y2="630" />
    <line x1="0" y1="100" x2="1200" y2="100" />
    <line x1="0" y1="200" x2="1200" y2="200" />
    <line x1="0" y1="300" x2="1200" y2="300" />
    <line x1="0" y1="400" x2="1200" y2="400" />
    <line x1="0" y1="500" x2="1200" y2="500" />
    <line x1="0" y1="600" x2="1200" y2="600" />
  </g>

  <!-- Left Container / Hero Text -->
  <g transform="translate(100, 110)">
    <!-- Pill Badge -->
    <rect x="0" y="0" width="370" height="38" rx="19" fill="#14314A" stroke="#2B608F" stroke-width="1.5" />
    <text x="22" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#6CB5E8" letter-spacing="2">
      INTERACTIVE SCIENTIFIC LABORATORY
    </text>

    <!-- Main Title -->
    <text x="0" y="110" font-family="Georgia, 'Times New Roman', serif" font-size="64" font-weight="bold" fill="#F8F9FA" letter-spacing="-1">
      Memory in Motion
    </text>

    <!-- Formula Subtitle -->
    <text x="0" y="165" font-family="'JetBrains Mono', monospace, Courier" font-size="24" fill="#E2BA70">
      M_t+1 = λ M_t + η k_t v_t^T
    </text>

    <!-- Description -->
    <text x="0" y="230" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" fill="#C5D4E3">
      Explore fixed-size recurrent memory states, Hebbian
    </text>
    <text x="0" y="265" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" fill="#C5D4E3">
      plasticity, and the Dragon Hatchling (BDH) architecture.
    </text>

    <!-- Core Subtext: See. Change. Measure. Understand. -->
    <g transform="translate(0, 340)">
      <rect x="0" y="0" width="460" height="50" rx="8" fill="#102538" stroke="url(#card-border)" stroke-width="1" />
      <text x="24" y="32" font-family="Georgia, serif" font-style="italic" font-size="20" fill="#90CDF4" font-weight="500">
        See.  Change.  Measure.  Understand.
      </text>
    </g>
  </g>

  <!-- Right Visual / Matrix Heatmap Illustration -->
  <g transform="translate(720, 120)">
    <rect x="0" y="0" width="380" height="380" rx="16" fill="#0C1B2A" stroke="#254B73" stroke-width="2" />
    
    <!-- Matrix Cells Graphic -->
    <g transform="translate(30, 30)">
      <!-- Row 1 -->
      <rect x="0" y="0" width="70" height="70" rx="8" fill="#1E527D" opacity="0.9" />
      <rect x="80" y="0" width="70" height="70" rx="8" fill="#0E2D4A" opacity="0.6" />
      <rect x="160" y="0" width="70" height="70" rx="8" fill="#D97706" opacity="0.85" />
      <rect x="240" y="0" width="70" height="70" rx="8" fill="#133D63" opacity="0.7" />

      <!-- Row 2 -->
      <rect x="0" y="80" width="70" height="70" rx="8" fill="#0E2D4A" opacity="0.6" />
      <rect x="80" y="80" width="70" height="70" rx="8" fill="#167C80" opacity="0.9" />
      <rect x="160" y="80" width="70" height="70" rx="8" fill="#133D63" opacity="0.7" />
      <rect x="240" y="80" width="70" height="70" rx="8" fill="#247A4B" opacity="0.85" />

      <!-- Row 3 -->
      <rect x="0" y="160" width="70" height="70" rx="8" fill="#D97706" opacity="0.75" />
      <rect x="80" y="160" width="70" height="70" rx="8" fill="#133D63" opacity="0.7" />
      <rect x="160" y="160" width="70" height="70" rx="8" fill="#2B6CB0" opacity="0.95" />
      <rect x="240" y="160" width="70" height="70" rx="8" fill="#0E2D4A" opacity="0.5" />

      <!-- Row 4 -->
      <rect x="0" y="240" width="70" height="70" rx="8" fill="#133D63" opacity="0.7" />
      <rect x="80" y="240" width="70" height="70" rx="8" fill="#247A4B" opacity="0.85" />
      <rect x="160" y="240" width="70" height="70" rx="8" fill="#0E2D4A" opacity="0.5" />
      <rect x="240" y="240" width="70" height="70" rx="8" fill="#E2BA70" opacity="0.9" />
    </g>

    <!-- Coordinate Label Below Matrix -->
    <text x="190" y="345" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="13" fill="#88A8C4">
      STATE MATRIX CO-OCCURRENCE (d=16)
    </text>
  </g>

  <!-- Bottom Brand Bar -->
  <g transform="translate(100, 560)">
    <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" fill="#6B8CA8">
      Open Research · DataForge 2026 · Pathway Track
    </text>
  </g>
</svg>'''

with open('public/og/temp.svg', 'w') as f:
    f.write(og_svg)

# Convert to PNG 1200x630
subprocess.run(['convert', '-density', '150', 'public/og/temp.svg', 'public/og/memory-in-motion.png'])
os.remove('public/og/temp.svg')
print("Generated public/og/memory-in-motion.png")

# 2. Generate Favicon SVG (crisp modern academic M with recurrent loop)
favicon_svg = '''<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="44" height="44" rx="10" fill="#1B4D7E"/>
  <path d="M 12 36 L 12 16 L 24 28 L 36 16 L 36 36" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M 17 33 C 21 38 27 38 31 33" stroke="#E2BA70" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="24" cy="28" r="3" fill="#2E7D4E"/>
</svg>'''

with open('public/favicon.svg', 'w') as f:
    f.write(favicon_svg)

# 3. Generate favicon-32x32.png
subprocess.run(['convert', '-background', 'none', '-resize', '32x32', 'public/favicon.svg', 'public/favicon-32x32.png'])
print("Generated public/favicon-32x32.png")

# 4. Generate apple-touch-icon.png (180x180)
subprocess.run(['convert', '-background', 'none', '-resize', '180x180', 'public/favicon.svg', 'public/apple-touch-icon.png'])
print("Generated public/apple-touch-icon.png")
