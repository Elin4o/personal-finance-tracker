"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";

function DashboardContent() {
  return <main className="min-h-screen p-6"></main>;
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
