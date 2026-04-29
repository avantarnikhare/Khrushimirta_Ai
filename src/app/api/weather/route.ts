import { NextResponse } from "next/server";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import {
  appendRateLimitHeaders,
  applyRateLimit,
  getClientIp,
} from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 10;

const OPENWEATHER_CURRENT_URL =
  "https://api.openweathermap.org/data/2.5/weather";
const OPENWEATHER_FORECAST_URL =
  "https://api.openweathermap.org/data/2.5/forecast";
const GEOAPIFY_IPINFO_URL = "https://api.geoapify.com/v1/ipinfo";
const GEOAPIFY_REVERSE_URL = "https://api.geoapify.com/v1/geocode/reverse";
const GEOAPIFY_SEARCH_URL = "https://api.geoapify.com/v1/geocode/search";
const GEOAPIFY_AUTOCOMPLETE_URL =
  "https://api.geoapify.com/v1/geocode/autocomplete";
const WEATHER_PROVIDER_TIMEOUT_MS = 7000;
const WEATHER_RATE_LIMIT = {
  windowMs: 60_000,
  maxRequests: 40,
};
const WEATHER_SUGGEST_RATE_LIMIT = {
  windowMs: 60_000,
  maxRequests: 70,
};

type GeoapifyIpInfoResponse = {
  location?: {
    latitude?: number;
    longitude?: number;
  };
  city?: {
    name?: string;
  };
  state?: {
    name?: string;
  };
  country?: {
    name?: string;
  };
};

type GeoapifyReverseResponse = {
  results?: Array<{
    city?: string;
    county?: string;
    state?: string;
    country?: string;
    formatted?: string;
  }>;
};

type GeoapifySearchResponse = {
  results?: Array<{
    lat?: number;
    lon?: number;
    city?: string;
    county?: string;
    state?: string;
    country?: string;
    formatted?: string;
  }>;
};

type GeoapifyAutocompleteResponse = {
  results?: Array<{
    lat?: number;
    lon?: number;
    city?: string;
    county?: string;
    state?: string;
    country?: string;
    formatted?: string;
  }>;
};

type OpenWeatherCurrentResponse = {
  weather?: Array<{
    icon?: string;
    description?: string;
  }>;
  main?: {
    temp?: number;
    humidity?: number;
  };
  wind?: {
    speed?: number;
  };
};

type OpenWeatherForecastResponse = {
  list?: Array<{
    pop?: number;
    dt_txt?: string;
    main?: {
      temp?: number;
      humidity?: number;
    };
  }>;
};

type CoordinateSource = "geolocation" | "ip" | "manual";

type LocationSuggestion = {
  name: string;
  latitude: number;
  longitude: number;
};

function parseCoordinate(
  value: string | null,
  min: number,
  max: number,
): number | null {
  if (value === null) {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    return null;
  }

  return parsed;
}

