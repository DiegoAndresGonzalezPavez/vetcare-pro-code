'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useCartStore } from '@/stores/cartStore';
import Link from 'next/link';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ProductoPage() {
  const params = useParams();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/productos/${params.id}`);
        setProducto(response.data);
      } catch (error) {
        console.error('Error al cargar producto:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProducto();
    }
  }, [params.id]);

  const handleAddToCart = () => {
    for (let i = 0; i < cantidad; i++) {
      addItem({
        id: producto.id,
        nombre: producto.nombre,
        precio: parseFloat(producto.precio),
        imagen_url: producto.imagen_url,
        descripcion: producto.descripcion,
      });
    }
    // Redirigir al carrito
    window.location.href = '/tienda/carrito';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Producto no encontrado</p>
        <Link href="/tienda" className="text-blue-600 hover:text-blue-700">
          Volver a la tienda
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/tienda" className="text-blue-600 hover:text-blue-700 mb-6">
          ← Volver a la tienda
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-lg shadow-md p-8">
          {/* Imagen */}
          <div className="bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center min-h-96">
            {producto.imagen_url ? (
              <img
                src={producto.imagen_url}
                alt={producto.nombre}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-500">Sin imagen disponible</span>
            )}
          </div>

          {/* Detalles */}
          <div className="flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {producto.nombre}
              </h1>
              <p className="text-2xl text-blue-600 font-bold mb-4">
                ${parseFloat(producto.precio).toLocaleString('es-CL')}
              </p>
              <p className="text-gray-600 mb-6">{producto.descripcion}</p>

              {producto.stock && (
                <p className="text-sm text-gray-600 mb-4">
                  Stock disponible: {producto.stock}
                </p>
              )}
            </div>

            {/* Compra */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 border border-gray-300 rounded-lg w-fit p-2">
                <button
                  onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                  className="px-4 py-2 hover:bg-gray-100"
                >
                  −
                </button>
                <span className="px-6 py-2 font-semibold">{cantidad}</span>
                <button
                  onClick={() => setCantidad(cantidad + 1)}
                  className="px-4 py-2 hover:bg-gray-100"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
