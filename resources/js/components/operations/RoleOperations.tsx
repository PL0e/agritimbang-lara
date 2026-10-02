import { useState, type FormEvent } from "react";
import { priceRows } from "../../data/mockData";
import type { Role } from "../../types";
import Field from "../Field";

type TransactionStatus = "Pending" | "Verified" | "Rejected";

export default function RoleOperations({ role }: { role: Role }) {
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showDraftForm, setShowDraftForm] = useState(false);
  const [message, setMessage] = useState("");
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>("Pending");
  const [species, setSpecies] = useState("Cattle");
  const [breedName, setBreedName] = useState("");
  const [breeds, setBreeds] = useState(["Native", "Large White", "Boer cross", "Swamp"]);

  function submitTransaction(event: FormEvent) {
    event.preventDefault();
    setMessage(role === "farmer" ? "Transaction TRX-0249 submitted for LGU validation." : "Assisted transaction TRX-0249 recorded with pending status.");
    setShowTransactionForm(false);
    setTransactionStatus("Pending");
  }

  function addBreed(event: FormEvent) {
    event.preventDefault();
    if (!breedName.trim() || breeds.some((breed) => breed.toLowerCase() === breedName.trim().toLowerCase())) {
      setMessage("Breed name is required and must be unique.");
      return;
    }
    setBreeds((current) => [...current, breedName.trim()]);
    setBreedName("");
    setMessage("Livestock classification updated.");
  }

  if (role === "admin") {
    return (
      <section className="panel operations-panel">
        <div className="panel-header">
          <div><h2>Livestock configuration</h2><p>Manage species and breeds used in drafts, pricing, and transactions.</p></div>
        </div>
        <div className="species-config">
          {priceRows.map((row) => (
            <div key={row.species}><span className="species-mark">{row.species.slice(0, 2).toUpperCase()}</span><span><strong>{row.species}</strong><small>{row.breed}</small></span><button className="text-button">Edit</button></div>
          ))}
        </div>
        <form className="inline-create-form" onSubmit={addBreed}>
          <label><span>Species</span><select value={species} onChange={(event) => setSpecies(event.target.value)}>{priceRows.map((row) => <option key={row.species}>{row.species}</option>)}</select></label>
          <Field label="New breed name" value={breedName} onChange={(event) => setBreedName(event.target.value)} />
          <button className="secondary-button" type="submit">Add breed</button>
        </form>
        {message && <div className="operation-message">{message}</div>}
        <div className="breed-tags">{breeds.map((breed) => <span key={breed}>{breed}</span>)}</div>
      </section>
    );
  }

  return (
    <>
      {role === "farmer" && (
        <section className="panel operations-panel">
          <div className="panel-header">
            <div><h2>Livestock drafts</h2><p>Prepare reusable livestock information before recording a sale.</p></div>
            <button className="secondary-button compact-button" onClick={() => setShowDraftForm(!showDraftForm)}>+ New draft</button>
          </div>
          {showDraftForm && (
            <form className="operation-form" onSubmit={(event) => { event.preventDefault(); setMessage("Draft LVD-0108 saved and is ready for a transaction."); setShowDraftForm(false); }}>
              <div className="form-grid">
                <label className="field"><span>Species</span><select>{priceRows.map((row) => <option key={row.species}>{row.species}</option>)}</select></label>
                <Field label="Breed / type" required placeholder="Enter breed" />
                <Field label="Weight (kg)" type="number" min="1" required />
                <label className="field"><span>Condition</span><select><option>Good</option><option>Average</option><option>Needs assessment</option></select></label>
              </div>
              <button className="primary-button button-fit" type="submit">Save livestock draft</button>
            </form>
          )}
          <div className="draft-row"><span className="record-id">LVD-0107</span><span><strong>Cattle · Native</strong><small>328 kg · Good condition</small></span><strong>₱77,080</strong><span className="status status-reference">Draft</span></div>
          {message && <div className="operation-message">{message}</div>}
        </section>
      )}

      <section className="panel operations-panel">
        <div className="panel-header">
          <div><h2>{role === "farmer" ? "Record a livestock sale" : "Transaction validation"}</h2><p>{role === "farmer" ? "Use a saved draft or enter sale details manually." : "Confirm that submitted market transactions are complete and accurate."}</p></div>
          <button className="primary-button button-fit" onClick={() => setShowTransactionForm(!showTransactionForm)}>+ {role === "farmer" ? "New transaction" : "Assisted transaction"}</button>
        </div>
        {showTransactionForm && (
          <form className="operation-form" onSubmit={submitTransaction}>
            <div className="form-grid">
              <label className="field"><span>Livestock source</span><select><option>LVD-0107 · Cattle</option><option>Enter new livestock</option></select></label>
              <Field label="Buyer name" required placeholder="Use Anonymous if not provided" />
              <Field label="Buyer contact" type="tel" placeholder="+63" />
              <Field label="Agreed selling price" type="number" min="1" required />
              <label className="field"><span>Confirmation method</span><select><option>Buyer OTP</option><option>LGU assisted confirmation</option></select></label>
              <Field label="OTP code" inputMode="numeric" placeholder="6-digit code" />
            </div>
            <button className="primary-button button-fit" type="submit">Submit transaction</button>
          </form>
        )}
        {role === "lgu" && (
          <div className="validation-row">
            <span className="record-id">TRX-0247</span>
            <span><strong>Hog · 96 kg</strong><small>Mario Lapaz · Buyer confirmed</small></span>
            <strong>₱19,008</strong>
            <span className={`status status-${transactionStatus === "Verified" ? "verified" : transactionStatus === "Rejected" ? "returned" : "pending"}`}>{transactionStatus}</span>
            <div><button className="approve-button" onClick={() => setTransactionStatus("Verified")}>Verify</button><button className="reject-button" onClick={() => setTransactionStatus("Rejected")}>Reject</button></div>
          </div>
        )}
        {message && <div className="operation-message">{message}</div>}
      </section>
    </>
  );
}
