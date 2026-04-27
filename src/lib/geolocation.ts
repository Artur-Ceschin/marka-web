export type LocationInfo = { lat: number; lng: number; place: string };

type NominatimResponse = {
  display_name?: string;
  address?: Record<string, string>;
};

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const fallback = `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) return fallback;
    const data: NominatimResponse = await res.json();
    const a = data.address ?? {};
    const short = [a.city ?? a.town ?? a.village ?? a.suburb, a.state, a.country]
      .filter(Boolean)
      .join(", ");
    return short || data.display_name || fallback;
  } catch {
    return fallback;
  }
}

export function getCurrentLocation(): Promise<LocationInfo | null> {
  if (typeof window === "undefined" || !("geolocation" in navigator)) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const place = await reverseGeocode(lat, lng);
        resolve({ lat, lng, place });
      },
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    );
  });
}
