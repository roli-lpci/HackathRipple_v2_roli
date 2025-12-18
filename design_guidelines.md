# Design Guidelines: Agent Synapse Mission Control

## Design Approach

**Reference-Based Approach:** This is a utility-focused, function-differentiated application requiring a custom design system inspired by mission control interfaces, development tools, and real-time monitoring dashboards. Draw inspiration from:
- **Linear** (clean typography, purposeful spacing, status indicators)
- **Replit** (code-first interfaces, live execution feedback)
- **Vercel/Railway** (deployment dashboards, real-time logs)
- **Mission control aesthetics** (NASA interfaces, Bloomberg terminals)

**Core Principle:** Prioritize **inspectability, clarity, and determinism** over decorative polish. This is a hackathon build focused on demonstrating agentic execution with full visibility.

---

## Layout System

### Primary Layout (Desktop)
```
┌─────────────────────────────────────────────────────────┐
│  God Mode Input Bar (fixed top, full width)            │
├──────────────────────┬──────────────────────────────────┤
│ CHAT THREAD (60%)    │ GRAPH CANVAS (40%)              │
│                      │ - Agent/Artifact nodes           │
│ - Messages           │ - Can expand to overlay          │
│ - Artifacts          │                                  │
│ - File uploads       │ STEERING CONTROLS (below graph)  │
│ - Input at bottom    │ - Context-sensitive              │
└──────────────────────┴──────────────────────────────────┘
│ OMNI-CONSOLE (collapsible drawer, 0-40% height)        │
└─────────────────────────────────────────────────────────┘
```

**Tailwind spacing primitives:** Use units of **2, 4, 6, 8, 12, 16** (p-2, gap-4, h-8, m-12, py-16)

**Responsive behavior:**
- Tablet: Stack to single column (chat full width, graph below)
- Mobile: Collapse graph to icon-only, expand on tap

---

## Typography

**Font Family:** Inter (via Google Fonts CDN) - technical clarity, excellent at small sizes

**Hierarchy:**
- **Page Title/God Mode:** text-2xl font-semibold (24px)
- **Section Headers:** text-lg font-medium (18px) 
- **Agent/Task Names:** text-base font-semibold (16px)
- **Chat Messages:** text-sm (14px)
- **Status/Metadata:** text-xs font-medium uppercase tracking-wide (12px)
- **Console/Logs:** font-mono text-xs (12px, monospace for technical output)

---

## Core Components

### 1. God Mode Input Bar
- **Fixed position** at top of viewport
- **Large input field** (h-12 on desktop, h-10 mobile)
- **Placeholder:** "Tell me what you need... (e.g., 'Create a research team for crypto analysis')"
- **Submit button** on right side with icon (HeroIcons arrow-right)
- **Subtle backdrop blur** (backdrop-blur-md) if content scrolls beneath

### 2. Chat Thread (Left Panel - 60%)
- **Message layout:** Alternating user (right-aligned) and agent (left-aligned) bubbles
- **User messages:** Compact, rounded-lg, max-w-md
- **Agent responses:** Full width, includes agent avatar/name badge
- **Artifact cards:** Distinct visual treatment - bordered, with file icon, title, timestamp, download action
- **File upload zone:** Drag-and-drop area with dashed border, appears on hover/focus
- **Input box:** Fixed at bottom with p-4 padding, shadow-lg elevation

### 3. Graph Canvas (Right Panel - 40%)
- **Container:** Rounded border, subtle shadow
- **Background:** Grid pattern (like React Flow default) for spatial reference
- **Agent Nodes:** Circular (96px diameter), with:
  - Agent name (text-sm font-semibold)
  - Status indicator (small badge: green=idle, orange=working, red=error, blue=done)
  - Progress ring during execution (subtle animated stroke)
- **Artifact Nodes:** Rectangular (120x80px), file-icon appearance:
  - File type icon (top)
  - Filename (text-xs, truncated)
  - Timestamp (text-xs)
