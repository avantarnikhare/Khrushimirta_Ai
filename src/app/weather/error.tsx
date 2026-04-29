"use client";

import { useLanguage } from "@/context/language-context";

type WeatherErrorProps = {
  error: Error;
  reset: () => void;
};

export default function WeatherError({ error, reset }: WeatherErrorProps) {
  const { dictionary } = useLanguage();

  return (
    <section className="glass-card p-6 sm:p-8">
      <p className="text-sm font-semibold text-red-700">
        {dictionary.errors.weatherLoadFail}
      </p>
      <p className="mt-2 text-sm text-green-900/85">
        {error.message || dictionary.errors.unexpected}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
      >
        {dictionary.errors.tryAgain}
      </button>
    </section>
  );
}
