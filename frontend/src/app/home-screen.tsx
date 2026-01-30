"use client";

import {
    ArrowNarrowRight,
    ArrowsDown,
    ArrowsUp,
    LineChartUp02,
    Zap,
} from "@untitledui/icons";
import Link from "next/link";

interface NavCardProps {
    title: string;
    description: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    gradient: string;
    iconBg: string;
}

const NavCard = ({
    title,
    description,
    href,
    icon: Icon,
    gradient,
    iconBg,
}: NavCardProps) => {
    return (
        <Link href={href} className="group block">
            <div
                className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${gradient} p-8 shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}
            >
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Animated border glow */}
                <div className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:shadow-[inset_0_0_20px_rgba(255,255,255,0.1)]" />

                <div className="relative">
                    {/* Icon */}
                    <div
                        className={`mb-6 inline-flex items-center justify-center rounded-xl ${iconBg} p-4 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                    >
                        <Icon className="size-8 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="mb-2 text-2xl font-bold text-white">
                        {title}
                    </h3>
                    <p className="mb-4 text-sm leading-relaxed text-white/70">
                        {description}
                    </p>

                    {/* Arrow indicator */}
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                        <span>Go to {title}</span>
                        <ArrowNarrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                </div>
            </div>
        </Link>
    );
};

export const HomeScreen = () => {
    const navCards: NavCardProps[] = [
        {
            title: "Receiver",
            description:
                "Create and manage Lightning invoices to receive payments instantly",
            href: "/receiver",
            icon: ArrowsDown,
            gradient: "from-emerald-600 via-teal-600 to-cyan-600",
            iconBg: "bg-emerald-500",
        },
        {
            title: "Sender",
            description:
                "Pay Lightning invoices and send instant payments across the network",
            href: "/sender",
            icon: ArrowsUp,
            gradient: "from-violet-600 via-purple-600 to-fuchsia-600",
            iconBg: "bg-violet-500",
        },
        {
            title: "Transactions",
            description:
                "View your complete transaction history and payment details",
            href: "/transactions",
            icon: LineChartUp02,
            gradient: "from-blue-600 via-indigo-600 to-purple-600",
            iconBg: "bg-blue-500",
        },
        {
            title: "Balances",
            description:
                "Monitor your wallet balances and channel capacity in real-time",
            href: "/balance",
            icon: Zap,
            gradient: "from-amber-600 via-orange-600 to-red-600",
            iconBg: "bg-amber-500",
        },
    ];

    return (
        <div className="relative flex min-h-dvh flex-col overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -left-1/4 -top-1/4 size-1/2 animate-pulse rounded-full bg-violet-500/20 blur-3xl" />
                <div className="absolute -right-1/4 -bottom-1/4 size-1/2 animate-pulse rounded-full bg-emerald-500/20 blur-3xl [animation-delay:1s]" />
                <div className="absolute left-1/2 top-1/2 size-1/3 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-blue-500/20 blur-3xl [animation-delay:2s]" />
            </div>

            {/* Grid pattern overlay */}
            <div
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                                     linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
                    backgroundSize: "50px 50px",
                }}
            />

            {/* Content */}
            <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-16 md:px-8">
                {/* Hero section */}
                <div className="mb-16 text-center">
                    {/* Lightning icon */}
                    <div className="mb-6 inline-flex items-center justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 animate-ping rounded-full bg-violet-500/50 blur-xl" />
                            <div className="relative flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/50">
                                <Zap className="size-10 text-white" />
                            </div>
                        </div>
                    </div>

                    <h1 className="mb-4 bg-gradient-to-r from-white via-violet-100 to-white bg-clip-text text-5xl font-bold text-transparent md:text-6xl">
                        Lightning Network
                    </h1>
                    <h2 className="mb-4 text-3xl font-semibold text-white/90 md:text-4xl">
                        Payment Hub
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg leading-relaxed text-white/60">
                        Manage your Lightning Network payments with ease. Send
                        and receive instant, low-fee Bitcoin payments across the
                        network.
                    </p>
                </div>

                {/* Navigation cards */}
                <div className="grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
                    {navCards.map((card) => (
                        <NavCard key={card.title} {...card} />
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
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
