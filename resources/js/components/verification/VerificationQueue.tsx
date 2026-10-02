import { useState } from "react";
import type { VerificationDocument, VerificationStatus } from "../../types";
import VerificationPreview from "./VerificationPreview";

export default function VerificationQueue({
  document,
  onStatusChange,
}: {
  document: VerificationDocument;
  onStatusChange: (status: VerificationStatus) => void;
}) {
  const [previewing, setPreviewing] = useState(false);
  return (
    <>
      <section className="panel verification-panel">
        <div className="panel-header">
          <div><h2>User verification</h2><p>Review farmer identity documents before activating verified access.</p></div>
          <span className="pending-count">{document.status === "Pending review" ? "1 pending" : "Up to date"}</span>
        </div>
        <div className="verification-row">
          <span className="avatar avatar-farmer">{(document.submittedBy ?? "Juan Dela Cruz").split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>
          <span className="verification-user"><strong>{document.submittedBy ?? "Juan Dela Cruz"}</strong><small>{document.submittedEmail ?? "farmer1@gmail.com"} · Barili</small></span>
          <span className="document-file"><strong>{document.fileName}</strong><small>Barangay certification</small></span>
          <span className={`status verification-status status-${document.status === "Verified" ? "verified" : document.status === "Returned" ? "returned" : "pending"}`}>{document.status}</span>
          <button className="view-document-button" onClick={() => setPreviewing(true)}>View document</button>
        </div>
      </section>
      {previewing && <VerificationPreview document={document} onClose={() => setPreviewing(false)} onStatusChange={onStatusChange} />}
    </>
  );
}
