import React, { createContext, ReactNode, useContext, useState } from 'react';

export interface ProductoCarrito {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria?: string;
  stock: number;
  imagen_url?: string;
  cantidad: number;
  negocio_id?: number; // <-- Asegura que el producto en el carrito lleva negocio_id
}

interface CarritoContextType {
  productos: ProductoCarrito[];
  agregarProducto: (producto: ProductoCarrito) => void;
  quitarProducto: (id: number) => void;
  limpiarCarrito: () => void;
  neto: number;
  total: number;
}

const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

export const useCarrito = () => {
  const context = useContext(CarritoContext);
  if (!context) throw new Error('useCarrito debe usarse dentro de CarritoProvider');
  return context;
};

export const CarritoProvider = ({ children }: { children: ReactNode }) => {
  const [productos, setProductos] = useState<ProductoCarrito[]>([]);

  const agregarProducto = (producto: ProductoCarrito) => {
    setProductos(prev => {
      const existe = prev.find(p => p.id === producto.id);
      if (existe) {
        return prev.map(p => p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p);
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const quitarProducto = (id: number) => {
    setProductos(prev => prev.filter(p => p.id !== id));
  };

  const limpiarCarrito = () => setProductos([]);

  const neto = productos.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  const total = neto; // Aquí puedes sumar impuestos/envío si lo deseas

  return (
    <CarritoContext.Provider value={{ productos, agregarProducto, quitarProducto, limpiarCarrito, neto, total }}>
      {children}
    </CarritoContext.Provider>
  );
};
