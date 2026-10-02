import { useState, type FormEvent } from "react";

import Field from "../components/Field";
import Logo from "../components/Logo";

import type { RegistrationInput } from "../types";

export default function RegisterPage({
    onBack,
    onRegister,
}: {
    onBack: () => void;
    onRegister: (input: RegistrationInput) => Promise<string | undefined>;
}) {
    const [form, setForm] = useState<RegistrationInput>({
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        passwordConfirmation: "",
    });

    const [error, setError] = useState("");

    function update(field: keyof RegistrationInput, value: string) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));

        if (error) {
            setError("");
        }
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const requiredFields = [
            form.firstName,
            form.lastName,
            form.email,
            form.password,
        ];

        if (requiredFields.some((value) => !value.trim())) {
            setError("Please complete all required fields.");
            return;
        }

        if (form.password.length < 8) {
            setError("Create a password with at least 8 characters.");
            return;
        }

        if (form.password !== form.passwordConfirmation) {
            setError("The passwords do not match.");
            return;
        }

        setError("");

        const registrationError = await onRegister(form);

        if (registrationError) {
            setError(registrationError);
        }
    }

    return (
        <main className="login-page">
            {/* LEFT PANEL */}
            <section className="login-story registration-story">
                <Logo />

                <div className="story-content">
                    <div className="eyebrow light">Join AgriTimbang</div>

                    <h1>Start your journey with AgriTimbang.</h1>

                    <p>
                        Create your farmer account to access livestock price
                        information and begin setting up your farmer profile.
                    </p>

                    <div className="registration-steps">
                        <div>
                            <span>1</span>

                            <p>
                                <strong>Create your account</strong>

                                <small>
                                    Provide your basic account information.
                                </small>
                            </p>
                        </div>

                        <div>
                            <span>2</span>

                            <p>
                                <strong>Complete your farmer profile</strong>

                                <small>
                                    Add your municipality, barangay, address,
                                    and other farmer information after signing
                                    in.
                                </small>
                            </p>
                        </div>

                        <div>
                            <span>3</span>

                            <p>
                                <strong>Verify your farmer profile</strong>

                                <small>
                                    Submit your verification document from your
                                    dashboard for LGU review.
                                </small>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="story-note">
                    <span className="note-mark">i</span>

                    <p>
                        You can access your account immediately after
                        registration. Some farmer features will remain
                        unavailable until your profile is verified by an
                        authorized LGU officer.
                    </p>
                </div>
            </section>

            {/* RIGHT PANEL */}
            <section className="login-panel register-panel">
                <div className="mobile-logo">
                    <Logo />
                </div>

                <div className="login-card register-card">
                    <button
                        type="button"
                        className="back-to-login"
                        onClick={onBack}
                    >
                        ← Back to sign in
                    </button>

                    <div className="eyebrow">Farmer Registration</div>

                    <h2>Create your account</h2>

                    <p className="muted">
                        Enter your basic information to create your AgriTimbang
                        account. You can complete your farmer profile after
                        signing in.
                    </p>

                    <form onSubmit={submit}>
                        {/* NAME */}
                        <div className="registration-grid">
                            <Field
                                label="First name"
                                required
                                value={form.firstName}
                                onChange={(event) =>
                                    update("firstName", event.target.value)
                                }
                                autoComplete="given-name"
                            />

                            <Field
                                label="Middle name"
                                value={form.middleName}
                                onChange={(event) =>
                                    update("middleName", event.target.value)
                                }
                                autoComplete="additional-name"
                            />
                        </div>

                        <Field
                            label="Last name"
                            required
                            value={form.lastName}
                            onChange={(event) =>
                                update("lastName", event.target.value)
                            }
                            autoComplete="family-name"
                        />

                        {/* EMAIL */}
                        <Field
                            label="Email address"
                            type="email"
                            required
                            placeholder="name@email.com"
                            value={form.email}
                            onChange={(event) =>
                                update("email", event.target.value)
                            }
                            autoComplete="email"
                        />

                        {/* CONTACT */}
                        <Field
                            label="Contact number"
                            type="tel"
                            placeholder="+63"
                            value={form.phone}
                            onChange={(event) =>
                                update("phone", event.target.value)
                            }
                            autoComplete="tel"
                        />

                        {/* PASSWORD */}
                        <div className="registration-grid">
                            <Field
                                label="Password"
                                type="password"
                                required
                                minLength={8}
                                value={form.password}
                                onChange={(event) =>
                                    update("password", event.target.value)
                                }
                                autoComplete="new-password"
                            />

                            <Field
                                label="Confirm password"
                                type="password"
                                required
                                minLength={8}
                                value={form.passwordConfirmation}
                                onChange={(event) =>
                                    update(
                                        "passwordConfirmation",
                                        event.target.value,
                                    )
                                }
                                autoComplete="new-password"
                            />
                        </div>

                        {/* ERROR */}
                        {error && (
                            <div className="form-error" role="alert">
                                {error}
                            </div>
                        )}

                        {/* SUBMIT */}
                        <div className="registration-actions">
                            <button type="submit" className="primary-button">
                                Create account
                            </button>
                        </div>
                    </form>

                    <p className="registration-terms">
                        By registering, you confirm that the information
                        provided is accurate. Additional farmer information and
                        verification documents can be submitted after signing
                        in.
                    </p>
                </div>

                <p className="copyright">
                    AgriTimbang · Livestock Price Transparency and Monitoring
                    System
                </p>
            </section>
        </main>
    );
}
