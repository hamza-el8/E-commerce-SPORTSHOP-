/**
 * HeroSlider — SportShop
 * Carrousel hero : crossfade + Ken Burns + dots + flèches + progression + swipe.
 * Les slides utilisent des illustrations SVG inline comme fond visuel —
 * aucune image externe requise. Si /hero/slideN.jpg existe, elle s'affiche
 * par-dessus l'illustration.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "../language.js";

/* ─────────────────────────────────────────
   Illustrations SVG par catégorie
───────────────────────────────────────── */

/* Slide 1 — Chaussure de running */
const IlluShoe = () => (
  <svg viewBox="0 0 480 360" xmlns="http://www.w3.org/2000/svg"
       className="hslider__illu" preserveAspectRatio="xMidYMid slice">
    {/* Fond dégradé */}
    <defs>
      <radialGradient id="bg1" cx="60%" cy="50%" r="70%">
        <stop offset="0%" stopColor="#3d1500"/>
        <stop offset="100%" stopColor="#0d0400"/>
      </radialGradient>
      <linearGradient id="sole1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ff5a1f"/>
        <stop offset="100%" stopColor="#c03a0a"/>
      </linearGradient>
    </defs>
    <rect width="480" height="360" fill="url(#bg1)"/>

    {/* Cercles décoratifs */}
    <circle cx="340" cy="80" r="120" fill="none" stroke="rgba(255,90,31,0.08)" strokeWidth="40"/>
    <circle cx="340" cy="80" r="70"  fill="none" stroke="rgba(255,90,31,0.06)" strokeWidth="20"/>

    {/* Corps de la chaussure */}
    <path d="M80 240 C80 240 90 180 140 170 C170 165 190 185 220 185
             C260 185 290 165 330 168 C360 170 380 188 375 205
             C368 225 340 232 300 232 L80 232 Z"
          fill="white" opacity="0.95"/>

    {/* Semelle */}
    <rect x="78" y="230" width="300" height="22" rx="11" fill="url(#sole1)"/>

    {/* Languette */}
    <path d="M135 170 C135 170 138 140 148 132 C158 124 165 138 165 170"
          fill="#eeeeee"/>

    {/* Lacets */}
    <line x1="150" y1="175" x2="165" y2="168" stroke="#ff5a1f" strokeWidth="3" strokeLinecap="round"/>
    <line x1="155" y1="183" x2="172" y2="176" stroke="#ff5a1f" strokeWidth="3" strokeLinecap="round"/>
    <line x1="160" y1="191" x2="178" y2="184" stroke="#ff5a1f" strokeWidth="3" strokeLinecap="round"/>
    <line x1="165" y1="199" x2="183" y2="192" stroke="#ff5a1f" strokeWidth="3" strokeLinecap="round"/>
    <line x1="170" y1="207" x2="188" y2="200" stroke="#ff5a1f" strokeWidth="3" strokeLinecap="round"/>

    {/* Trait décoratif swoosh */}
    <path d="M195 220 Q270 195 350 210" fill="none" stroke="rgba(255,90,31,0.6)" strokeWidth="3" strokeLinecap="round"/>

    {/* Texte décoratif */}
    <text x="80" y="290" fontFamily="Montserrat,sans-serif" fontWeight="900"
          fontSize="48" fill="rgba(255,255,255,0.04)" letterSpacing="-2">RUNNING</text>

    {/* Badge -30% */}
    <rect x="340" y="140" width="76" height="30" rx="15" fill="#ff5a1f"/>
    <text x="378" y="160" fontFamily="Montserrat,sans-serif" fontWeight="800"
          fontSize="13" fill="white" textAnchor="middle">−30 %</text>
  </svg>
);

