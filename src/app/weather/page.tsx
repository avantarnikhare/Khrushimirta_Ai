import type { Metadata } from "next";
import { WeatherOverview } from "@/components/weather-overview";

export const metadata: Metadata = {
  title: "Weather",
};

export default function WeatherPage() {
  return <WeatherOverview />;
}
