import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

import { Doughnut, Bar } from "react-chartjs-2";

import { productoService } from "../../services/productoService";
import { categoriaService } from "../../services/categoriaService";
import { desarrolladorService } from "../../services/desarrolladorService";
import { ofertaService } from "../../services/ofertaService";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const obtenerEstadoOferta = (oferta) => {
  const hoy = new Date();

  const inicio = new Date(
    `${oferta.fechaInicio}T00:00:00`
  );

  const fin = new Date(
    `${oferta.fechaFin}T23:59:59`
  );

  if (hoy < inicio) {
    return "Proxima";
  }

  if (hoy > fin) {
    return "Finalizada";
  }

  return "Activa";
};

const formatearFecha = (fecha) => {
  if (!fecha) {
    return "Sin fecha";
  }

  return new Date(
    `${fecha}T00:00:00`
  ).toLocaleDateString("es-SV", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function Dashboard() {
  const navigate = useNavigate();

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [desarrolladores, setDesarrolladores] =
    useState([]);
  const [ofertas, setOfertas] = useState([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      setCargando(true);
      setError("");

      const [
        productosData,
        categoriasData,
        desarrolladoresData,
        ofertasData,
      ] = await Promise.all([
        productoService.getAll(),
        categoriaService.getAll(),
        desarrolladorService.getAll(),
        ofertaService.getAll(),
      ]);

      setProductos(
        productosData || []
      );

      setCategorias(
        categoriasData || []
      );

      setDesarrolladores(
        desarrolladoresData || []
      );

      setOfertas(
        ofertasData || []
      );
    } catch (err) {
      console.error(
        "Error cargando Dashboard:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "No se pudieron cargar los datos del Dashboard."
      );
    } finally {
      setCargando(false);
    }
  };

  // =========================================================
  // ESTADÍSTICAS DE OFERTAS
  // =========================================================

  const estadisticasOfertas =
    useMemo(() => {
      const resultado = {
        Activa: 0,
        Proxima: 0,
        Finalizada: 0,
      };

      ofertas.forEach(
        (oferta) => {
          const estado =
            obtenerEstadoOferta(
              oferta
            );

          if (
            resultado[estado] !==
            undefined
          ) {
            resultado[estado]++;
          }
        }
      );

      return resultado;
    }, [ofertas]);

  // =========================================================
  // PRODUCTOS POR CATEGORÍA
  // =========================================================

  const productosPorCategoria =
    useMemo(() => {
      return categorias.map(
        (categoria) => {
          const cantidad =
            productos.filter(
              (producto) =>
                Number(
                  producto.categoriaId
                ) ===
                Number(
                  categoria.id
                )
            ).length;

          return {
            nombre:
              categoria.nombre,
            cantidad,
          };
        }
      );
    }, [
      categorias,
      productos,
    ]);

  // =========================================================
  // JUEGOS RECIENTES
  // =========================================================

  const productosRecientes =
    useMemo(() => {
      return [...productos]
        .slice(-5)
        .reverse();
    }, [productos]);

  // =========================================================
  // OFERTAS ACTIVAS
  // =========================================================

  const ofertasActivas =
    useMemo(() => {
      return ofertas
        .filter(
          (oferta) =>
            obtenerEstadoOferta(
              oferta
            ) === "Activa"
        )
        .slice(0, 5);
    }, [ofertas]);

  // =========================================================
  // GRÁFICA DE CATEGORÍAS
  // =========================================================

  const graficaCategorias = {
    labels:
      productosPorCategoria.map(
        (item) =>
          item.nombre
      ),

    datasets: [
      {
        label: "Juegos",

        data:
          productosPorCategoria.map(
            (item) =>
              item.cantidad
          ),

        backgroundColor:
          "rgba(56, 189, 248, 0.65)",

        borderColor:
          "#38bdf8",

        borderWidth: 1,

        borderRadius: 6,

        maxBarThickness: 45,
      },
    ],
  };

  const opcionesCategorias = {
    responsive: true,

    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        backgroundColor:
          "#0f172a",

        titleColor:
          "#ffffff",

        bodyColor:
          "#cbd5e1",

        borderColor:
          "#334155",

        borderWidth: 1,

        callbacks: {
          label: (
            context
          ) =>
            ` ${context.raw} juego(s)`,
        },
      },
    },

    scales: {
      x: {
        ticks: {
          color: "#cbd5e1",

          font: {
            size: 11,
          },
        },

        grid: {
          display: false,
        },

        border: {
          color:
            "#334155",
        },
      },

      y: {
        beginAtZero: true,

        ticks: {
          precision: 0,

          color: "#94a3b8",
        },

        grid: {
          color:
            "rgba(148, 163, 184, 0.08)",
        },

        border: {
          display: false,
        },
      },
    },
  };

  // =========================================================
  // GRÁFICA DE OFERTAS
  // =========================================================

  const graficaOfertas = {
    labels: [
      "Activas",
      "Próximas",
      "Finalizadas",
    ],

    datasets: [
      {
        data: [
          estadisticasOfertas.Activa,
          estadisticasOfertas.Proxima,
          estadisticasOfertas.Finalizada,
        ],

        backgroundColor: [
          "#22c55e",
          "#f59e0b",
          "#64748b",
        ],

        borderColor: "#0f172a",

        borderWidth: 3,

        hoverOffset: 6,
      },
    ],
  };

  const opcionesOfertas = {
    responsive: true,

    maintainAspectRatio: false,

    plugins: {
      legend: {
        position: "bottom",

        labels: {
          color: "#e2e8f0",

          padding: 18,

          usePointStyle: true,

          pointStyle:
            "circle",
        },
      },

      tooltip: {
        backgroundColor:
          "#0f172a",

        titleColor:
          "#ffffff",

        bodyColor:
          "#cbd5e1",

        borderColor:
          "#334155",

        borderWidth: 1,

        callbacks: {
          label: (
            context
          ) =>
            ` ${context.raw} oferta(s)`,
        },
      },
    },

    cutout: "68%",
  };

  // =========================================================
  // TARJETAS KPI
  // =========================================================

  const tarjetas = [
    {
      titulo: "Juegos",
      valor: productos.length,
      icono:
        "pi pi-discord",
      descripcion:
        "Juegos registrados",
      color:
        "sky",
    },

    {
      titulo:
        "Categorías",
      valor:
        categorias.length,
      icono:
        "pi pi-tags",
      descripcion:
        "Categorías disponibles",
      color:
        "violet",
    },

    {
      titulo:
        "Desarrolladores",
      valor:
        desarrolladores.length,
      icono:
        "pi pi-code",
      descripcion:
        "Desarrolladores registrados",
      color:
        "amber",
    },

    {
      titulo:
        "Ofertas activas",
      valor:
        estadisticasOfertas.Activa,
      icono:
        "pi pi-tag",
      descripcion:
        "Ofertas vigentes",
      color:
        "green",
    },
  ];

  // =========================================================
  // LOADING
  // =========================================================

  if (cargando) {
    return (
      <div
        className="
          flex
          items-center
          justify-center
          min-h-[500px]
        "
      >
        <div className="text-center">
          <i
            className="
              pi
              pi-spin
              pi-spinner
              text-4xl
              text-sky-400
            "
          />

          <p
            className="
              text-slate-400
              mt-4
            "
          >
            Cargando Dashboard...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div
        className="
          bg-red-950/40
          border
          border-red-700
          rounded-xl
          p-6
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <i
            className="
              pi
              pi-exclamation-triangle
              text-red-400
              text-xl
            "
          />

          <div>
            <h2
              className="
                text-white
                font-semibold
                text-lg
              "
            >
              Error al cargar el Dashboard
            </h2>

            <p
              className="
                text-red-300
                mt-1
              "
            >
              {error}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={
            cargarDashboard
          }
          className="
            mt-5
            px-4
            py-2
            rounded-lg
            bg-sky-500
            hover:bg-sky-400
            text-white
            font-semibold
            transition
          "
        >
          <i className="pi pi-refresh mr-2" />
          Reintentar
        </button>
      </div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div
      className="
        space-y-8
      "
    >
      {/* =====================================================
          ENCABEZADO
      ====================================================== */}

      <div>
        <h1
          className="
            text-3xl
            font-bold
            text-white
          "
        >
          Dashboard
        </h1>

        <p
          className="
            text-slate-400
            mt-2
          "
        >
          Resumen general de PixelWorks.
        </p>
      </div>

      {/* =====================================================
          TARJETAS KPI
      ====================================================== */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-4
          gap-5
        "
      >
        {tarjetas.map(
          (tarjeta) => (
            <div
              key={
                tarjeta.titulo
              }
              className="
                bg-slate-900
                border
                border-slate-700
                rounded-2xl
                p-5
                hover:border-slate-600
                transition
              "
            >
              <div
                className="
                  flex
                  items-start
                  justify-between
                "
              >
                <div>
                  <p
                    className="
                      text-slate-400
                      text-sm
                    "
                  >
                    {tarjeta.titulo}
                  </p>

                  <p
                    className="
                      text-3xl
                      font-bold
                      text-white
                      mt-2
                    "
                  >
                    {tarjeta.valor}
                  </p>

                  <p
                    className="
                      text-slate-500
                      text-sm
                      mt-2
                    "
                  >
                    {tarjeta.descripcion}
                  </p>
                </div>

                <div
                  className={`

                    w-12
                    h-12
                    rounded-xl
                    flex
                    items-center
                    justify-center

                    ${
                      tarjeta.color ===
                      "sky"
                        ? "bg-sky-500/10 border border-sky-500/30"
                        : tarjeta.color ===
                          "violet"
                        ? "bg-violet-500/10 border border-violet-500/30"
                        : tarjeta.color ===
                          "amber"
                        ? "bg-amber-500/10 border border-amber-500/30"
                        : "bg-green-500/10 border border-green-500/30"
                    }
                  `}
                >
                  <i
                    className={`

                      ${tarjeta.icono}

                      ${
                        tarjeta.color ===
                        "sky"
                          ? "text-sky-400"
                          : tarjeta.color ===
                            "violet"
                          ? "text-violet-400"
                          : tarjeta.color ===
                            "amber"
                          ? "text-amber-400"
                          : "text-green-400"
                      }

                      text-xl
                    `}
                  />
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* =====================================================
          GRÁFICAS
      ====================================================== */}

      <div
        className="
          grid
          grid-cols-1
          xl:grid-cols-2
          gap-6
        "
      >
        {/* =================================================
            JUEGOS POR CATEGORÍA
        ================================================== */}

        <div
          className="
            bg-slate-900
            border
            border-sky-900/50
            rounded-2xl
            overflow-hidden
          "
        >
          <div
            className="
              px-6
              py-5
              border-b
              border-sky-900/40
              bg-sky-950/20
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
              "
            >
              <div>
                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <span
                    className="
                      w-2
                      h-2
                      rounded-full
                      bg-sky-400
                    "
                  />

                  <h2
                    className="
                      text-xl
                      font-semibold
                      text-white
                    "
                  >
                    Juegos por categoría
                  </h2>
                </div>

                <p
                  className="
                    text-slate-400
                    text-sm
                    mt-1
                  "
                >
                  Distribución de juegos registrados
                </p>
              </div>

              <div
                className="
                  w-10
                  h-10
                  rounded-xl
                  bg-sky-500/10
                  border
                  border-sky-500/30
                  flex
                  items-center
                  justify-center
                "
              >
                <i
                  className="
                    pi
                    pi-chart-bar
                    text-sky-400
                  "
                />
              </div>
            </div>
          </div>

          <div
            className="
              h-[320px]
              p-4
            "
          >
            {productosPorCategoria.length >
            0 ? (
              <Bar
                data={
                  graficaCategorias
                }
                options={
                  opcionesCategorias
                }
              />
            ) : (
              <div
                className="
                  h-full
                  flex
                  items-center
                  justify-center
                  text-slate-500
                "
              >
                No hay datos disponibles.
              </div>
            )}
          </div>
        </div>

        {/* =================================================
            ESTADO DE OFERTAS
        ================================================== */}

        <div
          className="
            bg-slate-900
            border
            border-green-900/50
            rounded-2xl
            overflow-hidden
          "
        >
          <div
            className="
              px-6
              py-5
              border-b
              border-green-900/40
              bg-green-950/20
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
              "
            >
              <div>
                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <span
                    className="
                      w-2
                      h-2
                      rounded-full
                      bg-green-400
                    "
                  />

                  <h2
                    className="
                      text-xl
                      font-semibold
                      text-white
                    "
                  >
                    Estado de ofertas
                  </h2>
                </div>

                <p
                  className="
                    text-slate-400
                    text-sm
                    mt-1
                  "
                >
                  Estado actual de las promociones
                </p>
              </div>

              <div
                className="
                  w-10
                  h-10
                  rounded-xl
                  bg-green-500/10
                  border
                  border-green-500/30
                  flex
                  items-center
                  justify-center
                "
              >
                <i
                  className="
                    pi
                    pi-chart-pie
                    text-green-400
                  "
                />
              </div>
            </div>
          </div>

          <div
            className="
              h-[320px]
              p-4
              flex
              items-center
              justify-center
            "
          >
            {ofertas.length > 0 ? (
              <Doughnut
                data={
                  graficaOfertas
                }
                options={
                  opcionesOfertas
                }
              />
            ) : (
              <div
                className="
                  text-slate-500
                "
              >
                No hay ofertas registradas.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          INFORMACIÓN INFERIOR
      ====================================================== */}

      <div
        className="
          grid
          grid-cols-1
          xl:grid-cols-2
          gap-6
        "
      >
        {/* =================================================
            JUEGOS RECIENTES
        ================================================== */}

        <div
          className="
            bg-slate-900
            border
            border-sky-900/50
            rounded-2xl
            overflow-hidden
          "
        >
          <div
            className="
              px-6
              py-5
              border-b
              border-sky-900/40
              bg-sky-950/20
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
              "
            >
              <div>
                <h2
                  className="
                    text-xl
                    font-semibold
                    text-white
                  "
                >
                  Juegos recientes
                </h2>

                <p
                  className="
                    text-slate-400
                    text-sm
                    mt-1
                  "
                >
                  Selecciona un juego para ver sus detalles
                </p>
              </div>

              <i
                className="
                  pi
                  pi-discord
                  text-sky-400
                "
              />
            </div>
          </div>

          <div
            className="
              divide-y
              divide-slate-800
            "
          >
            {productosRecientes.length >
            0 ? (
              productosRecientes.map(
                (producto) => (
                  <button
                    key={
                      producto.id
                    }
                    type="button"
                    onClick={() =>
                      navigate(
                        `/juegos/${producto.id}`
                      )
                    }
                    className="
                      w-full
                      px-6
                      py-4
                      flex
                      items-center
                      justify-between
                      text-left
                      hover:bg-sky-950/30
                      transition
                      cursor-pointer
                    "
                  >
                    <div
                      className="
                        min-w-0
                      "
                    >
                      <p
                        className="
                          text-white
                          font-medium
                          truncate
                        "
                      >
                        {
                          producto.nombre
                        }
                      </p>

                      <p
                        className="
                          text-slate-500
                          text-sm
                          mt-1
                        "
                      >
                        {
                          producto.anioLanzamiento ||
                          "Año no disponible"
                        }
                      </p>
                    </div>

                    <i
                      className="
                        pi
                        pi-external-link
                        text-slate-500
                        ml-4
                        transition
                      "
                    />
                  </button>
                )
              )
            ) : (
              <div
                className="
                  px-6
                  py-8
                  text-center
                  text-slate-500
                "
              >
                No hay juegos registrados.
              </div>
            )}
          </div>
        </div>

        {/* =================================================
            OFERTAS ACTIVAS
        ================================================== */}

        <div
          className="
            bg-slate-900
            border
            border-green-900/50
            rounded-2xl
            overflow-hidden
          "
        >
          <div
            className="
              px-6
              py-5
              border-b
              border-green-900/40
              bg-green-950/20
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
              "
            >
              <div>
                <h2
                  className="
                    text-xl
                    font-semibold
                    text-white
                  "
                >
                  Ofertas activas
                </h2>

                <p
                  className="
                    text-slate-400
                    text-sm
                    mt-1
                  "
                >
                  Promociones vigentes
                </p>
              </div>

              <i
                className="
                  pi
                  pi-tag
                  text-green-400
                "
              />
            </div>
          </div>

          <div
            className="
              divide-y
              divide-slate-800
            "
          >
            {ofertasActivas.length >
            0 ? (
              ofertasActivas.map(
                (oferta) => (
                  <div
                    key={
                      oferta.id
                    }
                    className="
                      px-6
                      py-4
                      flex
                      items-center
                      justify-between
                      hover:bg-green-950/20
                      transition
                    "
                  >
                    <div
                      className="
                        min-w-0
                      "
                    >
                      <p
                        className="
                          text-white
                          font-medium
                          truncate
                        "
                      >
                        {
                          oferta.nombre
                        }
                      </p>

                      <p
                        className="
                          text-slate-500
                          text-sm
                          mt-1
                        "
                      >
                        Hasta{" "}
                        {
                          formatearFecha(
                            oferta.fechaFin
                          )
                        }
                      </p>
                    </div>

                    <span
                      className="
                        ml-4
                        px-3
                        py-1
                        rounded-full
                        text-sm
                        font-semibold
                        bg-green-500/10
                        border
                        border-green-500/30
                        text-green-400
                        whitespace-nowrap
                      "
                    >
                      {
                        oferta.porcentajeDescuento
                      }%
                    </span>
                  </div>
                )
              )
            ) : (
              <div
                className="
                  px-6
                  py-8
                  text-center
                  text-slate-500
                "
              >
                No hay ofertas activas.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

