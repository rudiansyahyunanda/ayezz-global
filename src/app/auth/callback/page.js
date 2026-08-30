'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { getCurrentUser, syncUserToDatabase, loginAdminWithEmailPassword } from '../../../lib/authService';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      try {
        const user = await getCurrentUser();
        if (user && user.email) {
          const cleanEmail = user.email.toLowerCase();
          await syncUserToDatabase(user);

          if (cleanEmail === 'shahrirwan93@gmail.com' || cleanEmail === 'admin@ayezz.com') {
            await loginAdminWithEmailPassword(cleanEmail, 'Ayezz');
            router.push('/admin');
          } else {
            router.push('/katalog');
          }
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error('Error handling auth callback:', err);
        router.push('/login');
      }
    }
    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4 text-center p-6 select-none">
      <RefreshCw className="w-8 h-8 text-[#111111] animate-spin" />
      <div className="space-y-1">
        <h3 className="text-lg font-black uppercase text-[#111111]">
          Pengesahan Akaun Google Selesai
        </h3>
        <p className="text-xs text-neutral-500 font-mono">
          Menyambungkan akaun anda ke portal AYEZZ GLOBAL...
        </p>
      </div>
    </div>
  );
}
