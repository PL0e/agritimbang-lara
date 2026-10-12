import { useEffect, useState } from "react";

import { navByRole } from "../data/mockData";
import type {
    Account,
    AuthUser,
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
import AccountManagementPanel from "../components/accounts/AccountManagementPanel";

export default function DashboardLayout({
    account,
    profileUser,
    verificationStatus,
    onRefreshVerification,
    onProfileUpdated,
    onLogout,
    verificationDocument,
    onDocumentChange,
    managedAccounts,
    onManagedAccountsChange,
}: {
    account: Account;
    profileUser: AuthUser;
    verificationStatus: AuthUser["verification_status"];
    onRefreshVerification: () => Promise<void>;
    onProfileUpdated: () => Promise<void>;
    onLogout: () => void;
    verificationDocument: VerificationDocument;
    onDocumentChange: (document: VerificationDocument) => void;
    managedAccounts: ManagedAccount[];
    onManagedAccountsChange: (accounts: ManagedAccount[]) => void;
}) {
    const isFarmerLocked =
        account.role === "farmer" && verificationStatus !== "verified";
    const [page, setPage] = useState<Page>(() =>
        isFarmerLocked ? "profile" : "overview",
    );
    const [mobileNav, setMobileNav] = useState(false);
    const [verificationRefreshError, setVerificationRefreshError] =
        useState("");
    const nav = isFarmerLocked
        ? navByRole.farmer.filter((item) => item.id === "profile")
        : navByRole[account.role];
    const activePage = isFarmerLocked ? "profile" : page;

    useEffect(() => {
        if (!isFarmerLocked) {
            setVerificationRefreshError("");
            return;
        }

        let isActive = true;

        async function refreshVerificationStatus() {
            try {
                await onRefreshVerification();
                if (isActive) {
                    setVerificationRefreshError("");
                }
            } catch {
                if (isActive) {
                    setVerificationRefreshError(
                        "Could not refresh your verification status. Check your connection and reload this page.",
                    );
                }
            }
        }

        const handleFocus = () => {
            void refreshVerificationStatus();
        };

        void refreshVerificationStatus();
        const intervalId = window.setInterval(
            () => void refreshVerificationStatus(),
            15000,
        );
        window.addEventListener("focus", handleFocus);

        return () => {
            isActive = false;
            window.clearInterval(intervalId);
            window.removeEventListener("focus", handleFocus);
        };
    }, [isFarmerLocked, onRefreshVerification]);

    function navigateToPage(nextPage: Page) {
        if (isFarmerLocked && nextPage !== "profile") {
            setPage("profile");
            return;
        }

        setPage(nextPage);
    }

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
                            className={activePage === item.id ? "nav-active" : ""}
                            onClick={() => {
                                navigateToPage(item.id);
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
                            onNavigate={navigateToPage}
                        />
                        <UserMenu
                            account={account}
                            onNavigate={navigateToPage}
                            onLogout={onLogout}
                        />
                    </div>
                </header>
                <main className="page-content">
                    {isFarmerLocked && (
                        <div className="auth-notice" role="status">
                            Your account has not been verified by the LGU.
                            Profile settings is the only available section
                            until your account is verified.
                            {verificationRefreshError &&
                                ` ${verificationRefreshError}`}
                        </div>
                    )}
                    {activePage === "overview" && (
                        <OverviewPage role={account.role} setPage={navigateToPage} />
                    )}
                    {activePage === "prices" && <PricesPage role={account.role} />}
                    {activePage === "valuation" && <ValuationPage />}
                    {activePage === "transactions" && (
                        <TransactionsPage role={account.role} />
                    )}
                    {activePage === "monitoring" && <MonitoringPage />}
                    {activePage === "encoders" && account.role === "lgu" && (
                        <AccountManagementPanel role="lgu" />
                    )}
                    {activePage === "records" && (
                        <RecordsPage role={account.role} />
                    )}
                    {activePage === "profile" && (
                        <ProfileSettingsPage
                            account={account}
                            profileUser={profileUser}
                            onProfileUpdated={onProfileUpdated}
                        />
                    )}
                    {activePage === "settings" && account.role === "admin" && (
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