function toKmh(mps: number): number {
  return Number((mps * 3.6).toFixed(1));
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function formatTrendLabel(rawDateText: string | undefined, index: number): string {
  if (!rawDateText) {
    return `+${(index + 1) * 3}h`;
  }

  return rawDateText.slice(11, 16);
}

function makePlaceLabel(place: {
  formatted?: string;
  city?: string;
  county?: string;
  state?: string;
  country?: string;
}): string {
  if (place.formatted) {
    return place.formatted;
  }

  const parts = [place.city, place.county, place.state, place.country].filter(
    Boolean,
  );
  return parts.length > 0 ? parts.join(", ") : "Unknown place";
}

function buildIrrigationAdvice(
  temperatureC: number,
  humidityPct: number,
  rainfallChancePct: number,
): string {
  if (rainfallChancePct >= 60) {
    return "Rain is likely today. Delay heavy irrigation and monitor soil moisture before watering.";
  }

  if (temperatureC >= 33 && humidityPct < 45) {
    return "High heat and dry air can stress crops. Prefer early-morning or evening irrigation.";
  }

  if (temperatureC <= 20 && humidityPct >= 75) {
    return "Cool and humid conditions reduce evaporation. Use light irrigation and avoid overwatering.";
  }

  return "Weather is moderate. Continue planned irrigation with regular field moisture checks.";
}

function buildCropCareAdvice(
  humidityPct: number,
  windSpeedKmh: number,
  rainfallChancePct: number,
): string {
  if (humidityPct >= 85) {
    return "High humidity may increase fungal disease risk. Improve airflow and monitor leaf spots.";
  }

  if (windSpeedKmh >= 20) {
    return "Strong winds can drift sprays and damage tender plants. Delay spraying until winds calm.";
  }

  if (rainfallChancePct >= 50) {
    return "Rain may wash off foliar nutrients and pesticides. Reschedule applications after rainfall.";
  }

  return "Conditions are suitable for routine crop care and field operations.";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const suggestQuery = url.searchParams.get("suggest")?.trim() ?? "";
  const manualPlace = url.searchParams.get("place")?.trim() ?? "";
  const hasLat = url.searchParams.has("lat");
  const hasLon = url.searchParams.has("lon");
  const isSuggestionRequest = suggestQuery.length > 0;

  const rateLimitResult = applyRateLimit(
    isSuggestionRequest ? "api-weather-suggest" : "api-weather",
    getClientIp(request),
    isSuggestionRequest ? WEATHER_SUGGEST_RATE_LIMIT : WEATHER_RATE_LIMIT,
  );

  const respond = (body: unknown, init: ResponseInit = {}) => {
    const headers = new Headers(init.headers);
    headers.set("Cache-Control", "no-store");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-Frame-Options", "DENY");
    headers.set("Referrer-Policy", "same-origin");
    appendRateLimitHeaders(headers, rateLimitResult);

    return NextResponse.json(body, {
      ...init,
      headers,
    });
  };

  if (!rateLimitResult.allowed) {
    return respond(
      { error: "Too many weather requests. Please try again shortly." },
      { status: 429 },
    );
  }

  if (suggestQuery.length > 80) {
    return respond(
      { error: "Suggestion query is too long." },
      { status: 400 },
    );
  }

  if (manualPlace.length > 120) {
    return respond(
      { error: "Location text is too long." },
      { status: 400 },
    );
  }

  const openWeatherApiKey = process.env.OPENWEATHER_API_KEY;
  const geoapifyApiKey = process.env.GEOAPIFY_API_KEY;

  if (!openWeatherApiKey || !geoapifyApiKey) {
    return respond(
      {
        error:
          "Server is missing OPENWEATHER_API_KEY or GEOAPIFY_API_KEY configuration.",
      },
      { status: 500 },
    );
  }

  try {
    if (suggestQuery) {
      if (suggestQuery.length < 2) {
        return respond({ suggestions: [] });
      }

      const autocompleteUrl = new URL(GEOAPIFY_AUTOCOMPLETE_URL);
      autocompleteUrl.searchParams.set("text", suggestQuery);
      autocompleteUrl.searchParams.set("limit", "6");
      autocompleteUrl.searchParams.set("filter", "countrycode:in");
      autocompleteUrl.searchParams.set("format", "json");
      autocompleteUrl.searchParams.set("apiKey", geoapifyApiKey);

      const autocompleteResponse = await fetchWithTimeout(
        autocompleteUrl.toString(),
        {
          cache: "no-store",
        },
        WEATHER_PROVIDER_TIMEOUT_MS,
      );

      if (!autocompleteResponse.ok) {
        return respond(
          { error: "Unable to fetch location suggestions." },
          { status: 502 },
        );
      }

      const autocompleteData =
        (await autocompleteResponse.json()) as GeoapifyAutocompleteResponse;

      const suggestions = (autocompleteData.results ?? [])
        .filter((item) => isFiniteNumber(item.lat) && isFiniteNumber(item.lon))
        .map((item) => ({
          name: makePlaceLabel(item),
          latitude: item.lat as number,
          longitude: item.lon as number,
        }))
        .reduce<LocationSuggestion[]>((acc, suggestion) => {
          if (acc.some((entry) => entry.name === suggestion.name)) {
            return acc;
          }
          return [...acc, suggestion];
        }, [])
        .slice(0, 6);

      return respond({ suggestions });
    }

    if (hasLat !== hasLon) {
      return respond(
        { error: "Both lat and lon are required when passing coordinates." },
        { status: 400 },
      );
    }

    let latitude: number | null = null;
    let longitude: number | null = null;
    let coordinateSource: CoordinateSource = "ip";
    let fallbackLocationName = "Your Farm Area";

    if (manualPlace) {
      const searchUrl = new URL(GEOAPIFY_SEARCH_URL);
      searchUrl.searchParams.set("text", manualPlace);
      searchUrl.searchParams.set("limit", "1");
      searchUrl.searchParams.set("filter", "countrycode:in");
      searchUrl.searchParams.set("format", "json");
      searchUrl.searchParams.set("apiKey", geoapifyApiKey);

      const searchResponse = await fetchWithTimeout(
        searchUrl.toString(),
        {
          cache: "no-store",
        },
        WEATHER_PROVIDER_TIMEOUT_MS,
      );

      if (!searchResponse.ok) {
        return respond(
          { error: "Unable to locate entered place." },
          { status: 502 },
        );
      }

      const searchData = (await searchResponse.json()) as GeoapifySearchResponse;
      const firstMatch = searchData.results?.[0];

      if (
        typeof firstMatch?.lat !== "number" ||
        typeof firstMatch?.lon !== "number"
      ) {
        return respond(
          {
            error:
              "Location not found. Try entering city, district, or state name.",
          },
          { status: 404 },
        );
      }

      latitude = firstMatch.lat;
      longitude = firstMatch.lon;
      coordinateSource = "manual";

      const placeParts = [
        firstMatch.city,
        firstMatch.county,
        firstMatch.state,
        firstMatch.country,
      ].filter(Boolean);
      fallbackLocationName =
        firstMatch.formatted ??
        (placeParts.length > 0 ? placeParts.join(", ") : manualPlace);
    } else if (hasLat && hasLon) {
      latitude = parseCoordinate(url.searchParams.get("lat"), -90, 90);
      longitude = parseCoordinate(url.searchParams.get("lon"), -180, 180);

      if (latitude === null || longitude === null) {
        return respond(
          { error: "Invalid latitude or longitude values." },
          { status: 400 },
        );
      }

      coordinateSource = "geolocation";
    } else {
      const ipInfoUrl = new URL(GEOAPIFY_IPINFO_URL);
      ipInfoUrl.searchParams.set("apiKey", geoapifyApiKey);

      const forwardedFor = request.headers
        .get("x-forwarded-for")
        ?.split(",")[0]
        ?.trim();
      if (forwardedFor) {
        ipInfoUrl.searchParams.set("ip", forwardedFor);
      }

      const ipInfoResponse = await fetchWithTimeout(
        ipInfoUrl.toString(),
        {
          cache: "no-store",
        },
        WEATHER_PROVIDER_TIMEOUT_MS,
      );

      if (!ipInfoResponse.ok) {
        return respond(
          { error: "Unable to determine location from IP." },
          { status: 502 },
        );
      }

      const ipInfoData = (await ipInfoResponse.json()) as GeoapifyIpInfoResponse;
      latitude = ipInfoData.location?.latitude ?? null;
      longitude = ipInfoData.location?.longitude ?? null;

      const locationParts = [
        ipInfoData.city?.name,
        ipInfoData.state?.name,
        ipInfoData.country?.name,
      ].filter(Boolean);
      if (locationParts.length > 0) {
        fallbackLocationName = locationParts.join(", ");
      }
    }

    if (latitude === null || longitude === null) {
      return respond(
        { error: "Unable to detect location coordinates." },
        { status: 502 },
      );
    }

    const reverseUrl = new URL(GEOAPIFY_REVERSE_URL);
    reverseUrl.searchParams.set("lat", String(latitude));
    reverseUrl.searchParams.set("lon", String(longitude));
    reverseUrl.searchParams.set("format", "json");
    reverseUrl.searchParams.set("apiKey", geoapifyApiKey);

    const currentWeatherUrl = new URL(OPENWEATHER_CURRENT_URL);
    currentWeatherUrl.searchParams.set("lat", String(latitude));
    currentWeatherUrl.searchParams.set("lon", String(longitude));
    currentWeatherUrl.searchParams.set("appid", openWeatherApiKey);
    currentWeatherUrl.searchParams.set("units", "metric");

    const forecastUrl = new URL(OPENWEATHER_FORECAST_URL);
    forecastUrl.searchParams.set("lat", String(latitude));
    forecastUrl.searchParams.set("lon", String(longitude));
    forecastUrl.searchParams.set("appid", openWeatherApiKey);
    forecastUrl.searchParams.set("units", "metric");

    const [reverseResponse, currentResponse, forecastResponse] =
      await Promise.all([
        fetchWithTimeout(
          reverseUrl.toString(),
          { cache: "no-store" },
          WEATHER_PROVIDER_TIMEOUT_MS,
        ),
        fetchWithTimeout(
          currentWeatherUrl.toString(),
          { cache: "no-store" },
          WEATHER_PROVIDER_TIMEOUT_MS,
        ),
        fetchWithTimeout(
          forecastUrl.toString(),
          { cache: "no-store" },
          WEATHER_PROVIDER_TIMEOUT_MS,
        ),
      ]);

    if (!currentResponse.ok || !forecastResponse.ok) {
      return respond(
        { error: "Failed to fetch weather details." },
        { status: 502 },
      );
    }

    const currentData =
      (await currentResponse.json()) as OpenWeatherCurrentResponse;
    const forecastData =
      (await forecastResponse.json()) as OpenWeatherForecastResponse;

    if (
      !isFiniteNumber(currentData.main?.temp) ||
      !isFiniteNumber(currentData.main?.humidity) ||
      !isFiniteNumber(currentData.wind?.speed)
    ) {
      return respond(
        { error: "Received invalid weather metrics from provider." },
        { status: 502 },
      );
    }

    const forecastList = forecastData.list ?? [];
    if (forecastList.length === 0) {
      return respond(
        { error: "Forecast data is unavailable right now." },
        { status: 502 },
      );
    }

    const reverseData = reverseResponse.ok
      ? ((await reverseResponse.json()) as GeoapifyReverseResponse)
      : null;

    const locationResult = reverseData?.results?.[0];
    const resolvedLocationName =
      locationResult?.city ??
      locationResult?.county ??
      locationResult?.state ??
      locationResult?.formatted ??
      fallbackLocationName;

    const temperatureC = Number(currentData.main.temp.toFixed(1));
    const humidityPct = Math.round(currentData.main.humidity);
    const windSpeedKmh = toKmh(currentData.wind.speed);

    const nextForecast = forecastList.slice(0, 4);
    const rainfallChancePct = Math.round(
      Math.max(...nextForecast.map((item) => item.pop ?? 0), 0) * 100,
    );

    const forecastTrend = forecastList.slice(0, 8).map((item, index) => {
      const trendTemp = isFiniteNumber(item.main?.temp)
        ? Number(item.main.temp.toFixed(1))
        : temperatureC;
      const trendHumidity = isFiniteNumber(item.main?.humidity)
        ? Math.round(item.main.humidity)
        : humidityPct;

      return {
        timeLabel: formatTrendLabel(item.dt_txt, index),
        temperatureC: trendTemp,
        humidityPct: trendHumidity,
        rainfallChancePct: Math.round((item.pop ?? 0) * 100),
      };
    });

    const weatherDescription =
      currentData.weather?.[0]?.description ?? "Weather data available";
    const iconCode = currentData.weather?.[0]?.icon ?? "01d";

    const irrigationAdvice = buildIrrigationAdvice(
      temperatureC,
      humidityPct,
      rainfallChancePct,
    );
    const cropCareAdvice = buildCropCareAdvice(
      humidityPct,
      windSpeedKmh,
      rainfallChancePct,
    );

    return respond({
      location: {
        name: resolvedLocationName,
        latitude: Number(latitude.toFixed(4)),
        longitude: Number(longitude.toFixed(4)),
        source: coordinateSource,
      },
      weather: {
        temperatureC,
        humidityPct,
        windSpeedKmh,
        rainfallChancePct,
        description: weatherDescription,
        iconCode,
      },
      forecastTrend,
      insights: {
        irrigation: irrigationAdvice,
        cropCare: cropCareAdvice,
      },
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return respond(
        { error: "Weather service timeout. Please retry." },
        { status: 504 },
      );
    }

    console.error("Weather API error", error);
    return respond(
      { error: "Unexpected weather service error." },
      { status: 500 },
    );
  }
}