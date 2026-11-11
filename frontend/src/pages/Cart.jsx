/**
 * Cart — SportShop
 * Layout : liste articles (gauche) + récapitulatif commande (droite)
 * Style inspiré Shein / Zara / Nike store
 * Logique API inchangée.
 */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api.js";
import { useCartFav } from "../CartFavContext";
import { translateCategory, useLanguage } from "../language.js";

/* ── Icônes SVG ── */
const IconCart = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

const IconTag = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);

const IconShield = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const IconTruck = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="1"/>
    <path d="M16 8h4l3 5v3h-7V8z"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);

const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconEmpty = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

/* ── Skeleton ── */
function SkeletonItem() {
  return (
    <div className="cart-item skeleton-cart-item">
      <div className="skeleton" style={{ width: 88, height: 88, borderRadius: "var(--radius-md)", flexShrink: 0 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="skeleton" style={{ height: 18, width: "60%" }} />
        <div className="skeleton" style={{ height: 14, width: "30%" }} />
        <div className="skeleton" style={{ height: 14, width: "20%" }} />
      </div>
      <div className="skeleton" style={{ width: 80, height: 32, borderRadius: "var(--radius-full)" }} />
    </div>
  );
}

/* ── Page Cart ── */
export default function Cart() {
  const { lang, t } = useLanguage();
  const [data,    setData]    = useState({ panier: { items: [] }, total: 0 });
  const [loading, setLoading] = useState(true);
  const [promo,   setPromo]   = useState("");
  const [promoOk, setPromoOk] = useState(false);
  const { refreshCart } = useCartFav();
  const navigate = useNavigate();

  const load = () =>
    api.get("/panier")
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const changeQty = async (item, quantite) => {
    if (quantite < 1) return;
    try {
      const res = await api.put(`/panier/items/${item.id}`, { quantite });
      setData(res.data);
      refreshCart();
    } catch (err) {
      alert(err.response?.data?.message || t("Erreur", "Something went wrong"));
    }
  };

  const remove = async (item) => {
    const res = await api.delete(`/panier/items/${item.id}`);
    setData(res.data);
    refreshCart();
  };

  const applyPromo = (e) => {
    e.preventDefault();
    /* Simulation locale — à connecter au backend si nécessaire */
    if (promo.trim().toUpperCase() === "SPORT10") {
      setPromoOk(true);
    } else {
      setPromoOk(false);
      alert(t("Code promo invalide.", "Invalid promo code."));
    }
  };

  const items      = data.panier?.items ?? [];
  const total      = Number(data.total ?? 0);
  const remise     = promoOk ? total * 0.1 : 0;
  const livraison  = total >= 500 ? 0 : 29;
  const totalFinal = (total - remise + livraison).toFixed(2);
  const nbArticles = items.reduce((s, i) => s + i.quantite, 0);

  return (
    <div className="cart-page">

      {/* ── En-tête ── */}
      <div className="cart-header">
        <div className="cart-header__left">
          <span className="cart-header__icon"><IconCart /></span>
          <div>
            <h1 className="cart-header__title">{t("Mon Panier", "My Cart")}</h1>
            {!loading && (
              <p className="cart-header__count">
                {nbArticles === 0
                  ? t("Panier vide", "Your cart is empty")
                  : t(
                    `${nbArticles} article${nbArticles > 1 ? "s" : ""}`,
                    `${nbArticles} item${nbArticles > 1 ? "s" : ""}`
                  )}
              </p>
            )}
          </div>
        </div>
        <Link to="/" className="cart-header__btn">{t("Continuer mes achats", "Continue shopping")} <IconArrow /></Link>
      </div>

      {loading ? (
        /* Skeleton */
        <div className="cart-layout">
          <div className="cart-items">
            {[1,2,3].map((i) => <SkeletonItem key={i} />)}
          </div>
          <div className="skeleton" style={{ height: 380, borderRadius: "var(--radius-lg)" }} />
        </div>
      ) : items.length === 0 ? (

        /* ── État vide ── */
        <div className="cart-empty">
          <div className="cart-empty__icon"><IconEmpty /></div>
          <h2 className="cart-empty__title">{t("Votre panier est vide", "Your cart is empty")}</h2>
          <p className="cart-empty__text">
            {t("Ajoutez des articles depuis notre boutique pour les retrouver ici.", "Add items from our shop to find them here.")}
          </p>
          <Link to="/" className="cart-empty__btn">{t("Découvrir les produits", "Browse products")} <IconArrow /></Link>
        </div>

      ) : (

        /* ── Layout principal ── */
        <div className="cart-layout">

          {/* ════════════════════════
              Colonne gauche — articles
          ════════════════════════ */}
          <div className="cart-items">

            {/* Barre récap rapide */}
            <div className="cart-items__topbar">
              <span>{t(
                `${nbArticles} article${nbArticles > 1 ? "s" : ""} dans votre panier`,
                `${nbArticles} item${nbArticles > 1 ? "s" : ""} in your cart`
              )}</span>
              <span className="cart-items__topbar-total">
                {t("Sous-total", "Subtotal")} : <strong>{total.toLocaleString(lang === "fr" ? "fr-MA" : "en-US")} DH</strong>
              </span>
            </div>

            {items.map((item) => (
              <div className="cart-item" key={item.id}>

                {/* Image produit */}
                <Link to={`/produit/${item.produit.id}`} className="cart-item__img-wrap">
                  <img
                    src={item.produit.image || "https://placehold.co/120x120/f5f5f5/767676?text=Sport"}
                    alt={item.produit.nom}
                    loading="lazy"
                  />
                </Link>

                {/* Infos */}
                <div className="cart-item__info">
                  <Link to={`/produit/${item.produit.id}`} className="cart-item__name">
                    {item.produit.nom}
                  </Link>

                  {item.produit.categorie?.nom && (
                    <span className="cart-item__cat">
                      <IconTag /> {translateCategory(item.produit.categorie.nom, lang)}
                    </span>
                  )}

                  <span className="cart-item__unit-price">
                    {Number(item.prix).toLocaleString(lang === "fr" ? "fr-MA" : "en-US")} DH / {t("unité", "unit")}
                  </span>
                </div>

                {/* Contrôle quantité */}
                <div className="cart-item__qty">
                  <button
                    className="cart-item__qty-btn"
                    onClick={() => changeQty(item, item.quantite - 1)}
                    disabled={item.quantite <= 1}
                    aria-label={t("Diminuer", "Decrease quantity")}
                  >−</button>
                  <span className="cart-item__qty-val">{item.quantite}</span>
                  <button
                    className="cart-item__qty-btn"
                    onClick={() => changeQty(item, item.quantite + 1)}
                    aria-label={t("Augmenter", "Increase quantity")}
                  >+</button>
                </div>

                {/* Sous-total */}
                <div className="cart-item__subtotal">
                  {(item.prix * item.quantite).toLocaleString(lang === "fr" ? "fr-MA" : "en-US")} DH
                </div>

                {/* Supprimer */}
                <button
                  className="cart-item__remove"
                  onClick={() => remove(item)}
                  aria-label={t("Supprimer", "Remove")}
                  title={t("Supprimer cet article", "Remove this item")}
                >
                  <IconTrash />
                </button>

              </div>
            ))}
          </div>

          {/* ════════════════════════
              Colonne droite — récap
          ════════════════════════ */}
          <aside className="cart-summary">

            <h2 className="cart-summary__title">{t("Récapitulatif", "Order summary")}</h2>

            {/* Lignes de prix */}
            <div className="cart-summary__lines">
              <div className="cart-summary__line">
                <span>{t(`Sous-total (${nbArticles} article${nbArticles > 1 ? "s" : ""})`, `Subtotal (${nbArticles} item${nbArticles > 1 ? "s" : ""})`)}</span>
                <span>{total.toLocaleString(lang === "fr" ? "fr-MA" : "en-US")} DH</span>
              </div>

              {promoOk && (
                <div className="cart-summary__line cart-summary__line--promo">
                  <span>🎉 Code SPORT10 (−10%)</span>
                  <span>−{remise.toLocaleString(lang === "fr" ? "fr-MA" : "en-US")} DH</span>
                </div>
              )}

              <div className="cart-summary__line">
                <span>{t("Livraison", "Shipping")}</span>
                <span className={livraison === 0 ? "cart-summary__free" : ""}>
                  {livraison === 0 ? t("Gratuite 🎁", "Free 🎁") : `${livraison} DH`}
                </span>
              </div>

              {total > 0 && total < 500 && (
                <div className="cart-summary__free-bar">
                  <div className="cart-summary__free-track">
                    <div
                      className="cart-summary__free-fill"
                      style={{ width: `${Math.min((total / 500) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="cart-summary__free-hint">
                    {t("Plus que", "Add")} <strong>{(500 - total).toLocaleString(lang === "fr" ? "fr-MA" : "en-US")} DH</strong> {t("pour la livraison gratuite", "for free shipping")}
                  </p>
                </div>
              )}

              <div className="cart-summary__divider" />

              <div className="cart-summary__line cart-summary__line--total">
                <span>{t("Total TTC", "Total (incl. tax)")}</span>
                <span>{Number(totalFinal).toLocaleString(lang === "fr" ? "fr-MA" : "en-US")} DH</span>
              </div>
            </div>

            {/* Code promo */}
            <form className="cart-summary__promo" onSubmit={applyPromo}>
              <div className="cart-summary__promo-wrap">
                <input
                  className="cart-summary__promo-input"
                  type="text"
                  placeholder={t("Code promo (ex: SPORT10)", "Promo code (e.g. SPORT10)")}
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                />
                <button type="submit" className="cart-summary__promo-btn">
                  {promoOk ? <IconCheck /> : "OK"}
                </button>
              </div>
              {promoOk && (
                <p className="cart-summary__promo-ok">✓ {t("Code appliqué avec succès !", "Code applied successfully!")}</p>
              )}
            </form>

            {/* Bouton commander */}
            <button
              className="cart-summary__checkout"
              onClick={() => navigate("/checkout")}
            >
              {t("Passer la commande", "Proceed to checkout")} <IconArrow />
            </button>

            {/* Garanties */}
            <div className="cart-summary__badges">
              <span className="cart-summary__badge">
                <IconShield /> {t("Paiement sécurisé", "Secure payment")}
              </span>
              <span className="cart-summary__badge">
                <IconTruck /> {t("Livraison 48h", "48-hour delivery")}
              </span>
            </div>

          </aside>

        </div>
      )}
    </div>
  );
}
