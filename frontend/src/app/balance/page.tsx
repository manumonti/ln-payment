"use client";

import { useEffect, useState } from "react";

interface BalanceData {
    invoicesAmount: number;
    paymentsAmount: number;
    balance: number;
}

export default function BalancePage() {
    const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getBalanceData = async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await fetch("http://localhost:3000/api/balance");
            if (!res.ok) {
                throw new Error("Failed to fetch balance");
            }

            const data = await res.json();

            setBalanceData({
                invoicesAmount: data.totalInvoices,
                paymentsAmount: data.totalPayments,
                balance: data.totalInvoices - data.totalPayments,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getBalanceData();
    }, []);

    const formatAmount = (amount: number) => {
        return amount.toLocaleString("en-US");
    };

    return (
        <div className="flex h-dvh flex-col bg-primary">
            <main className="flex-1 overflow-y-auto px-4 py-8 md:px-8">
                <div className="mx-auto max-w-7xl">
                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-primary mb-2">
                            Balance Overview
                        </h1>
                        <p className="text-sm text-secondary">
                            View your Lightning Network balance summary
                        </p>
                    </div>

                    {/* Error State */}
                    {error && (
                        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 mb-6">
                            <p className="text-sm text-red-600 dark:text-red-400">
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="flex items-center justify-center py-16">
                            <div className="flex flex-col items-center gap-4">
                                <div className="h-12 w-12 animate-spin rounded-full border-4 border-secondary border-t-brand-primary"></div>
                                <p className="text-sm text-secondary">
                                    Loading balance...
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Balance Cards */}
                    {!loading && balanceData && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Invoices Amount Card */}
                            <div className="group relative rounded-2xl border border-secondary bg-gradient-to-br from-orange-500/10 to-orange-600/5 p-8 shadow-lg transition-all hover:shadow-xl hover:border-orange-500/30">
                                <div className="relative z-10">
                                    <p className="text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wide mb-3">
                                        Total Invoices
                                    </p>
                                    <p className="text-4xl font-bold text-orange-700 dark:text-orange-300 mb-1">
                                        {formatAmount(
                                            balanceData.invoicesAmount,
                                        )}
                                    </p>
                                    <p className="text-sm font-medium text-orange-600/70 dark:text-orange-400/70">
                                        sats requested
                                    </p>
                                </div>
                            </div>

                            {/* Payments Amount Card */}
                            <div className="group relative rounded-2xl border border-secondary bg-gradient-to-br from-green-500/10 to-green-600/5 p-8 shadow-lg transition-all hover:shadow-xl hover:border-green-500/30">
                                <div className="relative z-10">
                                    <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide mb-3">
                                        Total Payments
                                    </p>
                                    <p className="text-4xl font-bold text-green-700 dark:text-green-300 mb-1">
                                        {formatAmount(
                                            balanceData.paymentsAmount,
                                        )}
                                    </p>
                                    <p className="text-sm font-medium text-green-600/70 dark:text-green-400/70">
                                        sats sent
                                    </p>
                                </div>
                            </div>

                            {/* Balance Card */}
                            <div className="group relative rounded-2xl border border-secondary bg-gradient-to-br p-8 shadow-lg transition-all hover:shadow-xl from-blue-500/10 to-blue-600/5 hover:border-blue-500/30">
                                <div className="relative z-10">
                                    <p className="text-xs font-medium uppercase tracking-wide mb-3 text-blue-600 dark:text-blue-400">
                                        Net Balance
                                    </p>
                                    <p className="text-4xl font-bold mb-1 text-blue-700 dark:text-blue-300">
                                        {formatAmount(balanceData.balance)}
                                    </p>
                                    <p className="text-sm font-medium text-blue-600/70 dark:text-blue-400/70">
                                        sats
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
