export type Role = "admin" | "lgu" | "lgu_encoder" | "farmer";
export type Page = "overview" | "prices" | "valuation" | "transactions" | "monitoring" | "records" | "profile" | "settings";

export type VerificationStatus = "Pending review" | "Verified" | "Returned";

export type VerificationDocument = {
  fileName: string;
  fileType: string;
  submittedAt: string;
  status: VerificationStatus;
  previewUrl?: string;
  submittedBy?: string;
  submittedEmail?: string;
};

export type Account = {
  username: string;
  email: string;
  role: Role;
  name: string;
  title: string;
};

export type AccountStatus = "pending" | "active" | "suspended" | "rejected";

export type ManagedAccount = {
  account: Account;
  password: string;
  status: AccountStatus;
  phone?: string;
  barangay?: string;
};

export type RegistrationInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  municipality: string;
  barangay: string;
  documentName: string;
  documentType: string;
  documentUrl?: string;
  password: string;
};

export type AuthResult = {
  success: boolean;
  message?: string;
};
