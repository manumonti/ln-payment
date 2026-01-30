"use client";

import { Invoice } from "@/app/receiver/page";
import { Check, Copy01 as Copy, Zap } from "@untitledui/icons";
import { useState } from "react";

interface InvoiceListProps {
    invoices: Invoice[];
}

export const InvoiceList = ({ invoices }: InvoiceListProps) => {
    const [copiedHash, setCopiedHash] = useState<string | null>(null);

    console.log(invoices);

    const copyToClipboard = async (text: string, hash: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedHash(hash);
            setTimeout(() => setCopiedHash(null), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const formatDate = (timestamp: string) => {
        const date = new Date(parseInt(timestamp) * 1000);
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    };

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat("en-US").format(amount);
    };

    const calculateExpTimestamp = (creationDate: string, expiry: string) => {
        const expiryDate = parseInt(creationDate) + parseInt(expiry);
        return expiryDate.toString();
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "completed":
                return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
            case "pending":
                return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
            case "expired":
                return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20";
            default:
                return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
        }
    };

    if (invoices.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="mb-6 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 p-6">
                    <Zap className="size-12 text-violet-600 dark:text-violet-400" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">
                    No invoices yet
                </h3>
                <p className="text-sm text-secondary text-center max-w-md">
                    Create your first invoice to start receiving Lightning
                    Network payments
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {invoices.map((invoice, index) => (
                <div
                    key={invoice.rHash}
                    className="group relative overflow-hidden rounded-2xl border border-secondary bg-primary p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-violet-500/50 hover:-translate-y-1"
                    style={{
                        animation: `fadeIn 0.4s ease-out ${index * 0.1}s both`,
                    }}
                >
                    {/* Gradient Background Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="relative">
                        {/* Header Row */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
                                        <Zap className="size-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-primary text-lg">
                                            {formatAmount(invoice.amount)} sats
                                        </h3>
                                        <p className="text-xs text-secondary">
                                            {formatDate(invoice.creationDate)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                    invoice.status,
                                )}`}
                            >
                                {invoice.status}
                            </span>
                        </div>

                        {/* Memo */}
                        {invoice.memo && (
                            <div className="mb-4 p-3 rounded-lg bg-secondary/30">
                                <p className="text-sm text-secondary">
                                    <span className="font-medium text-primary">
                                        Memo:{" "}
                                    </span>
                                    {invoice.memo}
                                </p>
                            </div>
                        )}

                        {/* Payment Request */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-secondary uppercase tracking-wide">
                                Payment Request
                            </label>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 overflow-hidden rounded-lg border border-secondary bg-secondary/30 px-3 py-2">
                                    <code className="text-xs text-secondary font-mono break-all">
                                        {invoice.paymentRequest}
                                    </code>
                                </div>
                                <button
                                    onClick={() =>
                                        copyToClipboard(
                                            invoice.paymentRequest,
                                            invoice.rHash,
                                        )
                                    }
                                    className="flex items-center justify-center size-10 rounded-lg border border-secondary bg-primary text-secondary transition-all duration-200 hover:bg-violet-500 hover:text-white hover:border-violet-500 hover:scale-105"
                                    aria-label="Copy payment request"
                                >
                                    {copiedHash === invoice.rHash ? (
                                        <Check className="size-4" />
                                    ) : (
                                        <Copy className="size-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Hash */}
                        <div className="mt-3 flex items-center gap-2">
                            <span className="text-xs text-tertiary font-mono">
                                Hash: {invoice.rHash}
                            </span>
                            <button
                                onClick={() =>
                                    copyToClipboard(
                                        invoice.rHash,
                                        invoice.rHash,
                                    )
                                }
                                className="text-tertiary hover:text-secondary transition-colors"
                                aria-label="Copy hash"
                            >
                                {copiedHash === invoice.rHash ? (
                                    <Check className="size-3" />
                                ) : (
                                    <Copy className="size-3" />
                                )}
                            </button>
                        </div>

                        {/* Expiry Info */}
                        <div className="mt-3 pt-3 border-t border-secondary/50">
                            <p className="text-xs text-tertiary">
                                Expires:{" "}
                                {formatDate(
                                    calculateExpTimestamp(
                                        invoice.creationDate,
                                        invoice.expiry,
                                    ),
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            ))}

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};
