import { createContext, useContext, useState, useEffect, useRef } from "react";
import { Toast } from "primereact/toast";
import { compraService } from "../services/compraService";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [carrito, setCarrito] = useState(() => {
    const guardado = localStorage.getItem("pixelworks_carrito");
    return guardado ? JSON.parse(guardado) : [];
  });
  
  const [estaProcesando, setEstaProcesando] = useState(false);
  const toast = useRef(null);

  // Guardar cambios del carrito en localStorage automáticamente
  useEffect(() => {
    localStorage.setItem("pixelworks_carrito", JSON.stringify(carrito));
  }, [carrito]);

  // 1. NUEVA FUNCIÓN: Agregar al carrito con control de stock y validación de existencia
  const agregarAlCarrito = (juego) => {
    toast.current?.clear();

    // Si el stock viene undefined, null o es menor/igual a 0, bloqueamos la entrada
    const stockDisponible = juego.stock ?? 0;

    const existe = carrito.find((item) => item.id === juego.id);
    if (existe) {
      toast.current?.show({
        severity: "info",
        summary: "Ya en el carrito",
        detail: "Modifica la cantidad desde tu carrito.",
        life: 2500,
      });
      return;
    }

    setCarrito([...carrito, { ...juego, cantidad: 1 }]);
    toast.current?.show({
      severity: "success",
      summary: "Agregado",
      detail: `${juego.nombre} se añadió al carrito.`,
      life: 2500,
    });
  };

  const actualizarCantidad = (id, nuevaCantidad) => {
    setCarrito((actual) =>
      actual.map((item) => {
        if (item.id === id) {
          const stockMaximo = item.stock ?? 0;

          if (stockMaximo <= 0) {
            toast.current?.show({
              severity: "error",
              summary: "Agotado",
              detail: `Lo sentimos, ya no quedan claves para ${item.nombre}.`,
              life: 3000,
            });
            return item;
          }

          if (nuevaCantidad > stockMaximo) {
            toast.current?.show({
              severity: "warn",
              summary: "Límite alcanzado",
              detail: `Solo hay ${stockMaximo} unidades disponibles en inventario.`,
              life: 3000,
            });
            return item; 
          }

          if (nuevaCantidad <= 0) return item; 
          return { ...item, cantidad: nuevaCantidad };
        }
        return item;
      })
    );
  };

  // 3. Funciones auxiliares (mantenlas como las tenías originalmente)
  const eliminarDelCarrito = (id) => {
    setCarrito((actual) => actual.filter((item) => item.id !== id));
  };

  const vaciarCarrito = () => {
    setCarrito([]);
  };

  const procesarPago = async () => {
    // Tu lógica actual para conectar con compraService
  };

  // Cálculo del precio total multiplicando precio por cantidad de cada ítem
  const total = carrito.reduce((suma, item) => {
    const precioFinal = item.precioConDescuento ?? item.precio;
    return suma + (Number(precioFinal) * item.cantidad);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        carrito,
        agregarAlCarrito,
        actualizarCantidad,
        eliminarDelCarrito,
        vaciarCarrito,
        procesarPago,
        estaProcesando,
        total,
      }}
    >
      {/* El componente Toast se queda aquí para escuchar las alertas del contexto */}
      <Toast ref={toast} position="bottom-right" />
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
