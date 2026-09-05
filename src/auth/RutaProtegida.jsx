import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RutaProtegida({
  children,
  rolesPermisos,
}) {
  const {
    estaAutenticado,
    cargando,
    tienePermiso,
  } = useAuth();

  if (cargando) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        Cargando PixelWorks...
      </div>
    );
  }

  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  if (
    rolesPermisos &&
    !tienePermiso(rolesPermisos)
  ) {
    return <Navigate to="/" replace />;
  }

  return children;
}