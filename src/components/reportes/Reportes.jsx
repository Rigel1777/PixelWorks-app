import { useEffect, useCallback, useState } from "react";

import reporteService from "../../services/reporteService";

const formatearMoneda = (valor) => {
  if (valor == null) {
    return "$0.00";
  }

  return new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
  }).format(valor);
};

const formatearFecha = (fecha) => {
  if (!fecha) {
    return "Sin fecha";
  }

  return new Date(fecha).toLocaleDateString("es-SV", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const cargarDatosVentas = async (setVentas, setError, setCargando) => {
  try {
    setError("");

    const data = await reporteService.getVentasTotales();

    setVentas(data || {});
  } catch (err) {
    console.error("Error cargando ventas totales:", err);
    setError(
      err?.response?.data?.message ||
        "No se pudieron cargar los datos de ventas totales."
    );
  } finally {
    setCargando(false);
  }
};

export default function Reportes() {
  const [ventas, setVentas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const reintentar = useCallback(() => {
    setCargando(true);
    cargarDatosVentas(setVentas, setError, setCargando);
  }, []);

  useEffect(() => {
    cargarDatosVentas(setVentas, setError, setCargando);
  }, []);

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <i className="pi pi-spin pi-spinner text-4xl text-sky-400" />
          <p className="text-slate-400 mt-4">Cargando Reportes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-950/40 border border-red-700 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <i className="pi pi-exclamation-triangle text-red-400 text-xl" />
          <div>
            <h2 className="text-white font-semibold text-lg">
              Error al cargar los Reportes
            </h2>
            <p className="text-red-300 mt-1">{error}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={reintentar}
          className="mt-5 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-semibold transition"
        >
          <i className="pi pi-refresh mr-2" />
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Reportes</h1>
        <p className="text-slate-400 mt-2">
          Análisis y métricas de PixelWorks.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 hover:border-slate-600 transition">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm">Ventas totales</p>
              <p className="text-3xl font-bold text-white mt-2">
                {ventas?.cantidadVentas ?? 0}
              </p>
              <p className="text-slate-500 text-sm mt-2">
                Unidades vendidas
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
              <i className="pi pi-shopping-cart text-sky-400 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 hover:border-slate-600 transition">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm">Ingresos totales</p>
              <p className="text-3xl font-bold text-white mt-2">
                {formatearMoneda(ventas?.ingresosTotales)}
              </p>
              <p className="text-slate-500 text-sm mt-2">
                Ganancia acumulada
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <i className="pi pi-dollar text-emerald-400 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 hover:border-slate-600 transition">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm">Ticket promedio</p>
              <p className="text-3xl font-bold text-white mt-2">
                {formatearMoneda(ventas?.ticketPromedio)}
              </p>
              <p className="text-slate-500 text-sm mt-2">
                Por compra
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center">
              <i className="pi pi-receipt text-violet-400 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 hover:border-slate-600 transition">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm">Última venta</p>
              <p className="text-xl font-bold text-white mt-2">
                {formatearFecha(ventas?.ultimaVenta)}
              </p>
              <p className="text-slate-500 text-sm mt-2">
                Registro más reciente
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <i className="pi pi-calendar text-amber-400 text-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
