import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";

import type { Account, ApiResponse } from "../types";
import api from "../services/api";
import { getApiErrorMessage } from "../services/auth";

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
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

export default function ProfileSettingsPage({
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
  const [documentType, setDocumentType] = useState("national_id");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
    setMessage("");

    try {
      await api.put("/farmer/profile", {
        municipality_id: municipalityId,
        barangay_id: barangayId,
        address: address || null,
      });
      setProfileSaved(true);
      setMessage("Farmer profile saved.");
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
    setMessage("");
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
    setMessage("");

    const formData = new FormData();
    formData.append("document_type", documentType);
    formData.append("document", selectedFile);

    try {
      await api.post<ApiResponse<VerificationRecord>>(
        "/farmer/verification-documents",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      const response = await api.get<ApiResponse<VerificationRecord[]>>(
        "/farmer/verification-documents",
      );
      setDocuments(response.data.data);
      setSelectedFile(null);
      setMessage("Document uploaded and submitted to your LGU for review.");
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
      {message && <div className="upload-message" role="status">{message}</div>}
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
              <span className="file-mark">DOC</span>
              <span><strong>{latestDocument.document_type.replaceAll("_", " ")}</strong><small>Submitted {new Date(latestDocument.created_at).toLocaleDateString()}</small></span>
              <span className="file-status">{verificationStatus}</span>
            </div>
          )}
          <p className="privacy-note">Documents are stored privately and are visible only to authorized LGU officers and administrators.</p>
        </section>
      </div>
    </>
  );
}
