import type { LatLng, Step } from "../types";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  ITINERARY DATA
 *  Coordinates are [lat, lng]. Local pins are approximate — update to exact
 *  pins later. Train timings are from the published 12935 / 12936 timetable;
 *  each train step links to the live running status for the day.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Anchor points ────────────────────────────────────────────────────────────
export const ANDHERI_STATION: LatLng = [19.1197, 72.8464];
export const VAPI_STATION: LatLng = [20.3719, 72.9048];
export const MOUSTACHE_HOSTEL: LatLng = [20.4215, 72.8445];
export const NEARBY_BREAKFAST: LatLng = [20.4178, 72.8488];
export const NANI_DAMAN_FORT: LatLng = [20.4188, 72.8392];
export const MIRASOL_GARDEN: LatLng = [20.4475, 72.8545];
export const DEVKA_BEACH: LatLng = [20.4505, 72.8338];
export const NIGHT_MARKET: LatLng = [20.4172, 72.8427];
export const MOTI_DAMAN: LatLng = [20.3952, 72.8338];
export const JAMPORE_BEACH: LatLng = [20.3642, 72.8225];
export const SCOOTER_RETURN: LatLng = [20.4198, 72.8458];

// Western-line rail waypoints between Andheri and Vapi (rough track geometry).
const RAIL_NORTH: LatLng[] = [
  [19.229, 72.857], // Borivali
  [19.4559, 72.8111], // Virar
  [19.6967, 72.7644], // Palghar
  [19.98, 72.74], // Dahanu Road
  [20.2, 72.83], // Umbergaon
];
const RAIL_SOUTH: LatLng[] = [...RAIL_NORTH].reverse();

// Vapi → Nani Daman road waypoints.
const VAPI_TO_DAMAN: LatLng[] = [
  [20.38, 72.89],
  [20.399, 72.872],
  [20.412, 72.856],
];

// Crossing the Daman Ganga river via the bridge into Moti Daman.
const RIVER_CROSSING: LatLng[] = [
  [20.415, 72.849],
  [20.411, 72.8475], // bridge north end
  [20.4055, 72.844], // bridge south end
  [20.399, 72.838],
];

const TRAIN_OUT = { label: "Live status · 12935", url: "https://erail.in/train-enquiry/12935" };
const TRAIN_BACK = { label: "Live status · 12936", url: "https://erail.in/train-enquiry/12936" };

