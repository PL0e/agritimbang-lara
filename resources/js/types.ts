export type Role = "admin" | "lgu" | "lgu_encoder" | "farmer";

export type Page =
    | "overview"
    | "prices"
    | "valuation"
    | "transactions"
    | "monitoring"
    | "records"
    | "profile"
    | "settings";

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

/*
|--------------------------------------------------------------------------
| Registration UI
|--------------------------------------------------------------------------
*/

export interface RegistrationInput {
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    passwordConfirmation: string;
}

/*
|--------------------------------------------------------------------------
| Laravel Authentication
|--------------------------------------------------------------------------
*/

export interface BackendRole {
    id: string;
    name: string;
    slug: string;
}

export interface AuthUser {
    id: string;

    first_name: string;
    middle_name: string | null;
    last_name: string;

    email: string;
    phone_number: string | null;

    status: "active" | "inactive" | "suspended";

    verification_status: "unverified" | "pending" | "verified" | "rejected";

    roles: BackendRole[];

    farmer_profile?: unknown | null;
    lgu_officer_profile?: unknown | null;
}

export interface AuthData {
    user: AuthUser;
    token: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface RegisterFarmerInput {
    first_name: string;
    middle_name?: string | null;
    last_name: string;

    email: string;
    phone_number?: string | null;

    password: string;
    password_confirmation: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

/*
|--------------------------------------------------------------------------
| Authentication result
|--------------------------------------------------------------------------
*/

export type AuthResult = {
    success: boolean;
    message?: string;
};
