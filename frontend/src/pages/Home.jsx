/**
 * Home — SportShop
 * Page principale : Hero banner, filtres, grille produits, footer.
 * Logique métier inchangée (Axios, useAuth, toggleFav, addToCart).
 * Ajouts UI : skeleton loaders, toast notifications, état vide, footer.
 */ 
import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../AuthContext";
import { useCartFav } from "../CartFavContext";
import { translateCategory, useLanguage } from "../language.js";

/* ─────────────────────────────────────────
   Icônes SVG inline
───────────────────────────────────────── */
const IconHeart = ({ filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      fill={filled ? "#e53e3e" : "none"}
      stroke={filled ? "#e53e3e" : "currentColor"}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconSearch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const IconTag = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);

const IconArrowRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
       width="18" height="18">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

const IconCart = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
       stroke="cur
       rentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
       width="14" height="14">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

/* ─────────────────────────────────────────
   Icônes catégories SVG
───────────────────────────────────────── */
const CatIcons = {
  Accessoires: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
    </svg>
  ),
  Chaussures: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18h18v-2a4 4 0 0 0-4-4H9.5L7 9H3v9z"/>
      <path d="M11 12l1-3"/>
      <path d="M14 12l1-3"/>
    </svg>
  ),
  Maillots: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/>
    </svg>
  ),
  Shorts: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16v6l-4 10H8L4 10V4z"/>
      <line x1="12" y1="4" x2="12" y2="20"/>
    </svg>
  ),
  Survêtements: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/>
      <line x1="9" y1="10" x2="9" y2="20"/>
      <line x1="15" y1="10" x2="15" y2="20"/>
    </svg>
  ),
  "T-shirts": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/>
    </svg>
  ),
  /* Icône générique pour les catégories inconnues */
  default: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    </svg>
  ),
};

