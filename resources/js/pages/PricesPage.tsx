import { useMemo, useState, type FormEvent } from "react";
import type { Role } from "../types";
import PriceTable from "../components/PriceTable";
import { priceRows } from "../data/mockData";

export default function PricesPage({ role }: { role: Role }) {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [draftStatus, setDraftStatus] = useState<"Draft" | "Pending review" | "Official">("Pending review");
  const [message, setMessage] = useState("");
  const filteredRows = useMemo(
    () => priceRows.filter((row) => `${row.species} ${row.breed}`.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

  function savePrice(event: FormEvent) {
    event.preventDefault();
    setMessage("Weekly price draft saved. Submit it when the source details are complete.");
    setDraftStatus("Draft");
    setShowForm(false);
  }

  return (
    <>
      <div className="page-heading">
        <div><div className="eyebrow">Price transparency</div><h1>Official price references</h1><p>Approved weekly prices used for livestock valuations in Barili.</p></div>
        {role !== "farmer" && <button className="primary-button button-fit" onClick={() => setShowForm(!showForm)}>+ {role === "lgu_encoder" ? "Draft weekly price" : "Encode official price"}</button>}
      </div>
      {role !== "farmer" && showForm && (
        <section className="panel price-entry-panel">
          <div className="panel-header"><div><h2>Generate weekly price</h2><p>Record market observations for LGU Authority review.</p></div></div>
          <form className="operation-form" onSubmit={savePrice}>
            <div className="price-form-grid">
              <label className="field"><span>Species</span><select>{priceRows.map((row) => <option key={row.species}>{row.species}</option>)}</select></label>
              <label className="field"><span>Breed</span><select><option>All classifications</option>{priceRows.map((row) => <option key={row.breed}>{row.breed}</option>)}</select></label>
              <label className="field"><span>Price per kilogram</span><input type="number" min="1" required /></label>
              <label className="field"><span>Source</span><select><option>Municipal market observation</option><option>Barangay survey</option><option>Verified transactions</option></select></label>
              <label className="field"><span>Market location</span><input required defaultValue="Barili Public Market" /></label>
              <label className="field"><span>Effective week</span><input type="date" required /></label>
            </div>
            <button className="secondary-button" type="submit">Save draft</button>
          </form>
        </section>
      )}
      {message && <div className="operation-message price-message">{message}</div>}
      <div className="notice"><strong>Official records only</strong><span>Draft, rejected, and archived prices are never used in active valuations.</span></div>
      <section className="panel">
        <div className="filter-row">
          <label className="search-field"><span>Search</span><input placeholder="Search livestock or breed" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
          <label><span>Period</span><select defaultValue="current"><option value="current">Current week</option><option>Previous week</option><option>June 2025</option></select></label>
          <label><span>Municipality</span><select defaultValue="barili"><option value="barili">Barili, Cebu</option></select></label>
          <label><span>Status</span><select defaultValue="official"><option value="official">Official</option><option>All records</option></select></label>
        </div>
        <div className="filter-result">{filteredRows.length} official price reference{filteredRows.length === 1 ? "" : "s"} match the current search.</div>
        <PriceTable rows={filteredRows} />
      </section>
      {role !== "farmer" && (
        <>
        <section className="panel price-intelligence">
          <div className="panel-header"><div><h2>Weekly price trend & recommendation</h2><p>Historical averages from validated transactions.</p></div><span className="official-chip">Recommended: ₱199–₱204/kg</span></div>
          <div className="price-trend-chart">
            {[36, 43, 40, 51, 48, 56, 61, 58, 67, 72, 69, 78].map((height, index) => <span key={index} style={{ height: `${height}%` }}><i /></span>)}
          </div>
          <div className="recommendation-note"><strong>System insight</strong><span>The submitted hog price of ₱201/kg is within the recommended range and 1.5% above last week&apos;s average.</span></div>
        </section>
        <section className="panel price-review-panel">
          <div className="panel-header"><div><h2>Price validation queue</h2><p>Review source data before publishing a price as official.</p></div></div>
          <div className="validation-row">
            <span className="record-id">PRC-0617</span>
            <span><strong>Hog · Large White</strong><small>₱201/kg · Barili Public Market</small></span>
            <strong>Jun 16–22</strong>
            <span className={`status status-${draftStatus === "Official" ? "verified" : draftStatus === "Draft" ? "reference" : "pending"}`}>{draftStatus}</span>
            <div>
              {draftStatus === "Draft"
                ? <button className="approve-button" onClick={() => setDraftStatus("Pending review")}>Submit</button>
                : role === "lgu_encoder"
                  ? <span className="encoder-awaiting">Awaiting authority</span>
                  : <button className="approve-button" onClick={() => setDraftStatus("Official")}>Approve</button>}
              <button className="reject-button" onClick={() => { setDraftStatus("Draft"); setMessage("Price entry returned to draft with review remarks."); }}>Return</button>
            </div>
          </div>
        </section>
        </>
      )}
      <section className="panel history-panel">
        <div className="panel-header"><div><h2>Price lifecycle</h2><p>Every published reference remains traceable.</p></div></div>
        <div className="workflow">
          <div><span>1</span><strong>Draft</strong><small>Entered by LGU encoder</small></div>
          <i />
          <div><span>2</span><strong>Pending review</strong><small>Checked with source data</small></div>
          <i />
          <div className="workflow-active"><span>3</span><strong>Official</strong><small>Approved for valuation</small></div>
        </div>
      </section>
    </>
  );
}
