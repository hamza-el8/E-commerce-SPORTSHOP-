/**
 * ProductReviews — SportShop
 * Style Shein : note globale + barres de répartition + liste avis.
 */
import { useEffect, useState, useCallback } from "react";
import api from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../language.js";

/* ── Icône étoile ── */
const IconStar = ({ filled, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"
       fill={filled ? "#f59e0b" : "none"}
       stroke={filled ? "#f59e0b" : "#d1d1d1"}
       strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

/* ── Étoiles interactives ── */
function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;
  return (
    <div className="reviews-star-picker" role="group" aria-label="Note">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} type="button" className="reviews-star-btn"
          onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(s)}
          aria-label={`${s} étoile${s > 1 ? "s" : ""}`} aria-pressed={value === s}>
          <IconStar filled={s <= active} size={26} />
        </button>
      ))}
    </div>
  );
}

/* ── Affichage statique étoiles ── */
function StarDisplay({ value, size = 13 }) {
  const v = Math.round(value ?? 0);
  return (
    <span className="reviews-star-display">
      {[1, 2, 3, 4, 5].map((s) => <IconStar key={s} filled={s <= v} size={size} />)}
    </span>
  );
}

/* ── Initiales avatar ── */
function initials(name = "") {
  return name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

/* ── Composant principal ── */
export default function ProductReviews({ produitId }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [avis,       setAvis]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting,   setDeleting]   = useState(null);

  const [note,        setNote]        = useState(0);
  const [commentaire, setCommentaire] = useState("");
  const [formError,   setFormError]   = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const fetchAvis = useCallback(() => {
    setLoading(true);
    api.get(`/produits/${produitId}/avis`)
      .then((res) => setAvis(res.data))
      .catch(() => setAvis([]))
      .finally(() => setLoading(false));
  }, [produitId]);

  useEffect(() => { fetchAvis(); }, [fetchAvis]);

  const monAvis = avis.find((a) => a.user_id === user?.id);
  useEffect(() => {
    if (monAvis) { setNote(monAvis.note); setCommentaire(monAvis.commentaire ?? ""); }
    else         { setNote(0); setCommentaire(""); }
  }, [monAvis?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(""); setFormSuccess("");
    if (!user) return navigate("/login");
    if (note < 1 || note > 5) {
      setFormError(t("Veuillez choisir une note entre 1 et 5.", "Please choose a rating between 1 and 5."));
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post(`/produits/${produitId}/avis`, { note, commentaire });
      const isUpdate = !!monAvis;
      /* notif admin localStorage */
      const notifAdmin = {
        id: `avis-${Date.now()}`, type: "avis",
        clientId: user.id, clientName: user.name, clientEmail: user.email ?? "",
        produitId, produitNom: res.data?.produit?.nom ?? "",
        note, commentaire: commentaire || "", isUpdate,
        date: new Date().toISOString(), read: false,
      };
      const existing = JSON.parse(localStorage.getItem("sportshop_avis_notifs") || "[]");
      localStorage.setItem("sportshop_avis_notifs", JSON.stringify([notifAdmin, ...existing]));
      setFormSuccess(isUpdate
        ? t("Votre avis a été mis à jour.", "Your review has been updated.")
        : t("Votre avis a été publié.", "Your review has been published."));
      fetchAvis();
      setTimeout(() => setFormSuccess(""), 3000);
    } catch (err) {
      const msg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(" ")
        : err.response?.data?.message ?? t("Une erreur s'est produite.", "Something went wrong.");
      setFormError(msg);
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (avisId) => {
    setDeleting(avisId);
    try {
      await api.delete(`/avis/${avisId}`);
      setNote(0); setCommentaire("");
      setFormSuccess(t("Votre avis a été supprimé.", "Your review has been deleted."));
      fetchAvis();
      setTimeout(() => setFormSuccess(""), 3000);
    } catch { /* silencieux */ }
    finally { setDeleting(null); }
  };

  /* ── Stats ── */
  const total   = avis.length;
  const moyenne = total > 0 ? (avis.reduce((s, a) => s + a.note, 0) / total).toFixed(1) : null;
  const repartition = [5, 4, 3, 2, 1].map((n) => ({
    note: n,
    count: avis.filter((a) => a.note === n).length,
  }));

  return (
    <section className="reviews-section" aria-label={t("Avis clients", "Customer reviews")}>

      {/* ══ En-tête ══ */}
      <div className="reviews-header">
        <h2 className="reviews-title">
          {t("Commentaires des clients", "Customer reviews")}
          {total > 0 && <span className="reviews-count-badge">{total}+</span>}
        </h2>
      </div>

      {/* ══ Résumé + barres (style Shein) ══ */}
      {total > 0 && (
        <div className="reviews-summary">

          {/* Score global */}
          <div className="reviews-summary__score">
            <span className="reviews-summary__avg">{moyenne}</span>
            <StarDisplay value={Math.round(moyenne)} size={22} />
            <span className="reviews-summary__total">
              {total} {t(total > 1 ? "avis" : "avis", total > 1 ? "reviews" : "review")}
            </span>
          </div>

          {/* Barres de répartition */}
          <div className="reviews-summary__bars">
            {repartition.map(({ note: n, count }) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={n} className="reviews-bar-row">
                  <span className="reviews-bar-label">{n}</span>
                  <IconStar filled size={11} />
                  <div className="reviews-bar-track">
                    <div className="reviews-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="reviews-bar-pct">{pct}%</span>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ══ Formulaire ══ */}
      {user ? (
        <form className="reviews-form" onSubmit={handleSubmit} noValidate>
          <h3 className="reviews-form__title">
            {monAvis
              ? t("Modifier votre avis", "Edit your review")
              : t("Laisser un avis", "Leave a review")}
          </h3>

          <div className="reviews-form__field">
            <label className="reviews-form__label">
              {t("Votre note", "Your rating")} <span aria-hidden="true">*</span>
            </label>
            <StarPicker value={note} onChange={setNote} />
          </div>

          <div className="reviews-form__field">
            <label className="reviews-form__label" htmlFor="reviews-commentaire">
              {t("Commentaire (facultatif)", "Comment (optional)")}
            </label>
            <textarea id="reviews-commentaire" className="reviews-form__textarea"
              rows={4} maxLength={1000}
              placeholder={t("Partagez votre expérience avec ce produit…", "Share your experience with this product…")}
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)} />
            <span className="reviews-form__char-count">{commentaire.length} / 1000</span>
          </div>

          {formError   && <p className="reviews-form__error"   role="alert">{formError}</p>}
          {formSuccess && <p className="reviews-form__success" role="status">{formSuccess}</p>}

          <div className="reviews-form__actions">
            <button type="submit" className="reviews-form__submit"
              disabled={submitting || note === 0}>
              {submitting ? <span className="reviews-spinner" /> : monAvis
                ? t("Mettre à jour", "Update review")
                : t("Publier l'avis", "Publish review")}
            </button>
            {monAvis && (
              <button type="button" className="reviews-form__delete"
                onClick={() => handleDelete(monAvis.id)}
                disabled={deleting === monAvis.id}>
                {deleting === monAvis.id
                  ? t("Suppression…", "Deleting…")
                  : t("Supprimer mon avis", "Delete my review")}
              </button>
            )}
          </div>
        </form>
      ) : (
        <div className="reviews-login-prompt">
          <p>{t("Connectez-vous pour laisser un avis.", "Sign in to leave a review.")}</p>
          <button className="reviews-login-btn" onClick={() => navigate("/login")}>
            {t("Se connecter", "Sign in")}
          </button>
        </div>
      )}

      {/* ══ Liste des avis (style Shein) ══ */}
      <div className="reviews-list">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="reviews-item reviews-item--skeleton">
              <div className="skeleton reviews-skeleton__avatar" />
              <div className="reviews-item__body" style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 11, width: "30%", marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 11, width: "55%" }} />
              </div>
            </div>
          ))
        ) : total === 0 ? (
          <p className="reviews-empty">
            {t("Aucun avis pour l'instant. Soyez le premier à en laisser un !",
               "No reviews yet. Be the first to leave one!")}
          </p>
        ) : (
          avis.map((a) => (
            <article key={a.id} className={`reviews-item${a.user_id === user?.id ? " reviews-item--mine" : ""}`}>

              {/* Avatar */}
              <div className="reviews-item__avatar" aria-hidden="true">
                {initials(a.user?.name)}
              </div>

              <div className="reviews-item__body">

                {/* Ligne : auteur + badge + date */}
                <div className="reviews-item__header">
                  <span className="reviews-item__author">
                    {/* masque partiellement le nom (style Shein : c***6) */}
                    {(() => {
                      const name = a.user?.name ?? t("Anonyme", "Anonymous");
                      if (name.length <= 2) return name;
                      return name[0] + "***" + name[name.length - 1];
                    })()}
                  </span>
                  {a.user_id === user?.id && (
                    <span className="reviews-item__mine-badge">{t("Votre avis", "Your review")}</span>
                  )}
                  <span className="reviews-item__date">
                    {new Date(a.created_at).toLocaleDateString(undefined,
                      { year: "numeric", month: "short", day: "numeric" })}
                  </span>
                </div>

                {/* Étoiles */}
                <StarDisplay value={a.note} size={14} />

                {/* Commentaire */}
                {a.commentaire && (
                  <p className="reviews-item__comment">{a.commentaire}</p>
                )}

              </div>
            </article>
          ))
        )}
      </div>

    </section>
  );
}
