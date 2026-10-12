# Daman Trip Guide

A mobile-first, map-driven "faceless tour guide" for a 2-day / 1-night group trip from Mumbai to Daman.
The itinerary is a step-by-step wizard laid over a full-screen dark map: every **Next** flies the camera
to the next stop, draws the route line, and animates a train / cab / walker / scooter along it.

**Stack:** React 18 · TypeScript · Vite · Tailwind CSS · Framer Motion · MapLibre GL (free OpenFreeMap vector tiles, no API key).

## Run it

```bash
npm install
npm run dev        # http://localhost:5173  (add --host to open on your phone over Wi-Fi)
npm run build      # typecheck + production build into dist/
npm run preview    # serve the production build
```

Open it on a phone, or on a desktop browser where it renders inside a phone-sized frame (the UI is mobile-only by design).

## Edit the itinerary

Everything lives in `src/data/itinerary.ts` — the `steps` array. Each step:

```ts
{
  id: "devka",
  day: 1,
  time: "5:45 PM",
  title: "Devka Beach",
  subtitle: "Golden hour",
  description: "Head to Devka Beach to watch the sunset…",
  coordinates: [20.4505, 72.8338],   // [lat, lng] — placeholder, update to the exact pin
  iconType: "beach",                  // pin icon (see src/types.ts for the list)
  transport: "car",                   // how the group travels TO this step: train | car | walk | scooter
  route: [[20.4520, 72.8440]],        // optional intermediate waypoints for the drawn line
  legLabel: "10 min · Auto",          // shown while en route
  zoom: 15,                           // camera zoom when the stop is reached
  actionLabel: "Night Market",        // the primary button text
  tips: ["Pedal boats ~₹100"],        // optional chips
  choices: {                          // optional decision path → drops a pin for the chosen option
    prompt: "Dinner plan?",
    options: [
      { id: "seaview", label: "Sea-view restaurant", hint: "…", coordinates: [20.4538, 72.8325], emoji: "🦐" },
      { id: "street",  label: "Street food crawl",   hint: "…", coordinates: [20.4488, 72.8352], emoji: "🌮" },
    ],
  },
}
```

All coordinates are **approximate placeholders** so the map reads correctly; swap in exact pins from Google Maps
(right-click → copy coordinates, they're already `[lat, lng]`). A chosen option becomes the start point of the next leg.

Day accent colours (amber for Day 1, teal for Day 2) are set in `src/App.tsx` and `src/components/MapView.tsx`.

## Map style

`src/lib/mapTheme.ts` loads OpenFreeMap's `fiord` style and re-tones it into the app's ink palette.
Swap `STYLE_URL` for `https://tiles.openfreemap.org/styles/positron` (light) or any MapLibre style JSON.
Attribution: © OpenStreetMap contributors · © OpenMapTiles · OpenFreeMap (shown in the itinerary sheet).

## Deploy

A GitHub Pages workflow is included (`.github/workflows/deploy.yml`). Enable **Settings → Pages → Source: GitHub Actions**
once; every push to `main` builds and deploys. For Vercel / Netlify just point them at the repo — build command
`npm run build`, output `dist`.

## How it works

- `src/hooks/useItinerary.ts` — the state machine (reducer): `stepIndex`, `choices`, `phase` (`idle` | `traveling`). Progress is persisted to `localStorage`.
- `src/components/MapView.tsx` — MapLibre map. On each step change it fits the leg top-down, animates the line + vehicle with `requestAnimationFrame`, then `flyTo`s into the stop with a 48° pitch.
- `src/components/GuideSheet.tsx` — the glass bottom-sheet wizard (Framer Motion `AnimatePresence` transitions, decision options, Back/Next).
- `src/components/Timeline.tsx` — full itinerary overlay; jump back to any visited stop, restart the trip.
- `src/lib/geo.ts` — haversine, point-along-path and partial-path helpers used for the animation.
