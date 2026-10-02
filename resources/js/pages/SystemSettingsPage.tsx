import { useState } from "react";

export default function SystemSettingsPage() {
  const [message, setMessage] = useState("");
  return (
    <>
      <div className="page-heading"><div><div className="eyebrow">Administration</div><h1>System settings</h1><p>Configure core services, valuation rules, backups, and audit visibility.</p></div></div>
      <div className="settings-grid">
        <section className="panel settings-card"><span className="settings-code">PE</span><div><h2>Price engine</h2><p>Official-price validity, deviation threshold, and recommendation parameters.</p></div><button className="text-button" onClick={() => setMessage("Price engine settings saved.")}>Configure →</button></section>
        <section className="panel settings-card"><span className="settings-code">OT</span><div><h2>OTP & SMS provider</h2><p>Provider connection, sender identity, expiration, and retry limits.</p></div><button className="text-button" onClick={() => setMessage("A test OTP was sent in simulation mode.")}>Test provider →</button></section>
        <section className="panel settings-card"><span className="settings-code">BR</span><div><h2>Backup & restore</h2><p>Last successful backup: Today at 2:00 AM.</p></div><button className="text-button" onClick={() => setMessage("Manual backup completed successfully.")}>Run backup →</button></section>
        <section className="panel settings-card"><span className="settings-code">AU</span><div><h2>Audit logs</h2><p>Review attributed user actions and system results.</p></div><button className="text-button" onClick={() => setMessage("Audit report prepared for review.")}>View logs →</button></section>
      </div>
      {message && <div className="operation-message settings-message">{message}</div>}
      <section className="panel audit-panel"><div className="panel-header"><div><h2>Recent audit activity</h2><p>Administrative and approval actions.</p></div></div>{[["LOG-3812","Price PRC-0617 approved","Paolo Reyes","Today, 10:42 AM"],["LOG-3811","Farmer account reviewed","Maria Santos","Today, 9:18 AM"],["LOG-3810","Automated backup completed","System","Today, 2:00 AM"]].map((log) => <div className="audit-row" key={log[0]}><span className="record-id">{log[0]}</span><strong>{log[1]}</strong><span>{log[2]}</span><small>{log[3]}</small></div>)}</section>
    </>
  );
}
