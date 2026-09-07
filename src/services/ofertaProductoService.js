import axiosClient from "./axiosClient";

const ENDPOINT = "/api/ofertas-productos";

export const ofertaProductoService = {
  getAll: async () => {
    const response = await axiosClient.get(
      ENDPOINT
    );

    return response.data;
  },

  getById: async (id) => {
    const response = await axiosClient.get(
      `${ENDPOINT}/${id}`
    );

    return response.data;
  },

  create: async (dto) => {
    const response = await axiosClient.post(
      ENDPOINT,
      dto
    );

    return response.data;
  },

  delete: async (id) => {
    const response = await axiosClient.delete(
      `${ENDPOINT}/${id}`
    );

    return response.data;
  },
};