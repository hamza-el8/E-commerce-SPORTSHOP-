/**
 * Login — SportShop
 * Design moderne : card centrée, icônes sur les champs, logo en haut.
 * Logique inchangée (useAuth, navigate).
 */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

/* ── Icônes SVG inline ── */
const IconMail = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const IconLock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const IconEye = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const IconEyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const IconArrowRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
    <polyline points="10 17 15 12 10 7"/>
    <line x1="15" y1="12" x2="3" y2="12"/>
  </svg>
);

/* Logo inline pour la page auth */
const LogoMini = () => (
  <svg width="36" height="36" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="hexGradLogin" x1="0" y1="0" x2="42" y2="42" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ff7a45"/>
        <stop offset="100%" stopColor="#e04a12"/>
      </linearGradient>
    </defs>
    <polygon points="21,2 38,11.5 38,30.5 21,40 4,30.5 4,11.5" fill="url(#hexGradLogin)"/>
    <polygon points="21,5.5 35,13.75 35,30.25 21,38.5 7,30.25 7,13.75"
             fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1"/>
    <path d="M23.5 7 L14 22 L20.5 22 L18 35 L28 19 L21.5 19 Z" fill="white"/>
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
      setError(err.response?.data?.errors?.email?.[0] || "Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* ── En-tête : logo + titre ── */}
        <div className="auth-card__header">
          <Link to="/" className="auth-card__logo">
            <LogoMini />
            <span className="auth-card__logo-text">
              SPORT<span>SHOP</span>
            </span>
          </Link>
          <h1 className="auth-card__title">Welcome back 👋</h1>
          <p className="auth-card__subtitle">Sign in to your SportShop account</p>
        </div>

        {/* ── Formulaire ── */}
        <form className="auth-form" onSubmit={submit} noValidate>

          {/* Message d'erreur global */}
          {error && (
            <div className="auth-form__alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
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
            <label className="auth-form__label" htmlFor="login-email">Email address</label>
            <div className="auth-form__input-wrap">
              <span className="auth-form__icon"><IconMail /></span>
              <input
                id="login-email"
                className="auth-form__input"
                type="email"
                placeholder="example@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-form__field">
            <label className="auth-form__label" htmlFor="login-password">Password</label>
            <div className="auth-form__input-wrap">
              <span className="auth-form__icon"><IconLock /></span>
              <input
                id="login-password"
                className="auth-form__input"
                type={showPwd ? "text" : "password"}
                placeholder="Your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="auth-form__eye"
                onClick={() => setShowPwd((v) => !v)}
                aria-label={showPwd ? "Hide" : "Show"}
              >
                {showPwd ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="auth-form__btn"
            disabled={loading}
          >
            {loading ? (
              <span className="auth-form__spinner" />
            ) : (
              <>Sign in <IconArrowRight /></>
            )}
          </button>

        </form>

        {/* ── Pied de carte ── */}
        <p className="auth-card__footer">
          Don't have an account?{" "}
          <Link to="/register" className="auth-card__link">Create an account</Link>
        </p>

      </div>
    </div>
  );
}
