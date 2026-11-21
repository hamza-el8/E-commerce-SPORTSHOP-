/**
 * Login — Premium Split-Screen
 * Gauche : visuel noir/or immersif   Droite : formulaire épuré
 */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

/* ── Icons ── */
const IconMail = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const IconLock = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconEye = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconEyeOff = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);
const LogoMark = () => (
  <svg width="26" height="26" viewBox="0 0 20 20" fill="none">
    <path d="M11.5 2 L6 10.5 L10 10.5 L8.5 18 L14 9 L10 9 Z" fill="#0a0a0a"/>
  </svg>
);

export default function Login() {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const [form, setForm]       = useState({ email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.errors?.email?.[0] || "Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* ── Panneau gauche — visuel ── */}
      <div className="auth-visual">
        <div className="auth-visual__dots" />
        <div className="auth-visual__bg" />

        <div className="auth-visual__content">
          <Link to="/" className="auth-visual__logo">
            <div className="auth-visual__logo-mark">
              <LogoMark />
            </div>
            <span className="auth-visual__logo-name">SportShop</span>
          </Link>
          <div className="auth-visual__divider" />
          <h2 className="auth-visual__title">
            Bienvenue
            <span>de retour</span>
          </h2>
          <p className="auth-visual__sub">Performance · Style · Excellence</p>
        </div>
      </div>

      {/* ── Panneau droit — formulaire ── */}
      <div className="auth-form-panel">
        <div className="auth-card">

          <div className="auth-card__header">
            <span className="auth-card__eyebrow">Connexion</span>
            <h1 className="auth-card__title">Bon retour</h1>
            <p className="auth-card__subtitle">
              Connectez-vous à votre compte SportShop pour continuer.
            </p>
          </div>

          <form className="auth-form" onSubmit={submit} noValidate>

            {error && (
              <div className="auth-form__alert">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            {/* Email */}
            <div className="auth-form__field">
              <label className="auth-form__label" htmlFor="login-email">Adresse e-mail</label>
              <div className="auth-form__input-wrap">
                <span className="auth-form__icon"><IconMail /></span>
                <input
                  id="login-email"
                  className="auth-form__input"
                  type="email"
                  placeholder="exemple@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div className="auth-form__field">
              <label className="auth-form__label" htmlFor="login-password">Mot de passe</label>
              <div className="auth-form__input-wrap">
                <span className="auth-form__icon"><IconLock /></span>
                <input
                  id="login-password"
                  className="auth-form__input"
                  type={showPwd ? "text" : "password"}
                  placeholder="Votre mot de passe"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
                />
                <button type="button" className="auth-form__eye"
                        onClick={() => setShowPwd((v) => !v)}
                        aria-label={showPwd ? "Masquer" : "Afficher"}>
                  {showPwd ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-form__btn" disabled={loading}>
              {loading ? (
                <span className="auth-form__spinner" />
              ) : (
                <>Se connecter <IconArrow /></>
              )}
            </button>

          </form>

          <p className="auth-card__footer">
            Pas encore de compte ?{" "}
            <Link to="/register" className="auth-card__link">Créer un compte</Link>
          </p>

        </div>
      </div>

    </div>
  );
}
