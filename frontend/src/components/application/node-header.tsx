"use client";

import { Badge } from "@/components/base/badges/badges";
import { useState } from "react";
import { ConnectLndModal } from "./connect-lnd-modal";

interface NodeHeaderProps {
    setToken: (token: string | null) => void;
}

export const NodeHeader = ({ setToken }: NodeHeaderProps) => {
    const [alias, setAlias] = useState<string>("");
    const [pubKey, setPubKey] = useState<string>("");

    const handleConnect = (data: {
        host: string;
        cert: string;
        macaroon: string;
    }) => {
        fetch("http://localhost:3000/api/connect", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })
            .then((res) => res.json())
            .then((data) => {
                setAlias(data.alias);
                setPubKey(data.pubkey);
                setToken(data.token);
            })
            .catch((err) => console.log(err));
    };

    return (
        <header className="w-full border-b border-secondary bg-primary">
            <div className="flex h-16 items-center justify-between px-4 md:h-18 md:px-8">
                {alias && (
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-secondary">
                            Connected to:
                        </span>
                        <Badge color="gray" type="modern" size="md">
                            {alias}
                        </Badge>
                        <span className="text-sm font-medium text-secondary">
                            PubKey:
                        </span>
                        <code className="rounded-md bg-secondary px-2 py-1 font-mono text-xs text-tertiary">
                            {`${pubKey.slice(0, 6)}...${pubKey.slice(-6)}`}
                        </code>
                    </div>
                )}

                {/* Modal button on the right side */}
                <ConnectLndModal onConnect={handleConnect} />
            </div>
        </header>
    );
};
