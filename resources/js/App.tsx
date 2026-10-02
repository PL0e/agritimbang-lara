import { useState } from "react";
import DashboardLayout from "./layouts/DashboardLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { accounts } from "./data/mockData";
import type { Account, AuthResult, ManagedAccount, RegistrationInput, VerificationDocument } from "./types";

export default function App() {
  const [account, setAccount] = useState<Account | null>(null);
  const [authView, setAuthView] = useState<"login" | "register">("login");
  const [authNotice, setAuthNotice] = useState("");
  const [registeredAccounts, setRegisteredAccounts] = useState<ManagedAccount[]>([]);
  const [verificationDocument, setVerificationDocument] = useState<VerificationDocument>({
    fileName: "barangay-clearance-juan.pdf",
    fileType: "application/pdf",
    submittedAt: "June 16, 2025 · 2:14 PM",
    status: "Pending review",
    submittedBy: "Juan Dela Cruz",
    submittedEmail: "farmer1@gmail.com",
  });
  function authenticate(identity: string, password: string): AuthResult {
    const normalizedIdentity = identity.toLowerCase();
    const demoAccount = accounts.find(
      (candidate) =>
        candidate.username.toLowerCase() === normalizedIdentity ||
        candidate.email.toLowerCase() === normalizedIdentity,
    );
    if (demoAccount && password === "test_123") {
      setAccount(demoAccount);
      return { success: true };
    }
    const registered = registeredAccounts.find(
      (candidate) =>
        (candidate.account.username.toLowerCase() === normalizedIdentity ||
          candidate.account.email.toLowerCase() === normalizedIdentity) &&
        candidate.password === password,
    );
    if (!registered) return { success: false, message: "Invalid username or password." };
    if (registered.status === "pending") {
      return { success: false, message: "Account pending LGU approval. You will be able to sign in after verification." };
    }
    if (registered.status === "suspended") {
      return { success: false, message: "This account is suspended. Contact the Municipal Agriculture Office." };
    }
    if (registered.status === "rejected") {
      return { success: false, message: "Registration was returned. Contact the LGU to update your information." };
    }
    setAccount(registered.account);
    return { success: true };
  }

  function register(input: RegistrationInput) {
    const emailExists = accounts.some((candidate) => candidate.email.toLowerCase() === input.email.toLowerCase()) ||
      registeredAccounts.some((candidate) => candidate.account.email.toLowerCase() === input.email.toLowerCase());
    if (emailExists) return "An account already exists for this email. Sign in instead.";
    const baseUsername = input.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_") || "farmer";
    const newAccount: Account = {
      username: `${baseUsername}_${registeredAccounts.length + 1}`,
      email: input.email,
      role: "farmer",
      name: `${input.firstName} ${input.lastName}`,
      title: "Livestock Farmer",
    };
    setRegisteredAccounts((current) => [...current, {
      account: newAccount,
      password: input.password,
      status: "pending",
      phone: input.phone,
      barangay: input.barangay,
    }]);
    setVerificationDocument({
      fileName: input.documentName,
      fileType: input.documentType,
      previewUrl: input.documentUrl,
      submittedAt: "Just now",
      status: "Pending review",
      submittedBy: newAccount.name,
      submittedEmail: newAccount.email,
    });
    setAuthNotice(`Registration submitted for ${input.email}. Your account is awaiting LGU approval.`);
    setAuthView("login");
    return undefined;
  }

  if (account) return (
    <DashboardLayout
      account={account}
      onLogout={() => {
        setAccount(null);
        setAuthView("login");
      }}
      verificationDocument={verificationDocument}
      onDocumentChange={setVerificationDocument}
      managedAccounts={registeredAccounts}
      onManagedAccountsChange={setRegisteredAccounts}
    />
  );

  return authView === "login" ? (
    <LoginPage
      notice={authNotice}
      onLogin={authenticate}
      onRegister={() => {
        setAuthNotice("");
        setAuthView("register");
      }}
    />
  ) : (
    <RegisterPage onBack={() => setAuthView("login")} onRegister={register} />
  );
}
