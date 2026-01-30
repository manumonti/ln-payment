"use client";

import {
    Payment,
    PaymentElement,
} from "@/components/application/payment-element";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { SearchLg } from "@untitledui/icons";
import { useState } from "react";

export const PaymentLookup = () => {
    const [paymentHash, setPaymentHash] = useState("");
    const [payment, setPayment] = useState<Payment | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLookup = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setError(null);
        setPayment(null);

        if (!paymentHash.trim()) {
            setError("Please enter a payment hash");
            return;
        }

        try {
            setIsLoading(true);

            const response = await fetch(
                `http://localhost:3000/api/payment/${paymentHash}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || "Failed to retrieve invoice",
                );
            }

            const data = await response.json();

            const creationDate = (
                new Date(data.creation_date).getTime() / 1000
            ).toString();
            let status: "Completed" | "Pending" | "Failed";
            switch (data.status) {
                case 2:
                    status = "Completed";
                    break;
                case 3:
                    status = "Failed";
                    break;
                default:
                    status = "Pending";
            }

            const retrievedPayment: Payment = {
                amount: data.value,
                creationDate,
                memo: data.memo,
                paymentRequest: data.payment_request,
                rHash: data.payment_hash,
                status,
                paymentPreImage: data.payment_preimage,
                source: data.source,
                destination: data.destination,
            };

            setPayment(retrievedPayment);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mb-8">
            {/* Section Header */}
            <div className="mb-4">
                <h2 className="text-xl font-bold text-primary mb-1">
                    Lookup Payment
                </h2>
                <p className="text-sm text-secondary">
                    Search for a payment using its payment hash
                </p>
            </div>

            {/* Search Form */}
            <form onSubmit={handleLookup} className="mb-6">
                <div className="flex gap-3">
                    <div className="flex-1">
                        <Input
                            placeholder="Enter payment hash"
                            type="text"
                            value={paymentHash}
                            onChange={setPaymentHash}
                            isDisabled={isLoading}
                            size="md"
                        />
                    </div>
                    <Button
                        type="submit"
                        color="primary"
                        size="lg"
                        isDisabled={isLoading}
                        className="px-8"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <span className="inline-block size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                Searching...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <SearchLg className="size-4" />
                                Lookup
                            </span>
                        )}
                    </Button>
                </div>
            </form>

            {/* Error Message */}
            {error && (
                <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                    <p className="text-sm text-red-600 dark:text-red-400">
                        {error}
                    </p>
                </div>
            )}

            {/* Payment Result */}
            {payment && <PaymentElement payment={payment} index={0} />}
        </div>
    );
};
