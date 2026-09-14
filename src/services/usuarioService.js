import axiosClient from "./axiosClient";

export const usuarioService = {


async listar() {
    const response = await axiosClient.get("/api/usuarios");
    return response.data;
},

async cambiarRol(idUsuario, idRol) {
    const response = await axiosClient.put(
        `/api/usuarios/${idUsuario}/rol`,
        {
            idRol
        }
    );

    return response.data;
}


};
