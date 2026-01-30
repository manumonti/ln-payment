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

interface SendPaymentModalProps {
    onPaymentMade: (payment: Payment) => void;
    token: string | null;
}

export const SendPaymentModal = ({
    onPaymentMade,
    token,
}: SendPaymentModalProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [paymentRequest, setPaymentRequest] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDecode = () => {
        console.log(paymentRequest);
    };

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        // // Validation
        // const amountNum = parseInt(amount);
        // if (!amount || isNaN(amountNum) || amountNum <= 0) {
        //     setError("Please enter a valid amount greater than 0");
        //     return;
        // }
        // if (!token) {
        //     setError("No token found");
        //     return;
        // }
        // try {
        //     setIsLoading(true);
        //     const response = await fetch("http://localhost:3000/api/invoice", {
        //         method: "POST",
        //         headers: {
        //             "Content-Type": "application/json",
        //             "X-Token": token,
        //         },
        //         body: JSON.stringify({
        //             amount: amountNum,
        //             memo,
        //         }),
        //     });
        //     if (!response.ok) {
        //         const errorData = await response.json();
        //         throw new Error(errorData.error || "Failed to create invoice");
        //     }
        //     const data = await response.json();
        //     const invoice: Invoice = {
        //         amount: data.amount,
        //         creationDate: data.creationDate,
        //         expiry: data.expiry,
        //         memo: data.memo,
        //         paymentRequest: data.paymentRequest,
        //         rHash: data.rHash,
        //         status: "Pending",
        //     };
        //     onInvoiceCreated(invoice);
        //     // Reset form and close modal
        //     setAmount("");
        //     setMemo("");
        //     setIsOpen(false);
        // } catch (err) {
        //     setError(err instanceof Error ? err.message : "An error occurred");
        // } finally {
        //     setIsLoading(false);
        // }
    };

    const handleClose = () => {
        if (!isLoading) {
            setIsOpen(false);
            setPaymentRequest("");
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
                                    // isDisabled={
                                    //     isLoading ||
                                    //     isDecoding ||
                                    //     !paymentRequest.trim()
                                    // }
                                    className="w-full"
                                >
                                    Decode
                                </Button>

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
