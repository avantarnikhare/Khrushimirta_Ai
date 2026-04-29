"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/context/language-context";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { dictionary, language, setLanguage, options } = useLanguage();

  const navItems = [
    { href: "/", label: dictionary.nav.home },
    { href: "/ai-advisor", label: dictionary.nav.aiAdvisor },
    { href: "/weather", label: dictionary.nav.weather },
    { href: "/crop-guide", label: dictionary.nav.cropGuide },
    { href: "/about", label: dictionary.nav.about },
  ];

  return (
    <header className="relative z-20 border-b border-green-200/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="min-w-0">
          <p className="font-heading text-xl font-bold tracking-tight text-primary">
            KrushiMitra AI 🌾
          </p>
          <p className="truncate text-[11px] font-semibold uppercase tracking-[0.22em] text-green-700/90">
            {dictionary.header.brandTagline}
          </p>
        </Link>

        <button
          className="rounded-md border border-green-300 px-3 py-2 text-sm font-semibold text-primary md:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={dictionary.header.menuLabel}
        >
          {dictionary.header.menuLabel}
        </button>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-primary text-white"
                    : "text-green-900 hover:bg-green-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          <div className="ml-2 flex items-center gap-2 rounded-full border border-green-200 bg-white px-3 py-1.5">
            <label htmlFor="global-language" className="text-xs font-semibold text-green-900">
              {dictionary.header.languageLabel}
            </label>
            <select
              id="global-language"
              value={language}
              onChange={(event) => {
                const selected = event.target.value;
                if (options.some((option) => option.code === selected)) {
                  setLanguage(selected as typeof language);
                }
              }}
              className="bg-transparent text-xs font-semibold text-green-900 outline-none"
            >
              {options.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </nav>
      </div>

      {open ? (
        <nav className="mx-4 mb-4 grid gap-2 rounded-xl border border-green-200 bg-white p-3 md:hidden">
          <div className="mb-2 flex items-center justify-between rounded-lg bg-green-50 px-3 py-2">
            <label htmlFor="global-language-mobile" className="text-xs font-semibold text-green-900">
              {dictionary.header.languageLabel}
            </label>
            <select
              id="global-language-mobile"
              value={language}
              onChange={(event) => {
                const selected = event.target.value;
                if (options.some((option) => option.code === selected)) {
                  setLanguage(selected as typeof language);
                }
              }}
              className="bg-transparent text-xs font-semibold text-green-900 outline-none"
            >
              {options.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                  active ? "bg-primary text-white" : "text-green-900"
                }`}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      ) : null}
    </header>
  );
}
