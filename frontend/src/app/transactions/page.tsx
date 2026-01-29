"use client";

import { Badge } from "@/components/base/badges/badges";
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
                            transactions.map((tx) => (
                                <div
                                    key={tx.id}
                                    className="group relative rounded-xl border border-secondary bg-primary p-6 shadow-sm transition-all hover:shadow-md hover:border-brand-primary/50"
                                >
                                    {/* Transaction Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <Badge type="modern" size="md">
                                                {tx.type}
                                            </Badge>
                                            <Badge type="modern" size="md">
                                                {tx.status
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    tx.status.slice(1)}
                                            </Badge>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-medium text-tertiary uppercase tracking-wide mb-1">
                                                Amount
                                            </p>
                                            <p className="text-2xl font-bold text-brand-primary">
                                                {tx.amount.toLocaleString()}{" "}
                                                <span className="text-sm font-medium">
                                                    sats
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Transaction Hash */}
                                    <div className="mb-4">
                                        <p className="text-xs font-medium text-tertiary uppercase tracking-wide mb-2">
                                            Hash
                                        </p>
                                        <code className="block rounded-md bg-secondary px-3 py-2 font-mono text-xs text-primary break-all">
                                            {tx.hash}
                                        </code>
                                    </div>

                                    {/* Transaction Details Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-secondary">
                                        <div>
                                            <p className="text-xs font-medium text-tertiary uppercase tracking-wide mb-1">
                                                Memo
                                            </p>
                                            <p className="text-sm text-primary">
                                                {tx.memo || "No memo"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-tertiary uppercase tracking-wide mb-1">
                                                Date
                                            </p>
                                            <p className="text-sm text-secondary">
                                                {formatDate(tx.date)}
                                            </p>
                                        </div>
                                        {tx.source && (
                                            <div>
                                                <p className="text-xs font-medium text-tertiary uppercase tracking-wide mb-1">
                                                    Source
                                                </p>
                                                <p className="text-sm text-primary font-mono break-all">
                                                    {tx.source}
                                                </p>
                                            </div>
                                        )}
                                        {tx.destination && (
                                            <div>
                                                <p className="text-xs font-medium text-tertiary uppercase tracking-wide mb-1">
                                                    Destination
                                                </p>
                                                <p className="text-sm text-primary font-mono break-all">
                                                    {tx.destination}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
