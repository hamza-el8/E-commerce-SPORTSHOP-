/**
 * Home — Premium Dark Edition
 * Hero plein écran · Category bar sticky · Grille produits avec animations
 * Footer luxe noir/or
 */
import { useEffect, useState, useCallback, useRef } from "react";
import { Link, useNavigate }                        from "react-router-dom";
import api                                          from "../api";
import { useAuth }                                  from "../AuthContext";
import { useCartFav }                               from "../CartFavContext";
import { translateCategory, useLanguage }           from "../language.js";
import HeroSlider                                   from "../components/HeroSlider";

/* ─────────────────────────────────────────
   SVG ICONS
───────────────────────────────────────── */
const IconHeart = ({ filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      fill={filled ? "#e53e3e" : "none"}
      stroke={filled ? "#e53e3e" : "currentColor"}
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
    />
  </svg>
);

const IconSearch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const IconTag = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);                                             

const IconArrow = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
       width="18" height="18">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

const IconCart = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
       width="14" height="14">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

const IconArrowRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
       width="16" height="16">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

/* ─────────────────────────────────────────
   CATEGORY ICONS
───────────────────────────────────────── */
const s = { fill:"none", stroke:"currentColor", strokeWidth:1.6, strokeLinecap:"round", strokeLinejoin:"round" };

const CatIcons = {
  Accessoires: (
    <svg viewBox="0 0 24 24" {...s}>
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 2.5v2.2M12 19.3v2.2M4.4 4.4l1.6 1.6M18 18l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.4 19.6 6 18M18 6l1.6-1.6"/>
    </svg>
  ),
  Chaussures: (
    <svg viewBox="0 0 24 24" {...s}>
      <path d="M3.5 16.5h17v1.2a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-1.2z"/>
      <path d="M4 16.5V13c0-1.2.6-2.2 1.6-2.8L9 8.6c.6-.3 1.3-.2 1.8.2l1.4 1.2h3.2c2.2 0 4.1 1.5 4.6 3.6"/>
      <path d="M9.2 12.2h2.2"/>
    </svg>
  ),
  Maillots: (
    <svg viewBox="0 0 24 24" {...s}>
      <path d="M8.2 4.2 6 3.2 3.2 6.4l2.1 2.1L7 7.2V20h10V7.2l1.7 1.3 2.1-2.1L18 3.2l-2.2 1"/>
      <path d="M9.2 4.2a2.8 2.8 0 0 0 5.6 0"/>
    </svg>
  ),
  Shorts: (
    <svg viewBox="0 0 24 24" {...s}>
      <path d="M7 4h10l1.2 5.2L16.4 20h-3.1L12 11.2 10.7 20H7.6L5.8 9.2 7 4z"/>
      <path d="M9.2 4c.4 1.4 1.4 2.2 2.8 2.2S14.4 5.4 14.8 4"/>
    </svg>
  ),
  Survêtements: (
    <svg viewBox="0 0 24 24" {...s}>
      <path d="M8 3.5 5.5 5 4 8.2 5.6 9.4 7 8.2V20h4v-7h2v7h4V8.2l1.4 1.2L20 8.2 18.5 5 16 3.5"/>
      <path d="M9.4 3.6a2.6 2.6 0 0 0 5.2 0"/>
      <path d="M9 12.5h6"/>
    </svg>
  ),
  "T-shirts": (
    <svg viewBox="0 0 24 24" {...s}>
      <path d="M8.5 5 6.2 3.8 3 7.2l2.4 2.2L7.2 8v11h9.6V8l1.8 1.4L21 7.2 17.8 3.8 15.5 5"/>
      <path d="M9.4 5.1a2.6 2.6 0 0 0 5.2 0"/>
    </svg>
  ),
  default: (
    <svg viewBox="0 0 24 24" {...s}>
      <path d="M6 8h12l1 12H5L6 8z"/>
      <path d="M9 8V6.5A3 3 0 0 1 12 3.5 3 3 0 0 1 15 6.5V8"/>
    </svg>
  ),
};

