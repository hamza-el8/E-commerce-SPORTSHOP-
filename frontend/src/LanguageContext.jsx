import { useEffect, useState } from "react";
import { LanguageContext } from "./language.js";

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const savedLanguage = localStorage.getItem("ss_lang");
    return savedLanguage === "fr" || savedLanguage === "en" ? savedLanguage : "en";
  });

  useEffect(() => {
    localStorage.setItem("ss_lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (french, english) => lang === "en" ? english : french;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
