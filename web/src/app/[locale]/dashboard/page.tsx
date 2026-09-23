"use client";

import { useAuth } from "@/providers/auth-provider";
import { ProtectedRoute } from "@/components/auth/protected-route";

function DashboardContent() {
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <header>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="mt-2 text-gray-500">Welcome back, {user?.email}.</p>
        </header>

        <button
          type="button"
          onClick={logout}
          className="rounded-md border px-4 py-2 text-sm"
        >
          Sign out
        </button>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border p-5">
            <p className="text-sm text-gray-500">Total balance</p>
            <p className="mt-2 text-2xl font-semibold">€0.00</p>
          </div>

          <div className="rounded-xl border p-5">
            <p className="text-sm text-gray-500">Income</p>
            <p className="mt-2 text-2xl font-semibold">€0.00</p>
          </div>

          <div className="rounded-xl border p-5">
            <p className="text-sm text-gray-500">Expenses</p>
            <p className="mt-2 text-2xl font-semibold">€0.00</p>
          </div>

          <div className="rounded-xl border p-5">
            <p className="text-sm text-gray-500">Loans</p>
            <p className="mt-2 text-2xl font-semibold">€0.00</p>
          </div>
        </section>

        <section className="rounded-xl border p-6">
          <h2 className="text-xl font-semibold">Recent activity</h2>
          <p className="mt-2 text-sm text-gray-500">
            Your recent transactions will appear here.
          </p>
        </section>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