/* Slide 2 — Maillot de sport */
const IlluShirt = () => (
  <svg viewBox="0 0 480 360" xmlns="http://www.w3.org/2000/svg"
       className="hslider__illu" preserveAspectRatio="xMidYMid slice">
    <defs>
      <radialGradient id="bg2" cx="50%" cy="40%" r="70%">
        <stop offset="0%" stopColor="#001830"/>
        <stop offset="100%" stopColor="#000810"/>
      </radialGradient>
      <linearGradient id="shirt2" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ff5a1f"/>
        <stop offset="100%" stopColor="#c03a0a"/>
      </linearGradient>
    </defs>
    <rect width="480" height="360" fill="url(#bg2)"/>

    {/* Hexagones décoratifs */}
    <polygon points="380,40 400,52 400,76 380,88 360,76 360,52"
             fill="none" stroke="rgba(255,90,31,0.12)" strokeWidth="2"/>
    <polygon points="420,90 445,105 445,135 420,150 395,135 395,105"
             fill="none" stroke="rgba(255,90,31,0.07)" strokeWidth="2"/>

    {/* Corps du maillot */}
    <path d="M160 100 L120 140 L145 155 L145 270 L335 270 L335 155 L360 140 L320 100
             C320 100 305 85 295 82 C285 90 270 95 240 95 C210 95 195 90 185 82
             C175 85 160 100 160 100 Z"
          fill="url(#shirt2)"/>

    {/* Col */}
    <path d="M205 82 C215 95 265 95 275 82" fill="none" stroke="white" strokeWidth="3"/>

    {/* Rayures décoratives */}
    <line x1="145" y1="175" x2="335" y2="175" stroke="rgba(255,255,255,0.15)" strokeWidth="2"/>
    <line x1="145" y1="195" x2="335" y2="195" stroke="rgba(255,255,255,0.15)" strokeWidth="2"/>

    {/* Numéro */}
    <text x="240" y="235" fontFamily="Montserrat,sans-serif" fontWeight="900"
          fontSize="60" fill="rgba(255,255,255,0.18)" textAnchor="middle">10</text>

    {/* Logo SportShop sur le maillot */}
    <text x="240" y="145" fontFamily="Montserrat,sans-serif" fontWeight="900"
          fontSize="10" fill="rgba(255,255,255,0.5)" textAnchor="middle" letterSpacing="2">SPORTSHOP</text>

    {/* Texte fond */}
    <text x="80" y="310" fontFamily="Montserrat,sans-serif" fontWeight="900"
          fontSize="48" fill="rgba(255,255,255,0.03)" letterSpacing="-2">MAILLOTS</text>

    {/* Badge Nouveau */}
    <rect x="340" y="50" width="80" height="28" rx="14" fill="rgba(255,255,255,0.1)"
          stroke="rgba(255,90,31,0.5)" strokeWidth="1"/>
    <text x="380" y="69" fontFamily="Montserrat,sans-serif" fontWeight="700"
          fontSize="12" fill="#ff5a1f" textAnchor="middle">NOUVEAU</text>
  </svg>
);

/* Slide 3 — Sac de sport */
const IlluBag = () => (
  <svg viewBox="0 0 480 360" xmlns="http://www.w3.org/2000/svg"
       className="hslider__illu" preserveAspectRatio="xMidYMid slice">
    <defs>
      <radialGradient id="bg3" cx="40%" cy="60%" r="70%">
        <stop offset="0%" stopColor="#0f1f00"/>
        <stop offset="100%" stopColor="#040800"/>
      </radialGradient>
    </defs>
    <rect width="480" height="360" fill="url(#bg3)"/>

    {/* Grille points déco */}
    {[0,1,2,3,4].map((row) =>
      [0,1,2,3].map((col) => (
        <circle key={`${row}-${col}`}
          cx={310 + col * 28} cy={60 + row * 28}
          r="2" fill="rgba(255,90,31,0.2)"
        />
      ))
    )}

    {/* Corps du sac */}
    <rect x="140" y="135" width="220" height="165" rx="18"
          fill="#1a1a1a" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5"/>

    {/* Couvercle */}
    <path d="M155 135 C155 110 175 95 240 95 C305 95 325 110 325 135"
          fill="#222222" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5"/>

    {/* Poignée */}
    <path d="M205 95 C205 72 275 72 275 95"
          fill="none" stroke="#ff5a1f" strokeWidth="5" strokeLinecap="round"/>

    {/* Fermeture éclair */}
    <line x1="155" y1="135" x2="325" y2="135" stroke="rgba(255,90,31,0.6)" strokeWidth="2.5" strokeDasharray="6 4"/>
    <circle cx="240" cy="135" r="5" fill="#ff5a1f"/>

    {/* Poche avant */}
    <rect x="172" y="185" width="156" height="90" rx="10"
          fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5"/>

    {/* Fermeture poche */}
    <line x1="172" y1="213" x2="328" y2="213" stroke="rgba(255,90,31,0.4)" strokeWidth="1.5" strokeDasharray="5 3"/>

    {/* Bretelles */}
    <path d="M165 145 Q130 210 140 300" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" strokeLinecap="round"/>
    <path d="M315 145 Q350 210 340 300" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" strokeLinecap="round"/>

    {/* Logo */}
    <text x="250" y="240" fontFamily="Montserrat,sans-serif" fontWeight="900"
          fontSize="9" fill="rgba(255,90,31,0.6)" textAnchor="middle" letterSpacing="2">SS</text>

    <text x="80" y="315" fontFamily="Montserrat,sans-serif" fontWeight="900"
          fontSize="44" fill="rgba(255,255,255,0.03)" letterSpacing="-1">ACCESSOIRES</text>
  </svg>
);

