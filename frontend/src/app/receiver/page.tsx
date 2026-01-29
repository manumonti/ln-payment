"use client";

import { NodeHeader } from "@/components/application/node-header";
import { PageFooter } from "@/components/application/page-footer";

export default function ReceiverPage() {
    return (
        <div className="flex h-dvh flex-col">
            <NodeHeader />
            <PageFooter />
        </div>
    );
}
