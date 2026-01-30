"use client";

import {
    Dialog,
    DialogTrigger,
    Modal,
    ModalOverlay,
} from "@/components/application/modals/modal";
import { Payment } from "@/components/application/payment-element";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { X } from "@untitledui/icons";
import { useState } from "react";
import { decode } from "light-bolt11-decoder";

interface SendPaymentModalProps {
    onPaymentSent: (payment: Payment) => void;
    token: string | null;
}

interface DecodedData {
    amount: number | null;
    creationDate: Date | null;
    description: string | null;
    expiryDate: Date | null;
    paymentHash: string | null;
}

export const SendPaymentModal = ({
    onPaymentSent,
    token,
}: SendPaymentModalProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [paymentRequest, setPaymentRequest] = useState("");
    const [decodedData, setDecodedData] = useState<DecodedData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDecode = () => {
        try {
            const decoded = decode(paymentRequest);
            const amountSection = decoded.sections.find(
                (section) => section.name === "amount",
            );
            const amount = amountSection
                ? parseInt(amountSection.value) / 1000
                : null;
            const dateSection = decoded.sections.find(
                (section) => section.name === "timestamp",
            );
            const creationDate = dateSection
                ? new Date(dateSection.value * 1000)
                : null;
            const descriptionSection = decoded.sections.find(
                (section) => section.name === "description",
            );
            const description = descriptionSection
                ? descriptionSection.value
                : null;
            const expirySection = decoded.sections.find(
                (section) => section.name === "expiry",
            );
            const expiryDate =
                expirySection && creationDate
                    ? new Date(
                          creationDate.getTime() + expirySection.value * 1000,
                      )
                    : null;
            const paymentHashSection = decoded.sections.find(
                (section) => section.name === "payment_hash",
            );
            const paymentHash = paymentHashSection
                ? paymentHashSection.value
                : null;

            setDecodedData({
                amount,
                creationDate,
                description,
                expiryDate,
                paymentHash,
            });
            setError(null);
        } catch (err) {
            setDecodedData(null);
            setError(err instanceof Error ? err.message : "An error occurred");
        }
    };

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!token) {
            setError("No token found");
            return;
        }

        try {
            setIsLoading(true);
            decode(paymentRequest);

            console.log(paymentRequest);
            const response = await fetch("http://localhost:3000/api/payment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Token": token,
                },
                body: JSON.stringify({
                    paymentRequest,
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create invoice");
            }

            const data = await response.json();
            onPaymentSent(data.paymentHash);

            console.log(data.paymentHash);

            // Reset form and close modal
            setError(null);
            setDecodedData(null);
            setPaymentRequest("");
            setIsOpen(false);
        } catch (err) {
            console.log(err);
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setIsOpen(false);
            setPaymentRequest("");
            setDecodedData(null);
            setError(null);
        }
    };

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
            <Button color="primary" size="lg" isDisabled={!token}>
                Send payment
            </Button>
            <ModalOverlay>
                <Modal isDismissable={!isLoading}>
                    <Dialog>
                        <div className="relative w-full max-w-md rounded-2xl border border-secondary bg-primary p-6 shadow-2xl">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-primary mb-1">
                                        Send payment
                                    </h2>
                                    <p className="text-sm text-secondary">
                                        Send a payment to a Lightning Network
                                        invoice
                                    </p>
                                </div>
                                <button
                                    onClick={handleClose}
                                    disabled={isLoading}
                                    className="rounded-lg p-2 text-secondary transition-colors hover:bg-secondary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Close"
                                >
                                    <X className="size-5" />
                                </button>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                                    <p className="text-sm text-red-600 dark:text-red-400">
                                        {error}
                                    </p>
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Payment Request Input */}
                                <Input
                                    label="Payment Request"
                                    placeholder="Enter invoice's payment request"
                                    type="text"
                                    value={paymentRequest}
                                    onChange={setPaymentRequest}
                                    isRequired
                                    isDisabled={isLoading}
                                    size="md"
                                />

                                {/* Decode Button */}
                                <Button
                                    type="button"
                                    color="secondary"
                                    size="md"
                                    onClick={handleDecode}
                                    className="w-full"
                                >
                                    Decode
                                </Button>

                                {decodedData && (
                                    <div className="rounded-xl border border-secondary bg-secondary/50 p-5 space-y-4 backdrop-blur-sm">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-semibold text-primary">
                                                Payment Details
                                            </h3>
                                            <span className="inline-flex items-center rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand">
                                                Decoded
                                            </span>
                                        </div>

                                        <div className="space-y-3 text-sm">
                                            {/* Amount */}
                                            {decodedData.amount !== null && (
                                                <div className="flex items-start justify-between gap-4 pb-3 border-b border-secondary">
                                                    <span className="text-tertiary font-medium">
                                                        Amount
                                                    </span>
                                                    <span className="text-lg font-bold text-primary tabular-nums">
                                                        {decodedData.amount.toLocaleString()}{" "}
                                                        <span className="text-sm font-normal text-secondary">
                                                            sats
                                                        </span>
                                                    </span>
                                                </div>
                                            )}

                                            {/* Description */}
                                            {decodedData.description && (
                                                <div className="space-y-1.5">
                                                    <span className="block text-tertiary font-medium">
                                                        Description
                                                    </span>
                                                    <p className="text-primary leading-relaxed">
                                                        {
                                                            decodedData.description
                                                        }
                                                    </p>
                                                </div>
                                            )}

                                            {/* Payment Hash */}
                                            {decodedData.paymentHash && (
                                                <div className="space-y-1.5">
                                                    <span className="block text-tertiary font-medium">
                                                        Payment Hash
                                                    </span>
                                                    <div className="rounded-lg bg-primary/50 px-3 py-2 font-mono text-xs text-primary break-all border border-secondary">
                                                        {
                                                            decodedData.paymentHash
                                                        }
                                                    </div>
                                                </div>
                                            )}

                                            {/* Timestamps */}
                                            <div className="grid grid-cols-2 gap-3 pt-2">
                                                {decodedData.creationDate && (
                                                    <div className="space-y-1">
                                                        <span className="block text-tertiary text-xs font-medium">
                                                            Created
                                                        </span>
                                                        <p className="text-primary text-sm tabular-nums">
                                                            {decodedData.creationDate.toLocaleString(
                                                                undefined,
                                                                {
                                                                    month: "short",
                                                                    day: "numeric",
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                },
                                                            )}
                                                        </p>
                                                    </div>
                                                )}
                                                {decodedData.expiryDate && (
                                                    <div className="space-y-1">
                                                        <span className="block text-tertiary text-xs font-medium">
                                                            Expires
                                                        </span>
                                                        <p className="text-primary text-sm tabular-nums">
                                                            {decodedData.expiryDate.toLocaleString(
                                                                undefined,
                                                                {
                                                                    month: "short",
                                                                    day: "numeric",
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                },
                                                            )}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        color="secondary"
                                        size="lg"
                                        onClick={handleClose}
                                        isDisabled={isLoading}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        color="primary"
                                        size="lg"
                                        isDisabled={isLoading}
                                        className="flex-1"
                                    >
                                        {isLoading ? "Sending..." : "Send"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
};
