/**
 * Register — SportShop
 * Design moderne : card centrée, icônes sur les champs, logo en haut.
 * Logique inchangée (useAuth, navigate).
 */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

/* ── Icônes SVG inline ── */
const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

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

const IconShield = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
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
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <line x1="19" y1="8" x2="19" y2="14"/>
    <line x1="22" y1="11" x2="16" y2="11"/>
  </svg>
);

/* Logo inline pour la page auth */
const LogoMini = () => (
  <svg width="36" height="36" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="hexGradReg" x1="0" y1="0" x2="42" y2="42" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ff7a45"/>
        <stop offset="100%" stopColor="#e04a12"/>
      </linearGradient>
    </defs>
    <polygon points="21,2 38,11.5 38,30.5 21,40 4,30.5 4,11.5" fill="url(#hexGradReg)"/>
    <polygon points="21,5.5 35,13.75 35,30.25 21,38.5 7,30.25 7,13.75"
             fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1"/>
    <path d="M23.5 7 L14 22 L20.5 22 L18 35 L28 19 L21.5 19 Z" fill="white"/>
  </svg>
);

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm] = useState({
    name: "", email: "", password: "", password_confirmation: "",
  });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
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

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* ── En-tête ── */}
        <div className="auth-card__header">
          <Link to="/" className="auth-card__logo">
            <LogoMini />
            <span className="auth-card__logo-text">
              SPORT<span>SHOP</span>
            </span>
          </Link>
          <h1 className="auth-card__title">Create an account</h1>
          <p className="auth-card__subtitle">Join the SportShop community today</p>
        </div>

        {/* ── Formulaire ── */}
        <form className="auth-form" onSubmit={submit} noValidate>

          {/* Full name */}
          <div className="auth-form__field">
            <label className="auth-form__label" htmlFor="reg-name">Full name</label>
            <div className="auth-form__input-wrap">
              <span className="auth-form__icon"><IconUser /></span>
              <input
                id="reg-name"
                className={`auth-form__input${errors.name ? " error" : ""}`}
                name="name"
                type="text"
                placeholder="Your full name"
                value={form.name}
                onChange={handle}
                required
                autoComplete="name"
              />
            </div>
            {errors.name && <p className="auth-form__error">{errors.name[0]}</p>}
          </div>

          {/* Email */}
          <div className="auth-form__field">
            <label className="auth-form__label" htmlFor="reg-email">Email address</label>
            <div className="auth-form__input-wrap">
              <span className="auth-form__icon"><IconMail /></span>
              <input
                id="reg-email"
                className={`auth-form__input${errors.email ? " error" : ""}`}
                name="email"
                type="email"
                placeholder="example@email.com"
                value={form.email}
                onChange={handle}
                required
                autoComplete="email"
              />
            </div>
            {errors.email && <p className="auth-form__error">{errors.email[0]}</p>}
          </div>

          {/* Two columns: password + confirmation */}
          <div className="auth-form__row">

            {/* Password */}
            <div className="auth-form__field">
              <label className="auth-form__label" htmlFor="reg-pwd">Password</label>
              <div className="auth-form__input-wrap">
                <span className="auth-form__icon"><IconLock /></span>
                <input
                  id="reg-pwd"
                  className={`auth-form__input${errors.password ? " error" : ""}`}
                  name="password"
                  type={showPwd ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handle}
                  required
                  autoComplete="new-password"
                />
                <button type="button" className="auth-form__eye"
                        onClick={() => setShowPwd((v) => !v)}
                        aria-label={showPwd ? "Hide" : "Show"}>
                  {showPwd ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
              {errors.password && <p className="auth-form__error">{errors.password[0]}</p>}
            </div>

            {/* Confirm password */}
            <div className="auth-form__field">
              <label className="auth-form__label" htmlFor="reg-pwd2">Confirm password</label>
              <div className="auth-form__input-wrap">
                <span className="auth-form__icon"><IconShield /></span>
                <input
                  id="reg-pwd2"
                  className="auth-form__input"
                  name="password_confirmation"
                  type={showPwd2 ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={form.password_confirmation}
                  onChange={handle}
                  required
                  autoComplete="new-password"
                />
                <button type="button" className="auth-form__eye"
                        onClick={() => setShowPwd2((v) => !v)}
                        aria-label={showPwd2 ? "Hide" : "Show"}>
                  {showPwd2 ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

          </div>

          {/* Password strength indicator */}
          {form.password.length > 0 && (
            <div className="auth-form__pwd-strength">
              <div className="auth-form__pwd-bars">
                <span className={`auth-form__pwd-bar${form.password.length >= 1 ? " active weak" : ""}`} />
                <span className={`auth-form__pwd-bar${form.password.length >= 4 ? " active medium" : ""}`} />
                <span className={`auth-form__pwd-bar${form.password.length >= 8 ? " active strong" : ""}`} />
              </div>
              <span className="auth-form__pwd-label">
                {form.password.length < 4 ? "Weak" : form.password.length < 8 ? "Medium" : "Strong"}
              </span>
            </div>
          )}

          {/* Submit button */}
          <button type="submit" className="auth-form__btn" disabled={loading}>
            {loading ? (
              <span className="auth-form__spinner" />
            ) : (
              <>Create my account <IconArrowRight /></>
            )}
          </button>

        </form>

        {/* ── Pied ── */}
        <p className="auth-card__footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-card__link">Sign in</Link>
        </p>

      </div>
    </div>
  );
}
