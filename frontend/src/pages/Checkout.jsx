/**
 * Checkout — SportShop
 * Page de validation de commande : formulaire livraison + récapitulatif.
 * Les commandes sont stockées dans localStorage pour la notification admin.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import { useCartFav } from "../CartFavContext.jsx";
import { useLanguage } from "../language.js";

/* ── Icônes ── */
const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IconCheck = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
);
const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconMap = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconPhone = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.65 4.93 2 2 0 0 1 3.62 2.73h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.09a16 16 0 0 0 6 6l1.42-1.42a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const IconShield = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconTruck = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="1"/>
    <path d="M16 8h4l3 5v3h-7V8z"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);

export default function Checkout() {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const { refreshCart } = useCartFav();

  const [form, setForm] = useState({
    nom:      user?.name?.split(" ")[1] ?? "",
    prenom:   user?.name?.split(" ")[0] ?? "",
    adresse:  "",
    telephone: "",
  });
  const [cartData,  setCartData]  = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [errors,    setErrors]    = useState({});
  const [loadedCart, setLoadedCart] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [card, setCard] = useState({ numero: "", nom: "", expiry: "", cvv: "" });
  const [cardErrors, setCardErrors] = useState({});
  const [order, setOrder] = useState(null);

  /* Charge le panier une seule fois */
  useState(() => {
    api.get("/panier").then((res) => {
      setCartData(res.data);
      setLoadedCart(true);
    });
  }, []);

  const items     = cartData?.panier?.items ?? [];
  const total     = Number(cartData?.total ?? 0);
  const livraison = total >= 500 ? 0 : 29;
  const totalFinal = (total + livraison).toFixed(2);
  const nbArticles = items.reduce((s, i) => s + i.quantite, 0);

  /* Validation */
  const validate = () => {
    const e = {};
    if (!form.nom.trim())       e.nom = t("Nom requis", "Last name is required");
    if (!form.prenom.trim())    e.prenom = t("Prénom requis", "First name is required");
    if (!form.adresse.trim())   e.adresse = t("Adresse requise", "Address is required");
    if (!form.telephone.trim()) e.telephone = t("Numéro requis", "Phone number is required");
    else if (!/^[0-9+\s\-]{8,15}$/.test(form.telephone.trim()))
      e.telephone = t("Numéro invalide", "Invalid phone number");
    return e;
  };

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: undefined });
  };

  const handleCardChange = (field) => (e) => {
    let value = e.target.value;
    if (field === "numero") {
      value = value.replace(/[^0-9]/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
    }
    if (field === "expiry") {
      value = value.replace(/[^0-9]/g, "").slice(0, 4);
      if (value.length >= 3) value = value.slice(0, 2) + "/" + value.slice(2);
    }
    if (field === "cvv") {
      value = value.replace(/[^0-9]/g, "").slice(0, 4);
    }
    setCard({ ...card, [field]: value });
    if (cardErrors[field]) setCardErrors({ ...cardErrors, [field]: undefined });
  };

  const luhnCheck = (num) => {
    const s = num.replace(/\s/g, "");
    if (!/^\d{13,19}$/.test(s)) return false;
    let sum = 0, parity = s.length % 2;
    for (let i = 0; i < s.length; i++) {
      let d = parseInt(s[i], 10);
      if (i % 2 === parity) { d *= 2; if (d > 9) d -= 9; }
      sum += d;
    }
    return sum % 10 === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    const cerrs = {};
    if (paymentMethod === "card") {
      const num = card.numero.replace(/\s/g, "");
      if (!num) cerrs.numero = t("Numéro de carte requis", "Card number is required");
      else if (!luhnCheck(num)) cerrs.numero = t("Numéro de carte invalide", "Invalid card number");
      if (!card.nom.trim()) cerrs.nom = t("Nom sur la carte requis", "Name on card is required");
      const exp = card.expiry.replace(/\D/g, "");
      if (exp.length < 4) cerrs.expiry = t("Date d'expiration invalide", "Invalid expiry date");
      else {
        const mm = parseInt(exp.slice(0, 2), 10);
        if (mm < 1 || mm > 12) cerrs.expiry = t("Mois invalide", "Invalid month");
      }
      if (!/^\d{3,4}$/.test(card.cvv)) cerrs.cvv = t("CVV invalide", "Invalid CVV");
    }
    if (Object.keys(errs).length || Object.keys(cerrs).length) {
      setErrors(errs);
      setCardErrors(cerrs);
      return;
    }
    if (items.length === 0) return;

    setLoading(true);
    try {
      const payload = {
        prenom: form.prenom,
        nom: form.nom,
        telephone: form.telephone,
        adresse: form.adresse,
        mode_paiement: paymentMethod,
      };
      if (paymentMethod === "card") {
        payload.carte_numero = card.numero;
        payload.carte_nom = card.nom;
        payload.carte_expiry = card.expiry;
        payload.carte_cvv = card.cvv;
      }
      const res = await api.post("/commandes", payload);
      const cmd = res.data.commande;
      setOrder(cmd);
      refreshCart();
      setSuccess(true);
    } catch (err) {
      alert(err.response?.data?.message || t("Une erreur est survenue.", "Something went wrong."));
    } finally {
      setLoading(false);
    }
  };

  /* ── Écran succès ── */
  if (success && order) {
    const fmt = (n) => Number(n).toLocaleString(lang === "fr" ? "fr-MA" : "en-US");
    const methodeLabel = order.mode_paiement === "card"
      ? t("Carte bancaire", "Credit card")
      : t("Paiement à la livraison", "Cash on delivery");
    return (
      <div className="checkout-success">
        <div className="checkout-success__icon"><IconCheck /></div>
        <h1 className="checkout-success__title">{t("Commande confirmée !", "Order confirmed!")}</h1>
        <p className="checkout-success__num">{t("Numéro de commande :", "Order number:")} <strong>{order.numero}</strong></p>
        <p className="checkout-success__msg">
          {t("Merci", "Thank you")} <strong>{form.prenom}</strong>{t(", votre commande a bien été enregistrée. Vous serez livré à l'adresse :", ", your order has been placed. It will be delivered to:")} <em>{form.adresse}</em>.
        </p>

        {/* Reçu de paiement */}
        <div className="checkout-receipt" id="payment-receipt">
          <h2 className="checkout-receipt__title">{t("Reçu de paiement", "Payment receipt")}</h2>
          <div className="checkout-receipt__row">
            <span>{t("Date", "Date")}</span>
            <span>{new Date(order.created_at).toLocaleString(lang === "fr" ? "fr-MA" : "en-US")}</span>
          </div>
          <div className="checkout-receipt__row">
            <span>{t("Client", "Customer")}</span>
            <span>{order.prenom} {order.nom}</span>
          </div>
          <div className="checkout-receipt__row">
            <span>{t("Méthode de paiement", "Payment method")}</span>
            <span>{methodeLabel}</span>
          </div>
          <div className="checkout-receipt__row">
            <span>{t("Statut du paiement", "Payment status")}</span>
            <span>{order.statut_paiement === "paye" ? t("Payé", "Paid") : t("En attente", "Pending")}</span>
          </div>
          {order.transaction_id && (
            <div className="checkout-receipt__row">
              <span>{t("Transaction", "Transaction")}</span>
              <span>{order.transaction_id}</span>
            </div>
          )}
          <div className="checkout-receipt__divider" />
          <div className="checkout-receipt__items">
            {(order.items ?? []).map((it, idx) => (
              <div key={idx} className="checkout-receipt__item">
                <span>{it.nom} × {it.quantite}</span>
                <span>{fmt(it.prix * it.quantite)} DH</span>
              </div>
            ))}
          </div>
          <div className="checkout-receipt__divider" />
          <div className="checkout-receipt__row">
            <span>{t("Sous-total", "Subtotal")}</span>
            <span>{fmt(order.sous_total)} DH</span>
          </div>
          <div className="checkout-receipt__row">
            <span>{t("Livraison", "Shipping")}</span>
            <span>{Number(order.livraison) === 0 ? t("Gratuite", "Free") : `${fmt(order.livraison)} DH`}</span>
          </div>
          <div className="checkout-receipt__row checkout-receipt__row--total">
            <span>{t("Total TTC", "Total")}</span>
            <span>{fmt(order.total)} DH</span>
          </div>
        </div>

        <div className="checkout-success__actions">
          <button
            type="button"
            className="checkout-btn checkout-btn--secondary"
            onClick={() => window.print()}
          >
            {t("Imprimer le reçu", "Print receipt")}
          </button>
          <Link to="/" className="checkout-btn checkout-btn--primary">
            {t("Continuer les achats", "Continue shopping")} <IconArrow />
          </Link>
        </div>
      </div>
    );
  }

  /* ── Formulaire ── */
  return (
    <div className="checkout-page">

      {/* Breadcrumb */}
      <div className="checkout-breadcrumb">
        <Link to="/">{t("Accueil", "Home")}</Link>
        <span>/</span>
        <Link to="/panier">{t("Panier", "Cart")}</Link>
        <span>/</span>
        <span className="active">{t("Commande", "Checkout")}</span>
      </div>

      <h1 className="checkout-title">{t("Finaliser la commande", "Complete your order")}</h1>

      <div className="checkout-layout">

        {/* ═══════════════════════════
            Gauche — Formulaire
        ═══════════════════════════ */}
        <div className="checkout-form-col">

          <div className="checkout-card">
            <div className="checkout-card__header">
              <span className="checkout-card__step">1</span>
              <h2>{t("Informations de livraison", "Delivery information")}</h2>
            </div>

            <form className="checkout-form" onSubmit={handleSubmit} noValidate>

              {/* Nom + Prénom */}
              <div className="checkout-form__row">
                <div className={`checkout-form__field${errors.prenom ? " has-error" : ""}`}>
                  <label className="checkout-form__label">
                    <IconUser /> {t("Prénom", "First name")} *
                  </label>
                  <input
                    className="checkout-form__input"
                    type="text"
                    placeholder={t("ex : Hamza", "e.g. Hamza")}
                    value={form.prenom}
                    onChange={handleChange("prenom")}
                    autoFocus
                  />
                  {errors.prenom && <span className="checkout-form__error">{errors.prenom}</span>}
                </div>

                <div className={`checkout-form__field${errors.nom ? " has-error" : ""}`}>
                  <label className="checkout-form__label">
                    <IconUser /> {t("Nom", "Last name")} *
                  </label>
                  <input
                    className="checkout-form__input"
                    type="text"
                    placeholder={t("ex : Benali", "e.g. Benali")}
                    value={form.nom}
                    onChange={handleChange("nom")}
                  />
                  {errors.nom && <span className="checkout-form__error">{errors.nom}</span>}
                </div>
              </div>

              {/* Téléphone */}
              <div className={`checkout-form__field${errors.telephone ? " has-error" : ""}`}>
                <label className="checkout-form__label">
                  <IconPhone /> {t("Numéro de téléphone", "Phone number")} *
                </label>
                <input
                  className="checkout-form__input"
                  type="tel"
                  placeholder={t("ex : 06 12 34 56 78", "e.g. 06 12 34 56 78")}
                  value={form.telephone}
                  onChange={handleChange("telephone")}
                />
                {errors.telephone && <span className="checkout-form__error">{errors.telephone}</span>}
              </div>

              {/* Adresse */}
              <div className={`checkout-form__field${errors.adresse ? " has-error" : ""}`}>
                <label className="checkout-form__label">
                  <IconMap /> {t("Adresse de livraison", "Delivery address")} *
                </label>
                <textarea
                  className="checkout-form__input checkout-form__textarea"
                  placeholder={t("Numéro, rue, quartier, ville…", "Street number, street, neighborhood, city…")}
                  rows={3}
                  value={form.adresse}
                  onChange={handleChange("adresse")}
                />
                {errors.adresse && <span className="checkout-form__error">{errors.adresse}</span>}
              </div>

              {/* Méthode de paiement */}
              <div className="checkout-payment">
                <label className="checkout-form__label">{t("Méthode de paiement", "Payment method")}</label>
                <div className="checkout-payment__options">
                  <label className={`checkout-payment__option${paymentMethod === "cod" ? " active" : ""}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                    />
                    <span>{t("Paiement à la livraison", "Cash on delivery")}</span>
                  </label>
                  <label className={`checkout-payment__option${paymentMethod === "card" ? " active" : ""}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                    />
                    <span>{t("Carte bancaire", "Credit card")}</span>
                  </label>
                </div>

                {paymentMethod === "card" && (
                  <div className="checkout-card-form">
                    <div className={`checkout-form__field${cardErrors.numero ? " has-error" : ""}`}>
                      <label className="checkout-form__label">{t("Numéro de carte", "Card number")}</label>
                      <input
                        className="checkout-form__input"
                        type="text"
                        inputMode="numeric"
                        placeholder="1234 5678 9012 3456"
                        value={card.numero}
                        onChange={handleCardChange("numero")}
                      />
                      {cardErrors.numero && <span className="checkout-form__error">{cardErrors.numero}</span>}
                    </div>
                    <div className={`checkout-form__field${cardErrors.nom ? " has-error" : ""}`}>
                      <label className="checkout-form__label">{t("Nom sur la carte", "Name on card")}</label>
                      <input
                        className="checkout-form__input"
                        type="text"
                        placeholder={t("ex : HAMZA BENALI", "e.g. HAMZA BENALI")}
                        value={card.nom}
                        onChange={handleCardChange("nom")}
                      />
                      {cardErrors.nom && <span className="checkout-form__error">{cardErrors.nom}</span>}
                    </div>
                    <div className="checkout-form__row">
                      <div className={`checkout-form__field${cardErrors.expiry ? " has-error" : ""}`}>
                        <label className="checkout-form__label">{t("Expiration", "Expiry")}</label>
                        <input
                          className="checkout-form__input"
                          type="text"
                          inputMode="numeric"
                          placeholder="MM/AA"
                          value={card.expiry}
                          onChange={handleCardChange("expiry")}
                        />
                        {cardErrors.expiry && <span className="checkout-form__error">{cardErrors.expiry}</span>}
                      </div>
                      <div className={`checkout-form__field${cardErrors.cvv ? " has-error" : ""}`}>
                        <label className="checkout-form__label">CVV</label>
                        <input
                          className="checkout-form__input"
                          type="text"
                          inputMode="numeric"
                          placeholder="123"
                          value={card.cvv}
                          onChange={handleCardChange("cvv")}
                        />
                        {cardErrors.cvv && <span className="checkout-form__error">{cardErrors.cvv}</span>}
                      </div>
                    </div>
                    <p className="checkout-form__hint">
                      {t("Paiement simulé — aucune carte ne sera débitée.", "Simulated payment — no card will be charged.")}
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="checkout-btn checkout-btn--primary checkout-btn--full"
                disabled={loading || items.length === 0}
              >
                {loading ? (
                  <span className="checkout-spinner" />
                ) : (
                  <>{t("Confirmer la commande", "Place order")} <IconArrow /></>
                )}
              </button>

              {items.length === 0 && loadedCart && (
                <p className="checkout-form__warn">{t("Votre panier est vide.", "Your cart is empty.")}</p>
              )}
            </form>
          </div>

          {/* Badges sécurité */}
          <div className="checkout-badges">
            <span className="checkout-badge"><IconShield /> {t("Paiement sécurisé", "Secure payment")}</span>
            <span className="checkout-badge"><IconTruck /> {t("Livraison 48h", "48-hour delivery")}</span>
          </div>
        </div>

        {/* ═══════════════════════════
            Droite — Récap
        ═══════════════════════════ */}
        <aside className="checkout-summary">
          <div className="checkout-card">
            <div className="checkout-card__header">
              <span className="checkout-card__step">2</span>
              <h2>{t("Récapitulatif", "Order summary")}</h2>
            </div>

            {!loadedCart ? (
              <div className="checkout-summary__loading">
                {[1,2].map((i) => (
                  <div key={i} className="skeleton" style={{ height: 60, borderRadius: 8, marginBottom: 10 }} />
                ))}
              </div>
            ) : items.length === 0 ? (
              <p className="checkout-summary__empty">{t("Panier vide", "Your cart is empty")}</p>
            ) : (
              <>
                <div className="checkout-summary__items">
                  {items.map((item) => (
                    <div className="checkout-summary__item" key={item.id}>
                      <img
                        src={item.produit.image || "https://placehold.co/56x56/f5f5f5/767676?text=S"}
                        alt={item.produit.nom}
                      />
                      <div className="checkout-summary__item-info">
                        <span className="checkout-summary__item-name">{item.produit.nom}</span>
                        <span className="checkout-summary__item-qty">× {item.quantite}</span>
                      </div>
                      <span className="checkout-summary__item-price">
                        {(item.prix * item.quantite).toLocaleString(lang === "fr" ? "fr-MA" : "en-US")} DH
                      </span>
                    </div>
                  ))}
                </div>

                <div className="checkout-summary__lines">
                  <div className="checkout-summary__line">
                    <span>{t(`Sous-total (${nbArticles} art.)`, `Subtotal (${nbArticles} items)`)}</span>
                    <span>{total.toLocaleString(lang === "fr" ? "fr-MA" : "en-US")} DH</span>
                  </div>
                  <div className="checkout-summary__line">
                    <span>{t("Livraison", "Shipping")}</span>
                    <span className={livraison === 0 ? "free" : ""}>
                      {livraison === 0 ? t("Gratuite 🎁", "Free 🎁") : `${livraison} DH`}
                    </span>
                  </div>
                  <div className="checkout-summary__divider" />
                  <div className="checkout-summary__line checkout-summary__line--total">
                    <span>{t("Total TTC", "Total (incl. tax)")}</span>
                    <span>{Number(totalFinal).toLocaleString(lang === "fr" ? "fr-MA" : "en-US")} DH</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </aside>

      </div>
    </div>
  );
}
