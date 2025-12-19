'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/stores/cartStore';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function PagoExitososContent() {
  const searchParams = useSearchParams();
  const [orden, setOrden] = useState(null);
  const [loading, setLoading] = useState(true);
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (sessionId) {
      clearCart();
      // Aquí puedes obtener los detalles de la orden si es necesario
      setLoading(false);
    }
  }, [searchParams, clearCart]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <svg
            className="w-16 h-16 mx-auto text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          ¡Pago exitoso!
        </h1>
        <p className="text-gray-600 mb-6">
          Tu orden ha sido confirmada. Recibirás un email con los detalles de tu compra.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-2">Número de sesión:</p>
          <p className="font-mono text-sm text-gray-800 break-all">
            {new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('session_id')}
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/tienda"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Continuar comprando
          </Link>
          <Link
            href="/portal-cliente/mis-facturas"
            className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold"
          >
            Ver mis compras
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function PagoExitososPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div></div>}>
      <PagoExitososContent />
    </Suspense>
  );
}