/* Slide 4 — Haltères / Fitness */
const IlluFitness = () => (
  <svg viewBox="0 0 480 360" xmlns="http://www.w3.org/2000/svg"
       className="hslider__illu" preserveAspectRatio="xMidYMid slice">
    <defs>
      <radialGradient id="bg4" cx="60%" cy="45%" r="70%">
        <stop offset="0%" stopColor="#1a0030"/>
        <stop offset="100%" stopColor="#060010"/>
      </radialGradient>
      <linearGradient id="metal" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#555555"/>
        <stop offset="50%" stopColor="#888888"/>
        <stop offset="100%" stopColor="#333333"/>
      </linearGradient>
    </defs>
    <rect width="480" height="360" fill="url(#bg4)"/>

    {/* Cercles d'énergie */}
    <circle cx="240" cy="180" r="140" fill="none" stroke="rgba(255,90,31,0.06)" strokeWidth="30"/>
    <circle cx="240" cy="180" r="90"  fill="none" stroke="rgba(255,90,31,0.04)" strokeWidth="16"/>

    {/* Haltère — barre centrale */}
    <rect x="120" y="168" width="240" height="24" rx="12" fill="url(#metal)"/>

    {/* Disque gauche externe */}
    <rect x="85"  y="148" width="38" height="64" rx="8" fill="#222"/>
    <rect x="90"  y="154" width="28" height="52" rx="6" fill="#1a1a1a" stroke="rgba(255,90,31,0.3)" strokeWidth="1.5"/>
    <text x="104" y="182" fontFamily="Montserrat,sans-serif" fontWeight="900"
          fontSize="9" fill="rgba(255,90,31,0.5)" textAnchor="middle">20</text>

    {/* Disque gauche interne */}
    <rect x="118" y="155" width="26" height="50" rx="6" fill="#282828"/>

    {/* Disque droit interne */}
    <rect x="336" y="155" width="26" height="50" rx="6" fill="#282828"/>

    {/* Disque droit externe */}
    <rect x="357" y="148" width="38" height="64" rx="8" fill="#222"/>
    <rect x="362" y="154" width="28" height="52" rx="6" fill="#1a1a1a" stroke="rgba(255,90,31,0.3)" strokeWidth="1.5"/>
    <text x="376" y="182" fontFamily="Montserrat,sans-serif" fontWeight="900"
          fontSize="9" fill="rgba(255,90,31,0.5)" textAnchor="middle">20</text>

    {/* Poignée centrale orange */}
    <rect x="196" y="164" width="88" height="32" rx="16"
          fill="#ff5a1f" opacity="0.9"/>

    {/* Ombre portée */}
    <ellipse cx="240" cy="225" rx="130" ry="12" fill="rgba(0,0,0,0.4)"/>

    {/* Texte fond */}
    <text x="80" y="305" fontFamily="Montserrat,sans-serif" fontWeight="900"
          fontSize="44" fill="rgba(255,255,255,0.03)" letterSpacing="-1">FITNESS</text>

    {/* Badge */}
    <rect x="340" y="55" width="88" height="28" rx="14" fill="rgba(255,90,31,0.15)"
          stroke="#ff5a1f" strokeWidth="1"/>
    <text x="384" y="74" fontFamily="Montserrat,sans-serif" fontWeight="700"
          fontSize="11" fill="#ff5a1f" textAnchor="middle">TOP VENTES</text>
  </svg>
);

/* ─────────────────────────────────────────
   Données des slides — illustration + img optionnelle
───────────────────────────────────────── */
const SLIDES = [
  {
    src:       "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    alt:       "Chaussures de running",
    altEn:     "Running shoes",
    label:     "Chaussures Running",
    labelEn:   "Running shoes",
    cta:       "Voir la collection",
    ctaEn:     "Shop the collection",
    Visual:    IlluShoe,
  },
  {
    src:       "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
    alt:       "Maillots de sport",
    altEn:     "Sports jerseys",
    label:     "Maillots & Hauts",
    labelEn:   "Jerseys & tops",
    cta:       "Découvrir",
    ctaEn:     "Discover",
    Visual:    IlluShirt,
  },
  {
    src:       "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
    alt:       "Sacs et accessoires sport",
    altEn:     "Sports bags and accessories",
    label:     "Accessoires",
    labelEn:   "Accessories",
    cta:       "Explorer",
    ctaEn:     "Explore",
    Visual:    IlluBag,
  },
  {
    src:       "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
    alt:       "Équipement fitness",
    altEn:     "Fitness equipment",
    label:     "Fitness & Gym",
    labelEn:   "Fitness & gym",
    cta:       "Voir tout",
    ctaEn:     "Shop all",
    Visual:    IlluFitness,
  },
];

const INTERVAL_MS    = 4000;
const REDUCED_MOTION = typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Icônes flèches */
const IconChevLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const IconChevRight = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 6 15 12 9 18"/>
  </svg>
);
const IconArrow = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

