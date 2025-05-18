import { ReactNode } from 'react';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/session/new?callbackUrl=/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-100">
        <main>
          {children}
        </main>
    </div>
  );
}