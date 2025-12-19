'use client';

import { useCartStore } from '@/stores/cartStore';

export default function CartItem({ item }) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg shadow-md">
      <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
        {item.imagen_url ? (
          <img
            src={item.imagen_url}
            alt={item.nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300">
            <span className="text-gray-500 text-xs">Sin imagen</span>
          </div>
        )}
      </div>
      
      <div className="flex-1">
        <h3 className="font-semibold text-gray-800">{item.nombre}</h3>
        <p className="text-gray-600 text-sm">${parseFloat(item.precio).toLocaleString('es-CL')}</p>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
          <button
            onClick={() => updateQuantity(item.id, item.cantidad - 1)}
            className="px-3 py-1 hover:bg-gray-100"
          >
            −
          </button>
          <span className="px-3 py-1">{item.cantidad}</span>
          <button
            onClick={() => updateQuantity(item.id, item.cantidad + 1)}
            className="px-3 py-1 hover:bg-gray-100"
          >
            +
          </button>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-gray-600">Subtotal</p>
          <p className="font-semibold text-blue-600">
            ${(item.precio * item.cantidad).toLocaleString('es-CL')}
          </p>
        </div>

        <button
          onClick={() => removeItem(item.id)}
          className="text-red-600 hover:text-red-700 text-sm font-medium"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
