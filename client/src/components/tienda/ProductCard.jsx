'use client';

import Link from 'next/link';
import { useCartStore } from '@/stores/cartStore';

export default function ProductCard({ producto }) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem({
      id: producto.id,
      nombre: producto.nombre,
      precio: parseFloat(producto.precio),
      imagen_url: producto.imagen_url,
      descripcion: producto.descripcion,
    });
  };

  return (
    <Link href={`/tienda/producto/${producto.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden cursor-pointer">
        <div className="relative h-48 bg-gray-200 overflow-hidden">
          {producto.imagen_url ? (
            <img
              src={producto.imagen_url}
              alt={producto.nombre}
              className="w-full h-full object-cover hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-300">
              <span className="text-gray-500">Sin imagen</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-800 mb-2 truncate">
            {producto.nombre}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {producto.descripcion}
          </p>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-blue-600">
              ${parseFloat(producto.precio).toLocaleString('es-CL')}
            </span>
            <button
              onClick={handleAddToCart}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Agregar
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
