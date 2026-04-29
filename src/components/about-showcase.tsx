"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/context/language-context";

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export function AboutShowcase() {
  const { dictionary } = useLanguage();

  return (
    <div className="space-y-6">
      <motion.section
        variants={reveal}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.55 }}
        className="rounded-3xl border border-green-100 bg-white/90 p-6 shadow-card sm:p-8"
      >
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
          {dictionary.about.eyebrow}
        </p>
        <h1 className="mt-2 text-balance text-3xl font-bold text-primary sm:text-4xl">
          {dictionary.about.title}
        </h1>
        <p className="mt-3 max-w-3xl text-green-900/85">{dictionary.about.description}</p>
      </motion.section>

      <section className="grid gap-4 md:grid-cols-2">
        <motion.article
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-green-100 bg-white/90 p-5 shadow-card"
        >
          <h2 className="text-xl font-bold text-primary">{dictionary.about.missionTitle}</h2>
          <p className="mt-3 text-sm leading-relaxed text-green-900">
            {dictionary.about.missionBody}
          </p>
        </motion.article>

        <motion.article
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          transition={{ delay: 0.08, duration: 0.5 }}
          className="rounded-2xl border border-green-100 bg-white/90 p-5 shadow-card"
        >
          <h2 className="text-xl font-bold text-primary">{dictionary.about.visionTitle}</h2>
          <p className="mt-3 text-sm leading-relaxed text-green-900">
            {dictionary.about.visionBody}
          </p>
        </motion.article>
      </section>

      <motion.section
        variants={reveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl border border-green-100 bg-gradient-to-br from-green-950 via-green-900 to-green-800 p-6 text-white shadow-card sm:p-7"
      >
        <h3 className="text-xl font-bold">{dictionary.about.valuesTitle}</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {dictionary.about.values.map((value) => (
            <p key={value} className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm">
              {value}
            </p>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
