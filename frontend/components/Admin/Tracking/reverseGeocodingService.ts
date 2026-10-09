import { useEffect, useRef, useState } from 'react';
import { adminGpsApi, type ReverseGeocodeResponse } from '../../../services/api';

export interface GeocodedAddress {
  formattedAddress: string;
  road: string | null;
  district: string | null;
  city: string;
  country: string;
  fullDisplayName: string;
  latitude: number;
  longitude: number;
  googleMapsUrl: string;
}

const LOCAL_STORAGE_KEY = 'atellas_geocode_cache_v1';
const MAX_CACHE_ENTRIES = 500;

// In-memory cache for ultra-fast instant 0ms access
const memoryCache = new Map<string, GeocodedAddress>();

// In-flight request deduplication map
const inFlightRequests = new Map<string, Promise<GeocodedAddress>>();

// Initialize memory cache from localStorage
try {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    if (parsed && typeof parsed === 'object') {
      Object.entries(parsed).forEach(([key, val]) => {
        if (val && typeof val === 'object') {
          memoryCache.set(key, val as GeocodedAddress);
        }
      });
    }
  }
} catch {
  // Ignore localStorage read errors
}

const saveToLocalStorage = () => {
  try {
    const obj: Record<string, GeocodedAddress> = {};
    let count = 0;
    // Keep most recent MAX_CACHE_ENTRIES entries
    for (const [k, v] of memoryCache.entries()) {
      obj[k] = v;
      if (++count >= MAX_CACHE_ENTRIES) break;
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(obj));
  } catch {
    // Ignore localStorage quota exceeded or access errors
  }
};

/** Format coordinate key to 4 decimal places (~11 meters precision) */
export const getCoordKey = (lat: number, lng: number): string =>
  `${Number(lat).toFixed(4)},${Number(lng).toFixed(4)}`;

/** Get cached address synchronously if available (0ms latency) */
export const getStoredAddress = (lat: number | null | undefined, lng: number | null | undefined): GeocodedAddress | null => {
  if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const key = getCoordKey(lat, lng);
  return memoryCache.get(key) ?? null;
};

/** Build Google Maps navigation / search URL */
export const buildGoogleMapsUrl = (lat: number, lng: number): string =>
  `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

/**
 * Fetch human-readable address for given GPS coordinates.
 * Multi-tier strategy: Memory/LocalStorage Cache -> Backend API -> Client BigDataCloud -> Client Nominatim -> Coordinates.
 */
export const fetchAddress = async (lat: number, lng: number): Promise<GeocodedAddress> => {
  const key = getCoordKey(lat, lng);

  // 1. Check memory cache
  const cached = memoryCache.get(key);
  if (cached) return cached;

  // 2. Check if a request for this location is already in-flight
  const existingPromise = inFlightRequests.get(key);
  if (existingPromise) return existingPromise;

  const promise = (async (): Promise<GeocodedAddress> => {
    // 3. Tier 1: Backend proxy endpoint (cached on server in Laravel)
    try {
      const response: ReverseGeocodeResponse = await adminGpsApi.reverseGeocode(lat, lng);
      if (response && response.formatted_address) {
        const result: GeocodedAddress = {
          formattedAddress: response.formatted_address,
          road: response.road,
          district: response.district,
          city: response.city || 'Tanger',
          country: response.country || 'Maroc',
          fullDisplayName: response.display_name || response.formatted_address,
          latitude: lat,
          longitude: lng,
          googleMapsUrl: buildGoogleMapsUrl(lat, lng),
        };
        memoryCache.set(key, result);
        saveToLocalStorage();
        return result;
      }
    } catch {
      // Backend failed or not available, proceed to client fallback
    }

    // 4. Tier 2: BigDataCloud Reverse Geocoding API (Fast, no API key, CORS friendly)
    try {
      const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=fr`;
      const res = await fetch(bdcUrl, { signal: AbortSignal.timeout(3500) });
      if (res.ok) {
        const data = await res.json();
        const street = data.localityInfo?.administrative?.[0]?.name || data.localityInfo?.informative?.[0]?.name || '';
        const district = data.locality || data.principalSubdivision || '';
        const city = data.city || 'Tanger';
        const country = data.countryName || 'Maroc';

        const parts = [street, district, city].filter(Boolean);
        const formatted = parts.length > 0 ? parts.join(', ') : `${city}, ${country}`;

        const result: GeocodedAddress = {
          formattedAddress: formatted,
          road: street || null,
          district: district || null,
          city,
          country,
          fullDisplayName: formatted,
          latitude: lat,
          longitude: lng,
          googleMapsUrl: buildGoogleMapsUrl(lat, lng),
        };
        memoryCache.set(key, result);
        saveToLocalStorage();
        return result;
      }
    } catch {
      // BigDataCloud failed, proceed to Tier 3
    }

    // 5. Tier 3: OpenStreetMap Nominatim directly
    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=fr,ar`;
      const res = await fetch(nominatimUrl, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(3500),
      });
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const road = addr.road || addr.pedestrian || addr.street || null;
        const district = addr.suburb || addr.neighbourhood || addr.residential || addr.quarter || null;
        const city = addr.city || addr.town || addr.village || 'Tanger';
        const country = addr.country || 'Maroc';

        const parts = [road, district, city].filter(Boolean);
        const formatted = parts.length > 0 ? parts.join(', ') : data.display_name || `Tanger (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

        const result: GeocodedAddress = {
          formattedAddress: formatted,
          road,
          district,
          city,
          country,
          fullDisplayName: data.display_name || formatted,
          latitude: lat,
          longitude: lng,
          googleMapsUrl: buildGoogleMapsUrl(lat, lng),
        };
        memoryCache.set(key, result);
        saveToLocalStorage();
        return result;
      }
    } catch {
      // Nominatim failed
    }

    // 6. Tier 4: Fallback to coordinate representation
    const fallbackAddress: GeocodedAddress = {
      formattedAddress: `Stationnement GPS (${lat.toFixed(4)}, ${lng.toFixed(4)}) · Tanger`,
      road: null,
      district: null,
      city: 'Tanger',
      country: 'Maroc',
      fullDisplayName: `Position GPS (${lat}, ${lng})`,
      latitude: lat,
      longitude: lng,
      googleMapsUrl: buildGoogleMapsUrl(lat, lng),
    };
    memoryCache.set(key, fallbackAddress);
    return fallbackAddress;
  })();

  inFlightRequests.set(key, promise);
  try {
    return await promise;
  } finally {
    inFlightRequests.delete(key);
  }
};

/** Prefetch an address into cache (non-blocking) */
export const prefetchAddress = (lat: number | null | undefined, lng: number | null | undefined): void => {
  if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) return;
  void fetchAddress(lat, lng);
};

/**
 * React hook to retrieve and monitor address for a vehicle's coordinates.
 */
export const useVehicleAddress = (
  lat: number | null | undefined,
  lng: number | null | undefined,
  enabled: boolean = true,
) => {
  const [address, setAddress] = useState<GeocodedAddress | null>(() => getStoredAddress(lat, lng));
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled || lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      return;
    }

    const cached = getStoredAddress(lat, lng);
    if (cached) {
      setAddress(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetchAddress(lat, lng)
      .then(res => {
        if (mountedRef.current) {
          setAddress(res);
          setLoading(false);
        }
      })
      .catch(err => {
        if (mountedRef.current) {
          setError(err?.message || 'Erreur géocodage');
          setLoading(false);
        }
      });
  }, [lat, lng, enabled]);

  return { address, loading, error };
};
