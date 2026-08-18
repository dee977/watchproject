import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser, hasAdminAccess } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionUser();

  if (!session || !hasAdminAccess(session.role)) {
    redirect('/login?redirect=/admin');
  }

  return (
    <div className="min-h-screen bg-obsidian-950 text-gray-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <AdminSidebar userRole={session.role} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          user={{
            id: session.userId,
            name: session.name,
            email: session.email,
            role: session.role,
          }}
        />

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
}
