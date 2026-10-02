import { useState, type FormEvent } from "react";
import Field from "../components/Field";
import Logo from "../components/Logo";
import type { RegistrationInput } from "../types";

export default function RegisterPage({
  onBack,
  onRegister,
}: {
  onBack: () => void;
  onRegister: (input: RegistrationInput) => string | undefined;
}) {
  const [form, setForm] = useState<RegistrationInput>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    municipality: "Barili, Cebu",
    barangay: "",
    documentName: "",
    documentType: "",
    password: "",
  });
  const [step, setStep] = useState<1 | 2>(1);
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");

  function update(field: keyof RegistrationInput, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (step === 1) {
      if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.barangay) {
        setError("Complete all required personal information.");
        return;
      }
      if (form.password.length < 8) {
        setError("Create a password with at least 8 characters.");
        return;
      }
      if (form.password !== confirmation) {
        setError("The passwords do not match.");
        return;
      }
      setError("");
      setStep(2);
      return;
    }
    if (!form.documentName) {
      setError("Upload a valid ID or barangay certification before submitting.");
      return;
    }
    if (form.password.length < 8) {
      setError("Create a password with at least 8 characters.");
      return;
    }
    if (form.password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }
    setError("");
    const registrationError = onRegister(form);
    if (registrationError) setError(registrationError);
  }

  return (
    <main className="login-page">
      <section className="login-story registration-story">
        <Logo />
        <div className="story-content">
          <div className="eyebrow light">Join AgriTimbang</div>
          <h1>Start with a verified farmer profile.</h1>
          <p>
            Register your account to access official livestock prices, save valuation references,
            and keep your livestock records organized.
          </p>
          <div className="registration-steps">
            <div><span>1</span><p><strong>Create your account</strong><small>Provide your contact and location details.</small></p></div>
            <div><span>2</span><p><strong>Submit a document</strong><small>Upload an ID or barangay certification.</small></p></div>
            <div><span>3</span><p><strong>Get verified</strong><small>An authorized LGU officer reviews your submission.</small></p></div>
          </div>
        </div>
        <div className="story-note">
          <span className="note-mark">i</span>
          <p>Farmer registrations begin with pending status until the submitted document is reviewed.</p>
        </div>
      </section>

      <section className="login-panel register-panel">
        <div className="mobile-logo"><Logo /></div>
        <div className="login-card register-card">
          <button type="button" className="back-to-login" onClick={onBack}>← Back to sign in</button>
          <div className="registration-progress"><span className={step === 1 ? "active" : "complete"}>1</span><i /><span className={step === 2 ? "active" : ""}>2</span></div>
          <div className="eyebrow">Farmer registration · Step {step} of 2</div>
          <h2>{step === 1 ? "Create your account" : "Verify your information"}</h2>
          <p className="muted">{step === 1 ? "Enter your personal and location details." : "Upload one valid document and review your registration."}</p>
          <form onSubmit={submit}>
            {step === 1 ? (
              <>
                <div className="registration-grid">
                  <Field label="First name" required value={form.firstName} onChange={(event) => update("firstName", event.target.value)} autoComplete="given-name" />
                  <Field label="Last name" required value={form.lastName} onChange={(event) => update("lastName", event.target.value)} autoComplete="family-name" />
                </div>
                <Field label="Email address" type="email" required placeholder="name@email.com" value={form.email} onChange={(event) => update("email", event.target.value)} autoComplete="email" />
                <div className="registration-grid">
                  <Field label="Contact number" type="tel" required placeholder="+63" value={form.phone} onChange={(event) => update("phone", event.target.value)} autoComplete="tel" />
                  <Field label="Barangay" required placeholder="Your barangay" value={form.barangay} onChange={(event) => update("barangay", event.target.value)} />
                </div>
                <Field label="Municipality" required readOnly value={form.municipality} />
                <div className="registration-grid">
                  <Field label="Password" type="password" required minLength={8} value={form.password} onChange={(event) => update("password", event.target.value)} autoComplete="new-password" />
                  <Field label="Confirm password" type="password" required minLength={8} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" />
                </div>
              </>
            ) : (
              <>
                <label className="registration-upload">
                  <span className="upload-mark">↑</span>
                  <strong>{form.documentName || "Upload verification document"}</strong>
                  <small>Government ID or barangay certification · PDF, JPG, or PNG</small>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) setForm((current) => ({ ...current, documentName: file.name, documentType: file.type, documentUrl: URL.createObjectURL(file) }));
                  }} />
                </label>
                <div className="registration-review">
                  <div><span>Applicant</span><strong>{form.firstName} {form.lastName}</strong></div>
                  <div><span>Location</span><strong>{form.barangay}, {form.municipality}</strong></div>
                  <div><span>Email</span><strong>{form.email}</strong></div>
                  <div><span>Account status</span><strong>Pending LGU approval</strong></div>
                </div>
              </>
            )}
            {error && <div className="form-error">{error}</div>}
            <div className="registration-actions">
              {step === 2 && <button type="button" className="return-button" onClick={() => setStep(1)}>Back</button>}
              <button type="submit" className="primary-button">{step === 1 ? "Continue to document upload" : "Submit registration"}</button>
            </div>
          </form>
          <p className="registration-terms">By registering, you confirm that the information provided is accurate and may be reviewed by authorized municipal personnel.</p>
        </div>
        <p className="copyright">Municipality of Barili · Municipal Agriculture Office</p>
      </section>
    </main>
  );
}
