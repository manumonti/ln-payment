"use client";

import { CreateInvoiceModal } from "@/components/application/create-invoice-modal";
import { InvoiceList } from "@/components/application/invoice-list";
import { NodeHeader } from "@/components/application/node-header";
import { PageFooter } from "@/components/application/page-footer";
import { useState } from "react";

export interface Invoice {
    amount: number;
    creationDate: string;
    expiry: string;
    memo: string;
    paymentRequest: string;
    rHash: string;
    status: string;
}

export default function ReceiverPage() {
    const [token, setToken] = useState<string | null>(null);
    const [invoices, setInvoices] = useState<Invoice[]>([]);

    const handleInvoiceCreated = (invoice: Invoice) => {
        setInvoices((prev) => [...prev, invoice]);
    };

    return (
        <div className="flex h-dvh flex-col bg-primary">
            <NodeHeader setToken={setToken} />
            <main className="flex-1 overflow-y-auto px-4 py-8 md:px-8">
                <div className="mx-auto max-w-7xl">
                    {/* Page Header */}
                    <div className="mb-8 flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-primary mb-2">
                                Receive Payment
                            </h1>
                            <p className="text-sm text-secondary">
                                Create invoices to receive Lightning payments
                            </p>
                        </div>
                        <CreateInvoiceModal
                            onInvoiceCreated={handleInvoiceCreated}
                            token={token}
                        />
                    </div>

                    {/* Invoice List */}
                    <InvoiceList invoices={invoices} />
                </div>
            </main>
            <PageFooter />
        </div>
    );
}
