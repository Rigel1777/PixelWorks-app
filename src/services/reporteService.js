import axiosClient from "./axiosClient";

const reporteService = {
  getVentasTotales: async () => {
    const response = await axiosClient.get("/api/reportes/ventas-totales");
    return response.data;
  },
};

export default reporteService;
