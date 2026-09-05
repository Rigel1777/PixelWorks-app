import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AppLayout from "./AppLayout";

import Login from "../auth/Login";
import RutaProtegida from "../auth/RutaProtegida";
import Categorias from "../components/catalogos/Categorias";
import Desarrolladores from "../components/catalogos/Desarrolladores";
import Productos from "../components/productos/Productos";

function Inicio() {
  return (
    <div>
      <h2 className="text-3xl font-bold text-white">
        Panel de Administración
      </h2>

      <p className="text-slate-400 mt-2">
        Bienvenido al panel administrativo de PixelWorks.
      </p>
    </div>
  );
}




function Ofertas() {
  return <PaginaTemporal titulo="Ofertas" />;
}

function Compras() {
  return <PaginaTemporal titulo="Compras" />;
}

function ClavesActivacion() {
  return (
    <PaginaTemporal
      titulo="Claves de Activación"
    />
  );
}

function Usuarios() {
  return <PaginaTemporal titulo="Usuarios" />;
}

function Reportes() {
  return <PaginaTemporal titulo="Reportes" />;
}

function PaginaTemporal({ titulo }) {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white">
        {titulo}
      </h2>

      <p className="text-slate-400 mt-2">
        Módulo en construcción.
      </p>
    </div>
  );
}

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Área protegida */}
        <Route
          element={
            <RutaProtegida>
              <AppLayout />
            </RutaProtegida>
          }
        >
          <Route
            path="/"
            element={<Inicio />}
          />

          <Route
            path="/juegos"
            element={<Productos />}
          />

          <Route
            path="/catalogos/categorias"
            element={<Categorias />}
          />

          <Route
            path="/catalogos/desarrolladores"
            element={<Desarrolladores />}
          />

          <Route
            path="/ofertas"
            element={<Ofertas />}
          />

          <Route
            path="/compras"
            element={<Compras />}
          />

          <Route
            path="/claves-activacion"
            element={<ClavesActivacion />}
          />

          <Route
            path="/usuarios"
            element={
              <RutaProtegida
                rolesPermisos={["ADMIN"]}
              >
                <Usuarios />
              </RutaProtegida>
            }
          />

          <Route
            path="/reportes"
            element={<Reportes />}
          />
        </Route>

        {/* Ruta no encontrada */}
        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}