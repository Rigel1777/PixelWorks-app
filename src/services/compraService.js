import axiosClient from "./axiosClient";

export const compraService = {
  procesarCheckout: async (carrito, metodoPagoId = 1) => {
    const payload = {
      metodoPagoId: metodoPagoId, 
      items: carrito.map(item => ({
        productoId: item.id,
        cantidad: 1 
      }))
    };
    const response = await axiosClient.post("/api/compras", payload);
    return response.data;
  },

  obtenerMisCompras: async () => {
    const response = await axiosClient.get("/api/compras/mis-compras");
    return response.data;
  }
};