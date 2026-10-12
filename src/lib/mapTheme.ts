import type maplibregl from "maplibre-gl";

/**
 * Free, key-less vector basemap from OpenFreeMap (OpenMapTiles schema).
 * "fiord" is their dark style; we re-tone it below into the app's ink palette.
 * Alternatives: https://tiles.openfreemap.org/styles/positron (light) · /liberty · /bright
 */
export const STYLE_URL = "https://tiles.openfreemap.org/styles/fiord";

const INK = "#0b0f16";
const LAND = "#101620";
const WATER = "#070b11";

type Paint = Record<string, unknown>;

/** Per-layer paint overrides, keyed by the layer ids in the fiord style. */
const OVERRIDES: Record<string, Paint> = {
  background: { "background-color": LAND },
  water: { "fill-color": WATER },
  waterway: { "line-color": "#0d1522" },
  landuse_residential: { "fill-color": "#141b26" },
  landcover_wood: { "fill-color": "#0f1a18", "fill-opacity": 0.55 },
  landcover_ice_shelf: { "fill-color": LAND },
  park: { "fill-color": "#12231f", "fill-opacity": 0.5 },
  park_outline: { "line-color": "#1b3a33", "line-opacity": 0.6 },
  building: { "fill-color": "#1a2230", "fill-opacity": 0.5 },
  highway_path: { "line-color": "#1d2633" },
  highway_minor: { "line-color": "#202a38" },
  highway_major_casing: { "line-color": INK },
  highway_major_inner: { "line-color": "#2b3647" },
  highway_major_subtle: { "line-color": "#202a38" },
  highway_motorway_casing: { "line-color": INK },
  highway_motorway_inner: { "line-color": "#36435a" },
  highway_motorway_subtle: { "line-color": "#2b3647" },
  tunnel_motorway_casing: { "line-color": INK },
  tunnel_motorway_inner: { "line-color": "#242e3d" },
  railway: { "line-color": "#3a4558" },
  railway_dashline: { "line-color": INK },
  railway_transit: { "line-color": "#2e3848" },
  railway_transit_dashline: { "line-color": INK },
  railway_service: { "line-color": "#2a3444" },
  railway_service_dashline: { "line-color": INK },
  "aeroway-runway": { "line-color": "#1f2835" },
  "aeroway-taxiway": { "line-color": "#1a222e" },
  "aeroway-area": { "fill-color": "#141b26" },
  "aeroway-runway-casing": { "line-color": INK },
  road_pier: { "line-color": "#1d2633" },
  road_area_pier: { "fill-color": "#1d2633" },
  boundary_state: { "line-color": "#283347" },
  "boundary_country_z0-4": { "line-color": "#2d3a52" },
  "boundary_country_z5-": { "line-color": "#2d3a52" },
};

const LABEL_TEXT = "#aebbcf";
const LABEL_HALO = "rgba(11,15,22,0.9)";

/** Apply the ink theme to the loaded style. Safe to call once after `style.load`. */
export function applyInkTheme(map: maplibregl.Map) {
  const style = map.getStyle();
  if (!style?.layers) return;
  for (const layer of style.layers) {
    const paint = OVERRIDES[layer.id];
    if (paint) {
      for (const [k, v] of Object.entries(paint)) {
        try {
          map.setPaintProperty(layer.id, k, v);
        } catch {
          /* property not valid for this layer version — ignore */
        }
      }
    }
    if (layer.type === "symbol") {
      try {
        const isRoad = layer.id.startsWith("highway");
        const isWater = layer.id === "water_name";
        map.setPaintProperty(layer.id, "text-color", isWater ? "#3b5473" : isRoad ? "#6f7f96" : LABEL_TEXT);
        map.setPaintProperty(layer.id, "text-halo-color", LABEL_HALO);
        map.setPaintProperty(layer.id, "text-halo-width", 1.2);
        map.setPaintProperty(layer.id, "text-opacity", isRoad ? 0.85 : 0.95);
      } catch {
        /* ignore */
      }
    }
  }
}

/** The first symbol layer id — used to insert our route lines beneath the labels. */
export function firstSymbolLayer(map: maplibregl.Map): string | undefined {
  return map.getStyle()?.layers?.find((l) => l.type === "symbol")?.id;
}
