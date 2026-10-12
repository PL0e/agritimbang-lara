import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";

import type { Account, ApiResponse, AuthUser } from "../types";
import api from "../services/api";
import { getApiErrorMessage } from "../services/auth";
import Field from "../components/Field";
import SuccessDialog from "../components/SuccessDialog";

type Municipality = { id: string; name: string; province: string };
type Barangay = { id: string; name: string };
type FarmerProfile = {
  municipality_id: string;
  barangay_id: string;
  address: string | null;
};
type VerificationRecord = {
  id: string;
  document_type: string;
  original_filename: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};
type DocumentPreview = {
  fileName: string;
  contentType: string;
  url: string;
};

export default function ProfileSettingsPage({
  account,
  profileUser,
  onProfileUpdated,
}: {
  account: Account;
  profileUser: AuthUser;
  onProfileUpdated: () => Promise<void>;
}) {
  return (
    <>
      {account.role !== "farmer" ? (
        <StaffProfileSettingsPage
          account={account}
          profileUser={profileUser}
          onProfileUpdated={onProfileUpdated}
        />
      ) : (
        <FarmerProfileSettingsPage account={account} />
      )}
      <PasswordSettingsPanel />
    </>
  );
}

function StaffProfileSettingsPage({
  account,
  profileUser,
  onProfileUpdated,
}: {
  account: Account;
  profileUser: AuthUser;
  onProfileUpdated: () => Promise<void>;
}) {
  const [form, setForm] = useState({
    first_name: profileUser.first_name,
    middle_name: profileUser.middle_name ?? "",
    last_name: profileUser.last_name,
    email: profileUser.email,
    phone_number: profileUser.phone_number ?? "",
    station: profileUser.lgu_officer_profile?.station ?? "",
    designation: profileUser.lgu_officer_profile?.designation ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const assignment =
    account.role === "admin"
      ? "System-wide access"
      : account.role === "lgu"
        ? "Municipality authority"
        : "Municipal operations";

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">Account profile</div>
          <h1>Profile settings</h1>
          <p>Review your account information and role access.</p>
        </div>
      </div>
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Personal information</h2>
            <p>Your registered AgriTimbang account details.</p>
          </div>
        </div>
        <div className="profile-details">
          <div>
            <span>Account type</span>
            <strong>{account.title}</strong>
          </div>
          <div>
            <span>Access</span>
            <strong>{assignment}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong className={profileUser.status === "active" ? "verification-verified" : ""}>
              {profileUser.status}
            </strong>
          </div>
        </div>
        <form
          className="operation-form"
          onSubmit={async (event) => {
            event.preventDefault();
            setSaving(true);
            setError("");
            setSaved(false);
            try {
              const profileData = account.role === "admin"
                ? {
                    first_name: form.first_name,
                    middle_name: form.middle_name || null,
                    last_name: form.last_name,
                    email: form.email,
                    phone_number: form.phone_number || null,
                  }
                : {
                    ...form,
                    middle_name: form.middle_name || null,
                    phone_number: form.phone_number || null,
                    station: form.station || null,
                    designation: form.designation || null,
                  };
              await api.patch("/auth/profile", profileData);
              await onProfileUpdated();
              setSaved(true);
            } catch (requestError) {
              setError(getApiErrorMessage(requestError, "Unable to update your profile."));
            } finally {
              setSaving(false);
            }
          }}
        >
          <div className="form-grid">
            <Field label="First name" value={form.first_name} onChange={(event) => setForm({ ...form, first_name: event.target.value })} required />
            <Field label="Middle name" value={form.middle_name} onChange={(event) => setForm({ ...form, middle_name: event.target.value })} />
            <Field label="Last name" value={form.last_name} onChange={(event) => setForm({ ...form, last_name: event.target.value })} required />
            <Field label="Email address" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
            <Field label="Phone number" type="tel" value={form.phone_number} onChange={(event) => setForm({ ...form, phone_number: event.target.value })} />
            {account.role !== "admin" && (
              <>
                <Field label="Station" value={form.station} onChange={(event) => setForm({ ...form, station: event.target.value })} />
                <Field label="Designation" value={form.designation} onChange={(event) => setForm({ ...form, designation: event.target.value })} />
              </>
            )}
          </div>
          {error && <div className="form-error" role="alert">{error}</div>}
          {saved && <div className="auth-notice" role="status">Your profile was updated.</div>}
          <button className="primary-button button-fit" disabled={saving}>
            {saving ? "Saving..." : "Save profile"}
          </button>
        </form>
        <p className="privacy-note">
          Your role and municipality access remain managed by authorized administrators.
        </p>
      </section>
    </>
  );
}

function PasswordSettingsPanel() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      await api.patch("/auth/password", {
        current_password: currentPassword,
        password,
        password_confirmation: passwordConfirmation,
      });
      setCurrentPassword("");
      setPassword("");
      setPasswordConfirmation("");
      setSaved(true);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to change your password."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Password and security</h2>
          <p>Change your password. Other active sessions will be signed out.</p>
        </div>
      </div>
      <form className="operation-form" onSubmit={changePassword}>
        <div className="form-grid">
          <Field
            label="Current password"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
          />
          <Field
            label="New password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <Field
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={passwordConfirmation}
            onChange={(event) => setPasswordConfirmation(event.target.value)}
            required
          />
        </div>
        {error && <div className="form-error" role="alert">{error}</div>}
        {saved && <div className="auth-notice" role="status">Password changed successfully.</div>}
        <button className="primary-button button-fit" disabled={saving}>
          {saving ? "Updating..." : "Change password"}
        </button>
      </form>
    </section>
  );
}