export const steps: Step[] = [
  // ── DAY 1 · NANI DAMAN ────────────────────────────────────────────────────
  {
    id: "andheri",
    day: 1,
    time: "6:30 AM",
    title: "Andheri Station",
    subtitle: "Meet-up point",
    warning:
      "Everyone must reach Andheri station before 6:30 AM, no matter what. The train leaves at 6:42 AM and will not wait.",
    description:
      "Train 12935, Bandra Terminus – Surat Intercity Superfast Express. It arrives at Andheri at 6:40 AM and departs at 6:42 AM. Check the live status on the morning for any delay.",
    coordinates: ANDHERI_STATION,
    iconType: "train",
    zoom: 13,
    actionLabel: "Board the train",
    links: [TRAIN_OUT],
  },
  {
    id: "vapi-arrive",
    day: 1,
    time: "9:02 AM",
    title: "Vapi Station",
    subtitle: "Get off here",
    description:
      "Scheduled arrival at Vapi is 9:02 AM. Walk out of the station and take a cab to Moustache Daman. It is about 30 to 40 minutes by road.",
    coordinates: VAPI_STATION,
    iconType: "train",
    transport: "train",
    route: RAIL_NORTH,
    legLabel: "2h 20m · 12935 Intercity SF",
    zoom: 14,
    actionLabel: "Take a cab to Moustache",
    links: [TRAIN_OUT],
  },
  {
    id: "moustache-arrive",
    day: 1,
    time: "9:45 AM",
    title: "Moustache Daman",
    subtitle: "Our stay in Nani Daman",
    description:
      "Check-in is at 12 PM, so there is a 30-minute buffer here to change and freshen up. Then decide how we do breakfast.",
    coordinates: MOUSTACHE_HOSTEL,
    iconType: "hostel",
    transport: "car",
    route: VAPI_TO_DAMAN,
    legLabel: "30–40 min · Cab",
    zoom: 15,
    actionLabel: "Continue",
    choices: {
      prompt: "Breakfast plan?",
      options: [
        {
          id: "nearby",
          label: "Nearest breakfast place",
          hint: "Walk there, eat, walk back · about 1 hour",
          coordinates: NEARBY_BREAKFAST,
          emoji: "🍽️",
        },
        {
          id: "cafe",
          label: "Moustache's own cafe",
          hint: "About 30 minutes",
          coordinates: MOUSTACHE_HOSTEL,
          emoji: "☕",
        },
        {
          id: "common",
          label: "Hang out in the common area",
          hint: "Order something if hungry · about 30 minutes",
          coordinates: MOUSTACHE_HOSTEL,
          emoji: "🛋️",
        },
        {
          id: "other",
          label: "Skip breakfast, do something else",
          hint: "Type what you'd rather do",
          coordinates: MOUSTACHE_HOSTEL,
          emoji: "✍️",
          freeText: true,
          freeTextPlaceholder: "e.g. walk along the jetty, sleep for an hour…",
        },
      ],
    },
  },
  {
    // Branches on the breakfast choice above.
    id: "breakfast",
    day: 1,
    time: "10:15 AM",
    title: "Breakfast",
    subtitle: "Moustache Daman",
    description: "Breakfast.",
    coordinates: MOUSTACHE_HOSTEL,
    iconType: "food",
    transport: "walk",
    zoom: 16,
    actionLabel: "Go to Nani Daman Fort",
    variantsFor: "moustache-arrive",
    variants: {
      nearby: {
        title: "Breakfast nearby",
        subtitle: "Nearest place to the stay",
        description:
          "Walk to the nearest breakfast place, eat, and walk back to Moustache. Plan about an hour in total. Back at the stay by around 11:15 AM.",
        coordinates: NEARBY_BREAKFAST,
        transport: "walk",
        legLabel: "~10 min walk",
        tips: ["10:15 – 11:15 AM"],
      },
      cafe: {
        title: "Breakfast at the cafe",
        subtitle: "Moustache's own cafe",
        description: "Breakfast at Moustache's cafe. About 30 minutes. Done by around 10:45 AM.",
        legLabel: "At the stay",
        tips: ["10:15 – 10:45 AM"],
      },
      common: {
        title: "Common area",
        subtitle: "Moustache Daman",
        description:
          "Hang out in the common area and order something for breakfast if anyone is hungry. About 30 minutes. Done by around 10:45 AM.",
        legLabel: "At the stay",
        tips: ["10:15 – 10:45 AM"],
      },
      other: {
        title: "Your plan",
        subtitle: "Instead of breakfast",
        description: "The group chose to skip breakfast and do this instead: {note}. Plan to be back at Moustache by around 11:15 AM.",
        legLabel: "At the stay",
        tips: ["10:15 – 11:15 AM"],
      },
    },
  },
  {
    id: "nani-fort",
    day: 1,
    time: "11:30 AM",
    title: "Nani Daman Fort",
    subtitle: "Fort of St. Jerome, next to the stay",
    description:
      "Explore the fort, which is right next to the stay. Before heading out, call the scooter rental and ask them to drop 3 scooters at Moustache while we are at the fort.",
    coordinates: NANI_DAMAN_FORT,
    iconType: "fort",
    transport: "walk",
    legLabel: "~500 m walk",
    zoom: 16,
    actionLabel: "Back for check-in",
    tips: ["Call scooter rental: 3 scooters to Moustache"],
  },
  {
    id: "checkin",
    day: 1,
    time: "12:30 PM",
    title: "Check-in",
    subtitle: "Moustache Daman · 12:30 – 1:30 PM",
    description: "Check in, move the bags to the room and take an hour to settle. Then pick where lunch happens.",
    coordinates: MOUSTACHE_HOSTEL,
    iconType: "checkin",
    transport: "walk",
    legLabel: "~500 m walk",
    zoom: 16,
    actionLabel: "Go to Mirasol",
    choices: {
      prompt: "Lunch plan?",
      options: [
        {
          id: "local",
          label: "Nearby local cafe",
          hint: "5 min walk · Daman thali and seafood",
          coordinates: [20.4232, 72.8468],
          emoji: "🍛",
        },
        {
          id: "hostel",
          label: "Eat at Moustache",
          hint: "No travel · order at the cafe",
          coordinates: MOUSTACHE_HOSTEL,
          emoji: "🏠",
        },
      ],
    },
  },
  {
    id: "mirasol",
    day: 1,
    time: "3:00 PM",
    title: "Mirasol Lake Garden",
    subtitle: "Afternoon",
    description:
      "An hour or two at Mirasol Lake Garden. Pedal boats, shaded seating and a small restaurant on the island. Ride the scooters there.",
    coordinates: MIRASOL_GARDEN,
    iconType: "garden",
    transport: "scooter",
    route: [
      [20.426, 72.842],
      [20.438, 72.85],
    ],
    legLabel: "15 min · Scooter",
    zoom: 15,
    actionLabel: "Go to Devka Beach",
  },
  {
    id: "devka",
    day: 1,
    time: "5:30 PM",
    title: "Devka Beach",
    subtitle: "Sunset",
    description:
      "Devka Beach for the sunset. Sunset is around 6 PM. Black sand, rocky pools and a long promenade. Decide on dinner here.",
    coordinates: DEVKA_BEACH,
    iconType: "beach",
    transport: "scooter",
    route: [[20.452, 72.844]],
    legLabel: "10 min · Scooter",
    zoom: 15,
    actionLabel: "Go to the night market",
    choices: {
      prompt: "Dinner plan?",
      options: [
        {
          id: "seaview",
          label: "Sea-view restaurant",
          hint: "Sit-down · seafood on the promenade",
          coordinates: [20.4538, 72.8325],
          emoji: "🦐",
        },
        {
          id: "street",
          label: "Street food along the beach",
          hint: "Bhajiya, chaat, ice gola",
          coordinates: [20.4488, 72.8352],
          emoji: "🌮",
        },
      ],
    },
  },
  {
    id: "night-market",
    day: 1,
    time: "8:30 PM",
    title: "Night Market",
    subtitle: "Nani Daman bazaar",
    description:
      "Walk through the Nani Daman night market, then head back to Moustache to hang out in the common area, play games and sleep.",
    coordinates: NIGHT_MARKET,
    iconType: "market",
    transport: "scooter",
    route: [
      [20.44, 72.84],
      [20.428, 72.8415],
    ],
    legLabel: "15 min · Scooter",
    zoom: 16,
    actionLabel: "End of Day 1",
  },

  // ── DAY 2 · MOTI DAMAN ────────────────────────────────────────────────────
  {
    id: "day2-start",
    day: 2,
    time: "9:00 AM",
    title: "Breakfast & Scooters",
    subtitle: "Moustache Daman",
    description:
      "Breakfast at the stay, then take the 3 scooters out for the day. The rental has a strict 24-hour limit, so they must be back before we leave for the evening train.",
    coordinates: MOUSTACHE_HOSTEL,
    iconType: "scooter",
    transport: "walk",
    legLabel: "Short walk",
    zoom: 16,
    actionLabel: "Ride to Moti Daman",
    tips: ["Return scooters by 3:30 PM", "2 per scooter, helmets on"],
  },
  {
    id: "moti-daman",
    day: 2,
    time: "10:30 AM",
    title: "Moti Daman",
    subtitle: "Portuguese colony",
    description:
      "Cross the river into Moti Daman. Moti Daman Fort, Bom Jesus Church and the lighthouse are all within a short walk of each other. Quiet area, good for photos. Decide on lunch here.",
    coordinates: MOTI_DAMAN,
    iconType: "church",
    transport: "scooter",
    route: RIVER_CROSSING,
    legLabel: "15 min · Scooter, over the bridge",
    zoom: 15,
    actionLabel: "Go to Jampore Beach",
    choices: {
      prompt: "Lunch plan?",
      options: [
        {
          id: "goan",
          label: "Goan / seafood",
          hint: "Fish thali, prawn curry",
          coordinates: [20.3968, 72.836],
          emoji: "🐟",
        },
        {
          id: "veg",
          label: "Pure veg / cafe",
          hint: "Lighter food, AC",
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
    subtitle: "Afternoon",
    description: "A slow afternoon at Jampore Beach under the trees. Leave by 3 PM to return the scooters on time.",
    coordinates: JAMPORE_BEACH,
    iconType: "beach",
    transport: "scooter",
    route: [
      [20.388, 72.83],
      [20.376, 72.825],
    ],
    legLabel: "10 min · Scooter",
    zoom: 15,
    actionLabel: "Wrap up",
    tips: ["Leave by 3:00 PM"],
  },
  {
    id: "wrap-up",
    day: 2,
    time: "3:30 PM",
    title: "Wrap Up",
    subtitle: "Back in Nani Daman",
    description: "Return the 3 scooters, collect the bags from Moustache and take a cab to Vapi station.",
    coordinates: SCOOTER_RETURN,
    iconType: "flag",
    transport: "scooter",
    route: [
      [20.376, 72.825],
      [20.388, 72.83],
      [20.399, 72.838],
      [20.4055, 72.844],
      [20.411, 72.8475],
      [20.415, 72.849],
    ],
    legLabel: "25 min · Scooter",
    zoom: 16,
    actionLabel: "Cab to Vapi Station",
    tips: ["Fuel top-up before return"],
  },
  {
    id: "vapi-depart",
    day: 2,
    time: "5:00 PM",
    title: "Vapi Station",
    subtitle: "Return train",
    description:
      "Train 12936, Surat – Bandra Terminus Intercity Superfast Express. It departs Vapi at 5:40 PM and reaches Andheri at 8:08 PM. Be at the station by 5:00 PM and check the live status for delays.",
    coordinates: VAPI_STATION,
    iconType: "train",
    transport: "car",
    route: [...VAPI_TO_DAMAN].reverse(),
    legLabel: "30–40 min · Cab",
    zoom: 14,
    actionLabel: "Board the train",
    links: [TRAIN_BACK],
  },
  {
    id: "home",
    day: 2,
    time: "8:08 PM",
    title: "Andheri Station",
    subtitle: "Trip complete",
    description: "Scheduled arrival at Andheri is 8:08 PM. Here is the plan the group picked.",
    coordinates: ANDHERI_STATION,
    iconType: "home",
    transport: "train",
    route: RAIL_SOUTH,
    legLabel: "2h 30m · 12936 Intercity SF",
    zoom: 13,
    actionLabel: "Start over",
    links: [TRAIN_BACK],
  },
];

export const DAY_META = {
  1: { label: "Day 1", name: "Nani Daman", accent: "sun" as const },
  2: { label: "Day 2", name: "Moti Daman", accent: "sea" as const },
};
