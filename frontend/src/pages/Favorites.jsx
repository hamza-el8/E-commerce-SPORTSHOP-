/**
 * Favorites — SportShop
 * Design premium : header avec compteur, grille 4 colonnes,
 * cards avec effet hover, bouton retirer animé, état vide stylé.
 * Logique API inchangée.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api.js";
import { useCartFav } from "../CartFavContext";
import { translateCategory, useLanguage } from "../language.js";

/* ── Icônes SVG ── */
const IconHeart = ({ filled }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "#e53e3e" : "none"}
       stroke={filled ? "#e53e3e" : "currentColor"} strokeWidth="1.8"
       strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const IconTrash = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

const IconCart = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

const IconShoppingBag = () => (
  <svg width="56" height="56" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

/* ── Skeleton card ── */
function SkeletonFav() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-card__img" />
      <div className="skeleton-card__body">
        <div className="skeleton skeleton-card__title" />
        <div className="skeleton skeleton-card__price" />
        <div className="skeleton" style={{ height: "36px", borderRadius: "var(--radius-full)" }} />
      </div>
    </div>
  );
}

/* ── Page Favorites ── */
export default function Favorites() {
  const { lang, t } = useLanguage();
  const [favoris,  setFavoris]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [removing, setRemoving] = useState(null);
  const { decFav } = useCartFav(); /* id en cours de suppression */

  useEffect(() => {
    api.get("/favoris")
      .then((res) => setFavoris(res.data))
      .finally(() => setLoading(false));
  }, []);

  const remove = async (id) => {
    setRemoving(id);
    await api.delete(`/favoris/${id}`);
    setFavoris((prev) => prev.filter((p) => p.id !== id));
    decFav();
    setRemoving(null);
  };

  return (
    <div className="fav-page">

      {/* ── En-tête ── */}
      <div className="fav-header">
        <div className="fav-header__left">
          <span className="fav-header__icon">
            <IconHeart filled />
          </span>
          <div>
            <h1 className="fav-header__title">{t("Mes Favoris", "My Favorites")}</h1>
            {!loading && (
              <p className="fav-header__count">
                {favoris.length === 0
                  ? t("Aucun article sauvegardé", "No saved items")
                  : t(
                    `${favoris.length} article${favoris.length > 1 ? "s" : ""} sauvegardé${favoris.length > 1 ? "s" : ""}`,
                    `${favoris.length} saved item${favoris.length > 1 ? "s" : ""}`
                  )}
              </p>
            )}
          </div>
        </div>

        {/* Lien retour boutique */}
        {!loading && favoris.length > 0 && (
          <Link to="/" className="fav-header__btn">
            {t("Continuer les achats", "Continue shopping")} <IconArrow />
          </Link>
        )}
      </div>

      {/* ── Grille ── */}
      {loading ? (
        <div className="grid">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonFav key={i} />)}
        </div>
      ) : favoris.length > 0 ? (
        <div className="grid">
          {favoris.map((p) => (
            <article className="card fav-card" key={p.id}>

              {/* Zone image */}
              <div className="card__img-wrap">
                <Link to={`/produit/${p.id}`} tabIndex={-1}>
                  <img
                    src={p.image || "https://placehold.co/400x400/f5f5f5/767676?text=Sport"}
                    alt={p.nom}
                    loading="lazy"
                  />
                </Link>

                {/* Badge catégorie */}
                {p.categorie?.nom && (
                  <span className="card__category-badge">{translateCategory(p.categorie.nom, lang)}</span>
                )}

                {/* Bouton retirer (cœur) */}
                <button
                  className="card__fav-btn active"
                  onClick={() => remove(p.id)}
                  disabled={removing === p.id}
                  aria-label={t("Retirer des favoris", "Remove from favorites")}
                  title={t("Retirer des favoris", "Remove from favorites")}
                >
                  <IconHeart filled />
                </button>

                {/* Bouton "Ajouter au panier" — slide au hover */}
                <button className="card__add-btn" aria-label={t(`Ajouter ${p.nom} au panier`, `Add ${p.nom} to cart`)}>
                  <IconCart /> {t("Ajouter au panier", "Add to cart")}
                </button>
              </div>

              {/* Contenu texte */}
              <div className="card__body">
                <Link to={`/produit/${p.id}`} className="card__name">{p.nom}</Link>
                <p className="price">{Number(p.prix).toLocaleString(lang === "fr" ? "fr-MA" : "en-US")} DH</p>

                {/* Bouton retirer visible en bas */}
                <button
                  className="fav-card__remove"
                  onClick={() => remove(p.id)}
                  disabled={removing === p.id}
                >
                  {removing === p.id ? (
                    <span className="fav-card__spinner" />
                  ) : (
                    <><IconTrash /> {t("Retirer", "Remove")}</>
                  )}
                </button>
              </div>

            </article>
          ))}
        </div>
      ) : (

        /* ── État vide ── */
        <div className="fav-empty">
          <div className="fav-empty__icon">
            <IconShoppingBag />
          </div>
          <h2 className="fav-empty__title">{t("Aucun favori pour l'instant", "No favorites yet")}</h2>
          <p className="fav-empty__text">
            {t(
              "Explorez notre catalogue et sauvegardez les articles qui vous plaisent en cliquant sur le cœur.",
              "Browse our catalog and save the items you like by clicking the heart."
            )}
          </p>
          <Link to="/" className="fav-empty__btn">
            {t("Découvrir les produits", "Browse products")} <IconArrow />
          </Link>
        </div>

      )}
    </div>
  );
}
