import { activities, priceRows } from "../data/mockData";
import type { Role } from "../types";
import AdminFarmerList from "../components/accounts/AdminFarmerList";
import AccountManagementPanel from "../components/accounts/AccountManagementPanel";
import FarmerVerificationQueue from "../components/verification/FarmerVerificationQueue";
import RoleOperations from "../components/operations/RoleOperations";

export default function RecordsPage({ role }: { role: Role }) {
  const title = role === "farmer" ? "My livestock records" : "Users & system activity";

  return (
    <>
      <div className="page-heading">
        <div><div className="eyebrow">Traceable records</div><h1>{title}</h1><p>Review complete, timestamped information and current verification status.</p></div>
        {role !== "farmer" && <button className="primary-button button-fit">+ Record transaction</button>}
      </div>
      {role === "admin" && (
        <>
          <AdminFarmerList />
          <AccountManagementPanel role="admin" />
        </>
      )}
      {role === "lgu" && (
        <>
          <FarmerVerificationQueue />
          <AccountManagementPanel role="lgu" />
        </>
      )}
      <RoleOperations role={role} />
      <section className={`panel ${role !== "farmer" ? "activity-panel-spaced" : ""}`}>
        <div className="filter-row">
          <label className="search-field"><span>Search records</span><input placeholder="ID, livestock, farmer or buyer" /></label>
          <label><span>Species</span><select><option>All species</option>{priceRows.map((row) => <option key={row.species}>{row.species}</option>)}</select></label>
          <label><span>Status</span><select><option>All statuses</option><option>Verified</option><option>Pending</option></select></label>
        </div>
        <div className="activity-list detailed">
          {activities.map((activity, index) => (
            <div className="activity-row" key={activity.id}>
              <span className="record-id">{activity.id}</span>
              <span className="activity-main"><strong>{activity.detail}</strong><small>{activity.user} · June {16 - index}, 2025</small></span>
              <strong>{activity.value}</strong>
              <span className={`status status-${activity.status.toLowerCase()}`}>{activity.status}</span>
              <button className="row-action">View →</button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
