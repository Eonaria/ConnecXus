<template>
  <div class="network-anim-wrapper">
    <svg
      viewBox="0 0 380 320"
      xmlns="http://www.w3.org/2000/svg"
      class="network-svg-canvas"
      aria-hidden="true"
    >
      <defs>
        <!-- Gradients -->
        <linearGradient id="hubGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#818cf8" />
          <stop offset="50%" stop-color="#6366f1" />
          <stop offset="100%" stop-color="#a855f7" />
        </linearGradient>

        <linearGradient id="nodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e1e2d" />
          <stop offset="100%" stop-color="#13131c" />
        </linearGradient>

        <linearGradient id="activeNodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2a2254" />
          <stop offset="100%" stop-color="#181530" />
        </linearGradient>

        <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <!-- ── Orbital Background Rings ── -->
      <circle cx="190" cy="160" r="120" fill="none" stroke="rgba(99, 102, 241, 0.08)" stroke-width="1" stroke-dasharray="4 8" />
      <circle cx="190" cy="160" r="70" fill="none" stroke="rgba(168, 85, 247, 0.12)" stroke-width="1" />

      <!-- ── Connection Lines with Flowing Dash ── -->
      <!-- Center → Chat (Top Left) -->
      <line
        x1="190" y1="160" x2="80" y2="90"
        stroke="rgba(99, 102, 241, 0.45)" stroke-width="2"
        stroke-dasharray="6 6"
        class="flow-line-1"
      />
      <!-- Center → Feed (Top Right) -->
      <line
        x1="190" y1="160" x2="300" y2="80"
        stroke="rgba(168, 85, 247, 0.45)" stroke-width="2"
        stroke-dasharray="6 6"
        class="flow-line-2"
      />
      <!-- Center → Group (Bottom Left) -->
      <line
        x1="190" y1="160" x2="70" y2="240"
        stroke="rgba(99, 102, 241, 0.45)" stroke-width="2"
        stroke-dasharray="6 6"
        class="flow-line-3"
      />
      <!-- Center → Alert (Bottom Right) -->
      <line
        x1="190" y1="160" x2="310" y2="235"
        stroke="rgba(236, 72, 153, 0.55)" stroke-width="2"
        stroke-dasharray="6 6"
        class="flow-line-4"
      />

      <!-- ── Satellite Nodes ── -->

      <!-- 1. Chat Node -->
      <g class="satellite-group">
        <circle cx="80" cy="90" r="32" fill="url(#nodeGrad)" stroke="rgba(99, 102, 241, 0.35)" stroke-width="2" filter="url(#softGlow)" />
        <circle cx="80" cy="90" r="28" fill="rgba(255, 255, 255, 0.02)" />
        <path d="M74 80 h12 a3 3 0 0 1 3 3 v6 a3 3 0 0 1 -3 3 h-7 l-4 3 v-3 h-1 a3 3 0 0 1 -3 -3 v-6 a3 3 0 0 1 3 -3 z" fill="none" stroke="#818cf8" stroke-width="1.8" stroke-linejoin="round"/>
        <text x="80" y="107" text-anchor="middle" fill="#94a3b8" font-size="10.5" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" letter-spacing="0.5">Chat</text>
      </g>

      <!-- 2. Feed Node -->
      <g class="satellite-group">
        <circle cx="300" cy="80" r="32" fill="url(#nodeGrad)" stroke="rgba(168, 85, 247, 0.35)" stroke-width="2" filter="url(#softGlow)" />
        <circle cx="300" cy="80" r="28" fill="rgba(255, 255, 255, 0.02)" />
        <path d="M294 69 h12 a2 2 0 0 1 2 2 v14 a2 2 0 0 1 -2 2 h-12 a2 2 0 0 1 -2 -2 v-14 a2 2 0 0 1 2 -2 z M296 74 h8 M296 78 h8 M296 82 h5" fill="none" stroke="#c084fc" stroke-width="1.8" stroke-linecap="round"/>
        <text x="300" y="97" text-anchor="middle" fill="#94a3b8" font-size="10.5" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" letter-spacing="0.5">Feed</text>
      </g>

      <!-- 3. Group Node -->
      <g class="satellite-group">
        <circle cx="70" cy="240" r="32" fill="url(#nodeGrad)" stroke="rgba(99, 102, 241, 0.35)" stroke-width="2" filter="url(#softGlow)" />
        <circle cx="70" cy="240" r="28" fill="rgba(255, 255, 255, 0.02)" />
        <circle cx="67" cy="229" r="3" fill="none" stroke="#818cf8" stroke-width="1.8"/>
        <path d="M62 239 a5 5 0 0 1 10 0" fill="none" stroke="#818cf8" stroke-width="1.8" stroke-linecap="round"/>
        <circle cx="75" cy="228" r="2.5" fill="none" stroke="#818cf8" stroke-width="1.4"/>
        <path d="M72 237 a4 4 0 0 1 6 0" fill="none" stroke="#818cf8" stroke-width="1.4" stroke-linecap="round"/>
        <text x="70" y="257" text-anchor="middle" fill="#94a3b8" font-size="10.5" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" letter-spacing="0.5">Group</text>
      </g>

      <!-- 4. Alert Node (Active Glow) -->
      <g class="satellite-group">
        <circle cx="310" cy="235" r="32" fill="url(#activeNodeGrad)" stroke="rgba(236, 72, 153, 0.7)" stroke-width="2" filter="url(#neonGlow)" />
        <circle cx="310" cy="235" r="28" fill="rgba(236, 72, 153, 0.1)" />
        <path d="M310 220 a4 4 0 0 0 -4 4 v4 l-2 2 h12 l-2 -2 v-4 a4 4 0 0 0 -4 -4 z M308 230 a2 2 0 0 0 4 0" fill="none" stroke="#f472b6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="310" y="252" text-anchor="middle" fill="#f472b6" font-size="10.5" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" letter-spacing="0.5">Alert</text>
        <!-- Notification Dot -->
        <circle cx="330" cy="215" r="5" fill="#f43f5e" />
      </g>

      <!-- ── Center Pulse Rings ── -->
      <circle
        cx="190" cy="160" r="58"
        fill="none"
        stroke="rgba(129, 140, 248, 0.35)"
        stroke-width="1.5"
        class="pulse-ring-outer"
      />
      <circle
        cx="190" cy="160" r="48"
        fill="none"
        stroke="rgba(168, 85, 247, 0.5)"
        stroke-width="1.5"
        class="pulse-ring-inner"
      />

      <!-- ── Center Hub ── -->
      <g class="center-hub-group" filter="url(#neonGlow)">
        <circle cx="190" cy="160" r="42" fill="url(#hubGrad)" />
        <circle cx="190" cy="160" r="38" fill="none" stroke="rgba(255, 255, 255, 0.4)" stroke-width="1.5" />
        <text
          x="190" y="169"
          text-anchor="middle"
          fill="#ffffff"
          font-size="25"
          font-weight="900"
          font-family="'Inter', sans-serif"
          letter-spacing="-0.5px"
        >X</text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.network-anim-wrapper {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 0;
}

