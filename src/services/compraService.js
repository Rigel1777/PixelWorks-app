import axiosClient from "./axiosClient";

export const compraService = {
  procesarCheckout: async (carrito, metodoPagoId) => {
    const payload = {
      metodoPagoId: Number(metodoPagoId),
      items: carrito.map((item) => ({
        productoId: item.id,
        cantidad: item.cantidad || 1,
      })),
    };

    const response = await axiosClient.post("/api/compras", payload);

    return response.data;
  },

  obtenerMisCompras: async () => {
    const response = await axiosClient.get("/api/compras/mis-juegos");
    return response.data;
  },
};