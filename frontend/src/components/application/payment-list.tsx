"use client";

import { Payment } from "@/components/application/payment-element";
import { Zap } from "@untitledui/icons";
import { PaymentElement } from "./payment-element";

export const PaymentList = ({ payments }: { payments: Payment[] }) => {
    if (payments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="mb-6 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 p-6">
                    <Zap className="size-12 text-violet-600 dark:text-violet-400" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">
                    No payments yet
                </h3>
                <p className="text-sm text-secondary text-center max-w-md">
                    Make your first payment to start sending BTC through the
                    Lightning Network
                </p>
            </div>
        );
    }

    // Sort payments by creation date in descending order (newest first)
    const sortedPayments = [...payments].sort((a, b) => {
        return parseInt(b.creationDate) - parseInt(a.creationDate);
    });

    return (
        <div>
            {/* Section Header */}
            <div className="mb-6">
                <h2 className="text-xl font-bold text-primary mb-1">
                    Payments List
                </h2>
            </div>

            {/* Invoice Items */}
            <div className="space-y-4">
                {sortedPayments.map((payment, index) => (
                    <PaymentElement
                        key={payment.rHash}
                        payment={payment}
                        index={index}
                    />
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
        </div>
    );
};
