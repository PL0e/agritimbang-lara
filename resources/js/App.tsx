import { useEffect, useState } from "react";

import DashboardLayout from "./layouts/DashboardLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import {
    getApiErrorMessage,
    getCurrentUser,
    login,
    logout as logoutUser,
    registerFarmer,
} from "./services/auth";

import type {
    Account,
    AuthResult,
    AuthUser,
    ManagedAccount,
    RegistrationInput,
    Role,
    VerificationDocument,
} from "./types";

/*
|--------------------------------------------------------------------------
| Laravel user -> existing dashboard account
|--------------------------------------------------------------------------
|
| DashboardLayout currently uses the old frontend Account shape.
| Keep this compatibility layer until we refactor the dashboard.
|
*/

function mapRole(user: AuthUser): Role {
    const slugs = user.roles.map((role) => role.slug);

    if (slugs.includes("administrator")) {
        return "admin";
    }

    if (slugs.includes("lgu_authority")) {
        return "lgu";
    }

    if (slugs.includes("lgu_encoder")) {
        return "lgu_encoder";
    }

    return "farmer";
}

function mapUserToAccount(user: AuthUser): Account {
    const role = mapRole(user);

    const name = [user.first_name, user.middle_name, user.last_name]
        .filter(Boolean)
        .join(" ");

    const titles: Record<Role, string> = {
        admin: "Administrator",
        lgu: "LGU Authority",
        lgu_encoder: "LGU Encoder",
        farmer: "Livestock Farmer",
    };

    return {
        username: user.email,
        email: user.email,
        role,
        name,
        title: titles[role],
    };
}

export default function App() {
    const [account, setAccount] = useState<Account | null>(null);

    const [authUser, setAuthUser] = useState<AuthUser | null>(null);

    const [authView, setAuthView] = useState<"login" | "register">("login");

    const [authNotice, setAuthNotice] = useState("");

    const [isRestoringSession, setIsRestoringSession] = useState(true);

    /*
     * These are still temporary because DashboardLayout
     * currently expects the old mock management data.
     *
     * They will disappear as we integrate the corresponding
     * backend modules.
     */
    const [registeredAccounts, setRegisteredAccounts] = useState<
        ManagedAccount[]
    >([]);

    const [verificationDocument, setVerificationDocument] =
        useState<VerificationDocument>({
            fileName: "",
            fileType: "",
            submittedAt: "",
            status: "Pending review",
        });

    /*
    |--------------------------------------------------------------------------
    | Restore authenticated session
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        async function restoreSession() {
            const token = localStorage.getItem("auth_token");

            if (!token) {
                setIsRestoringSession(false);
                return;
            }

            try {
                const user = await getCurrentUser();

                setAuthUser(user);
                setAccount(mapUserToAccount(user));
            } catch {
                localStorage.removeItem("auth_token");

                setAuthUser(null);
                setAccount(null);
            } finally {
                setIsRestoringSession(false);
            }
        }

        void restoreSession();
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Login
    |--------------------------------------------------------------------------
    */

    async function authenticate(
        email: string,
        password: string,
    ): Promise<AuthResult> {
        try {
            const auth = await login({
                email,
                password,
            });

            setAuthUser(auth.user);

            setAccount(mapUserToAccount(auth.user));

            setAuthNotice("");

            return {
                success: true,
            };
        } catch (error) {
            return {
                success: false,
                message: getApiErrorMessage(
                    error,
                    "Unable to sign in. Please check your credentials.",
                ),
            };
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Farmer registration
    |--------------------------------------------------------------------------
    */

    async function register(
        input: RegistrationInput,
    ): Promise<string | undefined> {
        try {
            const auth = await registerFarmer({
                first_name: input.firstName.trim(),

                middle_name: input.middleName.trim() || null,

                last_name: input.lastName.trim(),

                email: input.email.trim().toLowerCase(),

                phone_number: input.phone.trim() || null,

                password: input.password,

                password_confirmation: input.passwordConfirmation,
            });

            /*
             * Laravel already returns a Sanctum token during
             * registration, so the farmer is authenticated
             * immediately.
             */
            setAuthUser(auth.user);

            setAccount(mapUserToAccount(auth.user));

            setAuthNotice("");

            return undefined;
        } catch (error) {
            return getApiErrorMessage(
                error,
                "Unable to create your account. Please try again.",
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Logout
    |--------------------------------------------------------------------------
    */

    async function logout() {
        try {
            await logoutUser();
        } finally {
            setAuthUser(null);
            setAccount(null);
            setAuthNotice("");
            setAuthView("login");
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Session restoration
    |--------------------------------------------------------------------------
    */

    if (isRestoringSession) {
        return (
            <main className="login-page">
                <section className="login-panel">
                    <div className="login-card">
                        <div className="eyebrow">AgriTimbang</div>

                        <h2>Loading your workspace...</h2>

                        <p className="muted">Restoring your session.</p>
                    </div>
                </section>
            </main>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Authenticated application
    |--------------------------------------------------------------------------
    */

    if (account && authUser) {
        return (
            <DashboardLayout
                account={account}
                onLogout={() => {
                    void logout();
                }}
                verificationDocument={verificationDocument}
                onDocumentChange={setVerificationDocument}
                managedAccounts={registeredAccounts}
                onManagedAccountsChange={setRegisteredAccounts}
            />
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Registration
    |--------------------------------------------------------------------------
    */

    if (authView === "register") {
        return (
            <RegisterPage
                onBack={() => {
                    setAuthNotice("");
                    setAuthView("login");
                }}
                onRegister={register}
            />
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Login
    |--------------------------------------------------------------------------
    */

    return (
        <LoginPage
            notice={authNotice}
            onLogin={authenticate}
            onRegister={() => {
                setAuthNotice("");
                setAuthView("register");
            }}
        />
    );
}
