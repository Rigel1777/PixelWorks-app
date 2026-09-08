import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const opcionesMenu = [
  {
    etiqueta: "Inicio",
    icono: "pi pi-home",
    ruta: "/",
  },

  {
    etiqueta: "Juegos",
    icono: "pi pi-discord",
    ruta: "/juegos",
  },

  {
    etiqueta: "Agregar",
    icono: "pi pi-th-large",
    submenu: [
      {
        etiqueta: "Categorías",
        ruta: "/catalogos/categorias",
      },
      {
        etiqueta: "Desarrolladores",
        ruta: "/catalogos/desarrolladores",
      },
      
      {
        etiqueta: "Ofertas",
        icono: "pi pi-tag",
        ruta: "/catalogos/ofertas",
      },
    ],
  },


  {
    etiqueta: "Claves de Activación",
    icono: "pi pi-key",
    ruta: "/claves-activacion",
  },

  {
    etiqueta: "Usuarios",
    icono: "pi pi-users",
    ruta: "/usuarios",
    rolesPermitidos: ["ADMIN"],
  },

  {
    etiqueta: "Reportes",
    icono: "pi pi-chart-bar",
    ruta: "/reportes",
  },
];

export default function Sidebar({ isOpen }) {
  const { usuario, tienePermiso } = useAuth();

  const [submenuAbierto, setSubmenuAbierto] = useState(
    null
  );

  const opcionesVisibles = opcionesMenu.filter(
    (opcion) =>
      !opcion.rolesPermitidos ||
      tienePermiso(opcion.rolesPermitidos)
  );

  return (
    <aside
      className={`
        bg-[#171a21]
        text-slate-200
        flex flex-col
        shrink-0
        fixed md:static
        inset-y-0 left-0
        z-30
        h-full
        transition-all duration-300 ease-in-out

        ${
          isOpen
            ? "w-64 translate-x-0"
            : "w-64 -translate-x-full md:w-0 md:translate-x-0 md:overflow-hidden"
        }
      `}
    >
      {/* Logo */}
      <div
        className="
          h-20
          flex flex-col
          justify-center
          px-5
          border-b border-slate-800
          shrink-0
        "
      >
        <span
          className="
            text-xl
            font-black
            tracking-wide
            text-sky-400
          "
        >
          PIXELWORKS
        </span>

        <span className="text-xs text-slate-500 mt-1">
          Panel de administración
        </span>
      </div>

      {/* Menú */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {opcionesVisibles.map((opcion) => (
          <div key={opcion.etiqueta}>
            {opcion.submenu ? (
              <SubmenuItem
                opcion={opcion}
                abierto={
                  submenuAbierto === opcion.etiqueta
                }
                onToggle={() =>
                  setSubmenuAbierto(
                    submenuAbierto === opcion.etiqueta
                      ? null
                      : opcion.etiqueta
                  )
                }
              />
            ) : (
              <EnlaceMenu opcion={opcion} />
            )}
          </div>
        ))}
      </nav>

      {/* Usuario */}
      <div
        className="
          border-t border-slate-800
          p-3
          shrink-0
        "
      >
        <div
          className="
            flex items-center gap-3
            px-2 py-2
            rounded-lg
            bg-slate-900/60
          "
        >
          <div
            className="
              w-9 h-9
              rounded-full
              flex items-center justify-center
              bg-sky-500/10
              border border-sky-500/30
              text-sky-400
              shrink-0
            "
          >
            <i className="pi pi-user" />
          </div>

          <div className="min-w-0">
            <p className="text-sm text-slate-200 truncate">
              {usuario?.nombre}
            </p>

            <p className="text-xs text-sky-400 truncate">
              {usuario?.rol}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

const EnlaceMenu = ({ opcion }) => {
  return (
    <NavLink
      to={opcion.ruta}
      end={opcion.ruta === "/"}
      className={({ isActive }) =>
        `
          flex items-center gap-3
          px-3 py-2.5
          mb-1
          rounded-lg
          text-sm
          transition-all
          ${
            isActive
              ? "bg-sky-500/15 text-sky-300 border border-sky-500/20"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }
        `
      }
    >
      <i
        className={`${opcion.icono} text-base w-5 text-center`}
      />

      <span>{opcion.etiqueta}</span>
    </NavLink>
  );
};

const SubmenuItem = ({
  opcion,
  abierto,
  onToggle,
}) => {
  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className="
          w-full
          flex items-center justify-between
          gap-3
          px-3 py-2.5
          rounded-lg
          text-sm
          text-slate-300
          hover:bg-slate-800
          hover:text-white
          transition-colors
        "
      >
        <span className="flex items-center gap-3">
          <i
            className={`${opcion.icono} text-base w-5 text-center`}
          />

          <span>{opcion.etiqueta}</span>
        </span>

        <i
          className={`pi pi-chevron-${
            abierto ? "up" : "down"
          } text-xs`}
        />
      </button>

      {abierto && (
        <div
          className="
            ml-4
            mt-1
            pl-2
            border-l border-slate-700
          "
        >
          {opcion.submenu.map((sub) => (
            <NavLink
              key={sub.ruta}
              to={sub.ruta}
              className={({ isActive }) =>
                `
                  block
                  px-3 py-2
                  rounded-md
                  text-sm
                  transition-colors
                  ${
                    isActive
                      ? "text-sky-300 bg-sky-500/10"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }
                `
              }
            >
              {sub.etiqueta}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};