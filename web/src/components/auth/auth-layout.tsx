import { ReactNode } from "react";
import { Wallet } from "lucide-react";

export function AuthLayout({
  headline,
  subtext,
  children,
}: {
  headline: string;
  subtext: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      <div className="flex items-center gap-2 border-b px-6 py-5 text-sm font-medium text-foreground lg:hidden">
        <Wallet className="size-5 text-primary" />
        <span>Fiscora</span>
      </div>

      <div className="relative hidden w-[44%] flex-col overflow-hidden bg-[oklch(0.18_0.04_260)] p-[clamp(2rem,4vw,4.5rem)] text-slate-100 lg:flex">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
          <Wallet className="size-5" />
          <span>Fiscora</span>
        </div>

        <div className="flex flex-1 flex-col justify-center">
          <div className="max-w-[clamp(24rem,32vw,36rem)]">
            <h1 className="text-[clamp(2.25rem,2.6vw+1rem,4.25rem)] font-semibold leading-[1.12] tracking-tight text-white">
              {headline}
            </h1>
            <p className="mt-[clamp(0.75rem,1vw,1.25rem)] text-[clamp(0.9375rem,0.6vw+0.75rem,1.125rem)] leading-relaxed text-slate-400">
              {subtext}
            </p>
          </div>

          <TrendChart />
        </div>
      </div>

      <div
        className="relative flex flex-1 items-center justify-center px-6 py-12"
        style={{
          backgroundColor: "#f8fafc",
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(148, 163, 184, 0.55) 0px, rgba(148, 163, 184, 0.55) 1px, transparent 1px, transparent 40px)",
          backgroundSize: "100% 40px",
        }}
      >
        <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white/70 px-8 py-10 shadow-sm ring-1 ring-slate-900/5 backdrop-blur-md">
          {children}
        </div>
      </div>
    </main>
  );
}

function TrendChart() {
  return (
    <div className="mt-[clamp(2.5rem,4vh,4.5rem)] flex items-end gap-4">
      <svg
        viewBox="0 0 320 120"
        className="h-auto w-full max-w-[clamp(20rem,28vw,34rem)] text-emerald-400"
        fill="none"
      >
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0 96 C 32 90, 48 100, 70 84 C 92 68, 104 76, 128 62 C 152 48, 164 54, 188 38 C 212 22, 228 30, 256 18 C 278 8, 296 14, 320 2 V 120 H 0 Z"
          fill="url(#trendFill)"
        />
        <path
          d="M0 96 C 32 90, 48 100, 70 84 C 92 68, 104 76, 128 62 C 152 48, 164 54, 188 38 C 212 22, 228 30, 256 18 C 278 8, 296 14, 320 2"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="pb-1 font-mono text-xs text-slate-500">30d</span>
    </div>
  );
}
