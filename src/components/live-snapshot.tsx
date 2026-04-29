"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useLanguage } from "@/context/language-context";
import { interpolate } from "@/lib/i18n";

const DEFAULT_PLACE_STORAGE_KEY = "krushi_default_place";

type SnapshotResponse = {
  location: {
    name: string;
    latitude: number;
    longitude: number;
    source: "geolocation" | "ip" | "manual";
  };
  weather: {
    temperatureC: number;
    humidityPct: number;
    windSpeedKmh: number;
    rainfallChancePct: number;
    description: string;
    iconCode: string;
  };
  insights: {
    irrigation: string;
    cropCare: string;
  };
  updatedAt: string;
};

type FetchSnapshotOptions = {
  latitude?: number;
  longitude?: number;
  place?: string;
};

function weatherIconUrl(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

export function LiveSnapshot() {
  const { dictionary } = useLanguage();
  const [snapshot, setSnapshot] = useState<SnapshotResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  const hasValidSnapshot = snapshot !== null;

  const fetchSnapshot = useCallback(async (options: FetchSnapshotOptions = {}) => {
    setIsLoading(true);
    setErrorText(null);

    try {
      const params = new URLSearchParams();
      if (
        typeof options.latitude === "number" &&
        typeof options.longitude === "number"
      ) {
        params.set("lat", String(options.latitude));
        params.set("lon", String(options.longitude));
      } else if (options.place) {
        params.set("place", options.place);
      }

      const query = params.toString() ? `?${params.toString()}` : "";
      const response = await fetch(`/api/weather${query}`, { cache: "no-store" });
      const payload = (await response.json()) as
        | SnapshotResponse
        | { error?: string };

      if (!response.ok || !("weather" in payload)) {
        setErrorText(
          payload && "error" in payload && payload.error
            ? payload.error
            : dictionary.snapshot.loadError,
        );
        return;
      }

      const isValid =
        Number.isFinite(payload.weather.temperatureC) &&
        Number.isFinite(payload.weather.humidityPct) &&
        Number.isFinite(payload.weather.windSpeedKmh) &&
        Number.isFinite(payload.weather.rainfallChancePct);

      if (!isValid) {
        setErrorText(dictionary.snapshot.waitingData);
        return;
      }

      setSnapshot(payload);
    } catch {
      setErrorText(dictionary.snapshot.unavailable);
    } finally {
      setIsLoading(false);
    }
  }, [dictionary.snapshot.loadError, dictionary.snapshot.unavailable, dictionary.snapshot.waitingData]);

  const loadCurrentLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      void fetchSnapshot({});
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        void fetchSnapshot({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        void fetchSnapshot({});
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 120000,
      },
    );
  }, [fetchSnapshot]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const savedPlace = window.localStorage
      .getItem(DEFAULT_PLACE_STORAGE_KEY)
      ?.trim();
    if (savedPlace) {
      void fetchSnapshot({ place: savedPlace });
      return;
    }

    loadCurrentLocation();
  }, [fetchSnapshot, loadCurrentLocation]);

  return (
    <div className="card-3d animate-float rounded-3xl border border-green-100 bg-gradient-to-br from-white to-green-50 p-5 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-primary">{dictionary.snapshot.title}</p>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
            hasValidSnapshot
              ? "bg-emerald-100 text-emerald-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {hasValidSnapshot ? dictionary.snapshot.valid : dictionary.snapshot.syncing}
        </span>
      </div>

      {isLoading ? (
        <div className="mt-4 space-y-3">
          <div className="h-14 animate-pulse rounded-xl bg-green-100/80" />
          <div className="h-20 animate-pulse rounded-xl bg-lime-100/70" />
          <div className="h-16 animate-pulse rounded-xl bg-emerald-100/70" />
        </div>
      ) : null}

      {errorText ? (
        <div className="mt-4 rounded-xl bg-red-50 p-3">
          <p className="text-sm font-semibold text-red-700">{errorText}</p>
        </div>
      ) : null}

      {snapshot ? (
        <div className="mt-4 space-y-3">
          <div className="rounded-xl bg-green-100/70 p-3">
            <p className="text-xs uppercase tracking-wide text-green-800">{dictionary.snapshot.region}</p>
            <p className="text-lg font-bold text-green-950">{snapshot.location.name}</p>
          </div>

          <div className="rounded-xl bg-lime-100/70 p-3">
            <p className="text-xs uppercase tracking-wide text-lime-800">{dictionary.snapshot.advisory}</p>
            <p className="text-sm font-semibold text-lime-950">
              {snapshot.insights.irrigation}
            </p>
          </div>

          <div className="rounded-xl bg-emerald-100/70 p-3">
            <div className="flex items-center gap-2">
              <Image
                src={weatherIconUrl(snapshot.weather.iconCode)}
                alt={snapshot.weather.description}
                className="h-10 w-10"
                width={40}
                height={40}
                unoptimized
              />
              <div>
                <p className="text-xs uppercase tracking-wide text-emerald-800">
                  {dictionary.snapshot.weather}
                </p>
                <p className="text-sm font-semibold capitalize text-emerald-950">
                  {snapshot.weather.description}
                </p>
              </div>
            </div>
            <p className="mt-2 text-sm font-medium text-emerald-950">
              {interpolate(dictionary.snapshot.metricsSummary, {
                temp: snapshot.weather.temperatureC,
                humidity: snapshot.weather.humidityPct,
                wind: snapshot.weather.windSpeedKmh,
                rain: snapshot.weather.rainfallChancePct,
              })}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
