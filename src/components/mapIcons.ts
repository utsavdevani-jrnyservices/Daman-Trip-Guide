import type { IconType, Transport } from "../types";

const svg = (body: string, size = 20) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

export const VEHICLE_SVG: Record<Transport, string> = {
  train: svg(
    `<rect x="4" y="3" width="16" height="14" rx="3"/><path d="M4 11h16"/><path d="M12 3v8"/><circle cx="8.5" cy="14.5" r="1" fill="currentColor"/><circle cx="15.5" cy="14.5" r="1" fill="currentColor"/><path d="M8 19l-2 3M16 19l2 3"/>`,
    22,
  ),
  car: svg(
    `<path d="M5 17h14"/><path d="M3 11l2-5h14l2 5"/><rect x="3" y="11" width="18" height="6" rx="2"/><circle cx="7.5" cy="17" r="1.6" fill="currentColor"/><circle cx="16.5" cy="17" r="1.6" fill="currentColor"/>`,
    22,
  ),
  walk: svg(
    `<circle cx="13" cy="4" r="1.8" fill="currentColor"/><path d="M11 20l1.5-6 2.5 2v4"/><path d="M8 13l2-5 3 1 2.5 3 2.5 1"/><path d="M8 13l-2 7"/>`,
    22,
  ),
  scooter: svg(
    `<circle cx="5" cy="17" r="2.5"/><circle cx="19" cy="17" r="2.5"/><path d="M7.5 17h6l2-7h3"/><path d="M15 6h3l1.5 4"/><path d="M13 10l-3 7"/>`,
    22,
  ),
};

export const STOP_SVG: Record<IconType, string> = {
  train: VEHICLE_SVG.train,
  car: VEHICLE_SVG.car,
  scooter: VEHICLE_SVG.scooter,
  hostel: svg(`<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>`),
  food: svg(`<path d="M7 3v8"/><path d="M4 3v5a3 3 0 0 0 6 0V3"/><path d="M17 3c-2 0-3 2-3 5v3h3v10"/><path d="M7 11v10"/>`),
  checkin: svg(`<path d="M5 3h10l4 4v14H5z"/><path d="M9 14l2 2 4-4"/>`),
  fort: svg(`<path d="M4 21V9l2-2 2 2 2-2 2 2 2-2 2 2 2-2 2 2v12"/><path d="M10 21v-5h4v5"/>`),
  garden: svg(`<path d="M12 22V12"/><path d="M12 12c-4 0-7-3-7-7 4 0 7 3 7 7z"/><path d="M12 12c4 0 7-3 7-7-4 0-7 3-7 7z"/>`),
  beach: svg(`<path d="M3 20h18"/><path d="M5 17c2-2 4-2 6 0s4 2 6 0"/><circle cx="17" cy="7" r="3"/><path d="M4 12c3-5 7-6 12-4"/>`),
  market: svg(`<path d="M4 9l1-5h14l1 5"/><path d="M4 9h16v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M6 14v7h12v-7"/><path d="M10 21v-4h4v4"/>`),
  church: svg(`<path d="M12 2v5"/><path d="M10 4h4"/><path d="M6 21V12l6-5 6 5v9"/><path d="M10 21v-5h4v5"/><path d="M3 21h18"/>`),
  flag: svg(`<path d="M5 22V3"/><path d="M5 4h12l-2 4 2 4H5"/>`),
  home: svg(`<path d="M3 11l9-8 9 8"/><path d="M5 10v11h5v-6h4v6h5V10"/>`),
};

export const VEHICLE_LABEL: Record<Transport, string> = {
  train: "Train",
  car: "Cab",
  walk: "Walk",
  scooter: "Scooter",
};

function el(html: string, className: string, accent: string): HTMLElement {
  const d = document.createElement("div");
  d.className = className;
  d.style.setProperty("--accent", accent);
  d.innerHTML = html;
  return d;
}

/** Moving vehicle marker element. */
export function vehicleElement(transport: Transport, accent: string): HTMLElement {
  return el(`<div class="vehicle-core">${VEHICLE_SVG[transport]}</div>`, "vehicle-wrap", accent);
}

/** Numbered / iconified stop marker element. */
export function stopElement(opts: {
  index: number;
  iconType: IconType;
  state: "visited" | "current";
  accent: string;
}): HTMLElement {
  const { index, iconType, state, accent } = opts;
  const inner =
    state === "current"
      ? `<span class="stop-ring"></span><span class="stop-ring stop-ring-2"></span><div class="stop-core">${STOP_SVG[iconType]}</div>`
      : `<div class="stop-core"><span class="stop-num">${index + 1}</span></div>`;
  return el(inner, `stop-wrap stop-${state}`, accent);
}

/** Pin for a chosen decision (lunch / dinner). */
export function choiceElement(emoji: string, accent: string): HTMLElement {
  return el(`<div class="choice-bubble">${emoji}</div><div class="choice-tail"></div>`, "choice-wrap", accent);
}
