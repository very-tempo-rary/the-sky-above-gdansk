# The sky above Gdańsk — project rules

## On every session resume
At the start of every conversation (including resuming from compaction), do the following without being asked:
1. Start the dev server if it isn't already running (`npm run dev` in the project root, background).
2. Take a preview screenshot with the preview MCP tools and display it.

## Stack
- Vite + React 19 + TypeScript
- GSAP + ScrollTrigger for all animation
- CSS Modules (no Tailwind)
- Assets live in `assets/` (outside `src/`), aliased as `@assets`

## Key files
- `src/sections/Frame1.tsx` — intro screen, custom bird cursor
- `src/sections/Frame2.tsx` — main scroll timeline
- `src/sections/BirdsLayer.tsx` — animated bird silhouettes
- `src/utils/cursorStore.ts` — shared cursor state between Frame1 and BirdsLayer

## Dev server
`npm run dev` — runs on http://localhost:5173
