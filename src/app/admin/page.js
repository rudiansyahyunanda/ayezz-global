'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AdminDashboard from '../../components/admin/AdminDashboard';

export default function AdminPage() {
  const router = useRouter();

  return (
    <AdminDashboard
      onSwitchToStorefront={() => router.push('/')}
    />
  );
}
