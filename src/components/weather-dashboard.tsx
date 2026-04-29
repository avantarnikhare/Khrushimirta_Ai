"use client";

import Image from "next/image";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/context/language-context";

const DEFAULT_PLACE_STORAGE_KEY = "krushi_default_place";

type WeatherTrendPoint = {
  timeLabel: string;
  temperatureC: number;
  humidityPct: number;
  rainfallChancePct: number;
};

type LocationSuggestion = {
  name: string;
  latitude: number;
  longitude: number;
};

type WeatherApiResponse = {
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
  forecastTrend: WeatherTrendPoint[];
  insights: {
    irrigation: string;
    cropCare: string;
  };
  updatedAt: string;
};

type SuggestionResponse = {
  suggestions?: LocationSuggestion[];
  error?: string;
};

function formatTimestamp(dateString: string): string {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(dateString));
  } catch {
    return "Just now";
  }
}

function weatherIconUrl(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

export function WeatherDashboard() {
  const { dictionary } = useLanguage();
  const [data, setData] = useState<WeatherApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [statusText, setStatusText] = useState(
    dictionary.weatherDashboard.status.detectingLocation,
  );
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualPlace, setManualPlace] = useState("");
  const [defaultPlace, setDefaultPlace] = useState<string | null>(null);
  const [manualSuggestions, setManualSuggestions] = useState<LocationSuggestion[]>(
    [],
  );
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);

  type FetchWeatherOptions = {
    latitude?: number;
    longitude?: number;
    place?: string;
    persistDefault?: boolean;
  };

  const fetchWeather = useCallback(async (options: FetchWeatherOptions = {}) => {
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

      const query = params.toString().length > 0 ? `?${params.toString()}` : "";

      const response = await fetch(`/api/weather${query}`, {
        cache: "no-store",
      });

      const payload = (await response.json()) as
        | WeatherApiResponse
        | { error?: string };

      if (!response.ok || !("weather" in payload)) {
        setErrorText(
          payload && "error" in payload && payload.error
            ? payload.error
            : dictionary.weatherDashboard.errors.weatherLoad,
        );
        return;
      }

      setData(payload);

      if (payload.location.source === "manual") {
        const normalizedPlace = payload.location.name;
        setManualPlace(normalizedPlace);

        if (options.persistDefault && typeof window !== "undefined") {
          window.localStorage.setItem(DEFAULT_PLACE_STORAGE_KEY, normalizedPlace);
          setDefaultPlace(normalizedPlace);
          setStatusText(dictionary.weatherDashboard.status.manualSaved);
        } else {
          setStatusText(dictionary.weatherDashboard.status.manualWeather);
        }
      } else if (payload.location.source === "geolocation") {
        setStatusText(dictionary.weatherDashboard.status.gpsLive);
      } else {
        setStatusText(dictionary.weatherDashboard.status.ipFallback);
      }
    } catch {
      setErrorText(dictionary.weatherDashboard.errors.networkIssue);
    } finally {
      setIsLoading(false);
    }
  }, [dictionary.weatherDashboard.errors.networkIssue, dictionary.weatherDashboard.errors.weatherLoad, dictionary.weatherDashboard.status.gpsLive, dictionary.weatherDashboard.status.ipFallback, dictionary.weatherDashboard.status.manualSaved, dictionary.weatherDashboard.status.manualWeather]);

  const fetchLocationSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setManualSuggestions([]);
      return;
    }

    setIsSuggestionsLoading(true);
    try {
      const response = await fetch(
        `/api/weather?suggest=${encodeURIComponent(query.trim())}`,
        {
          cache: "no-store",
        },
      );

      const payload = (await response.json()) as SuggestionResponse;
      if (!response.ok) {
        setManualSuggestions([]);
        return;
      }

      setManualSuggestions(payload.suggestions ?? []);
    } catch {
      setManualSuggestions([]);
    } finally {
      setIsSuggestionsLoading(false);
    }
  }, []);

  const loadCurrentLocationWeather = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatusText(dictionary.weatherDashboard.status.locationUnavailable);
      void fetchWeather({});
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setStatusText(dictionary.weatherDashboard.status.gpsAccurate);
        void fetchWeather({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        setStatusText(dictionary.weatherDashboard.status.permissionDenied);
        void fetchWeather({});
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 120000,
      },
    );
  }, [dictionary.weatherDashboard.status.gpsAccurate, dictionary.weatherDashboard.status.locationUnavailable, dictionary.weatherDashboard.status.permissionDenied, fetchWeather]);

  const handleManualSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const place = manualPlace.trim();

    if (!place) {
      setErrorText(dictionary.weatherDashboard.errors.locationRequired);
      return;
    }

    setStatusText(dictionary.weatherDashboard.status.searchingLocation);
    await fetchWeather({ place, persistDefault: true });
    setManualSuggestions([]);
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const savedPlace = window.localStorage
      .getItem(DEFAULT_PLACE_STORAGE_KEY)
      ?.trim();
    if (savedPlace) {
      setDefaultPlace(savedPlace);
      setManualPlace(savedPlace);
      setShowManualEntry(true);
      setStatusText(dictionary.weatherDashboard.status.defaultApplied);
      void fetchWeather({ place: savedPlace });
      return;
    }

    loadCurrentLocationWeather();
  }, [dictionary.weatherDashboard.status.defaultApplied, fetchWeather, loadCurrentLocationWeather]);

  useEffect(() => {
    if (!showManualEntry) {
      return;
    }

    const query = manualPlace.trim();
    if (query.length < 2) {
      setManualSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      void fetchLocationSuggestions(query);
    }, 260);

    return () => clearTimeout(timer);
  }, [manualPlace, showManualEntry, fetchLocationSuggestions]);

  const handleSuggestionSelect = (placeName: string) => {
    setManualPlace(placeName);
    setManualSuggestions([]);
    setStatusText(dictionary.weatherDashboard.status.selectedLocation);
    void fetchWeather({ place: placeName, persistDefault: true });
  };

  const clearDefaultLocation = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(DEFAULT_PLACE_STORAGE_KEY);
    }
    setDefaultPlace(null);
    setStatusText(dictionary.weatherDashboard.status.defaultCleared);
    loadCurrentLocationWeather();
  };

  const cards = useMemo(() => {
    if (!data) {
      return [];
    }

    return [
      {
        label: dictionary.weatherDashboard.labels.temperature,
        value: `${data.weather.temperatureC} °C`,
        hint: dictionary.weatherDashboard.hints.temperature,
      },
      {
        label: dictionary.weatherDashboard.labels.humidity,
        value: `${data.weather.humidityPct}%`,
        hint: dictionary.weatherDashboard.hints.humidity,
      },
      {
        label: dictionary.weatherDashboard.labels.windSpeed,
        value: `${data.weather.windSpeedKmh} km/h`,
        hint: dictionary.weatherDashboard.hints.windSpeed,
      },
      {
        label: dictionary.weatherDashboard.labels.rainfallChance,
        value: `${data.weather.rainfallChancePct}%`,
        hint: dictionary.weatherDashboard.hints.rainfallChance,
      },
    ];
  }, [data, dictionary.weatherDashboard.hints.humidity, dictionary.weatherDashboard.hints.rainfallChance, dictionary.weatherDashboard.hints.temperature, dictionary.weatherDashboard.hints.windSpeed, dictionary.weatherDashboard.labels.humidity, dictionary.weatherDashboard.labels.rainfallChance, dictionary.weatherDashboard.labels.temperature, dictionary.weatherDashboard.labels.windSpeed]);

  const chartData = useMemo(() => {
    if (!data || data.forecastTrend.length === 0) {
      return null;
    }

    const points = data.forecastTrend.slice(0, 8);
    const width = 760;
    const height = 270;
    const leftPad = 44;
    const rightPad = 20;
    const topPad = 20;
    const bottomPad = 44;
    const innerWidth = width - leftPad - rightPad;
    const innerHeight = height - topPad - bottomPad;

    const temperatures = points.map((item) => item.temperatureC);
    const minTemp = Math.min(...temperatures) - 1;
    const maxTemp = Math.max(...temperatures) + 1;
    const tempRange = Math.max(1, maxTemp - minTemp);

    const linePoints = points.map((item, index) => {
      const x =
        points.length === 1
          ? leftPad + innerWidth / 2
          : leftPad + (index / (points.length - 1)) * innerWidth;
      const y = topPad + ((maxTemp - item.temperatureC) / tempRange) * innerHeight;

      return {
        ...item,
        x,
        y,
      };
    });

    const linePath = linePoints
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
      .join(" ");

    return {
      width,
      height,
      leftPad,
      rightPad,
      topPad,
      bottomPad,
      linePoints,
      linePath,
      minTemp,
      maxTemp,
    };
  }, [data]);

  return (
    <div className="space-y-5">
      <section className="glass-card card-3d animate-fade-up overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-secondary">{dictionary.weatherDashboard.title}</p>
            <h2 className="mt-1 text-2xl font-bold text-primary sm:text-3xl">
              {data?.location.name ?? dictionary.weatherDashboard.locationLoading}
            </h2>
            <p className="mt-1 text-sm text-green-900/80">{statusText}</p>
            {data ? (
              <p className="mt-1 text-xs text-green-800/80">
                {dictionary.weatherDashboard.updatedLabel}: {formatTimestamp(data.updatedAt)}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50/90 px-4 py-3">
            {data ? (
              <Image
                src={weatherIconUrl(data.weather.iconCode)}
                alt={data.weather.description}
                className="h-14 w-14"
                width={56}
                height={56}
                unoptimized
              />
            ) : (
              <div className="h-14 w-14 animate-pulse rounded-full bg-green-100" />
            )}
            <div>
              <p className="text-sm font-semibold capitalize text-green-950">
                {data?.weather.description ?? dictionary.weatherDashboard.errors.noDataYet}
              </p>
              <p className="text-xs text-green-900">{dictionary.weatherDashboard.openWeatherLabel}</p>
            </div>
          </div>
        </div>

        {defaultPlace ? (
          <div className="mt-3 inline-flex items-center rounded-full border border-green-300 bg-green-50 px-3 py-1 text-xs font-semibold text-green-800">
            {dictionary.weatherDashboard.defaultLocationLabel}: {defaultPlace}
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadCurrentLocationWeather}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            {dictionary.weatherDashboard.buttons.useMyLocation}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowManualEntry((prev) => !prev);
            }}
            className="rounded-full border border-primary/30 bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary/60"
          >
            {dictionary.weatherDashboard.buttons.enterManually}
          </button>
          <button
            type="button"
            onClick={() => {
              if (data) {
                void fetchWeather({
                  latitude: data.location.latitude,
                  longitude: data.location.longitude,
                });
              } else {
                void fetchWeather({});
              }
            }}
            className="rounded-full border border-primary/30 bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary/60"
          >
            {dictionary.weatherDashboard.buttons.refreshWeather}
          </button>

          {defaultPlace ? (
            <button
              type="button"
              onClick={clearDefaultLocation}
              className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
            >
              {dictionary.weatherDashboard.buttons.clearDefault}
            </button>
          ) : null}
        </div>

        {showManualEntry ? (
          <div className="mt-3 rounded-xl border border-green-200 bg-white/80 p-3">
            <form onSubmit={handleManualSubmit} className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <input
                value={manualPlace}
                onChange={(event) => setManualPlace(event.target.value)}
                placeholder={dictionary.weatherDashboard.placeholders.manualLocation}
                className="rounded-lg border border-green-200 bg-white px-3 py-2 text-sm text-green-950 outline-none ring-primary focus:ring-2"
              />
              <button
                type="submit"
                className="rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600"
              >
                {dictionary.weatherDashboard.buttons.saveDefault}
              </button>
            </form>

            {isSuggestionsLoading ? (
              <p className="mt-2 text-xs font-medium text-green-800">
                {dictionary.weatherDashboard.errors.suggestionLoading}
              </p>
            ) : null}

            {manualSuggestions.length > 0 ? (
              <div className="mt-3 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-green-800">
                  {dictionary.weatherDashboard.placeholders.suggestionTitle}
                </p>
                <div className="max-h-40 overflow-y-auto rounded-lg border border-green-100 bg-white">
                  {manualSuggestions.map((suggestion) => (
                    <button
                      key={`${suggestion.name}-${suggestion.latitude}-${suggestion.longitude}`}
                      type="button"
                      onClick={() => handleSuggestionSelect(suggestion.name)}
                      className="w-full border-b border-green-50 px-3 py-2 text-left text-sm text-green-950 transition last:border-b-0 hover:bg-green-50"
                    >
                      {suggestion.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      {isLoading ? (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="glass-card h-28 animate-pulse bg-gradient-to-br from-white to-green-50"
            />
          ))}
        </section>
      ) : null}

      {errorText ? (
        <section className="glass-card p-5">
          <p className="text-sm font-semibold text-red-700">{errorText}</p>
        </section>
      ) : null}

      {data ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card, idx) => (
              <article
                key={card.label}
                className="glass-card card-3d animate-fade-up p-4 transition-transform duration-500 hover:-translate-y-1"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-green-800">
                  {card.label}
                </p>
                <p className="mt-2 text-3xl font-bold text-primary">{card.value}</p>
                <p className="mt-2 text-xs text-green-900/80">{card.hint}</p>
              </article>
            ))}
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <article className="glass-card card-3d animate-fade-up border-l-4 border-l-emerald-500 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                {dictionary.weatherDashboard.sections.irrigationInsight}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-green-950">
                {data.insights.irrigation}
              </p>
            </article>

            <article className="glass-card card-3d animate-fade-up border-l-4 border-l-lime-500 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-lime-700">
                {dictionary.weatherDashboard.sections.cropCareInsight}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-green-950">
                {data.insights.cropCare}
              </p>
            </article>
          </section>

          {chartData ? (
            <section className="glass-card card-3d animate-fade-up overflow-hidden p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xl font-bold text-primary">
                  {dictionary.weatherDashboard.chart.title}
                </h3>
                <p className="text-xs font-medium text-green-800">
                  {dictionary.weatherDashboard.chart.subtitle}
                </p>
              </div>

              <div className="mt-4 overflow-x-auto rounded-2xl border border-green-100 bg-gradient-to-br from-white to-green-50 p-3">
                <svg
                  viewBox={`0 0 ${chartData.width} ${chartData.height}`}
                  className="h-64 min-w-[640px] w-full"
                  aria-label={dictionary.weatherDashboard.chart.ariaLabel}
                >
                  <defs>
                    <linearGradient id="tempLineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#16a34a" />
                      <stop offset="100%" stopColor="#84cc16" />
                    </linearGradient>
                    <linearGradient id="rainBarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity="0.95" />
                      <stop offset="100%" stopColor="#166534" stopOpacity="0.28" />
                    </linearGradient>
                  </defs>

                  {[0, 1, 2, 3, 4].map((step) => {
                    const y =
                      chartData.topPad +
                      (step / 4) *
                        (chartData.height - chartData.topPad - chartData.bottomPad);
                    return (
                      <line
                        key={`grid-${step}`}
                        x1={chartData.leftPad}
                        x2={chartData.width - chartData.rightPad}
                        y1={y}
                        y2={y}
                        stroke="#dcfce7"
                        strokeWidth="1"
                      />
                    );
                  })}

                  {chartData.linePoints.map((point, idx) => {
                    const barHeight =
                      (point.rainfallChancePct / 100) *
                      (chartData.height - chartData.topPad - chartData.bottomPad) *
                      0.48;
                    const yBase = chartData.height - chartData.bottomPad;

                    return (
                      <g key={`rain-${point.timeLabel}-${idx}`}>
                        <rect
                          x={point.x - 8}
                          y={yBase - barHeight}
                          width="16"
                          height={barHeight}
                          rx="5"
                          fill="url(#rainBarGradient)"
                        />
                      </g>
                    );
                  })}

                  <path
                    d={chartData.linePath}
                    fill="none"
                    stroke="url(#tempLineGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {chartData.linePoints.map((point, idx) => (
                    <g key={`point-${point.timeLabel}-${idx}`}>
                      <circle cx={point.x} cy={point.y} r="5" fill="#166534" />
                      <text
                        x={point.x}
                        y={point.y - 12}
                        textAnchor="middle"
                        fontSize="11"
                        fill="#14532d"
                        fontWeight="700"
                      >
                        {point.temperatureC}°
                      </text>
                      <text
                        x={point.x}
                        y={chartData.height - 12}
                        textAnchor="middle"
                        fontSize="11"
                        fill="#166534"
                        fontWeight="600"
                      >
                        {point.timeLabel}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>

              <p className="mt-3 text-xs text-green-800">
                {dictionary.weatherDashboard.chart.caption}
              </p>
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  );
}