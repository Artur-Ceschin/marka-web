"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { IoLocationOutline, IoWarningOutline, IoSearchOutline } from "react-icons/io5";
import type { LocationInfo } from "@/lib/geolocation";
import { explore } from "@/lib/api";
import { NearbyCard } from "./_components/NearbyCard";
import { PlantDetailPanel } from "./_components/PlantDetailPanel";
import styles from "./page.module.scss";

type LocationState =
  | { status: "checking" }
  | { status: "prompt" }
  | { status: "requesting" }
  | { status: "blocked" } // GPS failed — show city fallback
  | { status: "ready"; info: LocationInfo };

const RADIUS_OPTIONS = [5, 10, 25, 50];

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) return `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
    const data = await res.json();
    const a = data.address ?? {};
    return (
      [a.city ?? a.town ?? a.village ?? a.suburb, a.state, a.country].filter(Boolean).join(", ") ||
      data.display_name ||
      `${lat.toFixed(3)}, ${lng.toFixed(3)}`
    );
  } catch {
    return `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
  }
}

async function geocodeCity(city: string): Promise<LocationInfo | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) return null;
    const [hit] = await res.json();
    if (!hit) return null;
    return {
      lat: parseFloat(hit.lat),
      lng: parseFloat(hit.lon),
      place: hit.display_name.split(",").slice(0, 2).join(", "),
    };
  } catch {
    return null;
  }
}

function fetchPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 10_000,
      maximumAge: 0,
    }),
  );
}

