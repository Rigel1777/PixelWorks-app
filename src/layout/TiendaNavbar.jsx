import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function TiendaNavbar() {
  const { usuario, logout } = useAuth();

  return (
    <nav className="bg-[#171a21] border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
      <div className="flex items-center gap-8">
        <Link to="/tienda" className="text-2xl font-black text-sky-400 tracking-wider">
          PIXELWORKS
        </Link>
        
        <div className="hidden md:flex gap-6 text-sm font-medium text-slate-300">
          <Link to="/tienda" className="hover:text-white transition-colors">Catálogo</Link>
          <Link to="/tienda/historial" className="hover:text-white transition-colors">Mi Biblioteca</Link>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <Link to="/tienda/carrito" className="text-slate-300 hover:text-sky-400 transition-colors relative" title="Carrito">
          <i className="pi pi-shopping-cart text-xl"></i>
        </Link>
        
        <div className="flex items-center gap-4 border-l border-slate-700 pl-6">
          <div className="hidden sm:flex flex-col items-end leading-tight">
            <span className="text-sm font-semibold text-slate-100">{usuario?.nombre}</span>
            <span className="text-xs text-sky-400">Jugador</span>
          </div>
          
          <button 
            onClick={logout} 
            className="text-slate-400 hover:text-red-400 transition-colors" 
            title="Cerrar sesión"
          >
            <i className="pi pi-sign-out text-xl"></i>
          </button>
        </div>
      </div>
    </nav>
  );
}