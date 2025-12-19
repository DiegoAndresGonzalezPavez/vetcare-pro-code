'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PortalClientePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('clientToken');
    
    if (token) {
      router.push('/portal-cliente/dashboard-cliente');
    } else {
      router.push('/portal-cliente/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}