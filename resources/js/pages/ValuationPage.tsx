import { useMemo, useState } from "react";
import { priceRows } from "../data/mockData";
import Field from "../components/Field";

export default function ValuationPage() {
  const [species, setSpecies] = useState("Cattle");
  const [weightMode, setWeightMode] = useState<"actual" | "estimated">("actual");
  const [weight, setWeight] = useState("328");
  const [girth, setGirth] = useState("155");
  const [length, setLength] = useState("170");
  const [ageGroup, setAgeGroup] = useState("Adult");
  const [frameScore, setFrameScore] = useState("3 · Medium");
  const [condition, setCondition] = useState("Good");
  const [saveMessage, setSaveMessage] = useState("");
  const price = priceRows.find((row) => row.species === species)?.price ?? 0;
  const effectiveWeight = useMemo(() => {
    if (weightMode === "actual") return Math.max(0, Number(weight) || 0);
    return Math.round(((Number(girth) || 0) ** 2 * (Number(length) || 0)) / 10840);
  }, [weightMode, weight, girth, length]);
  const value = effectiveWeight * price;

  return (
    <>
      <div className="page-heading">
        <div><div className="eyebrow">Decision-support tools</div><h1>Livestock calculators</h1><p>Estimate live weight or calculate fair market value using official prices.</p></div>
      </div>
      <div className="calculator-chooser">
        <button className={weightMode === "estimated" ? "active" : ""} onClick={() => setWeightMode("estimated")}><span>WET</span><div><strong>Weight Estimation Tool</strong><small>Calculate weight from chest girth and body length.</small></div></button>
        <button className={weightMode === "actual" ? "active" : ""} onClick={() => setWeightMode("actual")}><span>FPC</span><div><strong>Fair Price Calculator</strong><small>Use actual weight with the current official price.</small></div></button>
      </div>
      <div className="valuation-layout">
        <section className="panel valuation-form">
          <div className="step-heading"><span>1</span><div><h2>Livestock details</h2><p>Select the animal and provide its weight.</p></div></div>
          <div className="form-grid">
            <label className="field"><span>Species</span><select value={species} onChange={(event) => setSpecies(event.target.value)}>{priceRows.map((row) => <option key={row.species}>{row.species}</option>)}</select></label>
            <label className="field"><span>Breed / type</span><select><option>{priceRows.find((row) => row.species === species)?.breed}</option><option>Other / mixed</option></select></label>
          </div>
          <div className="form-grid">
            <label className="field"><span>Age group</span><select value={ageGroup} onChange={(event) => setAgeGroup(event.target.value)}><option>Young</option><option>Adult</option><option>Mature</option></select></label>
            <label className="field"><span>Body frame score</span><select value={frameScore} onChange={(event) => setFrameScore(event.target.value)}><option>1 · Small</option><option>3 · Medium</option><option>5 · Large</option></select></label>
          </div>
          <div className="segmented">
            <button className={weightMode === "actual" ? "active" : ""} onClick={() => setWeightMode("actual")}>Actual scale weight</button>
            <button className={weightMode === "estimated" ? "active" : ""} onClick={() => setWeightMode("estimated")}>Estimate from measurements</button>
          </div>
          {weightMode === "actual" ? (
            <Field label="Live weight (kg)" type="number" min="0" value={weight} onChange={(event) => setWeight(event.target.value)} />
          ) : (
            <div className="form-grid">
              <Field label="Chest girth (cm)" type="number" min="0" value={girth} onChange={(event) => setGirth(event.target.value)} />
              <Field label="Body length (cm)" type="number" min="0" value={length} onChange={(event) => setLength(event.target.value)} />
            </div>
          )}
          <label className="field"><span>Livestock condition</span><select value={condition} onChange={(event) => setCondition(event.target.value)}><option>Good</option><option>Average</option><option>Needs assessment</option></select></label>
          <div className="measurement-note">Estimated weights have an approximate ±10% consideration. A verified scale weight should be used when available.</div>
          <div className="valuation-actions">
            <button className="secondary-button" onClick={() => setSaveMessage("Draft LVD-0108 saved with the current weight and valuation.")}>Save as livestock draft</button>
            <button className="primary-button button-fit" onClick={() => setSaveMessage("Valuation is ready to use in a new transaction.")}>Proceed to transaction</button>
          </div>
          {saveMessage && <div className="operation-message">{saveMessage}</div>}
        </section>

        <aside className="result-card">
          <div className="result-label">Estimated fair value</div>
          <div className="result-value">₱{value.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</div>
          <div className="official-chip">Official price applied</div>
          <div className="calculation">
            <div><span>Official price</span><strong>₱{price}.00 / kg</strong></div>
            <div><span>{weightMode === "actual" ? "Actual" : "Estimated"} weight</span><strong>{effectiveWeight} kg</strong></div>
            {weightMode === "estimated" && <div><span>Confidence range</span><strong>{Math.round(effectiveWeight * .9)}–{Math.round(effectiveWeight * 1.1)} kg</strong></div>}
            <div className="calculation-total"><span>Calculation</span><strong>₱{price} × {effectiveWeight} kg</strong></div>
          </div>
          <div className="result-source"><span>Price reference</span><strong>Barili MAO · Jun 9–15, 2025</strong></div>
          <p>This is a reference value for informed decision-making, not a required final selling price.</p>
        </aside>
      </div>
    </>
  );
}
