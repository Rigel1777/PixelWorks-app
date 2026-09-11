import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Button } from "primereact/button";

export default function TiendaNavbar() {
  const { usuario, logout, estaAutenticado } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-[#171a21] border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
      <div className="flex items-center gap-8">
        <Link to="/tienda" className="text-2xl font-black text-sky-400 tracking-wider">
          PIXELWORKS
        </Link>
        
        <div className="hidden md:flex gap-6 text-sm font-medium text-slate-300">
          <Link to="/tienda" className="hover:text-white transition-colors">Catálogo</Link>
          <Link to="/tienda/ofertas" className="hover:text-white transition-colors">Ofertas</Link>
          {estaAutenticado && (
            <Link to="/tienda/historial" className="hover:text-white transition-colors">Mi Biblioteca</Link>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        {estaAutenticado ? (
          <>
            <Link to="/tienda/carrito" className="text-slate-300 hover:text-sky-400 transition-colors relative" title="Carrito">
              <i className="pi pi-shopping-cart text-xl"></i>
            </Link>
            
            <div className="flex items-center gap-4 border-l border-slate-700 pl-6">
              <div className="hidden sm:flex flex-col items-end leading-tight">
                <span className="text-sm font-semibold text-slate-100">{usuario?.nombre}</span>
                <span className="text-xs text-sky-400">Jugador</span>
              </div>
              <button onClick={() => { logout(); navigate("/tienda"); }} className="text-slate-400 hover:text-red-400 transition-colors" title="Cerrar sesión">
                <i className="pi pi-sign-out text-xl"></i>
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-slate-300 hover:text-white text-sm font-semibold transition-colors">
              Iniciar sesión
            </Link>
            <Link to="/registro">
              <Button label="Regístrate" className="bg-sky-600 hover:bg-sky-500 border-none text-xs font-bold py-2 px-4 shadow-md" />
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}