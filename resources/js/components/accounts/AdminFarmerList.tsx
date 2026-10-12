import { useEffect, useState } from "react";

import api from "../../services/api";
import { getApiErrorMessage } from "../../services/auth";
import type { ApiResponse } from "../../types";

type FarmerAccount = {
    id: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    email: string;
    status: "active" | "inactive" | "suspended";
    verification_status: "unverified" | "pending" | "verified" | "rejected";
    created_at: string;
    profile: {
        address: string | null;
        barangay: string | null;
        municipality: string | null;
        province: string | null;
    } | null;
    latest_document: {
        type: string;
        status: "pending" | "approved" | "rejected";
        submitted_at: string;
    } | null;
};

type Paginated<T> = { data: T[] };

export default function AdminFarmerList() {
    const [farmers, setFarmers] = useState<FarmerAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingFarmerId, setUpdatingFarmerId] = useState("");

    useEffect(() => {
        async function loadFarmers() {
            try {
                const response = await api.get<
                    ApiResponse<Paginated<FarmerAccount>>
                >("/admin/farmers");
                setFarmers(response.data.data.data);
            } catch (requestError) {
                setError(
                    getApiErrorMessage(
                        requestError,
                        "Unable to load farmer accounts.",
                    ),
                );
            } finally {
                setLoading(false);
            }
        }

        void loadFarmers();
    }, []);

    async function toggleFarmerStatus(farmer: FarmerAccount) {
        const status = farmer.status === "active" ? "inactive" : "active";
        setUpdatingFarmerId(farmer.id);
        setError("");

        try {
            const response = await api.patch<ApiResponse<{ status: FarmerAccount["status"] }>>(
                `/admin/farmers/${farmer.id}/status`,
                { status },
            );
            setFarmers((current) =>
                current.map((item) =>
                    item.id === farmer.id
                        ? { ...item, status: response.data.data.status }
                        : item,
                ),
            );
        } catch (requestError) {
            setError(
                getApiErrorMessage(
                    requestError,
                    "Unable to update farmer account status.",
                ),
            );
        } finally {
            setUpdatingFarmerId("");
        }
    }

    return (
        <section className="panel registration-queue">
            <div className="panel-header">
                <div>
                    <h2>Registered farmer accounts</h2>
                    <p>
                        View registration, verification, and saved location.
                        Farmer approval remains with the assigned LGU Authority.
                    </p>
                </div>
                <span className="pending-count">{farmers.length} shown</span>
            </div>

            {loading ? (
                <p className="muted">Loading farmer accounts...</p>
            ) : error ? (
                <div className="operation-message error-message">{error}</div>
            ) : farmers.length === 0 ? (
                <p className="muted">No farmer accounts have registered yet.</p>
            ) : (
                <div className="managed-user-list">
                    {farmers.map((farmer) => {
                        const name = [
                            farmer.first_name,
                            farmer.middle_name,
                            farmer.last_name,
                        ]
                            .filter(Boolean)
                            .join(" ");
                        const location = farmer.profile
                            ? [
                                  farmer.profile.address,
                                  farmer.profile.barangay,
                                  farmer.profile.municipality,
                                  farmer.profile.province,
                              ]
                                  .filter(Boolean)
                                  .join(", ")
                            : "Profile not completed";
                        const verificationLabel =
                            farmer.verification_status === "unverified"
                                ? "Not submitted"
                                : farmer.verification_status;
                        const statusClass =
                            farmer.verification_status === "verified"
                                ? "verified"
                                : farmer.verification_status === "rejected"
                                  ? "returned"
                                  : "pending";

                        return (
                            <div className="managed-user-row" key={farmer.id}>
                                <span className="avatar avatar-farmer">
                                    {farmer.first_name[0]}
                                    {farmer.last_name[0]}
                                </span>
                                <span>
                                    <strong>{name}</strong>
                                    <small>{farmer.email} · {location}</small>
                                </span>
                                <span className={`status status-${statusClass}`}>
                                    {verificationLabel}
                                </span>
                                <small>
                                    Registered {new Date(
                                        farmer.created_at,
                                    ).toLocaleDateString()}
                                </small>
                                <span className={`status status-${farmer.status}`}>
                                    {farmer.status}
                                </span>
                                <button
                                    className="row-action"
                                    type="button"
                                    disabled={updatingFarmerId === farmer.id}
                                    onClick={() => void toggleFarmerStatus(farmer)}
                                >
                                    {updatingFarmerId === farmer.id
                                        ? "Updating..."
                                        : farmer.status === "active"
                                          ? "Deactivate"
                                          : "Activate"}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}