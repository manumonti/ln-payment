"use client";

import { Badge } from "@/components/base/badges/badges";
import {
    InvoiceElement,
    Invoice,
} from "@/components/application/invoice-element";
import {
    PaymentElement,
    Payment,
} from "@/components/application/payment-element";
import { useEffect, useState } from "react";

interface Transaction {
    type: "Invoice" | "Payment";
    id: string;
    hash: string;
    amount: number;
    memo: string;
    status: "pending" | "completed" | "failed";
    date: Date;
    source?: string;
    destination?: string;
    paymentRequest?: string;
    expiry?: string;
    settleDate?: string;
    paymentPreImage?: string;
}

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[] | undefined>(
        undefined,
    );

    const formatDate = (date: Date) => {
        return date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getTransactions = async () => {
        const res = await fetch("http://localhost:3000/api/transactions");
        const data = await res.json();
        const formattedTransactions = data.map((tx: any) => {
            if (tx.type === "invoice") {
                return {
                    id: crypto.randomUUID(),
                    type: "Invoice",
                    hash: tx.hash,
                    amount: tx.amount,
                    memo: tx.memo,
                    status: tx.settled ? "completed" : "pending",
                    date: new Date(tx.creation_date),
                    paymentRequest: tx.payment_request || "",
                    expiry: tx.expiry || "3600",
                    settleDate: tx.settle_date,
                };
            } else if (tx.type === "payment") {
                let status: "pending" | "completed" | "failed";
                if (tx.status === 2) {
                    status = "completed";
                } else if (tx.status === 3) {
                    status = "failed";
                } else {
                    status = "pending";
                }
                return {
                    id: crypto.randomUUID(),
                    type: "Payment",
                    hash: tx.payment_hash,
                    amount: tx.value,
                    memo: tx.memo,
                    status: status,
                    date: new Date(tx.creation_date),
                    source: tx.source,
                    destination: tx.destination,
                    paymentRequest: tx.payment_request || "",
                    paymentPreImage: tx.payment_preimage || "",
                };
            }
        });
        // let's sort it chronologically
        formattedTransactions.sort(
            (a: Transaction, b: Transaction) =>
                b.date.getTime() - a.date.getTime(),
        );
        setTransactions(formattedTransactions);
    };

    useEffect(() => {
        getTransactions();
    }, []);

    return (
        <div className="flex h-dvh flex-col bg-primary">
            <main className="flex-1 overflow-y-auto px-4 py-8 md:px-8">
                <div className="mx-auto max-w-7xl">
                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-primary mb-2">
                            Transactions
                        </h1>
                        <p className="text-sm text-secondary">
                            View all your Lightning Network transactions
                        </p>
                    </div>

                    {/* Transactions List */}
                    <div className="space-y-4">
                        {transactions === undefined ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <p className="text-lg font-medium text-secondary mb-2">
                                    No transactions yet
                                </p>
                                <p className="text-sm text-tertiary">
                                    Your transactions will appear here
                                </p>
                            </div>
                        ) : (
                            transactions.map((tx, index) => {
                                if (tx.type === "Invoice") {
                                    // Map transaction data to Invoice interface
                                    const invoice: Invoice = {
                                        amount: tx.amount,
                                        creationDate: (
                                            tx.date.getTime() / 1000
                                        ).toString(),
                                        expiry: tx.expiry || "3600",
                                        memo: tx.memo,
                                        paymentRequest: tx.paymentRequest || "",
                                        rHash: tx.hash,
                                        status:
                                            tx.status === "completed"
                                                ? "Completed"
                                                : tx.status === "pending"
                                                  ? "Pending"
                                                  : "Expired",
                                        settleDate: tx.settleDate || null,
                                    };
                                    return (
                                        <InvoiceElement
                                            key={tx.id}
                                            invoice={invoice}
                                            index={index}
                                        />
                                    );
                                } else if (tx.type === "Payment") {
                                    // Map transaction data to Payment interface
                                    const payment: Payment = {
                                        amount: tx.amount,
                                        creationDate: (
                                            tx.date.getTime() / 1000
                                        ).toString(),
                                        memo: tx.memo,
                                        paymentRequest: tx.paymentRequest || "",
                                        rHash: tx.hash,
                                        status:
                                            tx.status === "completed"
                                                ? "Completed"
                                                : tx.status === "failed"
                                                  ? "Failed"
                                                  : "Pending",
                                        paymentPreImage:
                                            tx.paymentPreImage || "",
                                        source: tx.source || "",
                                        destination: tx.destination || "",
                                    };
                                    return (
                                        <PaymentElement
                                            key={tx.id}
                                            payment={payment}
                                            index={index}
                                        />
                                    );
                                }
                                return null;
                            })
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