function FarmerProfileSettingsPage({
  account,
}: {
  account: Account;
}) {
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [municipalityId, setMunicipalityId] = useState("");
  const [barangayId, setBarangayId] = useState("");
  const [address, setAddress] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [documents, setDocuments] = useState<VerificationRecord[]>([]);
  const [documentPreview, setDocumentPreview] = useState<DocumentPreview | null>(null);
  const [openingDocument, setOpeningDocument] = useState(false);
  const [documentType, setDocumentType] = useState("national_id");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    return () => {
      if (documentPreview) {
        URL.revokeObjectURL(documentPreview.url);
      }
    };
  }, [documentPreview]);

  useEffect(() => {
    async function loadProfile() {
      try {
        const [profileResponse, municipalityResponse, documentResponse] =
          await Promise.all([
            api.get<ApiResponse<FarmerProfile | null>>("/farmer/profile"),
            api.get<ApiResponse<Municipality[]>>(
              "/reference/municipalities",
            ),
            api.get<ApiResponse<VerificationRecord[]>>(
              "/farmer/verification-documents",
            ),
          ]);

        const profile = profileResponse.data.data;
        setMunicipalities(municipalityResponse.data.data);
        setDocuments(documentResponse.data.data);

        if (profile) {
          setMunicipalityId(profile.municipality_id);
          setBarangayId(profile.barangay_id);
          setAddress(profile.address ?? "");
          setProfileSaved(true);
        }
      } catch (requestError) {
        setError(
          getApiErrorMessage(
            requestError,
            "Unable to load your farmer profile.",
          ),
        );
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, []);

  useEffect(() => {
    if (!municipalityId) {
      setBarangays([]);
      return;
    }

    async function loadBarangays() {
      try {
        const response = await api.get<ApiResponse<Barangay[]>>(
          `/reference/municipalities/${municipalityId}/barangays`,
        );
        setBarangays(response.data.data);
      } catch (requestError) {
        setBarangays([]);
        setError(
          getApiErrorMessage(requestError, "Unable to load barangays."),
        );
      }
    }

    void loadBarangays();
  }, [municipalityId]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(null);

    try {
      await api.put("/farmer/profile", {
        municipality_id: municipalityId,
        barangay_id: barangayId,
        address: address || null,
      });
      setProfileSaved(true);
      setSuccess({
        title: "Farmer profile saved successfully",
        message: "Your farmer profile information has been saved.",
      });
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "Unable to save your profile."),
      );
    } finally {
      setSaving(false);
    }
  }

  function chooseDocument(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (extension !== "pdf" && extension !== "png") {
      setError("Only PDF and PNG files are accepted.");
      setSelectedFile(null);
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("The selected file is larger than 5 MB.");
      setSelectedFile(null);
      event.target.value = "";
      return;
    }

    setError("");
    setSuccess(null);
    setSelectedFile(file);
  }

  async function uploadDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedFile) {
      setError("Choose a PDF or PNG document first.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess(null);

    const formData = new FormData();
    formData.append("document_type", documentType);
    formData.append("document", selectedFile);

    try {
      const uploadResponse = await api.post<
        ApiResponse<VerificationRecord> & { errors?: Record<string, string[]> }
      >("/farmer/verification-documents", formData);
      const uploadResult = uploadResponse.data;

      if (!uploadResult?.success || !uploadResult.data?.id) {
        const validationError = Object.values(uploadResult?.errors ?? {})[0]?.[0];
        setError(
          validationError ??
            uploadResult?.message ??
            "The server did not confirm that the verification document was saved.",
        );
        return;
      }

      const documentsResponse = await api.get<ApiResponse<VerificationRecord[]>>(
        "/farmer/verification-documents",
      );
      const savedDocuments = documentsResponse.data.data;
      setDocuments(savedDocuments);

      if (!savedDocuments.some((document) => document.id === uploadResult.data.id)) {
        setError(
          "The upload response was received, but the document was not found in your saved verification records. Your selected file is still available to retry.",
        );
        return;
      }

      setSelectedFile(null);
      setSuccess({
        title: "Document submitted successfully",
        message: "Your verification document has been sent to your LGU for review.",
      });
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Unable to upload your verification document.",
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  async function openSubmittedDocument(document: VerificationRecord) {
    setOpeningDocument(true);
    setError("");

    try {
      const response = await api.get<Blob>(
        `/farmer/verification-documents/${document.id}/file`,
        { responseType: "blob" },
      );

      setDocumentPreview({
        fileName:
          document.original_filename ??
          document.document_type.replaceAll("_", " "),
        contentType: String(
          response.headers["content-type"] || response.data.type || "",
        ),
        url: URL.createObjectURL(response.data),
      });
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Unable to open your submitted verification document.",
        ),
      );
    } finally {
      setOpeningDocument(false);
    }
  }

  const latestDocument = documents[0];
  const selectedMunicipality = municipalities.find(
    (municipality) => municipality.id === municipalityId,
  );
  const selectedBarangay = barangays.find(
    (barangay) => barangay.id === barangayId,
  );
  const verificationStatus = latestDocument
    ? latestDocument.status === "approved"
      ? "Verified"
      : latestDocument.status === "rejected"
        ? "Returned"
        : "Pending review"
    : "Not submitted";

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">Farmer account</div>
          <h1>Profile settings</h1>
          <p>Save your municipality and barangay, then submit a verification document for LGU review.</p>
        </div>
      </div>
      {error && <div className="form-error" role="alert">{error}</div>}
      <div className="profile-layout">
        <section className="panel">
          <div className="panel-header">
            <div><h2>Personal information</h2><p>Your registered AgriTimbang account details.</p></div>
          </div>
          <div className="profile-person">
            <span className="profile-avatar">{account.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>
            <div><strong>{account.name}</strong><span>{account.title} · {account.email}</span></div>
          </div>
          {profileSaved && (
            <div className="profile-details">
              <div><span>Address</span><strong>{address || "Not provided"}</strong></div>
              <div><span>Barangay</span><strong>{selectedBarangay?.name ?? "Not selected"}</strong></div>
              <div><span>Municipality</span><strong>{selectedMunicipality?.name ?? "Not selected"}</strong></div>
              <div><span>Province</span><strong>{selectedMunicipality?.province ?? "Not selected"}</strong></div>
            </div>
          )}
          <form className="operation-form" onSubmit={saveProfile}>
            <label className="field">
              <span>Municipality</span>
              <select value={municipalityId} onChange={(event) => { setMunicipalityId(event.target.value); setBarangayId(""); setProfileSaved(false); }} required disabled={loading}>
                <option value="">Select municipality</option>
                {municipalities.map((municipality) => <option key={municipality.id} value={municipality.id}>{municipality.name}, {municipality.province}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Barangay</span>
              <select value={barangayId} onChange={(event) => { setBarangayId(event.target.value); setProfileSaved(false); }} required disabled={!municipalityId || loading}>
                <option value="">Select barangay</option>
                {barangays.map((barangay) => <option key={barangay.id} value={barangay.id}>{barangay.name}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Province</span>
              <input
                value={selectedMunicipality?.province ?? ""}
                placeholder="Selected from municipality"
                readOnly
              />
            </label>
            <label className="field">
              <span>Address</span>
              <textarea value={address} onChange={(event) => { setAddress(event.target.value); setProfileSaved(false); }} maxLength={500} rows={3} />
            </label>
            <button className="primary-button button-fit" disabled={saving || loading || municipalities.length === 0}>Save farmer profile</button>
            {municipalities.length === 0 && !loading && <p className="muted">No active municipalities are configured yet. Contact your administrator.</p>}
          </form>
        </section>
        <section className="panel verification-upload">
          <div className="panel-header">
            <div><h2>Account verification</h2><p>Upload a government ID or barangay certification.</p></div>
            <span className={`status status-${verificationStatus === "Verified" ? "verified" : verificationStatus === "Returned" ? "returned" : "pending"}`}>{verificationStatus}</span>
          </div>
          <form onSubmit={uploadDocument}>
            <label className="field">
              <span>Document type</span>
              <select value={documentType} onChange={(event) => setDocumentType(event.target.value)}>
                <option value="national_id">National ID</option>
                <option value="drivers_license">Driver's license</option>
                <option value="passport">Passport</option>
                <option value="voters_id">Voter's ID</option>
                <option value="barangay_id">Barangay ID</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="upload-area">
              <span className="upload-mark">↑</span>
              <strong>{selectedFile?.name ?? "Choose a verification document"}</strong>
              <small>PDF or PNG · maximum 5 MB</small>
              <input type="file" accept=".pdf,.png,application/pdf,image/png" onChange={chooseDocument} disabled={saving} />
            </label>
            {!profileSaved && <p className="muted">Save your farmer profile before submitting the document.</p>}
            <button className="primary-button button-fit" disabled={!profileSaved || !selectedFile || saving}>Submit for LGU review</button>
          </form>
          {latestDocument && (
            <div className="current-document">
              <span className="file-mark">
                {latestDocument.original_filename?.split(".").pop()?.toUpperCase() ?? "DOC"}
              </span>
              <span>
                <strong>{latestDocument.original_filename ?? latestDocument.document_type.replaceAll("_", " ")}</strong>
                <small>{latestDocument.document_type.replaceAll("_", " ")} · Submitted {new Date(latestDocument.created_at).toLocaleDateString()}</small>
              </span>
              <button
                className="text-button"
                type="button"
                disabled={openingDocument}
                onClick={() => void openSubmittedDocument(latestDocument)}
              >
                {openingDocument ? "Opening..." : "View file"}
              </button>
              <span className="file-status">{verificationStatus}</span>
            </div>
          )}
          <p className="privacy-note">Documents are stored privately and are visible only to authorized LGU officers and administrators.</p>
        </section>
      </div>
      <SuccessDialog
        title={success?.title}
        message={success?.message ?? null}
        onClose={() => setSuccess(null)}
      />
      {documentPreview && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setDocumentPreview(null);
            }
          }}
        >
          <section
            className="document-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="submitted-document-title"
          >
            <div className="modal-header">
              <div>
                <div className="eyebrow">Submitted verification document</div>
                <h2 id="submitted-document-title">{documentPreview.fileName}</h2>
              </div>
              <button
                className="modal-close"
                type="button"
                aria-label="Close document preview"
                onClick={() => setDocumentPreview(null)}
              >
                ×
              </button>
            </div>
            <div className="document-preview">
              {documentPreview.contentType.includes("pdf") ? (
                <iframe src={documentPreview.url} title={documentPreview.fileName} />
              ) : documentPreview.contentType.startsWith("image/") ? (
                <img src={documentPreview.url} alt={documentPreview.fileName} />
              ) : (
                <p className="muted">This file type cannot be previewed in the browser.</p>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
