import { useState, type ChangeEvent } from "react";
import type { Account, ManagedAccount, VerificationDocument } from "../types";

export default function ProfileSettingsPage({
  document,
  onDocumentChange,
  account,
  managedAccount,
}: {
  document: VerificationDocument;
  onDocumentChange: (document: VerificationDocument) => void;
  account: Account;
  managedAccount?: ManagedAccount;
}) {
  const [message, setMessage] = useState("");

  function uploadDocument(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setMessage("The selected file is larger than 5 MB.");
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    onDocumentChange({
      fileName: file.name,
      fileType: file.type,
      submittedAt: "Just now",
      status: "Pending review",
      previewUrl,
      submittedBy: document.submittedBy ?? "Juan Dela Cruz",
      submittedEmail: document.submittedEmail ?? "farmer1@gmail.com",
    });
    setMessage("Document uploaded and sent for review.");
  }

  return (
    <>
      <div className="page-heading">
        <div><div className="eyebrow">Farmer account</div><h1>Profile settings</h1><p>Keep your personal details current and submit proof for account verification.</p></div>
      </div>
      <div className="profile-layout">
        <section className="panel">
          <div className="panel-header"><div><h2>Personal information</h2><p>Your registered AgriTimbang account details.</p></div></div>
          <div className="profile-person">
            <span className="profile-avatar">{account.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>
            <div><strong>{account.name}</strong><span>{account.title} · {account.username}</span></div>
          </div>
          <div className="profile-details">
            <div><span>Email address</span><strong>{account.email}</strong></div>
            <div><span>Contact number</span><strong>{managedAccount?.phone ?? "+63 917 555 0142"}</strong></div>
            <div><span>Municipality</span><strong>Barili, Cebu</strong></div>
            <div><span>Barangay</span><strong>{managedAccount?.barangay ?? "Poblacion"}</strong></div>
          </div>
        </section>
        <section className="panel verification-upload">
          <div className="panel-header">
            <div><h2>Account verification</h2><p>Upload a government ID or barangay certification.</p></div>
            <span className={`status status-${document.status === "Verified" ? "verified" : document.status === "Returned" ? "returned" : "pending"}`}>{document.status}</span>
          </div>
          <label className="upload-area">
            <span className="upload-mark">↑</span>
            <strong>Choose a verification document</strong>
            <small>PDF, JPG, or PNG · maximum 5 MB</small>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={uploadDocument} />
          </label>
          {message && <div className="upload-message">{message}</div>}
          <div className="current-document">
            <span className="file-mark">DOC</span>
            <span><strong>{document.fileName}</strong><small>Submitted {document.submittedAt}</small></span>
            <span className="file-status">{document.status}</span>
          </div>
          <p className="privacy-note">Your document is visible only to authorized LGU officers and administrators and is used solely for account verification.</p>
        </section>
      </div>
    </>
  );
}
