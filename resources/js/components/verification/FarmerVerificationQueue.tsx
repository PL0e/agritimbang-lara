import { useEffect, useState } from "react";

import { getApiErrorMessage } from "../../services/auth";
import api from "../../services/api";
import type { ApiResponse } from "../../types";

type VerificationDocument = {
    id: string;
    document_type: string;
    created_at: string;
    status: "pending" | "approved" | "rejected";
};

type PendingFarmer = {
    id: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    email: string;
    created_at: string;
    verification_status: "unverified" | "pending" | "verified" | "rejected";
    farmer_profile?: {
        address?: string | null;
        municipality?: { name: string; province: string };
        barangay?: { name: string };
    } | null;
    verification_documents: VerificationDocument[];
};

type Paginated<T> = {
    data: T[];
};

type ReviewDocument = {
    farmer: PendingFarmer;
    document: VerificationDocument;
    previewUrl: string;
    contentType: string;
};

export default function FarmerVerificationQueue() {
    const [farmers, setFarmers] = useState<PendingFarmer[]>([]);
    const [review, setReview] = useState<ReviewDocument | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [loading, setLoading] = useState(true);
    const [working, setWorking] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    async function refresh() {
        setLoading(true);
        setError("");

        try {
            const response = await api.get<
                ApiResponse<Paginated<PendingFarmer>>
            >("/lgu/farmers");

            setFarmers(response.data.data.data);
        } catch (requestError) {
            setError(
                getApiErrorMessage(
                    requestError,
                    "Unable to load farmer accounts for your municipality.",
                ),
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void refresh();
    }, []);

    useEffect(() => {
        return () => {
            if (review) URL.revokeObjectURL(review.previewUrl);
        };
    }, [review]);

    async function openDocument(
        farmer: PendingFarmer,
        document: VerificationDocument,
    ) {
        setError("");

        try {
            const response = await api.get<Blob>(
                `/lgu/verification-documents/${document.id}/file`,
                { responseType: "blob" },
            );

            setReview({
                farmer,
                document,
                previewUrl: URL.createObjectURL(response.data),
                contentType: String(
                    response.headers["content-type"] || response.data.type || "",
                ),
            });
            setRejectionReason("");
        } catch (requestError) {
            setError(
                getApiErrorMessage(
                    requestError,
                    "Unable to open this verification document.",
                ),
            );
        }
    }

    async function decide(approved: boolean) {
        if (!review) return;

        setWorking(true);
        setError("");
        setMessage("");

        try {
            const endpoint = `/lgu/verification-documents/${review.document.id}`;

            if (approved) {
                await api.post(`${endpoint}/approve`);
            } else {
                await api.post(`${endpoint}/reject`, {
                    rejection_reason: rejectionReason,
                });
            }

            setMessage(
                approved
                    ? "Farmer verification approved."
                    : "Farmer verification returned for correction.",
            );
            setReview(null);
            await refresh();
        } catch (requestError) {
            setError(
                getApiErrorMessage(
                    requestError,
                    "Unable to update this verification.",
                ),
            );
        } finally {
            setWorking(false);
        }
    }

    const pendingCount = farmers.reduce(
        (count, farmer) =>
            count +
            farmer.verification_documents.filter(
                (document) => document.status === "pending",
            ).length,
        0,
    );

    return (
        <>
            <section className="panel verification-panel">
                <div className="panel-header">
                    <div>
                        <h2>Farmers in your municipality</h2>
                        <p>
                            Registered farmers with a saved profile for your
                            municipality. Review documents when submitted.
                        </p>
                    </div>
                    <span className="pending-count">
                        {farmers.length} farmers · {pendingCount} pending
                    </span>
                </div>

                {loading ? (
                    <p className="muted">Loading farmer accounts...</p>
                ) : farmers.length === 0 ? (
                    <p className="muted">
                        No farmer accounts are assigned to this municipality yet.
                        Farmers appear here after saving a profile with your
                        municipality selected.
                    </p>
                ) : (
                    farmers.map((farmer) => {
                        const name = [
                            farmer.first_name,
                            farmer.middle_name,
                            farmer.last_name,
                        ]
                            .filter(Boolean)
                            .join(" ");
                        const location = [
                            farmer.farmer_profile?.address,
                            farmer.farmer_profile?.barangay?.name,
                            farmer.farmer_profile?.municipality?.name,
                            farmer.farmer_profile?.municipality?.province,
                        ]
                            .filter(Boolean)
                            .join(", ");
                        const document =
                            farmer.verification_documents.find(
                                (item) => item.status === "pending",
                            ) ?? farmer.verification_documents[0];
                        const statusLabel =
                            farmer.verification_status === "verified"
                                ? "Verified"
                                : farmer.verification_status === "rejected"
                                  ? "Returned"
                                  : farmer.verification_status === "pending"
                                    ? "Pending review"
                                    : "Not submitted";
                        const statusClass =
                            farmer.verification_status === "verified"
                                ? "verified"
                                : farmer.verification_status === "rejected"
                                  ? "returned"
                                  : "pending";

                        return (
                            <div className="verification-row" key={farmer.id}>
                                <span className="avatar avatar-farmer">
                                    {farmer.first_name[0]}
                                    {farmer.last_name[0]}
                                </span>
                                <span className="verification-user">
                                    <strong>{name}</strong>
                                    <small>
                                        {farmer.email}
                                        {location ? ` · ${location}` : ""}
                                    </small>
                                </span>
                                <span className="document-file">
                                    <strong>
                                        {document
                                            ? document.document_type.replaceAll("_", " ")
                                            : "No document submitted"}
                                    </strong>
                                    <small>
                                        {document
                                            ? `Submitted ${new Date(document.created_at).toLocaleDateString()}`
                                            : `Registered ${new Date(farmer.created_at).toLocaleDateString()}`}
                                    </small>
                                </span>
                                <span className={`status status-${statusClass}`}>
                                    {statusLabel}
                                </span>
                                {document?.status === "pending" ? (
                                    <button
                                        type="button"
                                        className="view-document-button"
                                        onClick={() =>
                                            void openDocument(farmer, document)
                                        }
                                    >
                                        Review document
                                    </button>
                                ) : (
                                    <span className="muted">No action needed</span>
                                )}
                            </div>
                        );
                    })
                )}

                {error && (
                    <div className="operation-message error-message">{error}</div>
                )}
                {message && <div className="operation-message">{message}</div>}
            </section>

            {review && (
                <div
                    className="modal-backdrop"
                    role="presentation"
                    onMouseDown={() => setReview(null)}
                >
                    <section
                        className="document-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="farmer-document-title"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <div className="modal-header">
                            <div>
                                <div className="eyebrow">Farmer verification</div>
                                <h2 id="farmer-document-title">
                                    {review.farmer.first_name} {review.farmer.last_name}
                                </h2>
                                <p>{review.farmer.email}</p>
                            </div>
                            <button
                                type="button"
                                className="modal-close"
                                aria-label="Close document preview"
                                onClick={() => setReview(null)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="document-preview">
                            {review.contentType.includes("pdf") ? (
                                <iframe
                                    src={review.previewUrl}
                                    title="Farmer verification PDF"
                                />
                            ) : review.contentType.startsWith("image/") ? (
                                <img
                                    src={review.previewUrl}
                                    alt="Farmer verification document"
                                />
                            ) : (
                                <p className="muted">
                                    This file type cannot be previewed in the
                                    browser.
                                </p>
                            )}
                        </div>
                        <label className="field">
                            <span>Reason if returning this document</span>
                            <textarea
                                value={rejectionReason}
                                onChange={(event) =>
                                    setRejectionReason(event.target.value)
                                }
                                maxLength={1000}
                                rows={3}
                            />
                        </label>
                        {error && (
                            <div className="operation-message error-message">
                                {error}
                            </div>
                        )}
                        <div className="modal-actions">
                            <button
                                type="button"
                                className="return-button"
                                disabled={working || !rejectionReason.trim()}
                                onClick={() => void decide(false)}
                            >
                                Return for correction
                            </button>
                            <button
                                type="button"
                                className="primary-button button-fit"
                                disabled={working}
                                onClick={() => void decide(true)}
                            >
                                Approve farmer
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </>
    );
}