- **Membranes/Zones:** Translucent rounded rectangles grouping multiple nodes
  - Glass-morphism effect (backdrop-blur, low opacity border)
  - Zone label (text-xs uppercase)
- **Connections:** Animated lines when data flows (use dashed stroke with CSS animation)
- **Expand button:** Top-right corner icon to overlay graph full-screen

### 4. Steering Controls (Below Graph)
**Context-sensitive:** Only appear when agent selected on canvas

- **XY Pad (Primary control):**
  - Square container (200x200px minimum)
  - Draggable puck (16px circle with shadow)
  - Dynamic axis labels based on agent type (text-xs on edges)
  - Crosshair guides (subtle lines)
  
- **Constraint Sliders (3-5 sliders):**
  - Horizontal range inputs with labels above
  - Value display on right (text-sm font-medium)
  - Examples: "Budget", "Recursion Depth", "Safety Level"
  
- **Tool Toggles:**
  - Switch components (Shadcn UI) in vertical list
  - Tool name + description (text-xs)

- **Vitals Display:**
  - "Context Fuel Gauge": Horizontal progress bar with percentage
  - "Cost Ticker": Running dollar amount (text-sm font-mono)

### 5. Omni-Console (Bottom Drawer)
- **Default state:** Collapsed (only header visible with expand icon)
- **Expanded height:** 40% of viewport
- **Tabs:** "Live Stream" | "Context Inspector" | "Decision Logs"
- **Live Stream content:**
  - Terminal-style output (font-mono, text-xs)
  - JSON syntax highlighting for decision objects
  - Timestamp prefix for each entry
  - Auto-scroll to bottom with "pause" button
- **Resize handle:** Draggable divider at top edge

---

## Visual Treatment

### Status Indicators
Use **badge components** with icons (HeroIcons):
- 🟢 Idle: `check-circle` 
- 🟠 Working: `arrow-path` (spinning animation)
- 🔴 Error: `exclamation-circle`
- 🔵 Complete: `check-badge`

### Animations
**Use sparingly and purposefully:**
- **Artifact spawn:** Scale from 0 to 1 with bounce easing (duration-300)
- **Agent pulse:** Gentle scale pulse (100% to 105%) when processing
- **Connection flow:** Dashed stroke offset animation for active data pipes
- **NO hover animations** - maintain static, professional appearance

### Spacing & Rhythm
- **Section padding:** py-8 px-6 (desktop), py-4 px-4 (mobile)
- **Card spacing:** gap-4 in flex/grid layouts
- **Message bubbles:** mb-3 between consecutive messages
- **Component internal padding:** p-4 standard, p-2 compact

---

## Accessibility
- **Focus states:** 2px ring with offset on all interactive elements
- **Keyboard navigation:** Tab order follows visual hierarchy (God Mode → Chat Input → Graph → Console)
- **Screen reader labels:** All icons have `aria-label` attributes
- **Contrast:** Maintain WCAG AA standards (4.5:1 for normal text)

---

## Images
**No hero images.** This is a functional dashboard interface, not a marketing page. All visual interest comes from:
- Agent/artifact node icons (use HeroIcons or Font Awesome via CDN)
- Graph visualization itself
- Terminal/console output styling

**Icon usage:**
- Agent avatars: Generic user/robot icons or initials in circle
- Artifacts: File type icons (document, code, data, image)
- Tools: Tool-specific icons (magnifying glass for search, code brackets for interpreter)

---

## Quality Notes
- **Cleanliness over flash:** Prefer well-spaced grids and clear typography to decorative gradients
- **Information density:** Pack data efficiently without cramping (comfortable whitespace)
- **Immediate clarity:** A judge should understand "what is happening" within 3 seconds of viewing
- **Hackathon-appropriate:** Polished enough to impress, pragmatic enough to ship fast