/* ─────────────────────────────────────────
   Composant CategoryBar
───────────────────────────────────────── */
function CategoryBar({ categories, activeId, onSelect }) {
  const { lang, t } = useLanguage();
  return (
    <div className="cat-bar">
      {/* "Tout" — toujours en premier */}
      <button
        className={`cat-bar__item${!activeId ? " active" : ""}`}
        onClick={() => onSelect("")}
        aria-pressed={!activeId}
      >
        <span className="cat-bar__circle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
               strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
        </span>
        <span className="cat-bar__label">{t("Tout", "All")}</span>
      </button>

      {/* Une icône par catégorie */}
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
  );
}
function Toast({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.type}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   Composant Skeleton card
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
   Composant Hero Banner
   Côté gauche : texte animé fade-up séquencé
   Côté droit  : HeroSlider (carrousel SVG + photo)
───────────────────────────────────────── */
import HeroSlider from "../components/HeroSlider";

function HeroBanner() {
  const { t } = useLanguage();
  return (
    <section className="hero">

      {/* ── Côté gauche : texte ── */}
      <div className="hero__content">
        <span className="hero__eyebrow hero--anim-1">{t("Nouvelle Collection 2026", "New 2026 Collection")}</span>

        <h1 className="hero__title hero--anim-2">
          {t("Équipez-vous", "Gear up")}
          <span className="hero__title-accent">{t("pour gagner.", "to win.")}</span>
        </h1>

        <p className="hero__subtitle hero--anim-3">
          {t(
            "Vêtements et accessoires de sport axés sur la performance. Livraison gratuite à partir de 500 DH.",
            "Performance-focused sports clothing and accessories. Free shipping from 500 DH."
          )}
        </p>

        <a href="#produits" className="hero__cta hero--anim-4">
          {t("Découvrir la collection", "Discover the collection")}
          <span className="hero__cta-arrow"><IconArrowRight /></span>
        </a>

        <div className="hero__stats hero--anim-5">
          <div><span className="hero__stat-value">500+</span><span className="hero__stat-label">{t("Produits", "Products")}</span></div>
          <div><span className="hero__stat-value">48h</span><span className="hero__stat-label">{t("Livraison", "Delivery")}</span></div>
          <div><span className="hero__stat-value">4.9★</span><span className="hero__stat-label">{t("Satisfaction", "Satisfaction")}</span></div>
        </div>
      </div>

      {/* ── Côté droit : slider carrousel ── */}
      <div className="hero__slider-col">
        <HeroSlider />
      </div>

    </section>
  );
}

/* ─────────────────────────────────────────
   Composant Filtres
───────────────────────────────────────── */
function Filters({ filters, categories, onChange, onReset }) {
  const { lang, t } = useLanguage();
  return (
    <div className="filters">

      {/* Recherche */}
      <div className="filters__group filters__group--search">
        <span className="filters__icon">
          <IconSearch />
        </span>
        <input
          name="search"
          placeholder={t("Rechercher un produit...", "Search for a product...")}
          value={filters.search}
          onChange={onChange}
          aria-label={t("Rechercher un produit", "Search for a product")}
        />
      </div>

      {/* Catégorie */}
      <div className="filters__group filters__select-wrap">
        <span className="filters__icon">
          <IconTag />
        </span>
        <select
          name="categorie_id"
          value={filters.categorie_id}
          onChange={onChange}
          aria-label={t("Filtrer par catégorie", "Filter by category")}
        >
          <option value="">{t("Toutes les catégories", "All categories")}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{translateCategory(c.nom, lang)}</option>
          ))}
        </select>
      </div>

      {/* Prix min */}
      <div className="filters__group" style={{ minWidth: "120px", flex: "0 0 auto" }}>
        <span className="filters__icon" style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-gray-500)", left: "10px" }}>
          Min
        </span>
        <input
          name="prix_min"
          type="number"
          min="0"
          placeholder="0 DH"
          value={filters.prix_min}
          onChange={onChange}
          aria-label="Minimum price"
          style={{ paddingLeft: "40px" }}
        />
      </div>

      {/* Prix max */}
      <div className="filters__group" style={{ minWidth: "120px", flex: "0 0 auto" }}>
        <span className="filters__icon" style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-gray-500)", left: "10px" }}>
          Max
        </span>
        <input
          name="prix_max"
          type="number"
          min="0"
          placeholder="∞ DH"
          value={filters.prix_max}
          onChange={onChange}
          aria-label="Maximum price"
          style={{ paddingLeft: "40px" }}
        />
      </div>

      {/* Bouton reset */}
      <button className="filters__reset" onClick={onReset} type="button">
        {t("Réinitialiser", "Reset")}
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────
   Composant Carte Produit
───────────────────────────────────────── */
function ProductCard({ produit, isFav, onToggleFav, onAddToCart }) {
  const { lang, t } = useLanguage();
  const rupture = produit.stock === 0;

  return (
    <article className="card">

      {/* ── Zone image ── */}
      <div className="card__img-wrap">
        <Link to={`/produit/${produit.id}`} tabIndex={-1}>
          <img
            src={produit.image || "https://placehold.co/400x400/f5f5f5/767676?text=Sport"}
            alt={produit.nom}
            loading="lazy"
          />
        </Link>

        {/* Badge rupture ou catégorie */}
        {rupture ? (
          <span className="card__stock-badge">{t("Rupture de stock", "Out of stock")}</span>
        ) : (
          produit.prix_promo ? (
            <span className="card__promo-badge">
              -{Math.round((1 - produit.prix_promo / produit.prix) * 100)}%
            </span>
          ) : (
            produit.categorie?.nom && (
              <span className="card__category-badge">{translateCategory(produit.categorie.nom, lang)}</span>
            )
          )
        )}

        {/* Bouton favori */}
        <button
          className={`card__fav-btn${isFav ? " active" : ""}`}
          onClick={() => onToggleFav(produit.id)}
          aria-label={isFav ? t("Retirer des favoris", "Remove from favorites") : t("Ajouter aux favoris", "Add to favorites")}
          title={isFav ? t("Retirer des favoris", "Remove from favorites") : t("Ajouter aux favoris", "Add to favorites")}
        >
          <IconHeart filled={isFav} />
        </button>

        {/* Bouton "Ajouter au panier" — slide depuis le bas au hover */}
        <button
          className="card__add-btn"
          onClick={() => onAddToCart(produit.id)}
          disabled={rupture}
          aria-label={t(`Ajouter ${produit.nom} au panier`, `Add ${produit.nom} to cart`)}
        >
          <IconCart /> {rupture ? t("Indisponible", "Unavailable") : t("Ajouter au panier", "Add to cart")}
        </button>
      </div>

      {/* ── Contenu texte ── */}
      <div className="card__body">
        <Link to={`/produit/${produit.id}`} className="card__name">
          {produit.nom}
        </Link>
        {produit.prix_promo ? (
          <div className="card__price-wrap">
            <p className="price price--promo">{Number(produit.prix_promo).toLocaleString(lang === "fr" ? "fr-MA" : "en-US")} DH</p>
            <p className="price price--original">{Number(produit.prix).toLocaleString(lang === "fr" ? "fr-MA" : "en-US")} DH</p>
          </div>
        ) : (
          <p className="price">{Number(produit.prix).toLocaleString(lang === "fr" ? "fr-MA" : "en-US")} DH</p>
        )}
      </div>

    </article>
  );
}

