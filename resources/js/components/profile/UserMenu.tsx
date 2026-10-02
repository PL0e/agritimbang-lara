import { useState } from "react";
import type { Account, Page } from "../../types";
import {
    ChevronDown,
    CircleUserRound,
    LogOut,
    Settings,
    UserRound,
} from "lucide-react";

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
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("");
    return (
        <div className="user-menu">
            <button
                className="user-menu-trigger"
                onClick={() => setOpen(!open)}
                aria-expanded={open}
            >
                <span className={`avatar avatar-${account.role}`}>
                    {initials}
                </span>
            </button>
            {open && (
                <section className="profile-popover">
                    <div className="profile-popover-head">
                        <span
                            className={`profile-avatar avatar-${account.role}`}
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
                            <span>
                                {account.role === "farmer"
                                    ? "Barangay"
                                    : "Assignment"}
                            </span>
                            <strong>
                                {account.role === "farmer"
                                    ? "Poblacion, Barili"
                                    : account.role === "lgu"
                                      ? "Barili jurisdiction"
                                      : account.role === "lgu_encoder"
                                        ? "Barili Municipal Market"
                                        : "System-wide access"}
                            </strong>
                        </div>
                        <div>
                            <span>Verification</span>
                            <strong className="verification-verified">
                                Active account
                            </strong>
                        </div>
                    </div>
                    <button
                        className="profile-menu-action"
                        onClick={() => {
                            setOpen(false);
                            onNavigate(
                                account.role === "farmer"
                                    ? "profile"
                                    : account.role === "admin"
                                      ? "settings"
                                      : account.role === "lgu_encoder"
                                        ? "overview"
                                        : "records",
                            );
                        }}
                    >
                        Edit profile and settings <span>→</span>
                    </button>
                    <button
                        className="profile-menu-action profile-logout"
                        onClick={onLogout}
                    >
                        Sign out <span>→</span>
                    </button>
                </section>
            )}
        </div>
    );
}
