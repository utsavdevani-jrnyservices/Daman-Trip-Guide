import type { LatLng, Step } from "../types";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  ITINERARY DATA
 *  All coordinates are [lat, lng] PLACEHOLDERS — approximate real-world
 *  positions so the map looks right. Update them to exact pins later.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Anchor points ────────────────────────────────────────────────────────────
export const ANDHERI_STATION: LatLng = [19.1197, 72.8464];
export const VAPI_STATION: LatLng = [20.3719, 72.9048];
export const MOUSTACHE_HOSTEL: LatLng = [20.4215, 72.8445];
export const JALARAM_KHAMAN: LatLng = [20.4178, 72.8488];
export const NANI_DAMAN_FORT: LatLng = [20.4188, 72.8392];
export const MIRASOL_GARDEN: LatLng = [20.4475, 72.8545];
export const DEVKA_BEACH: LatLng = [20.4505, 72.8338];
export const NIGHT_MARKET: LatLng = [20.4172, 72.8427];
export const MOTI_DAMAN: LatLng = [20.3952, 72.8338];
export const JAMPORE_BEACH: LatLng = [20.3642, 72.8225];
export const SCOOTER_RETURN: LatLng = [20.4198, 72.8458];

// Western-line rail waypoints between Andheri and Vapi (rough track geometry).
const RAIL_NORTH: LatLng[] = [
  [19.2290, 72.8570], // Borivali
  [19.4559, 72.8111], // Virar
  [19.6967, 72.7644], // Palghar
  [19.9800, 72.7400], // Dahanu Road
  [20.2000, 72.8300], // Umbergaon
];
const RAIL_SOUTH: LatLng[] = [...RAIL_NORTH].reverse();

// Vapi → Nani Daman road (NH-848B-ish) waypoints.
const VAPI_TO_DAMAN: LatLng[] = [
  [20.3800, 72.8900],
  [20.3990, 72.8720],
  [20.4120, 72.8560],
];

// Crossing the Daman Ganga river via the bridge into Moti Daman.
const RIVER_CROSSING: LatLng[] = [
  [20.4150, 72.8490],
  [20.4110, 72.8475], // bridge north end
  [20.4055, 72.8440], // bridge south end
  [20.3990, 72.8380],
];

