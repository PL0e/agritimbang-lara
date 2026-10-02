import type { VerificationDocument, VerificationStatus } from "../../types";

export default function VerificationPreview({
  document,
  onClose,
  onStatusChange,
}: {
  document: VerificationDocument;
  onClose: () => void;
  onStatusChange: (status: VerificationStatus) => void;
}) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="document-modal" role="dialog" aria-modal="true" aria-labelledby="document-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="eyebrow">Verification document</div>
            <h2 id="document-title">{document.fileName}</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close document preview">×</button>
        </div>
        <div className="document-preview">
          {document.previewUrl && document.fileType.startsWith("image/") ? (
            <img src={document.previewUrl} alt="Uploaded verification document" />
          ) : document.previewUrl && document.fileType === "application/pdf" ? (
            <iframe src={document.previewUrl} title="Uploaded verification document" />
          ) : (
            <div className="sample-document">
              <div className="document-seal">BARILI</div>
              <div className="document-office">Republic of the Philippines<br /><strong>Municipality of Barili, Cebu</strong><br />Office of the Barangay Captain</div>
              <div className="document-rule" />
              <div className="document-title">BARANGAY CERTIFICATION</div>
              <p>This is to certify that <strong>JUAN DELA CRUZ</strong>, of legal age, is a bona fide resident and livestock farmer of Barangay Poblacion, Barili, Cebu.</p>
              <p>This certification is issued for identity and farmer-account verification in the AgriTimbang Municipal Livestock Information System.</p>
              <div className="document-signature"><span>Issued: June 16, 2025</span><strong>Barangay Captain</strong></div>
              <div className="sample-watermark">SAMPLE</div>
            </div>
          )}
        </div>
        <div className="document-meta">
          <div><span>Submitted by</span><strong>{document.submittedBy ?? "Juan Dela Cruz"} · {document.submittedEmail ?? "farmer1@gmail.com"}</strong></div>
          <div><span>Submitted</span><strong>{document.submittedAt}</strong></div>
          <div><span>Current status</span><strong className={`verification-text verification-${document.status.toLowerCase().replace(" ", "-")}`}>{document.status}</strong></div>
        </div>
        <div className="modal-actions">
          <button className="return-button" onClick={() => { onStatusChange("Returned"); onClose(); }}>Return for correction</button>
          <button className="primary-button button-fit" onClick={() => { onStatusChange("Verified"); onClose(); }}>Verify document</button>
        </div>
      </section>
    </div>
  );
}