export default function ExplorePage() {
  const [location, setLocation] = useState<LocationState>({ status: "checking" });
  const [radius, setRadius] = useState(10);
  const [selectedPlant, setSelectedPlant] = useState<import("@/lib/api").NearbyPlant | null>(null);
  const [city, setCity] = useState("");
  const [cityError, setCityError] = useState("");
  const [cityLoading, setCityLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setLocation({ status: "blocked" });
      return;
    }
    if (!("permissions" in navigator)) {
      setLocation({ status: "prompt" });
      return;
    }
    navigator.permissions
      .query({ name: "geolocation" })
      .then(({ state }) => {
        if (state === "granted") doRequest();
        else if (state === "denied") setLocation({ status: "blocked" });
        else setLocation({ status: "prompt" });
      })
      .catch(() => setLocation({ status: "prompt" }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function doRequest() {
    setLocation({ status: "requesting" });
    const [result] = await Promise.allSettled([
      fetchPosition(),
      new Promise((r) => setTimeout(r, 900)),
    ]);
    if (result.status === "fulfilled") {
      const pos = result.value as GeolocationPosition;
      const { latitude: lat, longitude: lng } = pos.coords;
      const place = await reverseGeocode(lat, lng);
      setLocation({ status: "ready", info: { lat, lng, place } });
    } else {
      setLocation({ status: "blocked" });
    }
  }

  async function searchCity(e: React.FormEvent) {
    e.preventDefault();
    if (!city.trim()) return;
    setCityError("");
    setCityLoading(true);
    const info = await geocodeCity(city.trim());
    setCityLoading(false);
    if (info) {
      setLocation({ status: "ready", info });
    } else {
      setCityError("City not found. Try a different name.");
    }
  }

  const lat = location.status === "ready" ? location.info.lat : 0;
  const lng = location.status === "ready" ? location.info.lng : 0;
  const place = location.status === "ready" ? location.info.place : "";

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["explore", "nearby", lat, lng, radius],
    queryFn: ({ pageParam }) => explore.nearby(lat, lng, pageParam, radius),
    initialPageParam: 0,
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
    enabled: location.status === "ready",
  });

  const plants = data?.pages.flatMap((p) => p.plants) ?? [];

  const onIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(onIntersect, { rootMargin: "200px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, [onIntersect]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerEyebrow}>
          <span className={styles.headerLine} />
          <span className={styles.headerLabel}>Nearby Flora</span>
        </div>
        <h1 className={styles.headerTitle}>
          Plants Around
          <span className={styles.headerTitleItalic}>Your Location</span>
        </h1>
        {place && (
          <p className={styles.headerPlace}>
            <IoLocationOutline size={14} />
            {place}
          </p>
        )}
      </header>

      <div className={styles.content}>
        {/* Radius filter */}
        <div className={styles.filtersRow}>
          {RADIUS_OPTIONS.map((r) => (
            <button
              key={r}
              className={`${styles.filterBtn} ${radius === r ? styles.filterBtnActive : ""}`}
              onClick={() => setRadius(r)}
            >
              {r} km
            </button>
          ))}
        </div>

        {/* States */}
        {(location.status === "checking" || location.status === "requesting") && (
          <div className={styles.empty}>
            <p className={styles.emptyHint}>
              {location.status === "checking" ? "Checking permissions…" : "Locating you…"}
            </p>
          </div>
        )}

        {location.status === "prompt" && (
          <div className={styles.empty}>
            <IoLocationOutline size={32} className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>Find plants near you</p>
            <p className={styles.emptyHint}>
              Allow location access to discover plants growing in your area.
            </p>
            <button className={styles.locationBtn} onClick={doRequest}>
              Enable Location
            </button>
          </div>
        )}

        {location.status === "blocked" && (
          <div className={styles.blockedState}>
            <div className={styles.blockedSection}>
              <IoWarningOutline size={28} className={styles.emptyIcon} />
              <p className={styles.emptyTitle}>Location unavailable</p>
              <p className={styles.emptyHint}>
                Enable Location Services in{" "}
                <strong>System Settings → Privacy &amp; Security → Location Services</strong> or
                allow this site in browser settings.
              </p>
              <button className={styles.locationBtnOutline} onClick={doRequest}>
                Try Again
              </button>
            </div>

            <div className={styles.divider}>
              <span className={styles.dividerText}>or search by city</span>
            </div>

            <form className={styles.cityForm} onSubmit={searchCity}>
              <label className={styles.cityInput}>
                <IoSearchOutline size={16} className={styles.cityInputIcon} />
                <input
                  type="text"
                  placeholder="e.g. Porto Alegre, Lisbon…"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setCityError("");
                  }}
                  className={styles.cityInputField}
                  autoComplete="off"
                />
              </label>
              {cityError && <p className={styles.cityError}>{cityError}</p>}
              <button
                type="submit"
                className={styles.locationBtn}
                disabled={cityLoading || !city.trim()}
              >
                {cityLoading ? "Searching…" : "Search"}
              </button>
            </form>
          </div>
        )}

        {location.status === "ready" && isLoading && (
          <div className={styles.masonry}>
            {[220, 300, 260, 340, 200, 280, 320, 240, 300, 260, 200, 350].map((h, i) => (
              <div key={i} className={styles.masonryItem}>
                <div className={styles.skeleton} style={{ height: h }} />
              </div>
            ))}
          </div>
        )}

        {location.status === "ready" && !isLoading && plants.length === 0 && (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>No plants found</p>
            <p className={styles.emptyHint}>
              Try expanding the radius or explore a different area.
            </p>
          </div>
        )}

        {plants.length > 0 && (
          <div className={styles.masonry}>
            {plants.map((plant, i) => (
              <div key={`${plant.latin}-${i}`} className={styles.masonryItem}>
                <NearbyCard plant={plant} onClick={(p) => setSelectedPlant(p)} />
              </div>
            ))}
          </div>
        )}

        <div ref={sentinelRef} className={styles.sentinel}>
          {isFetchingNextPage && <p className={styles.emptyHint}>Loading more…</p>}
        </div>
      </div>

      <PlantDetailPanel
        latin={selectedPlant?.latin ?? null}
        fallback={selectedPlant}
        onClose={() => setSelectedPlant(null)}
      />
    </div>
  );
}
