"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { translations, type Locale, type TranslationKey } from "@/lib/i18n"

interface LanguageContextType {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "pt-BR",
  setLocale: () => {},
  t: (key) => key,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("pt-BR")

  useEffect(() => {
    const stored = localStorage.getItem("inspesub_locale") as Locale | null
    if (stored === "pt-BR" || stored === "en") setLocaleState(stored)
  }, [])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    localStorage.setItem("inspesub_locale", l)
  }, [])

  const t = useCallback(
    (key: TranslationKey): string => translations[locale][key] ?? translations["pt-BR"][key] ?? key,
    [locale]
  )

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
