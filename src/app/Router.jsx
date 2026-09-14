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
import DetalleJuegoAdmin from "../components/productos/DetalleJuegoAdmin";
import Usuarios from "../components/usuarios/Usuarios";

import TiendaLayout from "./TiendaLayout";
import Tienda from "../components/jugadores/Tienda";
import Carrito from "../components/jugadores/Carrito";
import Historial from "../components/jugadores/Historial";
import OfertasTienda from "../components/jugadores/OfertasTienda";
import DetalleJuego from "../components/jugadores/DetalleJuego";

export default function Router() {
return ( <BrowserRouter> <Routes>


    {/* =====================================================
        AUTENTICACIÓN
    ===================================================== */}

    <Route
      path="/login"
      element={<Login />}
    />

    <Route
      path="/registro"
      element={<Registro />}
    />


    {/* =====================================================
        TIENDA
        PÚBLICA
    ===================================================== */}

    <Route
      path="/tienda"
      element={<TiendaLayout />}
    >
      <Route
        index
        element={<Tienda />}
      />

      <Route
        path="ofertas"
        element={<OfertasTienda />}
      />

      <Route
        path="juego/:id"
        element={<DetalleJuego />}
      />

      {/* JUGADOR */}

      <Route
        path="carrito"
        element={
          <RutaProtegida
            rolesPermisos={["JUGADOR"]}
          >
            <Carrito />
          </RutaProtegida>
        }
      />

      <Route
        path="historial"
        element={
          <RutaProtegida
            rolesPermisos={["JUGADOR"]}
          >
            <Historial />
          </RutaProtegida>
        }
      />
    </Route>


    {/* =====================================================
        ÁREA ADMINISTRATIVA
        LA RUTA "/" ES EL DASHBOARD
    ===================================================== */}

    <Route
      element={
        <RutaProtegida
          rolesPermisos={["ADMIN"]}
        >
          <AppLayout />
        </RutaProtegida>
      }
    >

      {/* "/" → Dashboard */}

      <Route
        index
        element={<Dashboard />}
      />

      <Route
        path="juegos"
        element={<Productos />}
      />

      <Route
        path="juegos/:id"
        element={<DetalleJuegoAdmin />}
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
        path="claves-activacion"
        element={<ClavesActivacion />}
      />

      <Route
        path="usuarios"
        element={<Usuarios />}
      />

      <Route
        path="reportes"
        element={<Reportes />}
      />

    </Route>


    {/* =====================================================
        RUTA NO ENCONTRADA
    ===================================================== */}

    <Route
      path="*"
      element={
        <Navigate
          to="/tienda"
          replace
        />
      }
    />

  </Routes>
</BrowserRouter>


);
}
