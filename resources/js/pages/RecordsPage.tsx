import { activities, priceRows } from "../data/mockData";
import type { AccountStatus, ManagedAccount, Role, VerificationDocument, VerificationStatus } from "../types";
import VerificationQueue from "../components/verification/VerificationQueue";
import RoleOperations from "../components/operations/RoleOperations";

export default function RecordsPage({
  role,
  verificationDocument,
  onVerificationStatusChange,
  managedAccounts,
  onManagedAccountsChange,
}: {
  role: Role;
  verificationDocument: VerificationDocument;
  onVerificationStatusChange: (status: VerificationStatus) => void;
  managedAccounts: ManagedAccount[];
  onManagedAccountsChange: (accounts: ManagedAccount[]) => void;
}) {
  const title = role === "farmer" ? "My livestock records" : "Users & system activity";

  function updateAccountStatus(email: string, status: AccountStatus) {
    onManagedAccountsChange(
      managedAccounts.map((record) => record.account.email === email ? { ...record, status } : record),
    );
  }

  function updateAccountRole(email: string, accountRole: Role) {
    onManagedAccountsChange(
      managedAccounts.map((record) =>
        record.account.email === email
          ? { ...record, account: { ...record.account, role: accountRole, title: accountRole === "admin" ? "System Administrator" : accountRole === "lgu" ? "LGU Authority" : accountRole === "lgu_encoder" ? "LGU Market Encoder" : "Livestock Farmer" } }
          : record,
      ),
    );
  }

  return (
    <>
      <div className="page-heading">
        <div><div className="eyebrow">Traceable records</div><h1>{title}</h1><p>Review complete, timestamped information and current verification status.</p></div>
        {role !== "farmer" && <button className="primary-button button-fit">+ Record transaction</button>}
      </div>
      {role !== "farmer" && <VerificationQueue document={verificationDocument} onStatusChange={onVerificationStatusChange} />}
      {role !== "farmer" && managedAccounts.length > 0 && (
        <section className="panel registration-queue">
          <div className="panel-header">
            <div><h2>Farmer account approvals</h2><p>New registrations remain blocked from login until approved.</p></div>
            <span className="pending-count">{managedAccounts.filter((record) => record.status === "pending").length} pending</span>
          </div>
          <div className="managed-user-list">
            {managedAccounts.map((record) => (
              <div className="managed-user-row" key={record.account.email}>
                <span className="avatar avatar-farmer">{record.account.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>
                <span><strong>{record.account.name}</strong><small>{record.account.email} · {record.barangay || "Barangay not supplied"}</small></span>
                <span className={`status status-${record.status === "active" ? "verified" : record.status === "rejected" ? "returned" : "pending"}`}>{record.status}</span>
                {role === "admin" && (
                  <select value={record.account.role} onChange={(event) => updateAccountRole(record.account.email, event.target.value as Role)}>
                    <option value="farmer">Farmer</option>
                    <option value="lgu">LGU personnel</option>
                    <option value="lgu_encoder">LGU Encoder</option>
                    <option value="admin">Administrator</option>
                  </select>
                )}
                <select value={record.status} onChange={(event) => updateAccountStatus(record.account.email, event.target.value as AccountStatus)}>
                  <option value="pending">Pending review</option>
                  <option value="active">Approve account</option>
                  <option value="rejected">Return registration</option>
                  <option value="suspended">Suspend account</option>
                </select>
              </div>
            ))}
          </div>
        </section>
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
