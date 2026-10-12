import { useEffect } from "react";

export default function SuccessDialog({
    title = "Created successfully",
    message,
    onClose,
}: {
    title?: string;
    message: string | null;
    onClose: () => void;
}) {
    useEffect(() => {
        if (!message) {
            return;
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                onClose();
            }
        }

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [message, onClose]);

    if (!message) {
        return null;
    }

    return (
        <div
            className="modal-backdrop"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <section
                className="success-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="success-dialog-title"
                aria-describedby="success-dialog-message"
            >
                <div className="success-dialog-mark" aria-hidden="true">✓</div>
                <h2 id="success-dialog-title">{title}</h2>
                <p id="success-dialog-message">{message}</p>
                <div className="modal-actions">
                    <button
                        className="primary-button button-fit"
                        type="button"
                        onClick={onClose}
                    >
                        OK
                    </button>
                </div>
            </section>
        </div>
    );
}
