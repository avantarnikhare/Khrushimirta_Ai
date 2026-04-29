"use client";

import { useLanguage } from "@/context/language-context";

export function SiteFooter() {
  const { dictionary } = useLanguage();

  return (
    <footer className="relative z-10 mt-10 border-t border-green-200/80 bg-white/70 py-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 text-sm text-green-900 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>{dictionary.footer.copyright}</p>
        <p className="font-semibold">{dictionary.footer.founder}</p>
      </div>
    </footer>
  );
}
