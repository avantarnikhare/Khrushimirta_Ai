"use client";

import { motion } from "framer-motion";
import { WeatherDashboard } from "@/components/weather-dashboard";
import { useLanguage } from "@/context/language-context";

export function WeatherOverview() {
  const { dictionary } = useLanguage();

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl border border-green-100 bg-white/90 p-6 shadow-card sm:p-8"
      >
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
          {dictionary.weatherPage.eyebrow}
        </p>
        <h1 className="mt-2 text-balance text-3xl font-bold text-primary sm:text-4xl">
          {dictionary.weatherPage.title}
        </h1>
        <p className="mt-3 max-w-2xl text-green-900/85">
          {dictionary.weatherPage.description}
        </p>
      </motion.section>

      <WeatherDashboard />
    </div>
  );
}
