import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axiosClient from "../services/axiosClient";
import { useAuth } from "./AuthContext";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);

  const {
    login,
    estaAutenticado,
  } = useAuth();

  const navigate = useNavigate();

  if (estaAutenticado) {
    return <Navigate to="/" replace />;
  }

  const manejarEnvio = async (evento) => {
    evento.preventDefault();

    setEnviando(true);

    try {
      const respuesta = await axiosClient.post(
        "/api/auth/login",
        {
          correo,
          password,
        }
      );

      login(respuesta.data.token);

      navigate("/", {
        replace: true,
      });
    } catch (error) {
      console.error(error);

      const mensaje =
        error.response?.data?.message ||
        "Correo o contraseña incorrectos";

      Swal.fire({
        icon: "error",
        title: "No se pudo iniciar sesión",
        text: mensaje,
        background: "#171a21",
        color: "#e5e7eb",
        confirmButtonColor: "#1a9fff",
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <form
        onSubmit={manejarEnvio}
        className="
          w-full max-w-md
          bg-slate-900
          border border-slate-800
          rounded-2xl
          shadow-2xl
          p-8
        "
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-sky-400 tracking-wide">
            PIXELWORKS
          </h1>

          <p className="text-sm text-slate-400 mt-2">
            Panel de administración
          </p>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Correo electrónico
          </label>

          <span className="p-input-icon-left w-full">
            <i className="pi pi-envelope" />

            <input
              type="email"
              value={correo}
              onChange={(evento) =>
                setCorreo(evento.target.value)
              }
              className="
                w-full
                bg-slate-800
                border border-slate-700
                text-white
                rounded-lg
                px-10 py-2.5
                outline-none
                focus:border-sky-500
                focus:ring-2
                focus:ring-sky-500/20
              "
              placeholder="correo@ejemplo.com"
              required
              autoFocus
            />
          </span>
        </div>

        <div className="mb-7">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Contraseña
          </label>

          <span className="p-input-icon-left w-full">
            <i className="pi pi-lock" />

            <input
              type="password"
              value={password}
              onChange={(evento) =>
                setPassword(evento.target.value)
              }
              className="
                w-full
                bg-slate-800
                border border-slate-700
                text-white
                rounded-lg
                px-10 py-2.5
                outline-none
                focus:border-sky-500
                focus:ring-2
                focus:ring-sky-500/20
              "
              placeholder="••••••••"
              required
            />
          </span>
        </div>

        <button
          type="submit"
          disabled={enviando}
          className="
            w-full
            bg-sky-600
            hover:bg-sky-500
            disabled:opacity-50
            disabled:cursor-not-allowed
            text-white
            font-semibold
            py-2.5
            rounded-lg
            transition-colors
          "
        >
          {enviando
            ? "Iniciando sesión..."
            : "Iniciar sesión"}
        </button>
      </form>
    </div>
  );
}