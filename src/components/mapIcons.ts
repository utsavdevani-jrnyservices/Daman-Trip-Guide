import type { IconType, Transport } from "../types";

const svg = (body: string, size = 20) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

const filled = (d: string, size = 24) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor"><path d="${d}"/></svg>`;

export const VEHICLE_SVG: Record<Transport, string> = {
  train: filled(
    "M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2.23l2-2H14l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-6H6V6h5v5zm5.5 6c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6h-5V6h5v5z",
  ),
  car: filled(
    "M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z",
  ),
  walk: filled(
    "M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7",
  ),
  scooter: filled(
    "M19 7c0-1.1-.9-2-2-2h-3v2h3v2.65L13.52 14H10V9H6c-2.21 0-4 1.79-4 4v3h2c0 1.66 1.34 3 3 3s3-1.34 3-3h4.48L19 10.35V7zM7 17c-.55 0-1-.45-1-1h2c0 .55-.45 1-1 1zM5 6h5v2H5zm14 7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z",
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

/** The stay: a permanent white house badge, independent of the day accent. */
export function stayElement(): HTMLElement {
  return el(`<div class="stay-core">${STOP_SVG.hostel}</div><div class="stay-label">Stay</div>`, "stay-wrap", "#ffffff");
}

/** Pin for a chosen decision (lunch / dinner). */
export function choiceElement(emoji: string, accent: string): HTMLElement {
  return el(`<div class="choice-bubble">${emoji}</div><div class="choice-tail"></div>`, "choice-wrap", accent);
}
