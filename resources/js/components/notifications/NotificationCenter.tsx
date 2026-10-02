import { useMemo, useState } from "react";
import type { ManagedAccount, Page, Role } from "../../types";

type Notification = {
  id: string;
  title: string;
  detail: string;
  time: string;
  page: Page;
};

export default function NotificationCenter({
  role,
  managedAccounts,
  onNavigate,
}: {
  role: Role;
  managedAccounts: ManagedAccount[];
  onNavigate: (page: Page) => void;
}) {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);

  const notifications = useMemo<Notification[]>(() => {
    const pendingRegistrations = managedAccounts
      .filter((record) => record.status === "pending")
      .map((record) => ({
        id: `registration-${record.account.email}`,
        title: "Farmer approval required",
        detail: `${record.account.name} submitted a new account registration.`,
        time: "Just now",
        page: "records" as Page,
      }));

    if (role === "farmer") {
      return [
        { id: "farmer-price", title: "Weekly prices updated", detail: "Four official livestock prices are now available for June 9–15.", time: "2 hours ago", page: "prices" },
        { id: "farmer-transaction", title: "Transaction verified", detail: "Transaction TRX-0248 was confirmed by the LGU.", time: "Yesterday", page: "records" },
        { id: "farmer-profile", title: "Complete account verification", detail: "Upload an ID or barangay certification in Profile settings.", time: "2 days ago", page: "profile" },
      ];
    }

    if (role === "lgu_encoder") {
      return [
        { id: "encoder-code", title: "New assisted transaction code", detail: "A farmer submitted code AT8K24 for market-day confirmation.", time: "6 minutes ago", page: "transactions" },
        { id: "encoder-price", title: "Weekly price draft reminder", detail: "Complete this week's observed hog and cattle prices.", time: "1 hour ago", page: "prices" },
        { id: "encoder-summary", title: "Daily encoding summary", detail: "You assisted 8 transactions today.", time: "2 hours ago", page: "overview" },
      ];
    }

    if (role === "lgu") {
      return [
        ...pendingRegistrations,
        { id: "lgu-price", title: "Weekly price awaiting review", detail: "Hog · Large White at ₱201/kg is pending validation.", time: "18 minutes ago", page: "prices" },
        { id: "lgu-transaction", title: "Transaction awaiting validation", detail: "TRX-0247 has buyer confirmation and is ready for review.", time: "45 minutes ago", page: "records" },
      ];
    }

    return [
      ...pendingRegistrations,
      { id: "admin-activity", title: "Daily activity summary ready", detail: "46 transactions and 128 valuations were recorded this week.", time: "1 hour ago", page: "overview" },
      { id: "admin-users", title: "User management update", detail: "Review active roles and account statuses for municipal personnel.", time: "Yesterday", page: "records" },
    ];
  }, [managedAccounts, role]);

  const unreadCount = notifications.filter((notification) => !readIds.includes(notification.id)).length;

  function openNotification(notification: Notification) {
    setReadIds((current) => current.includes(notification.id) ? current : [...current, notification.id]);
    setOpen(false);
    onNavigate(notification.page);
  }

  return (
    <div className="notification-center">
      <button
        className="notification-trigger"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span aria-hidden="true">N</span>
        {unreadCount > 0 && <strong>{unreadCount}</strong>}
      </button>
      {open && (
        <section className="notification-popover">
          <div className="notification-header">
            <div><h2>Notifications</h2><span>{unreadCount} unread</span></div>
            <button onClick={() => setReadIds(notifications.map((notification) => notification.id))}>Mark all as read</button>
          </div>
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">You&apos;re all caught up.</div>
            ) : notifications.map((notification) => {
              const isUnread = !readIds.includes(notification.id);
              return (
                <button
                  key={notification.id}
                  className={`notification-item ${isUnread ? "notification-unread" : ""}`}
                  onClick={() => openNotification(notification)}
                >
                  <span className="notification-indicator" />
                  <span><strong>{notification.title}</strong><small>{notification.detail}</small><time>{notification.time}</time></span>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
