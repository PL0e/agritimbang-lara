import { useState, type FormEvent } from "react";

import Field from "../components/Field";
import Logo from "../components/Logo";

import type { AuthResult } from "../types";

export default function LoginPage({
    onLogin,
    onRegister,
    notice,
}: {
    onLogin: (email: string, password: string) => Promise<AuthResult>;

    onRegister: () => void;

    notice?: string;
}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

    const [showRecovery, setShowRecovery] = useState(false);

    const [recoveryEmail, setRecoveryEmail] = useState("");

    const [recoveryMessage, setRecoveryMessage] = useState("");

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!email.trim() || !password) {
            setError("Enter your email address and password.");
            return;
        }

        setError("");
        setIsSubmitting(true);

        try {
            const result = await onLogin(email.trim(), password);

            if (!result.success) {
                setError(
                    result.message ?? "We couldn't match those credentials.",
                );
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="login-page">
            <section className="login-story">
                <Logo />

                <div className="story-content">
                    <div className="eyebrow light">
                        Municipal livestock intelligence
                    </div>

                    <h1>Mas malinaw na presyo para sa bawat alaga.</h1>

                    <p>
                        Official local price references, dependable weight-based
                        valuation, and transparent transactions—built for the
                        local farming community.
                    </p>

                    <div className="story-stats">
                        <div>
                            <strong>4</strong>
                            <span>Livestock species</span>
                        </div>

                        <div>
                            <strong>LGU</strong>
                            <span>Local price references</span>
                        </div>

                        <div>
                            <strong>Weekly</strong>
                            <span>Official price updates</span>
                        </div>
                    </div>
                </div>

                <div className="story-note">
                    <span className="note-mark">i</span>

                    <p>
                        Valuations are decision-support references. Final
                        selling prices remain negotiated by the parties.
                    </p>
                </div>
            </section>

            <section className="login-panel">
                <div className="mobile-logo">
                    <Logo />
                </div>

                <div className="login-card">
                    <div className="eyebrow">Welcome back</div>

                    <h2>Sign in to your account</h2>

                    <p className="muted">Access your AgriTimbang workspace.</p>

                    {notice && <div className="auth-notice">{notice}</div>}

                    <form onSubmit={submit}>
                        <Field
                            label="Email address"
                            type="email"
                            required
                            placeholder="name@email.com"
                            value={email}
                            onChange={(event) => {
                                setEmail(event.target.value);

                                if (error) {
                                    setError("");
                                }
                            }}
                            autoComplete="email"
                        />

                        <label className="field">
                            <span>Password</span>

                            <div className="password-wrap">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(event) => {
                                        setPassword(event.target.value);

                                        if (error) {
                                            setError("");
                                        }
                                    }}
                                    autoComplete="current-password"
                                />

                                <button
                                    type="button"
                                    className="show-password"
                                    onClick={() =>
                                        setShowPassword((current) => !current)
                                    }
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </label>

                        <button
                            type="button"
                            className="forgot-password"
                            onClick={() =>
                                setShowRecovery((current) => !current)
                            }
                        >
                            Forgot password?
                        </button>

                        {showRecovery && (
                            <div className="recovery-box">
                                <Field
                                    label="Recovery email"
                                    type="email"
                                    required
                                    value={recoveryEmail}
                                    onChange={(event) =>
                                        setRecoveryEmail(event.target.value)
                                    }
                                />

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={() =>
                                        setRecoveryMessage(
                                            recoveryEmail
                                                ? "Password recovery is not available yet."
                                                : "Enter your email address.",
                                        )
                                    }
                                >
                                    Send reset link
                                </button>

                                {recoveryMessage && (
                                    <span>{recoveryMessage}</span>
                                )}
                            </div>
                        )}

                        {error && (
                            <div className="form-error" role="alert">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="primary-button"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Signing in..." : "Sign in"}
                        </button>
                    </form>

                    <div className="register-prompt">
                        <div>
                            <strong>New to AgriTimbang?</strong>

                            <span>
                                Create your farmer account. Profile verification
                                can be completed after signing in.
                            </span>
                        </div>

                        <button
                            type="button"
                            className="register-link"
                            onClick={onRegister}
                        >
                            Register account →
                        </button>
                    </div>
                </div>

                <p className="copyright">
                    AgriTimbang · Livestock Price Transparency and Monitoring
                    System
                </p>
            </section>
        </main>
    );
}
