import { useState, type FormEvent } from "react";

import Field from "../components/Field";
import Logo from "../components/Logo";
import {
    getApiErrorMessage,
    requestPasswordReset,
    resetPassword,
} from "../services/auth";

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
    const [recoveryError, setRecoveryError] = useState("");
    const [recoverySubmitting, setRecoverySubmitting] = useState(false);
    const [resetToken, setResetToken] = useState(
        () => new URLSearchParams(window.location.search).get("reset_token") ?? "",
    );
    const [resetPasswordValue, setResetPasswordValue] = useState("");
    const [resetPasswordConfirmation, setResetPasswordConfirmation] =
        useState("");
    const [resetCompleted, setResetCompleted] = useState(false);
    const [resetEmail, setResetEmail] = useState(
        () => new URLSearchParams(window.location.search).get("email") ?? "",
    );

    async function sendResetLink() {
        if (!recoveryEmail.trim()) {
            setRecoveryError("Enter your email address.");
            return;
        }

        setRecoverySubmitting(true);
        setRecoveryError("");
        setRecoveryMessage("");

        try {
            setRecoveryMessage(
                await requestPasswordReset(recoveryEmail.trim()),
            );
        } catch (requestError) {
            setRecoveryError(
                getApiErrorMessage(
                    requestError,
                    "Unable to send a password reset link.",
                ),
            );
        } finally {
            setRecoverySubmitting(false);
        }
    }

    async function submitPasswordReset(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setRecoveryError("");
        setRecoveryMessage("");
        setRecoverySubmitting(true);

        try {
            const message = await resetPassword({
                token: resetToken,
                email: resetEmail.trim(),
                password: resetPasswordValue,
                password_confirmation: resetPasswordConfirmation,
            });
            setRecoveryMessage(message);
            setResetPasswordValue("");
            setResetPasswordConfirmation("");
            setResetToken("");
            setResetCompleted(true);
            window.history.replaceState({}, "", window.location.pathname);
        } catch (requestError) {
            setRecoveryError(
                getApiErrorMessage(
                    requestError,
                    "Unable to reset your password.",
                ),
            );
        } finally {
            setRecoverySubmitting(false);
        }
    }

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
                        Local livestock prices and practical tools for farmers,
                        buyers, and municipal agriculture teams.
                    </p>

                    <div className="story-stats">
                        <div>
                            <strong>4</strong>
                            <span>Species tracked</span>
                        </div>

                        <div>
                            <strong>LGU</strong>
                            <span>Local price data</span>
                        </div>

                        <div>
                            <strong>Weekly</strong>
                            <span>Price updates</span>
                        </div>
                    </div>
                </div>

                <div className="login-story-footer">
                    <div className="story-note">
                        <span className="note-mark">i</span>
                        <p>
                            Valuations are decision-support references. Final
                            selling prices remain negotiated by the parties.
                        </p>
                    </div>
                    <a
                        className="photo-credit"
                        href="https://images.unsplash.com/photo-1548550023-2bdb3c5beed7"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Farm photography via Unsplash
                    </a>
                </div>
            </section>

            <section className="login-panel">
                <div className="mobile-logo">
                    <Logo />
                </div>
                <div className="mobile-login-context">
                    <div className="portal-status">
                        <span className="portal-status-indicator" />
                        <span className="portal-status-copy">
                            <strong>Municipal portal</strong>
                            <small>Barili, Cebu</small>
                        </span>
                        <span className="portal-status-label">Operational</span>
                    </div>
                    <div className="mobile-livestock-stats">
                        <span><strong>4</strong> species</span>
                        <span><strong>LGU</strong> local prices</span>
                        <span><strong>Weekly</strong> updates</span>
                    </div>
                </div>

                <div className="login-card">
                    <div className="portal-status desktop-portal-status">
                        <span className="portal-status-indicator" />
                        <span className="portal-status-copy">
                            <strong>Municipal portal</strong>
                            <small>Barili, Cebu · livestock services</small>
                        </span>
                        <span className="portal-status-label">Operational</span>
                    </div>
                    <div className="eyebrow">Welcome back</div>

                    <h2>Sign in to your account</h2>

                    <p className="muted">Access your AgriTimbang workspace.</p>

                    {notice && <div className="auth-notice">{notice}</div>}
                    {resetCompleted && recoveryMessage && (
                        <div className="auth-notice" role="status">
                            {recoveryMessage}
                        </div>
                    )}

                    {resetToken ? (
                        <form onSubmit={submitPasswordReset}>
                            <p className="muted">
                                Choose a new password for your account.
                            </p>
                            <Field
                                label="Account email"
                                type="email"
                                required
                                autoComplete="email"
                                value={resetEmail}
                                onChange={(event) => setResetEmail(event.target.value)}
                            />
                            <Field
                                label="New password"
                                type="password"
                                required
                                minLength={8}
                                autoComplete="new-password"
                                value={resetPasswordValue}
                                onChange={(event) =>
                                    setResetPasswordValue(event.target.value)
                                }
                            />
                            <Field
                                label="Confirm new password"
                                type="password"
                                required
                                minLength={8}
                                autoComplete="new-password"
                                value={resetPasswordConfirmation}
                                onChange={(event) =>
                                    setResetPasswordConfirmation(event.target.value)
                                }
                            />
                            {recoveryError && (
                                <div className="form-error" role="alert">
                                    {recoveryError}
                                </div>
                            )}
                            {recoveryMessage && (
                                <div className="auth-notice" role="status">
                                    {recoveryMessage}
                                </div>
                            )}
                            <button
                                type="submit"
                                className="primary-button"
                                disabled={recoverySubmitting}
                            >
                                {recoverySubmitting
                                    ? "Updating password..."
                                    : "Reset password"}
                            </button>
                        </form>
                    ) : (
                        <>
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
                            onClick={() => {
                                setRecoveryEmail(email);
                                setRecoveryError("");
                                setRecoveryMessage("");
                                setShowRecovery((current) => !current);
                            }}
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
                                    disabled={recoverySubmitting}
                                    onClick={() => void sendResetLink()}
                                >
                                    {recoverySubmitting
                                        ? "Sending..."
                                        : "Send reset link"}
                                </button>

                                {recoveryError && (
                                    <span className="recovery-error" role="alert">
                                        {recoveryError}
                                    </span>
                                )}
                                {recoveryMessage && (
                                    <span role="status">{recoveryMessage}</span>
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
                        </>
                    )}
                </div>

                <p className="copyright">
                    AgriTimbang · Livestock Price Transparency and Monitoring
                    System
                </p>
            </section>
        </main>
    );
}
