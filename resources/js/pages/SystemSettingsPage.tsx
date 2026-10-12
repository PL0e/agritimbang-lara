import { useEffect, useState } from "react";

import api from "../services/api";
import { getApiErrorMessage } from "../services/auth";
import type { ApiResponse } from "../types";

type AuditEvent = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  new_values: Record<string, unknown> | null;
  created_at: string;
  user: { name: string; email: string } | null;
};

type Paginated<T> = { data: T[] };

function describeAction(action: string): string {
  const labels: Record<string, string> = {
    "account.registered": "Farmer registered",
    "account.created": "Account created",
    "account.updated": "Account updated",
    "account.profile_updated": "Profile updated",
    "account.status_changed": "Account status changed",
    "auth.login": "Signed in",
    "auth.login_failed": "Sign-in denied",
    "auth.logout": "Signed out",
    "password.changed": "Password changed",
    "password.reset": "Password reset",
    "password.reset_link_sent": "Password reset requested",
    "password.reset_link_requested": "Password reset requested",
    "farmer_profile.updated": "Farmer profile updated",
    "farmer_verification.submitted": "Verification document submitted",
    "farmer_verification.approved": "Farmer verification approved",
    "farmer_verification.rejected": "Farmer verification rejected",
  };

  return labels[action] ?? action.replaceAll(/[._]/g, " ");
}

function summarizeChanges(values: Record<string, unknown> | null): string {
  if (!values) {
    return "";
  }

  return Object.entries(values)
    .map(([key, value]) => `${key.replaceAll("_", " ")}: ${String(value)}`)
    .join(" · ");
}

export default function SystemSettingsPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAuditEvents() {
      try {
        const response = await api.get<ApiResponse<Paginated<AuditEvent>>>(
          "/admin/audit-logs",
        );
        setEvents(response.data.data.data);
      } catch (requestError) {
        setError(
          getApiErrorMessage(requestError, "Unable to load audit activity."),
        );
      } finally {
        setLoading(false);
      }
    }

    void loadAuditEvents();
  }, []);

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">Administration</div>
          <h1>System settings</h1>
          <p>Review recent account, authentication, and approval activity.</p>
        </div>
      </div>
      <section className="panel audit-panel">
        <div className="panel-header">
          <div>
            <h2>Recent audit activity</h2>
            <p>Latest attributed user actions, newest first.</p>
          </div>
        </div>
        {loading ? (
          <p className="muted">Loading audit activity...</p>
        ) : error ? (
          <div className="operation-message error-message" role="alert">{error}</div>
        ) : events.length === 0 ? (
          <p className="muted">No account activity has been recorded yet.</p>
        ) : (
          events.map((event) => (
            <div className="audit-row" key={event.id}>
              <span className="record-id">{describeAction(event.action)}</span>
              <div>
                <strong>
                  {event.entity_type.replaceAll("_", " ")}
                  {event.entity_id ? ` · ${event.entity_id.slice(0, 8)}` : ""}
                </strong>
                {event.action.startsWith("password.")
                  ? <small>Credential event; no password values are stored.</small>
                  : <small>{summarizeChanges(event.new_values)}</small>}
              </div>
              <span>{event.user?.name ?? "System"}{event.user ? ` · ${event.user.email}` : ""}</span>
              <small>{new Date(event.created_at).toLocaleString()}</small>
            </div>
          ))
        )}
      </section>
    </>
  );
}
