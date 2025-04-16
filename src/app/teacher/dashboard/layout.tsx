import React from 'react';
import { Metadata } from 'next';
import Sidebar from '@/components/teacher/sidebar';

export const metadata: Metadata = {
  title: 'Teacher Dashboard | School Management System',
  description: 'Teacher dashboard for managing student results',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-50 md:ml-64">
        <div className="container mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}