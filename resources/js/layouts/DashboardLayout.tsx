import { useState } from "react";

import { navByRole } from "../data/mockData";
import type {
    Account,
    ManagedAccount,
    Page,
    VerificationDocument,
} from "../types";
import Logo from "../components/Logo";
import NotificationCenter from "../components/notifications/NotificationCenter";
import UserMenu from "../components/profile/UserMenu";
import OverviewPage from "../pages/OverviewPage";
import PricesPage from "../pages/PricesPage";
import ProfileSettingsPage from "../pages/ProfileSettingsPage";
import RecordsPage from "../pages/RecordsPage";
import ValuationPage from "../pages/ValuationPage";
import TransactionsPage from "../pages/TransactionsPage";
import MonitoringPage from "../pages/MonitoringPage";
import SystemSettingsPage from "../pages/SystemSettingsPage";

export default function DashboardLayout({
    account,
    onLogout,
    verificationDocument,
    onDocumentChange,
    managedAccounts,
    onManagedAccountsChange,
}: {
    account: Account;
    onLogout: () => void;
    verificationDocument: VerificationDocument;
    onDocumentChange: (document: VerificationDocument) => void;
    managedAccounts: ManagedAccount[];
    onManagedAccountsChange: (accounts: ManagedAccount[]) => void;
}) {
    const [page, setPage] = useState<Page>("overview");
    const [mobileNav, setMobileNav] = useState(false);
    const nav = navByRole[account.role];

    return (
        <div className="app-shell">
            <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
                <div className="sidebar-logo">
                    <Logo />
                </div>
                <nav>
                    <span className="nav-label">Workspace</span>
                    {nav.map((item) => (
                        <button
                            key={item.id}
                            className={page === item.id ? "nav-active" : ""}
                            onClick={() => {
                                setPage(item.id);
                                setMobileNav(false);
                            }}
                        >
                            <span className="nav-icon">{item.short}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    <div className="office-card">
                        <span className="office-mark">MAO</span>
                        <div>
                            <strong>Barili, Cebu</strong>
                            <small>Municipal Agriculture Office</small>
                        </div>
                    </div>
                    <button className="logout-button" onClick={onLogout}>
                        Sign out <span>→</span>
                    </button>
                </div>
            </aside>
            <div className="main-shell">
                <header className="topbar">
                    <button
                        className="menu-button"
                        onClick={() => setMobileNav(!mobileNav)}
                    >
                        Menu
                    </button>
                    <div className="topbar-context">
                        <span>Current price period</span>
                        <strong>June 9–15, 2025</strong>
                    </div>
                    <div className="topbar-actions">
                        <NotificationCenter
                            role={account.role}
                            managedAccounts={managedAccounts}
                            onNavigate={setPage}
                        />
                        <UserMenu
                            account={account}
                            onNavigate={setPage}
                            onLogout={onLogout}
                        />
                    </div>
                </header>
                <main className="page-content">
                    {page === "overview" && (
                        <OverviewPage role={account.role} setPage={setPage} />
                    )}
                    {page === "prices" && <PricesPage role={account.role} />}
                    {page === "valuation" && <ValuationPage />}
                    {page === "transactions" && (
                        <TransactionsPage role={account.role} />
                    )}
                    {page === "monitoring" && <MonitoringPage />}
                    {page === "records" && (
                        <RecordsPage role={account.role} />
                    )}
                    {page === "profile" && account.role === "farmer" && (
                        <ProfileSettingsPage account={account} />
                    )}
                    {page === "settings" && account.role === "admin" && (
                        <SystemSettingsPage />
                    )}
                </main>
            </div>
            {mobileNav && (
                <button
                    className="nav-backdrop"
                    aria-label="Close navigation"
                    onClick={() => setMobileNav(false)}
                />
            )}
        </div>
    );
}
