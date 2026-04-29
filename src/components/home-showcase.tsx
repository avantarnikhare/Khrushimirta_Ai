"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LiveSnapshot } from "@/components/live-snapshot";
import { useLanguage } from "@/context/language-context";

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export function HomeShowcase() {
  const { dictionary } = useLanguage();

  return (
    <div className="space-y-12">
      <motion.section
        variants={reveal}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.65 }}
        className="relative overflow-hidden rounded-3xl border border-green-100/90 bg-white/90 px-6 py-9 shadow-card backdrop-blur sm:px-10 sm:py-12"
      >
        <div className="pointer-events-none absolute -right-20 -top-16 h-64 w-64 rounded-full bg-green-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-0 h-56 w-56 rounded-full bg-lime-200/45 blur-3xl" />

        <div className="relative grid items-center gap-8 lg:grid-cols-[1.12fr_0.88fr]">
          <div className="space-y-5">
            <span className="inline-flex rounded-full border border-green-200 bg-green-50 px-4 py-1 text-xs font-bold uppercase tracking-[0.16em] text-green-800">
              {dictionary.home.badge}
            </span>

            <h1 className="text-balance text-4xl font-bold leading-tight text-primary sm:text-5xl">
              {dictionary.home.title}
            </h1>

            <p className="max-w-xl text-base text-green-900/85 sm:text-lg">
              {dictionary.home.description}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/ai-advisor"
                className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
              >
                {dictionary.home.ctaAdvisor}
              </Link>
              <Link
                href="/weather"
                className="rounded-full border border-primary/30 bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:border-primary/60"
              >
                {dictionary.home.ctaWeather}
              </Link>
            </div>

            <div className="grid gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-4">
              {dictionary.home.stats.map((stat) => (
                <article
                  key={stat.label}
                  className="rounded-2xl border border-green-100 bg-white/95 px-3 py-3"
                >
                  <p className="text-xl font-bold text-primary">{stat.value}</p>
                  <p className="text-xs font-medium text-green-900/80">{stat.label}</p>
                </article>
              ))}
            </div>
          </div>

          <LiveSnapshot />
        </div>
      </motion.section>

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {dictionary.home.featureCards.map((item, index) => (
          <motion.div
            key={item.title}
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            transition={{ delay: index * 0.06, duration: 0.5 }}
          >
            <Link
              href={item.href}
              className="group block rounded-2xl border border-green-100 bg-white/90 p-5 shadow-card transition hover:-translate-y-1 hover:border-green-200"
            >
              <h2 className="text-xl font-bold text-primary">{item.title}</h2>
              <p className="mt-2 text-sm text-green-900/85">{item.desc}</p>
              <p className="mt-4 text-sm font-semibold text-secondary transition group-hover:translate-x-0.5">
                {item.cta}
              </p>
            </Link>
          </motion.div>
        ))}
      </section>

      <motion.section
        variants={reveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.55 }}
        className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]"
      >
        <article className="rounded-3xl border border-green-100 bg-white/90 p-6 shadow-card sm:p-8">
          <h3 className="text-2xl font-bold text-primary">{dictionary.home.trustTitle}</h3>
          <div className="mt-5 grid gap-3">
            {dictionary.home.trustPoints.map((point) => (
              <p
                key={point}
                className="rounded-2xl border border-green-100 bg-green-50/70 px-4 py-3 text-sm text-green-950"
              >
                {point}
              </p>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-green-100 bg-gradient-to-br from-green-950 via-green-900 to-green-800 p-6 text-white shadow-card sm:p-8">
          <h3 className="text-2xl font-bold">{dictionary.home.testimonialTitle}</h3>
          <div className="mt-5 space-y-4">
            {dictionary.home.testimonials.map((item) => (
              <blockquote key={item.farmer} className="rounded-2xl bg-white/10 p-4">
                <p className="text-sm leading-relaxed text-green-50/95">“{item.quote}”</p>
                <footer className="mt-2 text-xs font-semibold uppercase tracking-[0.15em] text-green-100/90">
                  {item.farmer} · {item.region}
                </footer>
              </blockquote>
            ))}
          </div>
        </article>
      </motion.section>
    </div>
  );
}
