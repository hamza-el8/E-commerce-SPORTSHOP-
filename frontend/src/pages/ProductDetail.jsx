/**
 * ProductDetail — SportShop
 * Galerie thumbnails à gauche (style Shein) + infos à droite.
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import { useCartFav } from "../CartFavContext";
import { translateCategory, useLanguage } from "../language.js";
import ProductReviews from "../components/ProductReviews.jsx";

/* ── Icônes SVG ── */
const IconCart = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

const IconHeart = ({ filled }) => (
  <svg width="20" height="20" viewBox="0 0 24 24"
       fill={filled ? "#e53e3e" : "none"}
       stroke={filled ? "#e53e3e" : "currentColor"}
       strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const IconChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconTruck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="1"/>
    <path d="M16 8h4l3 5v3h-7V8z"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);

const IconShield = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const IconRefresh = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);

const IconStar = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24"
       fill={filled ? "#f59e0b" : "none"}
       stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

/* ── Skeleton ── */
function SkeletonDetail() {
  return (
    <div className="detail-page">
      <div className="detail-layout">
        <div className="skeleton detail-skeleton__img" style={{ height: 520 }} />
        <div className="detail-info" style={{ gap: "var(--space-5)" }}>
          <div className="skeleton" style={{ height: 14, width: "30%" }} />
          <div className="skeleton" style={{ height: 36, width: "80%" }} />
          <div className="skeleton" style={{ height: 28, width: "25%" }} />
          <div className="skeleton" style={{ height: 16, width: "40%" }} />
          <div className="skeleton" style={{ height: 52, borderRadius: "var(--radius-full)" }} />
          <div className="skeleton" style={{ height: 52, borderRadius: "var(--radius-full)" }} />
        </div>
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { lang, t } = useLanguage();
  const { id }       = useParams();
  const { user }     = useAuth();
  const navigate     = useNavigate();

  const SIZES_VETEMENTS  = ["XS", "S", "M", "L", "XL", "XXL"];
  const SIZES_CHAUSSURES = ["38", "39", "40", "41", "42", "43", "44"];

  const [produit,      setProduit]     = useState(null);
  const [quantite,     setQuantite]    = useState(1);
  const [isFav,        setIsFav]       = useState(false);
  const [adding,       setAdding]      = useState(false);
  const [added,        setAdded]       = useState(false);
  const [rating,       setRating]      = useState({ moyenne: null, total: 0 });
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeImg,    setActiveImg]   = useState(0);
  const [similaires,   setSimilaires]  = useState([]);

  const { incCart, incFav, decFav } = useCartFav();

  useEffect(() => {
    api.get(`/produits/${id}`).then((res) => {
      const p = res.data;
      setProduit(p);
      setActiveImg(0);
      /* Charge les produits similaires (même catégorie, hors produit courant) */
      api.get("/produits", { params: { categorie_id: p.categorie_id } })
        .then((r) => setSimilaires(r.data.filter((x) => String(x.id) !== String(id)).slice(0, 6)))
        .catch(() => setSimilaires([]));
    });
    api.get(`/produits/${id}/avis`).then((res) => {
      const list = res.data ?? [];
      const total = list.length;
      const moyenne = total > 0
        ? (list.reduce((s, a) => s + a.note, 0) / total).toFixed(1)
        : null;
      setRating({ moyenne, total });
    }).catch(() => {});
    if (user) {
      api.get("/favoris").then((res) => {
        setIsFav(res.data.some((p) => String(p.id) === String(id)));
      });
    }
  }, [id, user]);

  const addToCart = async () => {
    if (!user) return navigate("/login");
    setAdding(true);
    try {
      await api.post("/panier/items", { produit_id: produit.id, quantite });
      incCart(quantite);
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch (err) {
      alert(err.response?.data?.message || t("Erreur", "Something went wrong"));
    } finally {
      setAdding(false);
    }
  };

  const toggleFav = async () => {
    if (!user) return navigate("/login");
    if (isFav) {
      await api.delete(`/favoris/${id}`);
      setIsFav(false);
      decFav();
    } else {
      await api.post("/favoris", { produit_id: id });
      setIsFav(true);
      incFav();
    }
  };

  if (!produit) return <SkeletonDetail />;

  const rupture  = produit.stock === 0;
  const stockBas = produit.stock > 0 && produit.stock <= 5;

  /* Tailles selon la catégorie */
  const catNom = produit.categorie?.nom?.toLowerCase() ?? "";
  const isChaussures = catNom.includes("chaussure") || catNom.includes("shoe");
  const SIZES = isChaussures ? SIZES_CHAUSSURES : SIZES_VETEMENTS;

  /* Construit la liste des images dispo (filtre les vides) */
  const allImages = [produit.image, produit.image2, produit.image3]
    .filter(Boolean)
    .filter((u) => u.trim() !== "");
  if (allImages.length === 0) allImages.push("https://placehold.co/600x700/f5f5f5/767676?text=SportShop");

  const mainImg = allImages[activeImg] ?? allImages[0];

  return (
    <div className="detail-page">

      {/* ── Fil d'Ariane ── */}
      <nav className="detail-breadcrumb" aria-label={t("Fil d'Ariane", "Breadcrumb")}>
        <Link to="/" className="detail-breadcrumb__link">
          <IconChevronLeft /> {t("Boutique", "Shop")}
        </Link>
        {produit.categorie?.nom && (
          <>
            <span className="detail-breadcrumb__sep">/</span>
            <span className="detail-breadcrumb__current">{translateCategory(produit.categorie.nom, lang)}</span>
          </>
        )}
        <span className="detail-breadcrumb__sep">/</span>
        <span className="detail-breadcrumb__current">{produit.nom}</span>
      </nav>

      {/* ── Layout principal ── */}
      <div className="detail-layout">

        {/* ════ Colonne galerie style Shein ════ */}
        <div className="detail-gallery">

          {/* Thumbnails verticaux à gauche — toujours visibles */}
          <div className="detail-gallery__thumbs">
            {allImages.map((src, i) => (
              <button
                key={i}
                className={`detail-gallery__thumb${activeImg === i ? " active" : ""}`}
                onClick={() => setActiveImg(i)}
                aria-label={`Image ${i + 1}`}
                type="button"
              >
                <img src={src} alt={`${produit.nom} ${i + 1}`}
                  onError={(e) => { e.target.src = "https://placehold.co/80x80/f5f5f5/767676?text=?"; }} />
              </button>
            ))}
          </div>

          {/* Image principale */}
          <div className="detail-gallery__main">
            <img
              key={mainImg}
              src={mainImg}
              alt={produit.nom}
              className="detail-gallery__main-img"
            />
            {rupture && (
              <div className="detail-gallery__rupture">{t("Rupture de stock", "Out of stock")}</div>
            )}
          </div>
        </div>

        {/* ════ Colonne infos ════ */}
        <div className="detail-info">

          {/* Badge catégorie */}
          {produit.categorie?.nom && (
            <span className="detail-cat-badge">{translateCategory(produit.categorie.nom, lang)}</span>
          )}

          {/* Titre */}
          <h1 className="detail-title">{produit.nom}</h1>

          {/* Étoiles */}
          <div className="detail-rating">
            {[1, 2, 3, 4, 5].map((s) => (
              <IconStar key={s} filled={s <= Math.round(rating.moyenne ?? 0)} />
            ))}
            {rating.moyenne !== null ? (
              <span className="detail-rating__count">
                {rating.moyenne} ({rating.total} {t(rating.total > 1 ? "avis" : "avis", rating.total > 1 ? "reviews" : "review")})
              </span>
            ) : (
              <span className="detail-rating__count detail-rating__count--none">
                {t("Aucun avis", "No reviews yet")}
              </span>
            )}
          </div>

          {/* Prix */}
          <div className="detail-price-wrap">
            {produit.prix_promo ? (
              <>
                <span className="detail-price detail-price--promo">
                  {Number(produit.prix_promo).toLocaleString(lang === "fr" ? "fr-MA" : "en-US")} DH
                </span>
                <span className="detail-price detail-price--original">
                  {Number(produit.prix).toLocaleString(lang === "fr" ? "fr-MA" : "en-US")} DH
                </span>
                <span className="detail-price__discount-badge">
                  -{Math.round((1 - produit.prix_promo / produit.prix) * 100)}%
                </span>
              </>
            ) : (
              <span className="detail-price">
                {Number(produit.prix).toLocaleString(lang === "fr" ? "fr-MA" : "en-US")} DH
              </span>
            )}
            {!rupture && (
              <span className="detail-price__tax">
                {t("TTC · Livraison calculée au panier", "Tax included · Shipping calculated at checkout")}
              </span>
            )}
          </div>

          {/* Description */}
          {produit.description && (
            <p className="detail-desc">{produit.description}</p>
          )}

          {/* Stock */}
          <div className={`detail-stock${rupture ? " out" : stockBas ? " low" : " ok"}`}>
            <span className="detail-stock__dot" />
            {rupture
              ? t("Rupture de stock", "Out of stock")
              : stockBas
              ? t(`Plus que ${produit.stock} en stock — commandez vite !`, `Only ${produit.stock} left in stock — order soon!`)
              : t(`En stock (${produit.stock} disponibles)`, `In stock (${produit.stock} available)`)}
          </div>

          {/* ── Sélecteur taille ── */}
          <div className="detail-sizes">
            <div className="detail-sizes__header">
              <span className="detail-sizes__label">{t("Taille", "Size")}</span>
              <a href="#" className="detail-sizes__guide" onClick={(e) => e.preventDefault()}>
                {t("Guide des tailles", "Size guide")} →
              </a>
            </div>
            <div className="detail-sizes__options">
              {SIZES.map((size) => (
                <button
                  key={size}
                  className={`detail-size-btn${selectedSize === size ? " selected" : ""}`}
                  onClick={() => setSelectedSize(size)}
                  type="button"
                  aria-pressed={selectedSize === size}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Séparateur */}
          <div className="detail-divider" />

          {/* Quantité + Boutons */}
          {!rupture && (
            <>
              <div className="detail-qty-row">
                <label className="detail-qty-label">{t("Quantité", "Quantity")}</label>
                <div className="detail-qty-ctrl">
                  <button className="detail-qty-btn"
                    onClick={() => setQuantite((q) => Math.max(1, q - 1))}
                    disabled={quantite <= 1}>−</button>
                  <span className="detail-qty-val">{quantite}</span>
                  <button className="detail-qty-btn"
                    onClick={() => setQuantite((q) => Math.min(produit.stock, q + 1))}
                    disabled={quantite >= produit.stock}>+</button>
                </div>
              </div>

              <button
                className={`detail-btn-cart${added ? " added" : ""}`}
                onClick={addToCart}
                disabled={adding || rupture}
              >
                {adding ? (
                  <span className="detail-spinner" />
                ) : added ? (
                  <><IconCheck /> {t("Ajouté au panier !", "Added to cart!")}</>
                ) : (
                  <><IconCart /> {t("Ajouter au panier", "Add to cart")}</>
                )}
              </button>
            </>
          )}

          {/* Favori */}
          <button
            className={`detail-btn-fav${isFav ? " active" : ""}`}
            onClick={toggleFav}
          >
            <IconHeart filled={isFav} />
            {isFav ? t("Retiré des favoris", "Removed from favorites") : t("Ajouter aux favoris", "Add to favorites")}
          </button>

          {/* Garanties */}
          <div className="detail-guarantees">
            <div className="detail-guarantee">
              <span className="detail-guarantee__icon"><IconTruck /></span>
              <div>
                <p className="detail-guarantee__label">{t("Livraison gratuite dès 500 DH", "Free shipping on orders over 500 DH")}</p>
                <p className="detail-guarantee__desc">{t("Partout au Maroc en 48h", "Across Morocco in 48 hours")}</p>
              </div>
            </div>
            <div className="detail-guarantee">
              <span className="detail-guarantee__icon"><IconShield /></span>
              <div>
                <p className="detail-guarantee__label">{t("Paiement 100% sécurisé", "100% secure payment")}</p>
                <p className="detail-guarantee__desc">{t("Transactions chiffrées SSL", "SSL-encrypted transactions")}</p>
              </div>
            </div>
            <div className="detail-guarantee">
              <span className="detail-guarantee__icon"><IconRefresh /></span>
              <div>
                <p className="detail-guarantee__label">{t("Retour gratuit 30 jours", "30-day free returns")}</p>
                <p className="detail-guarantee__desc">{t("Satisfait ou remboursé", "Satisfaction guaranteed or your money back")}</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Avis clients ── */}
      <ProductReviews produitId={id} />

      {/* ── Articles similaires ── */}
      {similaires.length > 0 && (
        <section className="similaires-section">
          <div className="similaires-header">
            <h2 className="similaires-title">
              {t("Articles Également Consultés", "You May Also Like")}
            </h2>
          </div>
          <div className="similaires-grid">
            {similaires.map((p) => {
              const promoPercent = p.prix_promo
                ? Math.round((1 - p.prix_promo / p.prix) * 100)
                : null;
              return (
                <Link
                  key={p.id}
                  to={`/produit/${p.id}`}
                  className="similaires-card"
                  onClick={() => { setActiveImg(0); setSelectedSize(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                >
                  <div className="similaires-card__img-wrap">
                    <img
                      src={p.image || "https://placehold.co/300x360/f5f5f5/767676?text=Sport"}
                      alt={p.nom}
                      loading="lazy"
                    />
                    {promoPercent && (
                      <span className="similaires-card__badge">-{promoPercent}%</span>
                    )}
                  </div>
                  <div className="similaires-card__body">
                    <p className="similaires-card__name">{p.nom}</p>
                    <div className="similaires-card__price">
                      {p.prix_promo ? (
                        <>
                          <span className="similaires-card__price--promo">
                            {Number(p.prix_promo).toLocaleString(lang === "fr" ? "fr-MA" : "en-US")} DH
                          </span>
                          <span className="similaires-card__price--old">
                            {Number(p.prix).toLocaleString(lang === "fr" ? "fr-MA" : "en-US")} DH
                          </span>
                        </>
                      ) : (
                        <span>{Number(p.prix).toLocaleString(lang === "fr" ? "fr-MA" : "en-US")} DH</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

    </div>
  );
}
