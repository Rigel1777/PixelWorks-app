import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axiosClient from "../services/axiosClient";
import { useAuth } from "./AuthContext";
import { Link } from "react-router-dom";

export default function Registro() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [enviando, setEnviando] = useState(false);

  const { estaAutenticado } = useAuth();
  const navigate = useNavigate();

  if (estaAutenticado) {
    return <Navigate to="/tienda" replace />;
  }

  const NOMBRE_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s_-]+$/;

const manejarEnvio = async (evento) => {
    evento.preventDefault();
    setEnviando(true);

    // 1. Validar el formato del nombre
    if (!NOMBRE_REGEX.test(nombre.trim())) {
      Swal.fire({
        icon: "error",
        title: "Nombre inválido",
        text: "El nombre solo puede contener letras, espacios y guiones.",
        background: "#171a21",
        color: "#e5e7eb",
        confirmButtonColor: "#1a9fff",
      });
      setEnviando(false);
      return;
    }

    // 2. Validar que las contraseñas coincidan
    if (password !== confirmarPassword) {
      Swal.fire({
        icon: "error",
        title: "No se pudo registrar",
        text: "Las contraseñas no coinciden.",
        background: "#171a21",
        color: "#e5e7eb",
        confirmButtonColor: "#1a9fff",
      });
      setEnviando(false);
      return;
    }

    try {
      await axiosClient.post("/api/auth/register", {
        nombre: nombre.trim(),
        correo: correo.trim(),
        password,
      });

      Swal.fire({
        icon: "success",
        title: "Registro exitoso",
        text: "Inicia Sesión para continuar",
        background: "#171a21",
        color: "#e5e7eb",
        confirmButtonColor: "#1a9fff",
      });

      navigate("/login", { replace: true });
    } catch (error) {
      console.error(error);
      const mensaje = error.response?.data?.message || "No se pudo completar el registro.";

      Swal.fire({
        icon: "error",
        title: "No se pudo registrar",
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
            Crear cuenta
          </p>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Nombre completo
          </label>

          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg px-3.5 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20">
            <i className="pi pi-user text-slate-400 mr-3 text-base" />
            <input
              type="text"
              value={nombre}
              onChange={(evento) =>
                setNombre(evento.target.value)
              }
              className="
                w-full
                bg-transparent
                text-white
                py-2.5
                outline-none
                border-none
                text-sm
              "
              placeholder="Nombre completo"
              required
              autoFocus
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Correo electrónico
          </label>

          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg px-3.5 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20">
            <i className="pi pi-envelope text-slate-400 mr-3 text-base" />
            <input
              type="email"
              value={correo}
              onChange={(evento) =>
                setCorreo(evento.target.value)
              }
              className="
                w-full
                bg-transparent
                text-white
                py-2.5
                outline-none
                border-none
                text-sm
              "
              placeholder="correo@ejemplo.com"
              required
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Contraseña
          </label>

          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg px-3.5 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20">
            <i className="pi pi-lock text-slate-400 mr-3 text-base" />
            <input
              type="password"
              value={password}
              onChange={(evento) =>
                setPassword(evento.target.value)
              }
              className="
                w-full
                bg-transparent
                text-white
                py-2.5
                outline-none
                border-none
                text-sm
              "
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <div className="mb-7">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Confirmar contraseña
          </label>

          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg px-3.5 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20">
            <i className="pi pi-lock text-slate-400 mr-3 text-base" />
            <input
              type="password"
              value={confirmarPassword}
              onChange={(evento) =>
                setConfirmarPassword(evento.target.value)
              }
              className="
                w-full
                bg-transparent
                text-white
                py-2.5
                outline-none
                border-none
                text-sm
              "
              placeholder="••••••••"
              required
            />
          </div>
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
            ? "Creando cuenta..."
            : "Registrarse"}
        </button>

        <p className="text-center text-sm text-slate-400 mt-5">
          ¿Ya tienes cuenta?{" "}
          <button
            type="button"
            onClick={() => navigate("/login", { replace: true })}
            className="text-sky-400 hover:text-sky-300 font-medium transition-colors"
          >
            Iniciar sesión
          </button>
        </p>
        <div className="mt-6 text-center">
        <Link 
          to="/tienda" 
          className="text-slate-400 hover:text-sky-400 transition-colors text-sm flex items-center justify-center gap-2"
        >
          <i className="pi pi-arrow-left text-xs" />
          Volver al catálogo de juegos
        </Link>
      </div>
      </form>
    </div>
  );
}
