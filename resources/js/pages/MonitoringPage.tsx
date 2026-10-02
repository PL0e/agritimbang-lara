import { activities } from "../data/mockData";

export default function MonitoringPage() {
  const barangays = [
    ["Poblacion", "₱225/kg", "high"], ["Guibuangan", "₱211/kg", "mid"], ["Azucena", "₱205/kg", "low"],
    ["Luhod", "₱218/kg", "mid"], ["Pangpang", "₱231/kg", "high"], ["Tubod", "₱207/kg", "low"],
  ];
  return (
    <>
      <div className="page-heading"><div><div className="eyebrow">Municipal intelligence</div><h1>Market monitoring</h1><p>Review barangay-level price activity using verified transaction records.</p></div></div>
      <div className="monitoring-layout">
        <section className="panel market-map-panel">
          <div className="panel-header"><div><h2>Average cattle price by barangay</h2><p>Verified transactions · June 2025</p></div><select><option>Cattle</option><option>Hog</option><option>Goat</option></select></div>
          <div className="barangay-map">{barangays.map(([name, value, tone]) => <div className={`barangay-shape map-${tone}`} key={name}><strong>{name}</strong><span>{value}</span></div>)}</div>
          <div className="map-legend"><span>Lower activity</span><i /><i /><i /><span>Higher activity</span></div>
        </section>
        <aside className="panel species-monitor"><div className="panel-header"><div><h2>Species activity</h2><p>Municipal totals</p></div></div>{["Cattle", "Hog", "Goat", "Carabao"].map((species, index) => <div key={species}><span className="species-mark">{species.slice(0, 2).toUpperCase()}</span><span><strong>{species}</strong><small>{38 - index * 6} verified sales</small></span><strong>₱{[235,198,210,220][index]}</strong></div>)}</aside>
      </div>
      <section className="panel monitoring-table"><div className="panel-header"><div><h2>Verified transactions</h2><p>Read-only municipal market records.</p></div></div><div className="activity-list">{activities.map((activity) => <div className="activity-row" key={activity.id}><span className="record-id">{activity.id}</span><span className="activity-main"><strong>{activity.detail}</strong><small>{activity.user}</small></span><strong>{activity.value}</strong><span className={`status status-${activity.status.toLowerCase()}`}>{activity.status}</span></div>)}</div></section>
    </>
  );
}
