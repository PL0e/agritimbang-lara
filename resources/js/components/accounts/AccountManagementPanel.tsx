import { useEffect, useState, type FormEvent } from "react";

import { getApiErrorMessage } from "../../services/auth";
import api from "../../services/api";
import type { ApiResponse, Role } from "../../types";
import Field from "../Field";

type Municipality = {
    id: string;
    name: string;
    province: string;
    is_active: boolean;
};

type Barangay = {
    id: string;
    name: string;
    municipality_id: string;
};

type ManagedUser = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    status: string;
    lgu_officer_profile?: {
        municipality?: Municipality;
    };
};

type Paginated<T> = {
    data: T[];
};

type AccountForm = {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    station: string;
    designation: string;
    password: string;
    password_confirmation: string;
};

const emptyAccountForm: AccountForm = {
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    station: "",
    designation: "",
    password: "",
    password_confirmation: "",
};

export default function AccountManagementPanel({
    role,
}: {
    role: Extract<Role, "admin" | "lgu">;
}) {
    const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
    const [accounts, setAccounts] = useState<ManagedUser[]>([]);
    const [municipalityName, setMunicipalityName] = useState("");
    const [province, setProvince] = useState("");
    const [barangayName, setBarangayName] = useState("");
    const [municipalityId, setMunicipalityId] = useState("");
    const [form, setForm] = useState<AccountForm>(emptyAccountForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    async function refresh() {
        setLoading(true);
        setError("");

        try {
            if (role === "admin") {
                const [municipalityResponse, accountResponse] =
                    await Promise.all([
                        api.get<ApiResponse<Municipality[]>>(
                            "/reference/municipalities",
                        ),
                        api.get<ApiResponse<Paginated<ManagedUser>>>(
                            "/admin/lgu-authorities",
                        ),
                    ]);

                const activeMunicipalities =
                    municipalityResponse.data.data.filter(
                        (municipality) => municipality.is_active,
                    );

                setMunicipalities(activeMunicipalities);
                setAccounts(accountResponse.data.data.data);
                setMunicipalityId((current) =>
                    current || activeMunicipalities[0]?.id || "",
                );
            } else {
                const response = await api.get<
                    ApiResponse<Paginated<ManagedUser>>
                >("/lgu/encoders");

                setAccounts(response.data.data.data);
            }
        } catch (requestError) {
            setError(
                getApiErrorMessage(
                    requestError,
                    "Unable to load account information.",
                ),
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void refresh();
    }, [role]);

    async function createMunicipality(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaving(true);
        setError("");
        setMessage("");

        try {
            const response = await api.post<ApiResponse<Municipality>>(
                "/admin/municipalities",
                { name: municipalityName, province },
            );

            const municipality = response.data.data;
            setMunicipalities((current) => [...current, municipality]);
            setMunicipalityId(municipality.id);
            setMunicipalityName("");
            setProvince("");
            setMessage("Municipality created. You can now assign an LGU Authority.");
        } catch (requestError) {
            setError(
                getApiErrorMessage(requestError, "Unable to create municipality."),
            );
        } finally {
            setSaving(false);
        }
    }

    async function createBarangay(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaving(true);
        setError("");
        setMessage("");

        try {
            await api.post<ApiResponse<Barangay>>("/admin/barangays", {
                municipality_id: municipalityId,
                name: barangayName,
            });
            setBarangayName("");
            setMessage("Barangay created and available in farmer profiles.");
        } catch (requestError) {
            setError(
                getApiErrorMessage(requestError, "Unable to create barangay."),
            );
        } finally {
            setSaving(false);
        }
    }

    async function createAccount(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaving(true);
        setError("");
        setMessage("");

        const payload = {
            ...form,
            middle_name: null,
            phone_number: form.phone_number || null,
            station: form.station || null,
            designation: form.designation || null,
        };

        try {
            const response = await api.post<ApiResponse<ManagedUser>>(
                role === "admin"
                    ? "/admin/lgu-authorities"
                    : "/lgu/encoders",
                role === "admin"
                    ? { ...payload, municipality_id: municipalityId }
                    : payload,
            );

            setAccounts((current) => [response.data.data, ...current]);
            setForm(emptyAccountForm);
            setMessage(
                role === "admin"
                    ? "LGU Authority account created successfully."
                    : "LGU Encoder account created successfully.",
            );
        } catch (requestError) {
            setError(
                getApiErrorMessage(
                    requestError,
                    "Unable to create the account.",
                ),
            );
        } finally {
            setSaving(false);
        }
    }

    const accountLabel = role === "admin" ? "LGU Authority" : "LGU Encoder";

    return (
        <section className="panel operations-panel account-management-panel">
            <div className="panel-header">
                <div>
                    <h2>{accountLabel} accounts</h2>
                    <p>
                        {role === "admin"
                            ? "Create municipal offices and assign an LGU Authority to each one."
                            : "Create Encoders for your municipality. Their municipality is assigned automatically."}
                    </p>
                </div>
            </div>

            {role === "admin" && (
                <form className="operation-form" onSubmit={createMunicipality}>
                    <h3>Add municipality</h3>
                    <div className="form-grid">
                        <Field
                            label="Municipality"
                            value={municipalityName}
                            onChange={(event) =>
                                setMunicipalityName(event.target.value)
                            }
                            required
                        />
                        <Field
                            label="Province"
                            value={province}
                            onChange={(event) => setProvince(event.target.value)}
                            required
                        />
                    </div>
                    <button className="secondary-button" disabled={saving}>
                        Create municipality
                    </button>
                </form>
            )}

            {role === "admin" && municipalities.length > 0 && (
                <form className="operation-form" onSubmit={createBarangay}>
                    <h3>Add barangay</h3>
                    <div className="form-grid">
                        <label className="field">
                            <span>Municipality</span>
                            <select
                                value={municipalityId}
                                onChange={(event) =>
                                    setMunicipalityId(event.target.value)
                                }
                                required
                            >
                                {municipalities.map((municipality) => (
                                    <option
                                        key={municipality.id}
                                        value={municipality.id}
                                    >
                                        {municipality.name}, {municipality.province}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <Field
                            label="Barangay name"
                            value={barangayName}
                            onChange={(event) =>
                                setBarangayName(event.target.value)
                            }
                            required
                        />
                    </div>
                    <button className="secondary-button" disabled={saving}>
                        Create barangay
                    </button>
                </form>
            )}

            <form className="operation-form" onSubmit={createAccount}>
                <h3>Create {accountLabel}</h3>
                <div className="form-grid">
                    <Field
                        label="First name"
                        value={form.first_name}
                        onChange={(event) =>
                            setForm({ ...form, first_name: event.target.value })
                        }
                        required
                    />
                    <Field
                        label="Last name"
                        value={form.last_name}
                        onChange={(event) =>
                            setForm({ ...form, last_name: event.target.value })
                        }
                        required
                    />
                    <Field
                        label="Email"
                        type="email"
                        value={form.email}
                        onChange={(event) =>
                            setForm({ ...form, email: event.target.value })
                        }
                        required
                    />
                    <Field
                        label="Phone number"
                        type="tel"
                        value={form.phone_number}
                        onChange={(event) =>
                            setForm({ ...form, phone_number: event.target.value })
                        }
                    />
                    {role === "admin" && (
                        <label className="field">
                            <span>Municipality</span>
                            <select
                                value={municipalityId}
                                onChange={(event) =>
                                    setMunicipalityId(event.target.value)
                                }
                                required
                            >
                                <option value="">Select municipality</option>
                                {municipalities.map((municipality) => (
                                    <option
                                        key={municipality.id}
                                        value={municipality.id}
                                    >
                                        {municipality.name}, {municipality.province}
                                    </option>
                                ))}
                            </select>
                        </label>
                    )}
                    <Field
                        label="Station"
                        value={form.station}
                        onChange={(event) =>
                            setForm({ ...form, station: event.target.value })
                        }
                    />
                    <Field
                        label="Designation"
                        value={form.designation}
                        onChange={(event) =>
                            setForm({ ...form, designation: event.target.value })
                        }
                    />
                    <Field
                        label="Temporary password"
                        type="password"
                        minLength={8}
                        value={form.password}
                        onChange={(event) =>
                            setForm({ ...form, password: event.target.value })
                        }
                        required
                    />
                    <Field
                        label="Confirm password"
                        type="password"
                        minLength={8}
                        value={form.password_confirmation}
                        onChange={(event) =>
                            setForm({
                                ...form,
                                password_confirmation: event.target.value,
                            })
                        }
                        required
                    />
                </div>
                <button
                    className="primary-button button-fit"
                    disabled={
                        saving ||
                        loading ||
                        (role === "admin" && municipalities.length === 0)
                    }
                >
                    Create {accountLabel}
                </button>
            </form>

            {error && <div className="operation-message error-message">{error}</div>}
            {message && <div className="operation-message">{message}</div>}

            <div className="managed-user-list">
                <h3>Existing {accountLabel} accounts</h3>
                {loading ? (
                    <p className="muted">Loading accounts...</p>
                ) : accounts.length === 0 ? (
                    <p className="muted">No {accountLabel.toLowerCase()} accounts yet.</p>
                ) : (
                    accounts.map((account) => (
                        <div className="managed-user-row" key={account.id}>
                            <span className="avatar avatar-lgu">
                                {account.first_name[0]}
                                {account.last_name[0]}
                            </span>
                            <span>
                                <strong>
                                    {account.first_name} {account.last_name}
                                </strong>
                                <small>
                                    {account.email}
                                    {account.lgu_officer_profile?.municipality
                                        ? ` · ${account.lgu_officer_profile.municipality.name}`
                                        : ""}
                                </small>
                            </span>
                            <span className={`status status-${account.status}`}>
                                {account.status}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
