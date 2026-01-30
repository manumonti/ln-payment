"use client";

import {
    LndConnectionData,
    NodeHeader,
} from "@/components/application/node-header";
import { Payment } from "@/components/application/payment-element";
import { PaymentList } from "@/components/application/payment-list";
import { PaymentLookup } from "@/components/application/payment-lookup";
import { SendPaymentModal } from "@/components/application/send-payment-modal";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function ReceiverPage() {
    // a little help to debug the app
    const lndConnectionData: LndConnectionData = {
        host: process.env.NEXT_PUBLIC_BOB_HOST || "",
        cert: process.env.NEXT_PUBLIC_BOB_CERT || "",
        macaroon: process.env.NEXT_PUBLIC_BOB_MACAROON || "",
    };

    const [token, setToken] = useState<string | null>(null);
    const [payments, setPayments] = useState<Payment[]>([]);

    const handlePaymentSent = (payment: Payment) => {
        // Refresh the payments list from the backend
        getPayments();
    };

    const getPayments = async () => {
        try {
            const response = await fetch(
                "http://localhost:3000/api/transactions",
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to get invoices");
            }

            const data = await response.json();

            // data includes all transactions: invoices + payments
            const dataFiltered = data.filter(
                (transaction: any) => transaction.type === "payment",
            );

            const paymentsRetrieved = dataFiltered.map((pay: any) => {
                const creationDate = (
                    new Date(pay.creation_date).getTime() / 1000
                ).toString();

                let status: "Completed" | "Pending" | "Failed";
                switch (pay.status) {
                    case 2:
                        status = "Completed";
                        break;
                    case 3:
                        status = "Failed";
                        break;
                    default:
                        status = "Pending";
                }

                const payment: Payment = {
                    amount: pay.value,
                    creationDate,
                    memo: pay.memo,
                    paymentRequest: pay.payment_request,
                    rHash: pay.payment_hash,
                    status,
                    paymentPreImage: pay.payment_preimage,
                    source: pay.source,
                    destination: pay.destination,
                };
                return payment;
            });

            setPayments(paymentsRetrieved);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        getPayments();

        const socket = io("http://localhost:3000");
        socket.on("invoice-paid", () => {
            getPayments();
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div className="flex h-dvh flex-col bg-primary">
            <NodeHeader
                connectionData={lndConnectionData}
                setToken={setToken}
            />
            <main className="flex-1 overflow-y-auto px-4 py-8 md:px-8">
                <div className="mx-auto max-w-7xl">
                    {/* Page Header */}
                    <div className="mb-8 flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-primary mb-2">
                                Send Payment
                            </h1>
                            <p className="text-sm text-secondary">
                                Pay Lightning invoices by entering a payment
                                request
                            </p>
                        </div>
                        <SendPaymentModal
                            onPaymentSent={handlePaymentSent}
                            token={token}
                        />
                    </div>

                    {/* Payment Lookup Section */}
                    <PaymentLookup />

                    {/* Payment List */}
                    <PaymentList payments={payments} />
                </div>
            </main>
        </div>
    );
}
