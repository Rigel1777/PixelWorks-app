import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AppLayout from "./AppLayout";
import Login from "../auth/Login";
import Registro from "../auth/Registro";
import RutaProtegida from "../auth/RutaProtegida";

import Categorias from "../components/catalogos/Categorias";
import Desarrolladores from "../components/catalogos/Desarrolladores";
import Productos from "../components/productos/Productos";
import Ofertas from "../components/catalogos/Ofertas";
import Dashboard from "../components/dashboard/Dashboard";
import ClavesActivacion from "../components/catalogos/ClavesActivacion";
import Reportes from "../components/reportes/Reportes";

import TiendaLayout from "./TiendaLayout";
import Tienda from "../components/jugadores/Tienda";
import Carrito from "../components/jugadores/Carrito";
import Historial from "../components/jugadores/Historial";
import OfertasTienda from "../components/jugadores/OfertasTienda";

// --- COMPONENTES TEMPORALES ADMINISTRATIVOS ---
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

// --- PLANTILLA PARA RUTAS EN CONSTRUCCIÓN ---
function PaginaTemporal({ titulo }) {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white">{titulo}</h2>
      <p className="text-slate-400 mt-2">Módulo en construcción.</p>
    </div>
  );
}

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* --- ÁREA DEL JUGADOR (TIENDA) --- */}
        <Route
          path="/"
          element={
            <RutaProtegida rolesPermisos={["JUGADOR"]}>
              <TiendaLayout />
            </RutaProtegida>
          }
        >
          <Route path="/tienda" element={<Tienda />} />
          <Route 
            path="/tienda/carrito" 
            element={<Carrito />} 
          />
          <Route 
            path="/tienda/historial" 
            element={<Historial />} 
          />
          <Route path="/tienda/ofertas"
           element={<OfertasTienda />} />
        </Route>

        {/* --- ÁREA ADMINISTRATIVA (BLOQUEADA PARA JUGADORES) --- */}
        <Route
          element={
            <RutaProtegida rolesPermisos={["ADMIN"]}>
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

          <Route path="juegos" element={<Productos />} />
          <Route path="catalogos/categorias" element={<Categorias />} />
          <Route path="catalogos/desarrolladores" element={<Desarrolladores />} />
          <Route path="catalogos/ofertas" element={<Ofertas />} />
          <Route path="compras" element={<Compras />} />
          <Route path="claves-activacion" element={<ClavesActivacion />} />
          
          <Route
            path="usuarios"
            element={
              <RutaProtegida rolesPermisos={["ADMIN"]}>
                <Usuarios />
              </RutaProtegida>
            }
          />
          <Route path="reportes" element={<Reportes />} />
        </Route>

        <Route path="*" element={<Navigate to="/tienda" replace />} />
      </Routes>
    </BrowserRouter>
  );
}