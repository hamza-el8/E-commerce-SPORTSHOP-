/**
 * Register — Premium Split-Screen
 * Gauche : visuel noir/or immersif   Droite : formulaire épuré
 */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

/* ── Icons ── */
const IconUser = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
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
const IconShield = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
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
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <line x1="19" y1="8" x2="19" y2="14"/>
    <line x1="22" y1="11" x2="16" y2="11"/>
  </svg>
);
const LogoMark = () => (
  <svg width="26" height="26" viewBox="0 0 20 20" fill="none">
    <path d="M11.5 2 L6 10.5 L10 10.5 L8.5 18 L14 9 L10 9 Z" fill="#0a0a0a"/>
  </svg>
);

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm] = useState({
    name: "", email: "", password: "", password_confirmation: "",
  });
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [showPwd,  setShowPwd]  = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setErrors(err.response?.data?.errors || {});
    } finally {
      setLoading(false);
    }
  };

  const pwdLen = form.password.length;

  return (
    <div className="auth-page">

      {/* ── Panneau gauche — visuel ── */}
      <div className="auth-visual">
        <div className="auth-visual__dots" />
        <div className="auth-visual__bg"
             style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80')" }} />

        <div className="auth-visual__content">
          <Link to="/" className="auth-visual__logo">
            <div className="auth-visual__logo-mark">
              <LogoMark />
            </div>
            <span className="auth-visual__logo-name">SportShop</span>
          </Link>
          <div className="auth-visual__divider" />
          <h2 className="auth-visual__title">
            Rejoignez
            <span>la communauté</span>
          </h2>
          <p className="auth-visual__sub">500+ produits · Livraison 48h</p>
        </div>
      </div>

      {/* ── Panneau droit — formulaire ── */}
      <div className="auth-form-panel">
        <div className="auth-card">

          <div className="auth-card__header">
            <span className="auth-card__eyebrow">Inscription</span>
            <h1 className="auth-card__title">Créer un compte</h1>
            <p className="auth-card__subtitle">
              Rejoignez la communauté SportShop et profitez d'avantages exclusifs.
            </p>
          </div>

          <form className="auth-form" onSubmit={submit} noValidate>

            {/* Nom complet */}
            <div className="auth-form__field">
              <label className="auth-form__label" htmlFor="reg-name">Nom complet</label>
              <div className="auth-form__input-wrap">
                <span className="auth-form__icon"><IconUser /></span>
                <input
                  id="reg-name"
                  className={`auth-form__input${errors.name ? " error" : ""}`}
                  name="name" type="text"
                  placeholder="Votre nom complet"
                  value={form.name} onChange={handle}
                  required autoComplete="name"
                />
              </div>
              {errors.name && <p className="auth-form__error">{errors.name[0]}</p>}
            </div>

            {/* Email */}
            <div className="auth-form__field">
              <label className="auth-form__label" htmlFor="reg-email">Adresse e-mail</label>
              <div className="auth-form__input-wrap">
                <span className="auth-form__icon"><IconMail /></span>
                <input
                  id="reg-email"
                  className={`auth-form__input${errors.email ? " error" : ""}`}
                  name="email" type="email"
                  placeholder="exemple@email.com"
                  value={form.email} onChange={handle}
                  required autoComplete="email"
                />
              </div>
              {errors.email && <p className="auth-form__error">{errors.email[0]}</p>}
            </div>

            {/* Mots de passe — 2 colonnes */}
            <div className="auth-form__row">
              <div className="auth-form__field">
                <label className="auth-form__label" htmlFor="reg-pwd">Mot de passe</label>
                <div className="auth-form__input-wrap">
                  <span className="auth-form__icon"><IconLock /></span>
                  <input
                    id="reg-pwd"
                    className={`auth-form__input${errors.password ? " error" : ""}`}
                    name="password"
                    type={showPwd ? "text" : "password"}
                    placeholder="Min. 6 caractères"
                    value={form.password} onChange={handle}
                    required autoComplete="new-password"
                  />
                  <button type="button" className="auth-form__eye"
                          onClick={() => setShowPwd((v) => !v)}>
                    {showPwd ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
                {errors.password && <p className="auth-form__error">{errors.password[0]}</p>}
              </div>

              <div className="auth-form__field">
                <label className="auth-form__label" htmlFor="reg-pwd2">Confirmer</label>
                <div className="auth-form__input-wrap">
                  <span className="auth-form__icon"><IconShield /></span>
                  <input
                    id="reg-pwd2"
                    className="auth-form__input"
                    name="password_confirmation"
                    type={showPwd2 ? "text" : "password"}
                    placeholder="Répéter"
                    value={form.password_confirmation} onChange={handle}
                    required autoComplete="new-password"
                  />
                  <button type="button" className="auth-form__eye"
                          onClick={() => setShowPwd2((v) => !v)}>
                    {showPwd2 ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </div>
            </div>

            {/* Force du mot de passe */}
            {pwdLen > 0 && (
              <div className="auth-form__pwd-strength">
                <div className="auth-form__pwd-bars">
                  <span className={`auth-form__pwd-bar${pwdLen >= 1 ? " active weak"   : ""}`} />
                  <span className={`auth-form__pwd-bar${pwdLen >= 4 ? " active medium" : ""}`} />
                  <span className={`auth-form__pwd-bar${pwdLen >= 8 ? " active strong" : ""}`} />
                </div>
                <span className="auth-form__pwd-label">
                  {pwdLen < 4 ? "Faible" : pwdLen < 8 ? "Moyen" : "Fort"}
                </span>
              </div>
            )}

            <button type="submit" className="auth-form__btn" disabled={loading}>
              {loading ? (
                <span className="auth-form__spinner" />
              ) : (
                <>Créer mon compte <IconArrow /></>
              )}
            </button>

          </form>

          <p className="auth-card__footer">
            Déjà un compte ?{" "}
            <Link to="/login" className="auth-card__link">Se connecter</Link>
          </p>

        </div>
      </div>

    </div>
  );
}
