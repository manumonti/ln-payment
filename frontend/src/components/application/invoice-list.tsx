"use client";

import { Invoice } from "@/components/application/invoice-element";
import { Zap } from "@untitledui/icons";
import { InvoiceElement } from "./invoice-element";

interface InvoiceListProps {
    invoices: Invoice[];
}

export const InvoiceList = ({ invoices }: InvoiceListProps) => {
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

    // Sort invoices by creation date in descending order (newest first)
    const sortedInvoices = [...invoices].sort((a, b) => {
        return parseInt(b.creationDate) - parseInt(a.creationDate);
    });

    return (
        <div className="space-y-4">
            {sortedInvoices.map((invoice, index) => (
                <InvoiceElement
                    key={invoice.rHash}
                    invoice={invoice}
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
    );
};
