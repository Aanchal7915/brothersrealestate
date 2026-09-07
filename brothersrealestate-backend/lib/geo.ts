/**
 * Coordinates as reported by the browser Geolocation API.
 *
 * These arrive in the request body and are therefore self-reported: a caller
 * driving the API directly can send any numbers they like. They are still
 * worth requiring and recording — combined with the server-derived IP they
 * make a forged entry obvious (coordinates in one country, IP in another),
 * and they defeat the casual case entirely. Treat them as evidence, not
 * proof.
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/** Returns the coordinates when the payload is a usable fix, else null. */
export function parseCoordinates(raw: unknown): Coordinates | null {
  if (!raw || typeof raw !== "object") return null;

  const { latitude, longitude, accuracy } = raw as Record<string, unknown>;

  if (!isFiniteNumber(latitude) || !isFiniteNumber(longitude)) return null;
  if (latitude < -90 || latitude > 90) return null;
  if (longitude < -180 || longitude > 180) return null;
  // 0,0 is in the Atlantic — in practice it means "the client sent an empty
  // object", not a real fix.
  if (latitude === 0 && longitude === 0) return null;

  return {
    latitude,
    longitude,
    accuracy: isFiniteNumber(accuracy) && accuracy >= 0 ? accuracy : null,
  };
}

/** A plain maps link, so an alert email needs no API key to be actionable. */
export function mapsUrl(coords: Coordinates): string {
  return `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`;
}

/** Compact label for the history table, e.g. "28.45832, 77.02631 (±32 m)". */
export function formatLocation(coords: Coordinates): string {
  const base = `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`;
  return coords.accuracy === null ? base : `${base} (±${Math.round(coords.accuracy)} m)`;
}
