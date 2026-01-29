"use client";

import { Button } from "@/components/base/buttons/button";
import { useRouter } from "next/navigation";

export const PageFooter = () => {
    const router = useRouter();

    const handleTransactions = () => {
        router.push("/transactions");
    };

    const handleBalance = () => {
        router.push("/balance");
    };

    return (
        <footer className="w-full border-t border-secondary bg-primary mt-auto">
            <div className="flex h-20 items-center justify-center gap-4 px-4 md:px-8">
                <Button color="primary" size="lg" onClick={handleTransactions}>
                    Transactions
                </Button>
                <Button color="primary" size="lg" onClick={handleBalance}>
                    Balance
                </Button>
            </div>
        </footer>
    );
};
