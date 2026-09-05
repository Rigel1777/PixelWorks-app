import axiosClient from "./axiosClient";

const catalogoService = (endpoint) => ({
  // Obtener todos los registros
  getAll: async () => {
    const response = await axiosClient.get(endpoint);
    return response.data;
  },

  // Obtener un registro por ID
  getById: async (id) => {
    const response = await axiosClient.get(`${endpoint}/${id}`);
    return response.data;
  },

  // Crear un registro
  create: async (dto) => {
    const response = await axiosClient.post(endpoint, dto);
    return response.data;
  },

  // Actualizar un registro
  update: async (id, dto) => {
    const response = await axiosClient.put(`${endpoint}/${id}`, dto);
    return response.data;
  },

  // Eliminar un registro
  delete: async (id) => {
    const response = await axiosClient.delete(`${endpoint}/${id}`);
    return response.data;
  },
});

export default catalogoService;