/* ─────────────────────────────────────────
   Composant principal
───────────────────────────────────────── */
export default function HeroSlider() {
  const { t } = useLanguage();
  const [current,  setCurrent]  = useState(0);
  const [paused,   setPaused]   = useState(false);
  const [progress, setProgress] = useState(0);
  const [imgLoaded, setImgLoaded] = useState({}); /* true=chargée, false=erreur */

  const timerRef   = useRef(null);
  const progRef    = useRef(null);
  const progStart  = useRef(null);
  const touchStart = useRef(null);
  const total      = SLIDES.length;

  /* ── Préchargement ── */
  useEffect(() => {
    SLIDES.forEach((s, i) => {
      const img = new Image();
      img.src     = s.src;
      img.onload  = () => setImgLoaded((p) => ({ ...p, [i]: true  }));
      img.onerror = () => setImgLoaded((p) => ({ ...p, [i]: false }));
    });
  }, []);

  /* ── Navigation ── */
  const goTo = useCallback((idx) => {
    setCurrent((idx + total) % total);
    setProgress(0);
    progStart.current = performance.now();
  }, [total]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  /* ── Barre de progression via rAF ── */
  useEffect(() => {
    if (REDUCED_MOTION) return;
    progStart.current = performance.now();

    const tick = (now) => {
      if (!paused) {
        const elapsed = now - (progStart.current ?? now);
        setProgress(Math.min((elapsed / INTERVAL_MS) * 100, 100));
      } else {
        /* Mémorise où on en était pour reprendre proprement */
        progStart.current = performance.now() - (progress / 100) * INTERVAL_MS;
      }
      progRef.current = requestAnimationFrame(tick);
    };

    progRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(progRef.current);
  }, [paused, current]); // eslint-disable-line

  /* ── Défilement automatique ── */
  useEffect(() => {
    if (REDUCED_MOTION || paused) return;
    timerRef.current = setTimeout(next, INTERVAL_MS);
    return () => clearTimeout(timerRef.current);
  }, [current, paused, next]);

  /* ── Swipe tactile ── */
  const onTouchStart = (e) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd   = (e) => {
    if (touchStart.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(delta) > 40) delta < 0 ? next() : prev();
    touchStart.current = null;
  };

  return (
    <div
      className="hslider"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role="region"
      aria-label={t("Carrousel de produits sportifs", "Sports product carousel")}
    >
      {/* ── Slides ── */}
      <div className="hslider__track">
        {SLIDES.map((slide, i) => {
          const { Visual } = slide;
          const hasRealImg  = imgLoaded[i] === true;

          return (
            <div
              key={i}
              className={`hslider__slide${i === current ? " active" : ""}`}
              aria-hidden={i !== current}
              role="group"
              aria-label={t(`${i + 1} sur ${total} : ${slide.label}`, `${i + 1} of ${total}: ${slide.labelEn}`)}
            >
              {/* Illustration SVG — toujours en fond */}
              <div className="hslider__illu-wrap">
                <Visual />
              </div>

              {/* Photo réelle par-dessus si chargée */}
              {hasRealImg && (
                <img
                  src={slide.src}
                  alt={t(slide.alt, slide.altEn)}
                  className={`hslider__img${i === current && !REDUCED_MOTION ? " ken-burns" : ""}`}
                />
              )}

              {/* Dégradé pour lisibilité de l'étiquette */}
              <div className="hslider__overlay" aria-hidden="true"/>

              {/* Étiquette + bouton */}
              {i === current && (
                <div className="hslider__caption">
                  <span className="hslider__caption-label">{t(slide.label, slide.labelEn)}</span>
                  <a href="#produits" className="hslider__caption-cta">
                    {t(slide.cta, slide.ctaEn)} <IconArrow />
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Barre de progression ── */}
      {!REDUCED_MOTION && (
        <div className="hslider__progress" aria-hidden="true">
          <div className="hslider__progress-fill" style={{ width: `${progress}%` }}/>
        </div>
      )}

      {/* ── Flèches ── */}
      <button className="hslider__arrow hslider__arrow--prev" onClick={prev} aria-label={t("Image précédente", "Previous slide")}>
        <IconChevLeft />
      </button>
      <button className="hslider__arrow hslider__arrow--next" onClick={next} aria-label={t("Image suivante", "Next slide")}>
        <IconChevRight />
      </button>

      {/* ── Dots ── */}
      <div className="hslider__dots" role="tablist" aria-label={t("Sélectionner un slide", "Select a slide")}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`hslider__dot${i === current ? " active" : ""}`}
            onClick={() => goTo(i)}
            role="tab"
            aria-selected={i === current}
            aria-label={t(`Slide ${i + 1} : ${SLIDES[i].label}`, `Slide ${i + 1}: ${SLIDES[i].labelEn}`)}
          />
        ))}
      </div>

    </div>
  );
}
