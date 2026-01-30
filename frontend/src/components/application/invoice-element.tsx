"use client";

import { QRCode } from "@/components/shared-assets/qr-code";
import { Check, Copy01 as Copy, Zap } from "@untitledui/icons";
import { useState } from "react";

export interface Invoice {
    amount: number;
    creationDate: string;
    expiry: string;
    memo: string;
    paymentRequest: string;
    rHash: string;
    status: "Completed" | "Pending" | "Expired";
    settleDate?: string | null;
}

export const InvoiceElement = ({
    invoice,
    index,
}: {
    invoice: Invoice;
    index: number;
}) => {
    const [copiedItem, setCopiedItem] = useState<string | null>(null);
    const copyToClipboard = async (text: string, itemId: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedItem(itemId);
            setTimeout(() => setCopiedItem(null), 2000);
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

    const calculateExpTimestamp = (creationDate: string, expiry: string) => {
        const expiryDate = parseInt(creationDate) + parseInt(expiry);
        return expiryDate.toString();
    };

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat("en-US").format(amount);
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
    return (
        <div
            className="group relative overflow-hidden rounded-2xl border border-secondary bg-primary p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-violet-500/50 hover:-translate-y-1"
            style={{
                animation: `fadeIn 0.4s ease-out ${index * 0.1}s both`,
            }}
        >
            {/* Gradient Background Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center size-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
                            <Zap className="size-6 text-white" />
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600 dark:text-blue-400 mb-0.5 block">
                                Invoice
                            </span>
                            <h3 className="font-bold text-primary text-xl">
                                {formatAmount(invoice.amount)} sats
                            </h3>
                            <p className="text-xs text-secondary">
                                {formatDate(invoice.creationDate)}
                            </p>
                        </div>
                    </div>
                    <span
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(
                            invoice.status,
                        )}`}
                    >
                        {invoice.status}
                    </span>
                </div>

                {/* Memo */}
                {invoice.memo && (
                    <div className="mb-4 p-4 rounded-xl bg-secondary/30 border border-secondary/50">
                        <p className="text-sm text-secondary">
                            <span className="font-semibold text-primary">
                                Memo:{" "}
                            </span>
                            {invoice.memo}
                        </p>
                    </div>
                )}

                {/* Hash */}
                <div className="mb-4">
                    <label className="text-xs font-semibold text-secondary uppercase tracking-wide mb-2 block">
                        Hash
                    </label>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 overflow-hidden rounded-lg border border-secondary bg-secondary/30 px-4 py-3">
                            <code className="text-xs text-secondary font-mono break-all">
                                {invoice.rHash}
                            </code>
                        </div>
                        <button
                            onClick={() =>
                                copyToClipboard(invoice.rHash, "hash")
                            }
                            className="flex items-center justify-center size-11 rounded-lg border border-secondary bg-primary text-secondary transition-all duration-200 hover:bg-violet-500 hover:text-white hover:border-violet-500 hover:scale-105"
                            aria-label="Copy hash"
                        >
                            {copiedItem === "hash" ? (
                                <Check className="size-4" />
                            ) : (
                                <Copy className="size-4" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Payment Request */}
                <div className="mb-4">
                    <label className="text-xs font-semibold text-secondary uppercase tracking-wide mb-2 block">
                        Payment Request
                    </label>
                    <div className="flex items-stretch gap-4">
                        {/* Left side: Payment Request text and copy button */}
                        <div className="flex-1 flex items-center gap-2">
                            <div className="flex-1 overflow-hidden rounded-lg border border-secondary bg-secondary/30 px-4 py-3">
                                <code className="text-xs text-secondary font-mono break-all">
                                    {invoice.paymentRequest}
                                </code>
                            </div>
                            <button
                                onClick={() =>
                                    copyToClipboard(
                                        invoice.paymentRequest,
                                        "payment-request",
                                    )
                                }
                                className="flex items-center justify-center size-11 rounded-lg border border-secondary bg-primary text-secondary transition-all duration-200 hover:bg-violet-500 hover:text-white hover:border-violet-500 hover:scale-105"
                                aria-label="Copy payment request"
                            >
                                {copiedItem === "payment-request" ? (
                                    <Check className="size-4" />
                                ) : (
                                    <Copy className="size-4" />
                                )}
                            </button>
                        </div>

                        {/* Right side: QR Code */}
                        <div className="flex items-center justify-center rounded-xl border border-secondary bg-secondary/30 p-2">
                            {/* QR Code are formatted in uppercase generally */}
                            <QRCode
                                value={invoice.paymentRequest.toUpperCase()}
                                size="md"
                            />
                        </div>
                    </div>
                </div>

                {/* Expiry Info / Settle Info */}
                <div className="pt-4 border-t border-secondary/50">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-tertiary mb-1">
                                Created
                            </p>
                            <p className="text-sm font-medium text-primary">
                                {formatDate(invoice.creationDate)}
                            </p>
                        </div>
                        {invoice.settleDate ? (
                            <div>
                                <p className="text-xs text-tertiary mb-1">
                                    Paid
                                </p>
                                <p className="text-sm font-medium text-primary">
                                    {formatDate(invoice.settleDate)}
                                </p>
                            </div>
                        ) : (
                            <div>
                                <p className="text-xs text-tertiary mb-1">
                                    Expires
                                </p>
                                <p className="text-sm font-medium text-primary">
                                    {formatDate(
                                        calculateExpTimestamp(
                                            invoice.creationDate,
                                            invoice.expiry,
                                        ),
                                    )}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
