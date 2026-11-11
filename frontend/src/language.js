import { createContext, useContext } from "react";

export const LanguageContext = createContext(null);

const CATEGORY_TRANSLATIONS = {
  Accessoires: "Accessories",
  Chaussures: "Shoes",
  Maillots: "Jerseys",
  Survêtements: "Tracksuits",
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export function translateCategory(name, lang) {
  return lang === "en" ? CATEGORY_TRANSLATIONS[name] ?? name : name;
}
