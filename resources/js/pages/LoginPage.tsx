import { useState, type FormEvent } from "react";
import type { AuthResult } from "../types";
import Field from "../components/Field";
import Logo from "../components/Logo";

export default function LoginPage({
  onLogin,
  onRegister,
  notice,
}: {
  onLogin: (identity: string, password: string) => AuthResult;
  onRegister: () => void;
  notice?: string;
}) {
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryMessage, setRecoveryMessage] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    const result = onLogin(identity.trim(), password);
    if (!result.success) {
      setError(result.message ?? "We couldn't match those credentials.");
      return;
    }
    setError("");
  }

  return (
    <main className="login-page">
      <section className="login-story">
        <Logo />
        <div className="story-content">
          <div className="eyebrow light">Municipal livestock intelligence</div>
          <h1>Mas malinaw na presyo para sa bawat alaga.</h1>
          <p>
            Official local price references, dependable weight-based valuation, and transparent
            transactions—built for Barili&apos;s farming community.
          </p>
          <div className="story-stats">
            <div><strong>4</strong><span>Livestock species</span></div>
            <div><strong>42</strong><span>Barangays supported</span></div>
            <div><strong>Weekly</strong><span>Official price updates</span></div>
          </div>
        </div>
        <div className="story-note">
          <span className="note-mark">i</span>
          <p>Valuations are decision-support references. Final selling prices remain negotiated by the parties.</p>
        </div>
      </section>

      <section className="login-panel">
        <div className="mobile-logo"><Logo /></div>
        <div className="login-card">
          <div className="eyebrow">Welcome back</div>
          <h2>Sign in to your account</h2>
          <p className="muted">Access your AgriTimbang workspace.</p>
          {notice && <div className="auth-notice">{notice}</div>}
          <form onSubmit={submit}>
            <Field
              label="Username or email"
              placeholder="Enter your username or email"
              value={identity}
              onChange={(event) => setIdentity(event.target.value)}
              autoComplete="username"
            />
            <label className="field">
              <span>Password</span>
              <div className="password-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                />
                <button type="button" className="show-password" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>
            <button type="button" className="forgot-password" onClick={() => setShowRecovery(!showRecovery)}>Forgot password?</button>
            {showRecovery && (
              <div className="recovery-box">
                <Field label="Recovery email" type="email" required value={recoveryEmail} onChange={(event) => setRecoveryEmail(event.target.value)} />
                <button type="button" className="secondary-button" onClick={() => setRecoveryMessage(recoveryEmail ? "If an account exists, a reset link has been sent." : "Enter your email address.")}>Send reset link</button>
                {recoveryMessage && <span>{recoveryMessage}</span>}
              </div>
            )}
            {error && <div className="form-error">{error}</div>}
            <button type="submit" className="primary-button">Sign in</button>
          </form>
          <div className="register-prompt">
            <div>
              <strong>New to AgriTimbang?</strong>
              <span>Create a farmer account and submit your verification document.</span>
            </div>
            <button type="button" className="register-link" onClick={onRegister}>Register account →</button>
          </div>
        </div>
        <p className="copyright">Municipality of Barili · Municipal Agriculture Office</p>
      </section>
    </main>
  );
}
