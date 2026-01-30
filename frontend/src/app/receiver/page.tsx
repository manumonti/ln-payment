"use client";

import { CreateInvoiceModal } from "@/components/application/create-invoice-modal";
import { Invoice } from "@/components/application/invoice-element";
import { InvoiceList } from "@/components/application/invoice-list";
import { InvoiceLookup } from "@/components/application/invoice-lookup";
import {
    LndConnectionData,
    NodeHeader,
} from "@/components/application/node-header";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function ReceiverPage() {
    // a little help to debug the app
    const lndConnectionData: LndConnectionData = {
        host: process.env.NEXT_PUBLIC_ALICE_HOST || "",
        cert: process.env.NEXT_PUBLIC_ALICE_CERT || "",
        macaroon: process.env.NEXT_PUBLIC_ALICE_MACAROON || "",
    };
    const [token, setToken] = useState<string | null>(null);
    const [invoices, setInvoices] = useState<Invoice[]>([]);

    const handleInvoiceCreated = (invoice: Invoice) => {
        // Refresh the invoice list from the backend
        getInvoices();
    };

    const getInvoices = async () => {
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
                (transaction: any) => transaction.type === "invoice",
            );

            const invoicesRetrieved = dataFiltered.map((inv: any) => {
                const creationDate = (
                    new Date(inv.creation_date).getTime() / 1000
                ).toString();
                const settleDate = inv.settle_date
                    ? (new Date(inv.settle_date).getTime() / 1000).toString()
                    : null;
                const invoice: Invoice = {
                    amount: inv.amount,
                    creationDate: creationDate,
                    expiry: inv.expiry,
                    memo: inv.memo,
                    paymentRequest: inv.payment_request,
                    rHash: inv.hash,
                    status: inv.settled ? "Completed" : "Pending",
                    settleDate: settleDate,
                };
                return invoice;
            });

            setInvoices(invoicesRetrieved);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        getInvoices();

        const socket = io("http://localhost:3000");
        socket.on("invoice-paid", () => {
            getInvoices();
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

                    {/* Invoice Lookup Section */}
                    <InvoiceLookup />

                    {/* Invoice List */}
                    <InvoiceList invoices={invoices} />
                </div>
            </main>
        </div>
    );
}