/* ─────────────────────────────────────────
   Composant Footer — design premium
───────────────────────────────────────── */
function Footer() {
  const { t } = useLanguage();
  const annee = new Date().getFullYear();

  /* Logo SVG inline pour le footer */
  const FooterLogo = () => (
    <svg width="32" height="32" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fHex" x1="0" y1="0" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff7a45"/>
          <stop offset="100%" stopColor="#e04a12"/>
        </linearGradient>
      </defs>
      <polygon points="21,2 38,11.5 38,30.5 21,40 4,30.5 4,11.5" fill="url(#fHex)"/>
      <path d="M23.5 7 L14 22 L20.5 22 L18 35 L28 19 L21.5 19 Z" fill="white"/>
    </svg>
  );

  return (
    <footer className="footer">

      {/* ── Bande newsletter ── */}
      <div className="footer__newsletter">
        <div className="footer__newsletter-inner">
          <div className="footer__newsletter-text">
            <p className="footer__newsletter-title">{t("Restez dans le jeu 🏃", "Stay in the game 🏃")}</p>
            <p className="footer__newsletter-sub">{t("Offres exclusives, nouveautés et conseils sportifs directement dans votre boîte mail.", "Exclusive offers, new arrivals and sports tips straight to your inbox.")}</p>
          </div>
          <form className="footer__newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder={t("Votre adresse e-mail", "Your email address")}
              className="footer__newsletter-input"
              aria-label={t("Email pour la newsletter", "Email for newsletter")}
            />
            <button type="submit" className="footer__newsletter-btn">
              {t("S'abonner", "Subscribe")}
            </button>
          </form>
        </div>
      </div>

      {/* ── Badges de confiance ── */}
      <div className="footer__trust">
        <div className="footer__trust-inner">
          {[
            { icon: "🚚", label: t("Livraison 48h", "48h Delivery"), sub: t("Partout au Maroc", "Across Morocco") },
            { icon: "🔒", label: t("Paiement sécurisé", "Secure payment"), sub: "SSL 256-bit" },
            { icon: "↩️", label: t("Retours gratuits", "Free returns"), sub: t("30 jours", "30 days") },
            { icon: "⭐", label: "4.9 / 5", sub: t("2 400+ avis", "2,400+ reviews") },
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

      {/* ── Colonnes principales ── */}
      <div className="footer__main">

        {/* Marque */}
        <div className="footer__brand-col">
          <div className="footer__brand-logo">
            <FooterLogo />
            <span className="footer__brand-name">
              SPORT<span>SHOP</span>
            </span>
          </div>
          <p className="footer__brand-desc">
            {t(
              "Votre destination sport au Maroc. Vêtements, chaussures et équipements des meilleures marques, livrés en 48h partout au Maroc.",
              "Your sports destination in Morocco. Clothing, footwear and equipment from top brands, delivered in 48h across Morocco."
            )}
          </p>

          {/* Réseaux sociaux */}
          <div className="footer__socials">
            {[
              {
                label: "Instagram",
                href: "#",
                svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
              },
              {
                label: "Facebook",
                href: "#",
                svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
              },
              {
                label: "TikTok",
                href: "#",
                svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>,
              },
              {
                label: "YouTube",
                href: "#",
                svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-1.96C18.88 4 12 4 12 4s-6.88 0-8.6.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.4 19.54C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>,
              },
            ].map(({ label, href, svg }) => (
              <a key={label} href={href} className="footer__social-link" aria-label={label}>
                {svg}
              </a>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div>
          <p className="footer__col-title">{t("Navigation", "Navigation")}</p>
          <ul className="footer__links">
            <li><Link to="/" className="footer__link">{t("Tous les produits", "All products")}</Link></li>
            <li><Link to="/favoris" className="footer__link">{t("Mes favoris", "My favorites")}</Link></li>
            <li><Link to="/panier" className="footer__link">{t("Mon panier", "My cart")}</Link></li>
            <li><Link to="/profil" className="footer__link">{t("Mon compte", "My account")}</Link></li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <p className="footer__col-title">{t("Services", "Services")}</p>
          <ul className="footer__links">
            <li><a href="#" className="footer__link">{t("Livraison & retours", "Shipping & returns")}</a></li>
            <li><a href="#" className="footer__link">{t("Guide des tailles", "Size guide")}</a></li>
            <li><a href="#" className="footer__link">{t("Programme fidélité", "Loyalty program")}</a></li>
            <li><a href="#" className="footer__link">{t("Cartes cadeaux", "Gift cards")}</a></li>
            <li><a href="#" className="footer__link">{t("Blog sportif", "Sports blog")}</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <p className="footer__col-title">{t("Contact", "Contact")}</p>
          <ul className="footer__links">
            <li>
              <a href="mailto:contact@sportshop.ma" className="footer__link footer__link--icon">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                contact@sportshop.ma
              </a>
            </li>
            <li>
              <a href="tel:+212600000000" className="footer__link footer__link--icon">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.6 1.25h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.29 6.29l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                +212 600-000-000
              </a>
            </li>
            <li>
              <span className="footer__link footer__link--icon" style={{ cursor: "default" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {t("Casablanca, Maroc", "Casablanca, Morocco")}
              </span>
            </li>
            <li>
              <span className="footer__link footer__link--icon" style={{ cursor: "default" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {t("Lun–Sam : 9h – 18h", "Mon–Sat: 9am – 6pm")}
              </span>
            </li>
          </ul>
        </div>

      </div>

      {/* ── Barre du bas ── */}
      <div className="footer__bottom">
        <div className="footer__bottom-left">
          <p>© {annee} SportShop. {t("Tous droits réservés.", "All rights reserved.")}</p>
          <span className="footer__bottom-dot" />
          <p>{t("Fait avec ❤️ au Maroc", "Made with ❤️ in Morocco")}</p>
        </div>
        <nav className="footer__bottom-links">
          <a href="#" className="footer__bottom-link">{t("Confidentialité", "Privacy")}</a>
          <a href="#" className="footer__bottom-link">{t("CGV", "Terms and conditions")}</a>
          <a href="#" className="footer__bottom-link">{t("Mentions légales", "Legal notice")}</a>
          <a href="#" className="footer__bottom-link">Cookies</a>
        </nav>
      </div>

    </footer>
  );
}

/* ─────────────────────────────────────────
   Page principale : Home
───────────────────────────────────────── */
const FILTERS_INITIAL = { search: "", categorie_id: "", prix_min: "", prix_max: "" };
const SKELETON_COUNT  = 8; /* Nombre de skeleton cards affichées pendant le chargement */

export default function Home() {
  const { t } = useLanguage();
  const { user }     = useAuth();
  const navigate     = useNavigate();
  const { incCart, incFav, decFav } = useCartFav();

  /* ── États ── */
  const [produits,    setProduits]   = useState([]);
  const [categories,  setCategories] = useState([]);
  const [favIds,      setFavIds]     = useState([]);
  const [filters,     setFilters]    = useState(FILTERS_INITIAL);
  const [loading,     setLoading]    = useState(true);
  const [toasts,      setToasts]     = useState([]);

  /* ── Chargement initial des catégories ── */
  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data));
  }, []);

  /* ── Chargement des produits à chaque changement de filtre ── */
  useEffect(() => {
    setLoading(true);
    api.get("/produits", { params: filters })
      .then((res) => setProduits(res.data))
      .finally(() => setLoading(false));
  }, [filters]);

  /* ── Chargement des favoris (utilisateur connecté seulement) ── */
  useEffect(() => {
    if (user) {
      api.get("/favoris").then((res) => setFavIds(res.data.map((p) => p.id)));
    } else {
      setFavIds([]);
    }
  }, [user]);

  /* ── Gestionnaire de toast ── */
  const showToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    /* Supprime le toast après 3 secondes */
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  /* ── Mise à jour des filtres ── */
  const handleChange = (e) =>
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  /* ── Réinitialisation des filtres ── */
  const handleReset = () => setFilters(FILTERS_INITIAL);

  /* ── Ajouter au panier ── */
  const addToCart = async (id) => {
    if (!user) return navigate("/login");
    try {
      await api.post("/panier/items", { produit_id: id, quantite: 1 });
      incCart(1);
      showToast(t("Produit ajouté au panier !", "Product added to cart!"), "success");
    } catch (err) {
      showToast(err.response?.data?.message || t("Erreur lors de l'ajout", "Could not add the product"), "error");
    }
  };

  /* ── Toggle favori ── */
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
      showToast(t("Ajouté aux favoris ❤️", "Added to favorites ❤️"), "success");
    }
  };

  /* ── Rendu ── */
  return (
    <>
      {/* Hero banner — centré avec marges */}
      <div className="hero-wrapper">
        <HeroBanner />
      </div>

      {/* Barre de catégories — icônes circulaires */}
      <div className="hero-wrapper" style={{ paddingTop: 0 }}>
        <CategoryBar
          categories={categories}
          activeId={filters.categorie_id}
          onSelect={(id) => setFilters((prev) => ({ ...prev, categorie_id: id }))}
        />
      </div>

      {/* Section produits */}
      <section id="produits">

        {/* En-tête de section */}
        <div className="section-header">
          <h2 className="section-title">{t("Nos produits", "Our products")}</h2>
          {!loading && (
            <span className="section-count">
              {produits.length} {produits.length === 1 ? t("article", "item") : t("articles", "items")}
            </span>
          )}
        </div>

        {/* Barre de filtres */}
        <Filters
          filters={filters}
          categories={categories}
          onChange={handleChange}
          onReset={handleReset}
        />

        {/* Grille produits */}
        <div className="grid">
          {loading ? (
            /* Skeleton loaders */
            Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <SkeletonCard key={i} />
            ))
          ) : produits.length > 0 ? (
            /* Cartes produits */
            produits.map((p) => (
              <ProductCard
                key={p.id}
                produit={p}
                isFav={favIds.includes(p.id)}
                onToggleFav={toggleFav}
                onAddToCart={addToCart}
              />
            ))
          ) : (
            /* État vide */
            <div className="empty-state">
              <span className="empty-state__icon">🔍</span>
              <p className="empty-state__title">{t("Aucun produit trouvé", "No products found")}</p>
              <p className="empty-state__text">
                {t("Essayez d'ajuster vos filtres ou de réinitialiser la recherche.", "Try adjusting your filters or resetting your search.")}
              </p>
              <button className="btn btn--outline" onClick={handleReset}>
                {t("Voir tous les produits", "View all products")}
              </button>
            </div>
          )}
        </div>

      </section>

      {/* Footer */}
      <Footer />

      {/* Notifications toast */}
      <Toast toasts={toasts} />
    </>
  );
}
