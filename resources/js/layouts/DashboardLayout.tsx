import { useState } from "react";
import { ChevronDown, LogOut, Settings, UserRound } from "lucide-react";

import type { Account, Page } from "../../types";

export default function UserMenu({
    account,
    onNavigate,
    onLogout,
}: {
    account: Account;
    onNavigate: (page: Page) => void;
    onLogout: () => void;
}) {
    const [open, setOpen] = useState(false);

    const initials = account.name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    function handleProfileNavigation() {
        setOpen(false);

        if (account.role === "farmer") {
            onNavigate("profile");
            return;
        }

        if (account.role === "admin") {
            onNavigate("settings");
            return;
        }

        if (account.role === "lgu") {
            onNavigate("records");
            return;
        }

        onNavigate("overview");
    }

    function handleLogout() {
        setOpen(false);
        onLogout();
    }

    return (
        <div className="user-menu">
            {/* USER TRIGGER */}
            <button
                type="button"
                className={`user-menu-trigger ${
                    open ? "user-menu-trigger-active" : ""
                }`}
                onClick={() => setOpen((current) => !current)}
                aria-expanded={open}
                aria-label="Open account menu"
            >
                <div className="user-menu-identity">
                    <strong>{account.name}</strong>
                    <span>{account.title}</span>
                </div>

                <span
                    className={`avatar avatar-${account.role}`}
                    aria-hidden="true"
                >
                    {initials}
                </span>

                <ChevronDown
                    className={`user-menu-chevron ${
                        open ? "user-menu-chevron-open" : ""
                    }`}
                    size={15}
                    strokeWidth={1.8}
                    aria-hidden="true"
                />
            </button>

            {/* USER POPOVER */}
            {open && (
                <section className="profile-popover" aria-label="Account menu">
                    <div className="profile-popover-head">
                        <span
                            className={`profile-avatar avatar-${account.role}`}
                            aria-hidden="true"
                        >
                            {initials}
                        </span>

                        <div>
                            <strong>{account.name}</strong>
                            <span>{account.title}</span>
                        </div>
                    </div>

                    <div className="profile-popover-info">
                        <div>
                            <span>Email</span>
                            <strong>{account.email}</strong>
                        </div>

                        <div>
                            <span>Account role</span>
                            <strong>{getRoleLabel(account.role)}</strong>
                        </div>
                    </div>

                    <div className="profile-menu-actions">
                        <button
                            type="button"
                            className="profile-menu-action"
                            onClick={handleProfileNavigation}
                        >
                            <span className="profile-action-content">
                                {account.role === "farmer" ? (
                                    <UserRound
                                        size={16}
                                        strokeWidth={1.8}
                                        aria-hidden="true"
                                    />
                                ) : (
                                    <Settings
                                        size={16}
                                        strokeWidth={1.8}
                                        aria-hidden="true"
                                    />
                                )}

                                <span>
                                    {account.role === "farmer"
                                        ? "Profile settings"
                                        : account.role === "admin"
                                          ? "System settings"
                                          : "Account workspace"}
                                </span>
                            </span>
                        </button>

                        <button
                            type="button"
                            className="profile-menu-action profile-logout"
                            onClick={handleLogout}
                        >
                            <span className="profile-action-content">
                                <LogOut
                                    size={16}
                                    strokeWidth={1.8}
                                    aria-hidden="true"
                                />

                                <span>Sign out</span>
                            </span>
                        </button>
                    </div>
                </section>
            )}
        </div>
    );
}

function getRoleLabel(role: Account["role"]) {
    switch (role) {
        case "admin":
            return "Administrator";

        case "lgu":
            return "LGU Authority";

        case "lgu_encoder":
            return "LGU Encoder";

        case "farmer":
            return "Farmer";

        default:
            return "User";
    }
}
