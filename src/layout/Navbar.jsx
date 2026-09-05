import { useAuth } from "../auth/AuthContext";

export default function Navbar({ onToggleSidebar }) {
  const { usuario, logout } = useAuth();

  return (
    <header
      className="
        h-16 shrink-0
        flex items-center justify-between
        px-4 md:px-6
        bg-[#171a21]
        border-b border-slate-800
        shadow-lg
      "
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="
            p-2 rounded-lg
            text-slate-300
            hover:text-white
            hover:bg-slate-800
            transition-colors
          "
          aria-label="Alternar menú"
        >
          <i className="pi pi-bars text-xl" />
        </button>

        <div className="hidden sm:block min-w-0">
          <h1 className="text-sm md:text-base font-semibold text-white truncate">
            Panel de Administración
          </h1>

          <p className="text-xs text-slate-500 truncate">
            Gestión de la plataforma PixelWorks
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex flex-col items-end leading-tight">
          <span className="text-sm font-semibold text-slate-100">
            {usuario?.nombre}
          </span>

          <span className="text-xs text-sky-400">
            {usuario?.rol}
          </span>
        </div>

        <div
          className="
            hidden sm:flex
            w-9 h-9
            rounded-full
            items-center justify-center
            bg-sky-500/10
            border border-sky-500/30
            text-sky-400
          "
        >
          <i className="pi pi-user" />
        </div>

        <button
          onClick={logout}
          className="
            p-2 rounded-lg
            text-slate-400
            hover:text-red-400
            hover:bg-red-500/10
            transition-colors
          "
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <i className="pi pi-sign-out text-xl" />
        </button>
      </div>
    </header>
  );
}