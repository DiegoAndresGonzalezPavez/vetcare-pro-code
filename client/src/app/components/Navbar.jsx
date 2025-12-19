'use client';

import Link from 'next/link';
import { useState } from 'react';
import CartIcon from '@/components/tienda/CartIcon';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-blue-600 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="font-bold text-xl">
            VetCare Pro
          </Link>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/dashboard" className="hover:text-blue-100">
              Dashboard
            </Link>
            <Link href="/citas" className="hover:text-blue-100">
              Citas
            </Link>
            <Link href="/mascotas" className="hover:text-blue-100">
              Mascotas
            </Link>
            <Link href="/clientes" className="hover:text-blue-100">
              Clientes
            </Link>
            <Link href="/tienda" className="hover:text-blue-100">
              Tienda
            </Link>
            <CartIcon />
            <Link
              href="/login"
              className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50"
            >
              Login
            </Link>
          </div>

          {/* Menu Mobile */}
          <div className="md:hidden flex items-center gap-4">
            <CartIcon />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 hover:bg-blue-700 rounded"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              href="/dashboard"
              className="block py-2 px-4 hover:bg-blue-700 rounded"
            >
              Dashboard
            </Link>
            <Link
              href="/citas"
              className="block py-2 px-4 hover:bg-blue-700 rounded"
            >
              Citas
            </Link>
            <Link
              href="/mascotas"
              className="block py-2 px-4 hover:bg-blue-700 rounded"
            >
              Mascotas
            </Link>
            <Link
              href="/clientes"
              className="block py-2 px-4 hover:bg-blue-700 rounded"
            >
              Clientes
            </Link>
            <Link
              href="/tienda"
              className="block py-2 px-4 hover:bg-blue-700 rounded"
            >
              Tienda
            </Link>
            <Link
              href="/login"
              className="block py-2 px-4 hover:bg-blue-700 rounded"
            >
              Login
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
