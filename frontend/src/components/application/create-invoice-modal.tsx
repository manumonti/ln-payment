"use client";

import { useState } from "react";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import {
    Dialog,
    DialogTrigger,
    Modal,
    ModalOverlay,
} from "@/components/application/modals/modal";
import { X } from "@untitledui/icons";
import { Invoice } from "@/components/application/invoice-element";

interface CreateInvoiceModalProps {
    onInvoiceCreated: (invoice: Invoice) => void;
    token: string | null;
}

export const CreateInvoiceModal = ({
    onInvoiceCreated,
    token,
}: CreateInvoiceModalProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [amount, setAmount] = useState("");
    const [memo, setMemo] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        // Validation
        const amountNum = parseInt(amount);
        if (!amount || isNaN(amountNum) || amountNum <= 0) {
            setError("Please enter a valid amount greater than 0");
            return;
        }

        if (!token) {
            setError("No token found");
            return;
        }

        try {
            setIsLoading(true);

            const response = await fetch("http://localhost:3000/api/invoice", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Token": token,
                },
                body: JSON.stringify({
                    amount: amountNum,
                    memo,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create invoice");
            }

            const data = await response.json();
            const invoice: Invoice = {
                amount: data.amount,
                creationDate: data.creationDate,
                expiry: data.expiry,
                memo: data.memo,
                paymentRequest: data.paymentRequest,
                rHash: data.rHash,
                status: "Pending",
            };
            onInvoiceCreated(invoice);

            // Reset form and close modal
            setAmount("");
            setMemo("");
            setIsOpen(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setIsOpen(false);
            setAmount("");
            setMemo("");
            setError(null);
        }
    };

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
            <Button color="primary" size="lg" isDisabled={token === null}>
                Create Invoice
            </Button>
            <ModalOverlay>
                <Modal isDismissable={!isLoading}>
                    <Dialog>
                        <div className="relative w-full max-w-md rounded-2xl border border-secondary bg-primary p-6 shadow-2xl">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-primary mb-1">
                                        Create Invoice
                                    </h2>
                                    <p className="text-sm text-secondary">
                                        Generate a Lightning Network payment
                                        request
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
                                {/* Amount Input */}
                                <Input
                                    label="Amount"
                                    placeholder="Enter amount in sats"
                                    type="number"
                                    value={amount}
                                    onChange={setAmount}
                                    isRequired
                                    isDisabled={isLoading}
                                    size="md"
                                />

                                {/* Memo Input */}
                                <Input
                                    label="Memo (Optional)"
                                    placeholder="Add a description"
                                    type="text"
                                    value={memo}
                                    onChange={setMemo}
                                    isDisabled={isLoading}
                                    size="md"
                                    maxLength={639}
                                />

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
                                        {isLoading
                                            ? "Creating..."
                                            : "Create Invoice"}
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
