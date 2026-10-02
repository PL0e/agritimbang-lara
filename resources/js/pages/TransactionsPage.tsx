import { useState, type FormEvent } from "react";
import type { Role } from "../types";
import Field from "../components/Field";

const steps = ["Livestock", "Buyer info", "Final price", "Confirmation"];

export default function TransactionsPage({ role }: { role: Role }) {
  const [step, setStep] = useState(0);
  const [source, setSource] = useState<"draft" | "new" | null>(null);
  const [selectedDraft, setSelectedDraft] = useState(false);
  const [method, setMethod] = useState<"otp" | "lgu" | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [searchCode, setSearchCode] = useState("");
  const [found, setFound] = useState(false);
  const [verified, setVerified] = useState(false);

  if (role === "lgu") {
    return (
      <>
        <div className="page-heading">
          <div><div className="eyebrow">Authority validation</div><h1>Validate transactions</h1><p>Review submitted records before they contribute to municipal market data.</p></div>
        </div>
        <section className="panel">
          <div className="filter-row">
            <label className="search-field"><span>Search</span><input placeholder="Transaction ID or farmer" /></label>
            <label><span>Species</span><select><option>All species</option><option>Cattle</option><option>Hog</option></select></label>
            <label><span>Source</span><select><option>All sources</option><option>Farmer OTP</option><option>LGU assisted</option></select></label>
            <label><span>Status</span><select><option>Pending</option><option>Verified</option><option>Rejected</option></select></label>
          </div>
          <div className="validation-row">
            <span className="record-id">TRX-0247</span>
            <span><strong>Hog · 96 kg</strong><small>Mario Lapaz · Farmer OTP</small></span>
            <strong>₱19,008</strong>
            <span className={`status status-${verified ? "verified" : "pending"}`}>{verified ? "Verified" : "Pending"}</span>
            <button className="view-document-button" onClick={() => setFound(true)}>Review details</button>
          </div>
        </section>
        {found && (
          <section className="panel transaction-detail-card">
            <div className="panel-header"><div><h2>Transaction TRX-0247</h2><p>Submitted June 16, 2025 · Farmer OTP</p></div><span className={`status status-${verified ? "verified" : "pending"}`}>{verified ? "Valid" : "Pending validation"}</span></div>
            <div className="transaction-summary-grid">
              <div><span>Farmer</span><strong>Mario Lapaz</strong></div><div><span>Buyer</span><strong>Ramon Trading</strong></div>
              <div><span>Livestock</span><strong>Hog · Large White</strong></div><div><span>Weight</span><strong>96 kg</strong></div>
              <div><span>Reference value</span><strong>₱19,008</strong></div><div><span>Agreed price</span><strong>₱18,800</strong></div>
            </div>
            <div className="authority-actions"><button className="return-button" onClick={() => { setVerified(false); setFound(false); }}>Mark invalid</button><button className="primary-button button-fit" onClick={() => setVerified(true)}>Mark as valid</button></div>
          </section>
        )}
      </>
    );
  }

  if (role === "lgu_encoder") {
    return (
      <>
        <div className="page-heading">
          <div><div className="eyebrow">LGU-assisted verification</div><h1>Assist a transaction</h1><p>Search the farmer&apos;s reference code and confirm the read-only transaction details.</p></div>
        </div>
        <section className="panel assist-search">
          <div className="panel-header"><div><h2>Transaction code lookup</h2><p>Ask the farmer for the six-character code shown after submission.</p></div></div>
          <div className="code-search"><input value={searchCode} onChange={(event) => setSearchCode(event.target.value.toUpperCase())} maxLength={6} placeholder="e.g. AT8K24" /><button className="primary-button button-fit" onClick={() => setFound(searchCode.length >= 4)}>Search transaction</button></div>
          {!found && searchCode.length > 0 && searchCode.length < 4 && <div className="form-error code-error">Enter at least four characters from the transaction code.</div>}
        </section>
        {found && (
          <section className="panel transaction-detail-card">
            <div className="panel-header"><div><h2>Transaction AT8K24</h2><p>Submitted today · LGU-assisted confirmation</p></div><span className={`status status-${verified ? "verified" : "pending"}`}>{verified ? "Verified" : "Awaiting confirmation"}</span></div>
            <div className="transaction-summary-grid">
              <div><span>Farmer</span><strong>Juan Dela Cruz</strong></div><div><span>Buyer</span><strong>Pedro Mercado</strong></div>
              <div><span>Livestock</span><strong>Cattle · Native</strong></div><div><span>Weight</span><strong>328 kg</strong></div>
              <div><span>Reference value</span><strong>₱77,080</strong></div><div><span>Agreed price</span><strong>₱75,500</strong></div>
            </div>
            <div className="read-only-note">Transaction details are read-only to preserve data integrity.</div>
            <button className="primary-button button-fit" disabled={verified} onClick={() => setVerified(true)}>{verified ? "Farmer notified" : "Confirm transaction validity"}</button>
          </section>
        )}
      </>
    );
  }

  if (submitted) {
    return (
      <section className="transaction-success">
        <span className="success-mark">✓</span>
        <div className="eyebrow">Transaction submitted</div>
        <h1>Ready for confirmation</h1>
        <p>Your livestock transaction was recorded and is pending LGU validation.</p>
        <div className="success-reference"><span>Reference code</span><strong>{method === "lgu" ? "AT8K24" : "TRX-0249"}</strong><small>{method === "lgu" ? "Show this code to an LGU Encoder." : "Buyer OTP confirmed."}</small></div>
        <button className="primary-button button-fit" onClick={() => { setSubmitted(false); setStep(0); setSource(null); }}>Return to transactions</button>
      </section>
    );
  }

  function continueFromLivestock(event: FormEvent) {
    event.preventDefault();
    if (source === "draft" && !selectedDraft) return;
    setStep(1);
  }

  return (
    <>
      <div className="page-heading">
        <div><div className="eyebrow">Livestock sale</div><h1>New transaction</h1><p>Record the livestock, buyer, final price, and confirmation method.</p></div>
      </div>
      <div className="transaction-stepper">
        {steps.map((label, index) => <div key={label} className={index <= step ? "active" : ""}><span>{index + 1}</span><strong>{label}</strong></div>)}
      </div>
      <section className="panel transaction-wizard">
        {step === 0 && (
          <form onSubmit={continueFromLivestock}>
            <div className="panel-header"><div><h2>Choose livestock source</h2><p>Start from a saved draft or calculate a new entry.</p></div></div>
            <div className="source-options">
              <button type="button" className={source === "draft" ? "selected" : ""} onClick={() => setSource("draft")}><span>DR</span><strong>From saved drafts</strong><small>Select one or more prepared livestock records.</small></button>
              <button type="button" className={source === "new" ? "selected" : ""} onClick={() => setSource("new")}><span>NE</span><strong>New entry</strong><small>Enter livestock details with an inline calculation.</small></button>
            </div>
            {source === "draft" && <button type="button" className={`draft-selection-card ${selectedDraft ? "selected" : ""}`} onClick={() => setSelectedDraft(!selectedDraft)}><i>{selectedDraft ? "✓" : ""}</i><span><strong>LVD-0107 · Cattle</strong><small>Native · 328 kg · Good condition</small></span><strong>₱77,080</strong></button>}
            {source === "new" && <div className="form-grid inline-livestock"><label className="field"><span>Species</span><select><option>Cattle</option><option>Hog</option><option>Goat</option><option>Carabao</option></select></label><Field label="Weight (kg)" type="number" required min="1" /><label className="field"><span>Condition</span><select><option>Good</option><option>Average</option></select></label><div className="inline-estimate"><span>Estimated value</span><strong>₱77,080</strong></div></div>}
            <div className="wizard-actions"><button type="submit" className="primary-button button-fit" disabled={!source || (source === "draft" && !selectedDraft)}>Add & proceed</button></div>
          </form>
        )}
        {step === 1 && (
          <form onSubmit={(event) => { event.preventDefault(); setStep(2); }}>
            <div className="panel-header"><div><h2>Buyer information</h2><p>Record the buyer&apos;s details for transaction confirmation.</p></div></div>
            <div className="form-grid"><Field label="Buyer name" required placeholder="Full name or Anonymous" /><Field label="Contact number" type="tel" placeholder="+63" /></div>
            <div className="wizard-actions"><button type="button" className="return-button" onClick={() => setStep(0)}>Back</button><button className="primary-button button-fit">Continue to final price</button></div>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={(event) => { event.preventDefault(); setStep(3); }}>
            <div className="panel-header"><div><h2>Finalize agreed price</h2><p>Review the reference value and enter the negotiated selling price.</p></div></div>
            <div className="price-finalization"><div><span>Cattle · 1 animal</span><strong>328 kg</strong></div><div><span>Estimated reference</span><strong>₱77,080</strong></div><Field label="Final agreed price" type="number" required min="1" placeholder="₱ 0.00" /></div>
            <div className="wizard-actions"><button type="button" className="return-button" onClick={() => setStep(1)}>Back</button><button className="primary-button button-fit">Continue to confirmation</button></div>
          </form>
        )}
        {step === 3 && (
          <div>
            <div className="panel-header"><div><h2>Choose confirmation method</h2><p>Select how the transaction will be validated.</p></div></div>
            <div className="source-options"><button className={method === "otp" ? "selected" : ""} onClick={() => setMethod("otp")}><span>OTP</span><strong>Buyer OTP verification</strong><small>Send a one-time code to the buyer&apos;s phone.</small></button><button className={method === "lgu" ? "selected" : ""} onClick={() => setMethod("lgu")}><span>LGU</span><strong>LGU-assisted verification</strong><small>Generate a code for an authorized encoder.</small></button></div>
            {method === "otp" && <div className="otp-box"><Field label="Enter buyer OTP" inputMode="numeric" maxLength={6} placeholder="000000" /><small>Prototype code: 123456</small></div>}
            <div className="wizard-actions"><button className="return-button" onClick={() => setStep(2)}>Back</button><button className="primary-button button-fit" disabled={!method} onClick={() => setSubmitted(true)}>Submit transaction</button></div>
          </div>
        )}
      </section>
    </>
  );
}
