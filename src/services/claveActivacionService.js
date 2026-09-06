import axiosClient from "./axiosClient";

const ENDPOINT = "/api/claves";

export const claveActivacionService = {
  guardar: async (dto) => {
    const response = await axiosClient.post(
      ENDPOINT,
      dto
    );

    return response.data;
  },

  contarStock: async (productoId) => {
    const response = await axiosClient.get(
      `${ENDPOINT}/producto/${productoId}/stock`
    );

    return response.data;
  },
};