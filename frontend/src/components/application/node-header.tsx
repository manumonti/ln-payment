"use client";

import type { FC } from "react";
import { Badge } from "@/components/base/badges/badges";

interface NodeHeaderProps {
    nodeAlias: string;
    nodePublicKey: string;
}

export const NodeHeader: FC<NodeHeaderProps> = ({
    nodeAlias,
    nodePublicKey,
}) => {
    return (
        <header className="w-full border-b border-secondary bg-primary">
            <div className="flex h-16 items-center justify-between px-4 md:h-18 md:px-8">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-secondary">
                        Connected to:
                    </span>
                    <Badge color="gray" type="modern" size="md">
                        {nodeAlias}
                    </Badge>
                    <code className="rounded-md bg-secondary px-2 py-1 font-mono text-xs text-tertiary">
                        {nodePublicKey}
                    </code>
                </div>
            </div>
        </header>
    );
};
