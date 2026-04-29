"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/language-context";
import type { CropId } from "@/lib/i18n";

type SeasonFilter = "all" | "kharif" | "rabi" | "zaid";

const CROP_ORDER: CropId[] = [
  "wheat",
  "rice",
  "cotton",
  "soybean",
  "sugarcane",
  "vegetables",
];

const CROP_META: Record<
  CropId,
  {
    icon: string;
    season: Exclude<SeasonFilter, "all">;
    accentClass: string;
  }
> = {
  wheat: {
    icon: "🌾",
    season: "rabi",
    accentClass: "from-amber-100 to-yellow-50 border-amber-200",
  },
  rice: {
    icon: "🍚",
    season: "kharif",
    accentClass: "from-emerald-100 to-lime-50 border-emerald-200",
  },
  cotton: {
    icon: "🧵",
    season: "kharif",
    accentClass: "from-slate-100 to-zinc-50 border-slate-200",
  },
  soybean: {
    icon: "🫘",
    season: "kharif",
    accentClass: "from-lime-100 to-emerald-50 border-lime-200",
  },
  sugarcane: {
    icon: "🎋",
    season: "zaid",
    accentClass: "from-green-100 to-emerald-50 border-green-200",
  },
  vegetables: {
    icon: "🥬",
    season: "zaid",
    accentClass: "from-teal-100 to-cyan-50 border-teal-200",
  },
};

const reveal = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export function CropGuideExplorer() {
  const { dictionary } = useLanguage();
  const [query, setQuery] = useState("");
  const [seasonFilter, setSeasonFilter] = useState<SeasonFilter>("all");

  const crops = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return CROP_ORDER.map((cropId) => ({
      id: cropId,
      ...dictionary.cropGuide.crops[cropId],
      icon: CROP_META[cropId].icon,
      seasonKey: CROP_META[cropId].season,
      accentClass: CROP_META[cropId].accentClass,
    })).filter((crop) => {
      const matchesSeason =
        seasonFilter === "all" ? true : crop.seasonKey === seasonFilter;

      if (!matchesSeason) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = [
        crop.name,
        crop.season,
        crop.water,
        crop.fertilizer,
        crop.diseases,
        crop.tip,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [dictionary.cropGuide.crops, query, seasonFilter]);

  return (
    <div className="space-y-6">
      <motion.section
        variants={reveal}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.45 }}
        className="rounded-3xl border border-green-100 bg-white/90 p-6 shadow-card sm:p-8"
      >
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
          {dictionary.cropGuide.eyebrow}
        </p>
        <h1 className="mt-2 text-balance text-3xl font-bold text-primary sm:text-4xl">
          {dictionary.cropGuide.title}
        </h1>
        <p className="mt-3 max-w-3xl text-green-900/85">{dictionary.cropGuide.description}</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={dictionary.cropGuide.searchPlaceholder}
            className="w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-sm text-green-900 outline-none ring-primary focus:ring-2"
          />

          <label className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-900">
            <span>{dictionary.cropGuide.filterLabel}</span>
            <select
              value={seasonFilter}
              onChange={(event) => setSeasonFilter(event.target.value as SeasonFilter)}
              className="bg-transparent text-sm font-semibold outline-none"
            >
              <option value="all">{dictionary.cropGuide.allSeasons}</option>
              <option value="kharif">{dictionary.cropGuide.seasonFilters.kharif}</option>
              <option value="rabi">{dictionary.cropGuide.seasonFilters.rabi}</option>
              <option value="zaid">{dictionary.cropGuide.seasonFilters.zaid}</option>
            </select>
          </label>
        </div>
      </motion.section>

      {crops.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-green-300 bg-white/70 p-8 text-center">
          <h2 className="text-xl font-bold text-primary">{dictionary.cropGuide.noResultTitle}</h2>
          <p className="mt-2 text-sm text-green-900/80">{dictionary.cropGuide.noResultHint}</p>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {crops.map((crop, index) => (
          <motion.article
            key={crop.id}
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: index * 0.04, duration: 0.4 }}
            className="group rounded-2xl border border-green-100 bg-white/90 p-5 shadow-card transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className={`rounded-2xl border bg-gradient-to-br p-4 ${crop.accentClass}`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-white text-2xl shadow-sm">
                    {crop.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-primary">{crop.name}</h2>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-green-700">
                      {dictionary.cropGuide.labels.season}: {crop.season}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 text-sm">
              <p className="rounded-xl border border-green-100 bg-green-50/70 px-3 py-2 text-green-950">
                <span className="font-semibold">{dictionary.cropGuide.labels.water}: </span>
                {crop.water}
              </p>
              <p className="rounded-xl border border-green-100 bg-green-50/70 px-3 py-2 text-green-950">
                <span className="font-semibold">{dictionary.cropGuide.labels.fertilizer}: </span>
                {crop.fertilizer}
              </p>
              <p className="rounded-xl border border-green-100 bg-green-50/70 px-3 py-2 text-green-950">
                <span className="font-semibold">{dictionary.cropGuide.labels.diseases}: </span>
                {crop.diseases}
              </p>
              <p className="rounded-xl border border-lime-200 bg-lime-50 px-3 py-2 text-lime-950">
                <span className="font-semibold">{dictionary.cropGuide.labels.bestTip}: </span>
                {crop.tip}
              </p>
            </div>
          </motion.article>
        ))}
      </section>
    </div>
  );
}