export const steps: Step[] = [
  // ── DAY 1 · NANI DAMAN ────────────────────────────────────────────────────
  {
    id: "andheri",
    day: 1,
    time: "6:30 AM",
    title: "Andheri Station",
    subtitle: "Where it all begins",
    description:
      "Meet up by 6:30 AM at Andheri Station. The train departs at 6:42 AM — grab a window seat, the coast rolls by on the left.",
    coordinates: ANDHERI_STATION,
    iconType: "train",
    zoom: 13,
    actionLabel: "Start Journey",
    tips: ["Platform tickets ready", "Carry water + snacks", "Group of 6 — count heads!"],
  },
  {
    id: "vapi-arrive",
    day: 1,
    time: "9:00 AM",
    title: "Vapi Station",
    subtitle: "Gateway to Daman",
    description:
      "Arrive at Vapi around 9:00 AM. Walk out of the station and grab a cab to Nani Daman — about 30 minutes.",
    coordinates: VAPI_STATION,
    iconType: "train",
    transport: "train",
    route: RAIL_NORTH,
    legLabel: "2h 20m · Western Line",
    zoom: 14,
    actionLabel: "Take Cab to Stay",
    tips: ["Prepaid cabs outside exit", "Agree on fare upfront"],
  },
  {
    id: "hostel-dropoff",
    day: 1,
    time: "9:45 AM",
    title: "Moustache Daman",
    subtitle: "Our hostel in Nani Daman",
    description:
      "Drop off the luggage at the stay — check-in is later, but they'll hold the bags. Now, let's get breakfast. It's a 750 m stroll.",
    coordinates: MOUSTACHE_HOSTEL,
    iconType: "hostel",
    transport: "car",
    route: VAPI_TO_DAMAN,
    legLabel: "30 min · Cab",
    zoom: 15,
    actionLabel: "Walk to Breakfast",
    tips: ["Bags stay at reception", "Freshen up quickly"],
  },
  {
    id: "jalaram",
    day: 1,
    time: "10:15 AM",
    title: "Jalaram Khaman House",
    subtitle: "Breakfast time!",
    description:
      "Soft khaman, hot jalebi and chai. Take it slow — this is a relaxed trip, there's no rush to be anywhere.",
    coordinates: JALARAM_KHAMAN,
    iconType: "food",
    transport: "walk",
    legLabel: "750 m · 10 min walk",
    zoom: 16,
    actionLabel: "Walk back to stay",
    tips: ["Try the khaman + sev", "Cash is handy here"],
  },
  {
    id: "checkin",
    day: 1,
    time: "12:00 PM",
    title: "Check-in",
    subtitle: "Moustache Daman · 12–1 PM",
    description:
      "Check-in time! You have one hour to freshen up and change. Then pick where the group eats lunch.",
    coordinates: MOUSTACHE_HOSTEL,
    iconType: "checkin",
    transport: "walk",
    legLabel: "750 m · 10 min walk",
    zoom: 16,
    actionLabel: "Head to the Fort",
    choices: {
      prompt: "Where's lunch?",
      options: [
        {
          id: "cafe",
          label: "Nearby local cafe",
          hint: "5 min walk · Daman thali & seafood",
          coordinates: [20.4232, 72.8468],
          emoji: "🍛",
        },
        {
          id: "hostel",
          label: "Eat at the hostel",
          hint: "Zero effort · chill on the terrace",
          coordinates: MOUSTACHE_HOSTEL,
          emoji: "🏠",
        },
      ],
    },
  },
  {
    id: "nani-fort",
    day: 1,
    time: "2:00 PM",
    title: "Nani Daman Fort",
    subtitle: "Fort of St. Jerome",
    description:
      "Explore the fort right next to the stay. Walk the ramparts, peek into the old church and watch the fishing boats on the Daman Ganga.",
    coordinates: NANI_DAMAN_FORT,
    iconType: "fort",
    transport: "walk",
    legLabel: "~500 m · stroll",
    zoom: 16,
    actionLabel: "Go to Mirasol",
    tips: ["Great photo spots on the walls", "Sunscreen!"],
  },
  {
    id: "mirasol",
    day: 1,
    time: "3:30 PM",
    title: "Mirasol Lake Garden",
    subtitle: "Slow afternoon",
    description:
      "Spend a relaxing hour or two in the gardens. Pedal boats, shaded benches and a small island restaurant for a cold drink.",
    coordinates: MIRASOL_GARDEN,
    iconType: "garden",
    transport: "car",
    route: [
      [20.4260, 72.8420],
      [20.4380, 72.8500],
    ],
    legLabel: "15 min · Auto",
    zoom: 15,
    actionLabel: "Catch the Sunset",
    tips: ["Pedal boats ~₹100", "Entry is cheap"],
  },
  {
    id: "devka",
    day: 1,
    time: "5:45 PM",
    title: "Devka Beach",
    subtitle: "Golden hour",
    description:
      "Head to Devka Beach to watch the sunset. Black sand, rocky pools and a long promenade — then decide on dinner.",
    coordinates: DEVKA_BEACH,
    iconType: "beach",
    transport: "car",
    route: [[20.4520, 72.8440]],
    legLabel: "10 min · Auto",
    zoom: 15,
    actionLabel: "Night Market",
    choices: {
      prompt: "Dinner plan?",
      options: [
        {
          id: "seaview",
          label: "Sea-view restaurant",
          hint: "Sit-down · seafood & cocktails on the promenade",
          coordinates: [20.4538, 72.8325],
          emoji: "🦐",
        },
        {
          id: "street",
          label: "Street food crawl",
          hint: "Bhajiya, chaat & ice gola along the beach",
          coordinates: [20.4488, 72.8352],
          emoji: "🌮",
        },
      ],
    },
  },
  {
    id: "night-market",
    day: 1,
    time: "9:00 PM",
    title: "Night Market & Sleep",
    subtitle: "Nani Daman bazaar",
    description:
      "Roam the Nani Daman night market, then head back to Moustache to hang out, play games and sleep. Big day tomorrow.",
    coordinates: NIGHT_MARKET,
    iconType: "market",
    transport: "car",
    route: [
      [20.4400, 72.8400],
      [20.4280, 72.8415],
    ],
    legLabel: "15 min · Auto",
    zoom: 16,
    actionLabel: "Good night 🌙",
    tips: ["Common room has board games", "Lights out by midnight-ish"],
  },

  // ── DAY 2 · MOTI DAMAN ────────────────────────────────────────────────────
  {
    id: "scooters",
    day: 2,
    time: "9:00 AM",
    title: "Breakfast & Scooters",
    subtitle: "Moustache Daman",
    description:
      "Easy breakfast at the hostel, then rent 3 scooters for the group. NOTE: there is a strict 24-hour limit to return them before the evening train.",
    coordinates: MOUSTACHE_HOSTEL,
    iconType: "scooter",
    transport: "walk",
    legLabel: "Short walk",
    zoom: 16,
    actionLabel: "Ride to Moti Daman",
    tips: ["3 scooters · 2 per bike", "Helmets on", "Return before 3:30 PM"],
  },
  {
    id: "moti-daman",
    day: 2,
    time: "10:30 AM",
    title: "Moti Daman",
    subtitle: "Portuguese colony",
    description:
      "Cross the river into Moti Daman. Explore the Fort, Bom Jesus Church and the Lighthouse. Very peaceful, great for photos — then lunch.",
    coordinates: MOTI_DAMAN,
    iconType: "church",
    transport: "scooter",
    route: RIVER_CROSSING,
    legLabel: "15 min · Scooter over the bridge",
    zoom: 15,
    actionLabel: "Beach Time",
    choices: {
      prompt: "Lunch in Moti Daman?",
      options: [
        {
          id: "goan",
          label: "Goan / Seafood specialty",
          hint: "Fish thali, prawn curry, feni on the side",
          coordinates: [20.3968, 72.8360],
          emoji: "🐟",
        },
        {
          id: "veg",
          label: "Pure Veg / Cafe",
          hint: "Light bites, coffee, AC",
          coordinates: [20.3935, 72.8372],
          emoji: "🥗",
        },
      ],
    },
  },
  {
    id: "jampore",
    day: 2,
    time: "1:30 PM",
    title: "Jampore Beach",
    subtitle: "Lazy afternoon",
    description:
      "Relaxing afternoon at Jampore Beach under the casuarina trees. Hammocks, coconut water and a long, calm shoreline.",
    coordinates: JAMPORE_BEACH,
    iconType: "beach",
    transport: "scooter",
    route: [
      [20.3880, 72.8300],
      [20.3760, 72.8250],
    ],
    legLabel: "10 min · Scooter",
    zoom: 15,
    actionLabel: "Wrap Up",
    tips: ["Camel rides on the sand", "Keep an eye on the clock ⏱"],
  },
  {
    id: "wrap-up",
    day: 2,
    time: "3:30 PM",
    title: "Wrap Up",
    subtitle: "Back in Nani Daman",
    description:
      "Return the 3 scooters in Nani Daman, collect the bags from Moustache and grab a cab to Vapi.",
    coordinates: SCOOTER_RETURN,
    iconType: "flag",
    transport: "scooter",
    route: [
      [20.3760, 72.8250],
      [20.3880, 72.8300],
      [20.3990, 72.8380],
      [20.4055, 72.8440],
      [20.4110, 72.8475],
      [20.4150, 72.8490],
    ],
    legLabel: "25 min · Scooter",
    zoom: 16,
    actionLabel: "Head to Vapi Station",
    tips: ["Fuel top-up before return", "Count the helmets"],
  },
  {
    id: "vapi-depart",
    day: 2,
    time: "5:00 PM",
    title: "Vapi Station",
    subtitle: "Homeward bound",
    description:
      "Board the 5:00 PM train back to Mumbai. Window seats, playlists on, and one last look at the coast.",
    coordinates: VAPI_STATION,
    iconType: "train",
    transport: "car",
    route: [...VAPI_TO_DAMAN].reverse(),
    legLabel: "30 min · Cab",
    zoom: 14,
    actionLabel: "Ride Home",
  },
  {
    id: "home",
    day: 2,
    time: "7:30 PM",
    title: "Back in Mumbai",
    subtitle: "Andheri Station",
    description:
      "Trip complete. 2 days, 1 night, 6 friends, zero stress. Until the next one.",
    coordinates: ANDHERI_STATION,
    iconType: "home",
    transport: "train",
    route: RAIL_SOUTH,
    legLabel: "2h 20m · Western Line",
    zoom: 13,
    actionLabel: "Restart Trip",
  },
];

export const DAY_META = {
  1: { label: "Day 1", name: "Nani Daman", accent: "sun" as const },
  2: { label: "Day 2", name: "Moti Daman", accent: "sea" as const },
};
