"use client";

export default function AppShell({ children }: { children: React.ReactNode }) {
  // No Navbar logic here if handled at layout level
  return (
    <main className="min-h-screen w-full flex flex-col">
      <div className="w-full">{children}</div>
    </main>
  );
}