/* ─────────────────────────────────────────
   TRUST ICONS (footer)
───────────────────────────────────────── */
const TrustIcons = {
  truck: (
    <svg viewBox="0 0 24 24" {...s}><path d="M3 7h11v10H3z"/><path d="M14 10h4.2L21 13.2V17h-7"/><circle cx="7" cy="18.2" r="1.6"/><circle cx="17.2" cy="18.2" r="1.6"/></svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" {...s}><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
  ),
  returns: (
    <svg viewBox="0 0 24 24" {...s}><path d="M4 12a8 8 0 1 0 2.3-5.6"/><path d="M4 4.5V9h4.5"/></svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" {...s}><path d="m12 3.6 2.2 4.6 5 .7-3.6 3.5.9 5.1L12 15.2 7.5 17.5l.9-5.1L4.8 8.9l5-.7L12 3.6z"/></svg>
  ),
};

/* ─────────────────────────────────────────
   LOGO MARK (footer)
───────────────────────────────────────── */
const FooterLogoMark = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
    <path d="M11.5 2 L6 10.5 L10 10.5 L8.5 18 L14 9 L10 9 Z" fill="#0a0a0a"/>
  </svg>
);

/* ─────────────────────────────────────────
   TOAST
───────────────────────────────────────── */
function Toast({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.type}`}>
          {t.type === "success" ? "✦" : "✕"} {t.message}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   SKELETON CARD
───────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-card__img" />
      <div className="skeleton-card__body">
        <div className="skeleton skeleton-card__title" />
        <div className="skeleton skeleton-card__subtitle" />
        <div className="skeleton skeleton-card__price" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   CATEGORY BAR
───────────────────────────────────────── */
function CategoryBar({ categories, activeId, onSelect }) {
  const { lang, t } = useLanguage();
  return (
    <div className="cat-bar-wrapper">
      <div className="cat-bar">
        <button
          className={`cat-bar__item${!activeId ? " active" : ""}`}
          onClick={() => onSelect("")}
          aria-pressed={!activeId}
        >
          <span className="cat-bar__circle">
            <svg viewBox="0 0 24 24" {...s}>
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          </span>
          <span className="cat-bar__label">{t("Tout", "All")}</span>
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`cat-bar__item${activeId === String(cat.id) ? " active" : ""}`}
            onClick={() => onSelect(String(cat.id))}
            aria-pressed={activeId === String(cat.id)}
          >
            <span className="cat-bar__circle">
              {CatIcons[cat.nom] || CatIcons.default}
            </span>
            <span className="cat-bar__label">{translateCategory(cat.nom, lang)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   FILTERS
───────────────────────────────────────── */
function Filters({ filters, categories, onChange, onReset }) {
  const { lang, t } = useLanguage();
  return (
    <div className="filters">
      <div className="filters__group filters__group--search">
        <span className="filters__icon"><IconSearch /></span>
        <input
          name="search"
          placeholder={t("Rechercher un produit...", "Search a product...")}
          value={filters.search}
          onChange={onChange}
        />
      </div>

      <div className="filters__group filters__select-wrap">
        <span className="filters__icon"><IconTag /></span>
        <select name="categorie_id" value={filters.categorie_id} onChange={onChange}>
          <option value="">{t("Toutes les catégories", "All categories")}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{translateCategory(c.nom, lang)}</option>
          ))}
        </select>
      </div>

      <div className="filters__group" style={{ minWidth: "110px", flex: "0 0 auto" }}>
        <span className="filters__icon" style={{ fontSize:"11px", fontWeight:700, color:"var(--c-muted)", left:"12px" }}>Min</span>
        <input name="prix_min" type="number" min="0" placeholder="0 DH"
               value={filters.prix_min} onChange={onChange} style={{ paddingLeft:"44px" }} />
      </div>

      <div className="filters__group" style={{ minWidth: "110px", flex: "0 0 auto" }}>
        <span className="filters__icon" style={{ fontSize:"11px", fontWeight:700, color:"var(--c-muted)", left:"12px" }}>Max</span>
        <input name="prix_max" type="number" min="0" placeholder="∞ DH"
               value={filters.prix_max} onChange={onChange} style={{ paddingLeft:"44px" }} />
      </div>

      <button className="filters__reset" onClick={onReset} type="button">
        {t("Réinitialiser", "Reset")}
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────
   PRODUCT CARD
───────────────────────────────────────── */
function ProductCard({ produit, isFav, onToggleFav, onAddToCart, index }) {
  const { lang, t } = useLanguage();
  const rupture     = produit.stock === 0;

  return (
    <article
      className="card"
      style={{ animationDelay: `${(index % 8) * 0.06}s` }}
    >
      <div className="card__img-wrap">
        <Link to={`/produit/${produit.id}`} tabIndex={-1}>
          <img
            src={produit.image || "https://placehold.co/400x500/f8f7f5/a8a8a8?text=Sport"}
            alt={produit.nom}
            loading="lazy"
          />
        </Link>

        {rupture ? (
          <span className="card__stock-badge">{t("Épuisé", "Out of stock")}</span>
        ) : produit.prix_promo ? (
          <span className="card__promo-badge">
            −{Math.round((1 - produit.prix_promo / produit.prix) * 100)}%
          </span>
        ) : (
          produit.categorie?.nom && (
            <span className="card__category-badge">
              {translateCategory(produit.categorie.nom, lang)}
            </span>
          )
        )}

        <button
          className={`card__fav-btn${isFav ? " active" : ""}`}
          onClick={() => onToggleFav(produit.id)}
          aria-label={isFav ? t("Retirer des favoris","Remove from favorites") : t("Ajouter aux favoris","Add to favorites")}
        >
          <IconHeart filled={isFav} />
        </button>

        <button
          className="card__add-btn"
          onClick={() => onAddToCart(produit.id)}
          disabled={rupture}
        >
          <IconCart />
          {rupture ? t("Indisponible","Unavailable") : t("Ajouter","Add to cart")}
        </button>
      </div>

      <div className="card__body">
        <Link to={`/produit/${produit.id}`} className="card__name">
          {produit.nom}
        </Link>
        {produit.prix_promo ? (
          <div className="card__price-wrap">
            <p className="price price--promo">
              {Number(produit.prix_promo).toLocaleString(lang === "fr" ? "fr-MA" : "en-US")} DH
            </p>
            <p className="price price--original">
              {Number(produit.prix).toLocaleString(lang === "fr" ? "fr-MA" : "en-US")} DH
            </p>
          </div>
        ) : (
          <p className="price">
            {Number(produit.prix).toLocaleString(lang === "fr" ? "fr-MA" : "en-US")} DH
          </p>
        )}
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────
   HERO BANNER
───────────────────────────────────────── */
function HeroBanner() {
  const { t } = useLanguage();
  return (
    <section className="hero">
      {/* Contenu texte */}
      <div className="hero__content">
        <div className="hero__overline hero--a1">
          <span className="hero__overline-line" />
          {t("Nouvelle Collection 2026", "New 2026 Collection")}
        </div>

        <h1 className="hero__title hero--a2">
          <span>{t("Équipez", "Gear")}</span>
          <span className="hero__title-gold">{t("vous", "up")}</span>
          <span className="hero__title-outline">{t("pour gagner", "to win")}</span>
        </h1>

        <p className="hero__subtitle hero--a3">
          {t(
            "Vêtements et équipements axés sur la performance. Livraison 48h partout au Maroc.",
            "Performance-focused sportswear and equipment. 48h delivery across Morocco."
          )}
        </p>

        <div className="hero__ctas hero--a4">
          <a href="#produits" className="hero__cta-primary">
            {t("Découvrir", "Shop now")}
            <IconArrow />
          </a>
          <a href="#produits" className="hero__cta-secondary">
            {t("Voir la collection", "View collection")}
            <IconArrowRight />
          </a>
        </div>

        <div className="hero__stats hero--a5">
          <div className="hero__stat">
            <span className="hero__stat-num">500+</span>
            <span className="hero__stat-label">{t("Produits", "Products")}</span>
          </div>
          <div className="hero__stat">
            <span className="hero__stat-num">48H</span>
            <span className="hero__stat-label">{t("Livraison", "Delivery")}</span>
          </div>
          <div className="hero__stat">
            <span className="hero__stat-num">4.9</span>
            <span className="hero__stat-label">{t("Satisfaction", "Rating")}</span>
          </div>
        </div>
      </div>

      {/* Slider visuel */}
      <div className="hero__slider-col">
        <HeroSlider />
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   FOOTER
───────────────────────────────────────── */
function Footer() {
  const { t } = useLanguage();
  const year  = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__topbar" />

      {/* Newsletter */}
      <div className="footer__newsletter">
        <div className="footer__newsletter-inner">
          <div>
            <p className="footer__newsletter-label">✦ {t("Newsletter", "Newsletter")}</p>
            <p className="footer__newsletter-title">{t("Restez dans le jeu", "Stay in the game")}</p>
            <p className="footer__newsletter-sub">
              {t(
                "Offres exclusives et nouveautés directement dans votre boîte mail.",
                "Exclusive offers and new arrivals straight to your inbox."
              )}
            </p>
          </div>
          <form className="footer__newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              className="footer__newsletter-input"
              placeholder={t("Votre adresse e-mail", "Your email address")}
            />
            <button type="submit" className="footer__newsletter-btn">
              {t("S'abonner", "Subscribe")}
            </button>
          </form>
        </div>
      </div>

      {/* Trust bar */}
      <div className="footer__trust">
        <div className="footer__trust-inner">
          {[
            { icon: TrustIcons.truck,   label: t("Livraison 48h","48h Delivery"),     sub: t("Partout au Maroc","Across Morocco") },
            { icon: TrustIcons.lock,    label: t("Paiement sécurisé","Secure payment"), sub: "SSL 256-bit" },
            { icon: TrustIcons.returns, label: t("Retours gratuits","Free returns"),    sub: t("30 jours","30 days") },
            { icon: TrustIcons.star,    label: "4.9 / 5",                               sub: t("2 400+ avis","2,400+ reviews") },
          ].map(({ icon, label, sub }) => (
            <div className="footer__trust-item" key={label}>
              <span className="footer__trust-icon">{icon}</span>
              <div>
                <p className="footer__trust-label">{label}</p>
                <p className="footer__trust-sub">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Colonnes */}
      <div className="footer__main">
        {/* Marque */}
        <div className="footer__brand-col">
          <div className="footer__brand-logo">
            <div className="footer__brand-mark">
              <FooterLogoMark />
            </div>
            <span className="footer__brand-name">
              SPORT<span>SHOP</span>
            </span>
          </div>
          <p className="footer__brand-desc">
            {t(
              "Votre destination sport au Maroc. Vêtements, chaussures et équipements premium livrés en 48h.",
              "Your sports destination in Morocco. Premium clothing, footwear and equipment delivered in 48h."
            )}
          </p>
          <div className="footer__socials">
            {[
              { label:"Instagram", href:"#", svg:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg> },
              { label:"Facebook",  href:"#", svg:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> },
              { label:"TikTok",    href:"#", svg:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg> },
              { label:"YouTube",   href:"#", svg:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-1.96C18.88 4 12 4 12 4s-6.88 0-8.6.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.4 19.54C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg> },
            ].map(({ label, href, svg }) => (
              <a key={label} href={href} className="footer__social-link" aria-label={label}>{svg}</a>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div>
          <p className="footer__col-title">{t("Navigation","Navigation")}</p>
          <ul className="footer__links">
            <li><Link to="/"        className="footer__link">{t("Tous les produits","All products")}</Link></li>
            <li><Link to="/favoris" className="footer__link">{t("Mes favoris","My favorites")}</Link></li>
            <li><Link to="/panier"  className="footer__link">{t("Mon panier","My cart")}</Link></li>
            <li><Link to="/profil"  className="footer__link">{t("Mon compte","My account")}</Link></li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <p className="footer__col-title">{t("Services","Services")}</p>
          <ul className="footer__links">
            <li><a href="#" className="footer__link">{t("Livraison & retours","Shipping & returns")}</a></li>
            <li><a href="#" className="footer__link">{t("Guide des tailles","Size guide")}</a></li>
            <li><a href="#" className="footer__link">{t("Programme fidélité","Loyalty program")}</a></li>
            <li><a href="#" className="footer__link">{t("Cartes cadeaux","Gift cards")}</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <p className="footer__col-title">{t("Contact","Contact")}</p>
          <ul className="footer__links">
            <li>
              <a href="mailto:contact@sportshop.ma" className="footer__link footer__link--icon">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                contact@sportshop.ma
              </a>
            </li>
            <li>
              <a href="tel:+212600000000" className="footer__link footer__link--icon">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.6 1.25h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.29 6.29l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                +212 600-000-000
              </a>
            </li>
            <li>
              <span className="footer__link footer__link--icon" style={{ cursor:"default" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {t("Casablanca, Maroc","Casablanca, Morocco")}
              </span>
            </li>
            <li>
              <span className="footer__link footer__link--icon" style={{ cursor:"default" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {t("Lun–Sam : 9h – 18h","Mon–Sat: 9am – 6pm")}
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer__bottom">
        <div className="footer__bottom-left">
          <p>© {year} SportShop. {t("Tous droits réservés.","All rights reserved.")}</p>
          <span className="footer__bottom-dot" />
          <p>{t("Fait avec ✦ au Maroc","Made with ✦ in Morocco")}</p>
        </div>
        <nav className="footer__bottom-links">
          <a href="#" className="footer__bottom-link">{t("Confidentialité","Privacy")}</a>
          <a href="#" className="footer__bottom-link">{t("CGV","Terms")}</a>
          <a href="#" className="footer__bottom-link">{t("Mentions légales","Legal")}</a>
          <a href="#" className="footer__bottom-link">Cookies</a>
        </nav>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────
   PAGE HOME
───────────────────────────────────────── */
const FILTERS_INIT = { search: "", categorie_id: "", prix_min: "", prix_max: "" };
const SKELETON_N   = 8;

export default function Home() {
  const { t }                           = useLanguage();
  const { user }                        = useAuth();
  const navigate                        = useNavigate();
  const { incCart, incFav, decFav }     = useCartFav();

  const [produits,   setProduits]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [favIds,     setFavIds]     = useState([]);
  const [filters,    setFilters]    = useState(FILTERS_INIT);
  const [loading,    setLoading]    = useState(true);
  const [toasts,     setToasts]     = useState([]);

  /* Chargement catégories */
  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data));
  }, []);

  /* Chargement produits */
  useEffect(() => {
    setLoading(true);
    api.get("/produits", { params: filters })
      .then((res) => setProduits(res.data))
      .finally(() => setLoading(false));
  }, [filters]);

  /* Favoris */
  useEffect(() => {
    if (user) api.get("/favoris").then((res) => setFavIds(res.data.map((p) => p.id)));
    else      setFavIds([]);
  }, [user]);

  /* Toast helper */
  const showToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  const handleChange = (e) =>
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleReset = () => setFilters(FILTERS_INIT);

  /* Ajouter au panier */
  const addToCart = async (id) => {
    if (!user) return navigate("/login");
    try {
      await api.post("/panier/items", { produit_id: id, quantite: 1 });
      incCart(1);
      showToast(t("Ajouté au panier !", "Added to cart!"), "success");
    } catch (err) {
      showToast(err.response?.data?.message || t("Erreur lors de l'ajout", "Could not add"), "error");
    }
  };

  /* Toggle favori */
  const toggleFav = async (id) => {
    if (!user) return navigate("/login");
    if (favIds.includes(id)) {
      await api.delete(`/favoris/${id}`);
      setFavIds((prev) => prev.filter((f) => f !== id));
      decFav();
      showToast(t("Retiré des favoris", "Removed from favorites"), "success");
    } else {
      await api.post("/favoris", { produit_id: id });
      setFavIds((prev) => [...prev, id]);
      incFav();
      showToast(t("Ajouté aux favoris ✦", "Added to favorites ✦"), "success");
    }
  };

  return (
    <>
      {/* Hero */}
      <HeroBanner />

      {/* Category bar */}
      <CategoryBar
        categories={categories}
        activeId={filters.categorie_id}
        onSelect={(id) => setFilters((prev) => ({ ...prev, categorie_id: id }))}
      />

      {/* Produits */}
      <section id="produits" className="products-section">
        <div className="section-header">
          <h2 className="section-title">{t("Nos produits", "Our products")}</h2>
          {!loading && (
            <span className="section-count">
              {produits.length}&nbsp;{produits.length === 1 ? t("article","item") : t("articles","items")}
            </span>
          )}
        </div>

        <Filters
          filters={filters}
          categories={categories}
          onChange={handleChange}
          onReset={handleReset}
        />

        <div className="grid">
          {loading ? (
            Array.from({ length: SKELETON_N }).map((_, i) => <SkeletonCard key={i} />)
          ) : produits.length > 0 ? (
            produits.map((p, i) => (
              <ProductCard
                key={p.id}
                produit={p}
                index={i}
                isFav={favIds.includes(p.id)}
                onToggleFav={toggleFav}
                onAddToCart={addToCart}
              />
            ))
          ) : (
            <div className="empty-state">
              <span className="empty-state__icon">◎</span>
              <p className="empty-state__title">{t("Aucun produit trouvé","No products found")}</p>
              <p className="empty-state__text">
                {t(
                  "Ajustez vos filtres ou réinitialisez la recherche.",
                  "Try adjusting your filters or resetting your search."
                )}
              </p>
              <button className="btn btn--outline" onClick={handleReset} style={{ marginTop:"8px" }}>
                {t("Voir tous les produits","View all products")}
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
      <Toast toasts={toasts} />
    </>
  );
}
