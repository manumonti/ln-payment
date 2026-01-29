"use client";

import { HomeScreen } from "../home-screen";
import { NodeHeader } from "@/components/application/node-header";

export default function ReceiverPage() {
    // TODO: Replace with actual node data from your backend
    const nodeAlias = "alice";
    const nodePublicKey = "02a1b2c3d4e5f6...";

    return (
        <div className="flex h-dvh flex-col">
            <NodeHeader nodeAlias={nodeAlias} nodePublicKey={nodePublicKey} />
            <div className="flex-1 overflow-auto">
                <HomeScreen />
            </div>
        </div>
    );
}