.network-svg-canvas {
  width: 100%;
  max-width: 380px;
  animation: cx-float 5s ease-in-out infinite;
}

/* Flow lines animation */
.flow-line-1 { animation: cx-dash 1.8s linear infinite; }
.flow-line-2 { animation: cx-dash 1.8s linear infinite 0.4s; }
.flow-line-3 { animation: cx-dash 1.8s linear infinite 0.8s; }
.flow-line-4 { animation: cx-dash 1.8s linear infinite 1.2s; }

@keyframes cx-dash {
  to { stroke-dashoffset: -24; }
}

@keyframes cx-float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-8px) rotate(0.5deg); }
}

.pulse-ring-outer {
  transform-origin: 190px 160px;
  animation: cx-pulse-expand 3s ease-out infinite;
}

.pulse-ring-inner {
  transform-origin: 190px 160px;
  animation: cx-pulse-expand 3s ease-out infinite 0.6s;
}

@keyframes cx-pulse-expand {
  0% { transform: scale(0.85); opacity: 0.8; }
  50% { transform: scale(1.15); opacity: 0.2; }
  100% { transform: scale(1.35); opacity: 0; }
}

.satellite-group {
  transition: transform 0.3s ease;
  cursor: default;
}

.satellite-group:hover {
  transform: scale(1.08);
}

.center-hub-group {
  animation: hub-breathe 4s ease-in-out infinite;
  transform-origin: 190px 160px;
}

@keyframes hub-breathe {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 16px rgba(99, 102, 241, 0.6)); }
  50% { transform: scale(1.03); filter: drop-shadow(0 0 26px rgba(168, 85, 247, 0.9)); }
}
</style>

