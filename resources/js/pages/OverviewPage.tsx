import { activities } from "../data/mockData";
import type { Page, Role } from "../types";
import Metric from "../components/Metric";
import PriceTable from "../components/PriceTable";

export default function OverviewPage({ role, setPage }: { role: Role; setPage: (page: Page) => void }) {
  const welcome = role === "farmer"
    ? "Your fair-price guide for today"
    : role === "lgu"
      ? "Authority tasks and municipal activity"
      : role === "lgu_encoder"
        ? "Market encoding workload at a glance"
        : "Municipal system overview";
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">Tuesday, June 17, 2025</div>
          <h1>{welcome}</h1>
          <p>Verified information from the Barili Municipal Agriculture Office.</p>
        </div>
        <button className="primary-button button-fit" onClick={() => setPage("valuation")}>+ New valuation</button>
      </div>

      <div className="metrics-grid">
        <Metric label="Official references" value="4 active" detail="Current week · all species" />
        <Metric label={role === "farmer" ? "My livestock" : "Valuations this week"} value={role === "farmer" ? "7 records" : "128"} detail={role === "farmer" ? "5 cattle · 2 goats" : "+18% from last week"} />
        <Metric label={role === "farmer" ? "Latest valuation" : "Transactions recorded"} value={role === "farmer" ? "₱77,080" : "46"} detail={role === "farmer" ? "Cattle · June 14" : "39 verified · 7 pending"} />
        <Metric label="Market status" value="Stable" detail="No major price deviations" accent />
      </div>
      {role === "farmer" && (
        <section className="quick-actions">
          <button onClick={() => setPage("transactions")}><span>TR</span><strong>New transaction</strong><small>Record a livestock sale</small></button>
          <button onClick={() => setPage("valuation")}><span>FP</span><strong>Estimate value</strong><small>Open fair price calculator</small></button>
          <button onClick={() => setPage("valuation")}><span>WT</span><strong>Estimate weight</strong><small>Use livestock measurements</small></button>
          <button onClick={() => setPage("records")}><span>DR</span><strong>View drafts</strong><small>Manage saved livestock</small></button>
        </section>
      )}

      <div className="dashboard-grid">
        <section className="panel panel-wide">
          <div className="panel-header">
            <div><h2>Official livestock prices</h2><p>Effective June 9–15, 2025</p></div>
            <button className="text-button" onClick={() => setPage("prices")}>View all prices →</button>
          </div>
          <PriceTable compact />
        </section>
        <aside className="panel market-card">
          <div className="market-label">Market signal</div>
          <h2>Prices remain steady</h2>
          <p>Average livestock prices moved by only 0.7% this week across Barili.</p>
          <div className="mini-chart" aria-label="Weekly market trend">
            {[36, 42, 39, 50, 48, 56, 60, 58, 65, 68, 72, 76].map((height, index) => (
              <span key={index} style={{ height: `${height}%` }} />
            ))}
          </div>
          <div className="chart-legend"><span>May 26</span><span>Jun 16</span></div>
        </aside>
      </div>

      <section className="panel">
        <div className="panel-header">
          <div><h2>{role === "farmer" ? "My recent activity" : "Recent market activity"}</h2><p>Latest valuations and recorded transactions</p></div>
          <button className="text-button" onClick={() => setPage("records")}>Open records →</button>
        </div>
        <div className="activity-list">
          {activities.slice(0, 3).map((activity) => (
            <div className="activity-row" key={activity.id}>
              <span className="record-id">{activity.id}</span>
              <span className="activity-main"><strong>{activity.detail}</strong><small>{activity.user}</small></span>
              <strong>{activity.value}</strong>
              <span className={`status status-${activity.status.toLowerCase()}`}>{activity.status}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
