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
import Ofertas from "../components/catalogos/Ofertas";
import Dashboard from "../components/dashboard/Dashboard";

function Compras() {
  return (
    <div>
      <h2 className="text-3xl font-bold text-white">Compras</h2>
      <p className="text-slate-400 mt-2">
        Módulo de compras en construcción.
      </p>
    </div>
  );
}

function ClavesActivacion() {
  return (
    <div>
      <h2 className="text-3xl font-bold text-white">
        Claves de Activación
      </h2>
      <p className="text-slate-400 mt-2">
        Gestión de claves de activación.
      </p>
    </div>
  );
}

function Usuarios() {
  return (
    <div>
      <h2 className="text-3xl font-bold text-white">Usuarios</h2>
      <p className="text-slate-400 mt-2">
        Gestión de usuarios en construcción.
      </p>
    </div>
  );
}

function Reportes() {
  return (
    <div>
      <h2 className="text-3xl font-bold text-white">Reportes</h2>
      <p className="text-slate-400 mt-2">
        Módulo de reportes en construcción.
      </p>
    </div>
  );
}

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <RutaProtegida>
              <AppLayout />
            </RutaProtegida>
          }
        >
          {/* DASHBOARD — SOLO ADMIN */}
          <Route
            index
            element={
              <RutaProtegida rolesPermisos={["ADMIN"]}>
                <Dashboard />
              </RutaProtegida>
            }
          />

          <Route
            path="juegos"
            element={<Productos />}
          />

          <Route
            path="catalogos/categorias"
            element={<Categorias />}
          />

          <Route
            path="catalogos/desarrolladores"
            element={<Desarrolladores />}
          />

          <Route
            path="catalogos/ofertas"
            element={<Ofertas />}
          />

          <Route
            path="compras"
            element={<Compras />}
          />

          <Route
            path="claves-activacion"
            element={<ClavesActivacion />}
          />

          <Route
            path="usuarios"
            element={
              <RutaProtegida rolesPermisos={["ADMIN"]}>
                <Usuarios />
              </RutaProtegida>
            }
          />

          <Route
            path="reportes"
            element={<Reportes />}
          />
        </Route>

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}