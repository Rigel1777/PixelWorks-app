import { useEffect, useCallback, useState } from "react";
import reporteService from "../../services/reporteService";
import { productoService } from "../../services/productoService";
import axiosClient from "../../services/axiosClient";
import { jsPDF } from "jspdf";
import { Link } from "react-router-dom";
import { MultiSelect } from "primereact/multiselect";

const formatearMoneda = (valor) => {
  if (valor == null) return "$0.00";
  return new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
  }).format(valor);
};

const formatearFecha = (fecha) => {
  if (!fecha) return "Sin registros";
  return new Date(fecha).toLocaleDateString("es-SV", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function Reportes() {
  const [ventas, setVentas] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [catalogo, setCatalogo] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [pdfInicio, setPdfInicio] = useState("");
  const [pdfFin, setPdfFin] = useState("");
  const [pdfJuegosIds, setPdfJuegosIds] = useState([]);
  const [generandoPdf, setGenerandoPdf] = useState(false);

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      const [ventasRes, alertasRes, catalogoRes] = await Promise.all([
        reporteService.getVentasTotales(),
        axiosClient.get("/api/dashboard/alertas/stock"),
        productoService.getAll(),
      ]);

      const datosFinancieros = ventasRes || {};

      setVentas(datosFinancieros);
      setAlertas(alertasRes.data || []);
      setCatalogo(catalogoRes || []);
    } catch (err) {
      setError("No se pudieron cargar los datos del panel.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const generarPDFParametrizado = async () => {
    try {
      setGenerandoPdf(true);

      const params = {};
      if (pdfInicio) params.fechaInicio = pdfInicio;
      if (pdfFin) params.fechaFin = pdfFin;
      if (pdfJuegosIds.length > 0) params.productoIds = pdfJuegosIds.join(",");

      const respuesta = await axiosClient.get("/api/dashboard/finanzas", {
        params,
      });
      const dataRango = respuesta.data || {};

      const ingresosGlobales = Number(dataRango.ingresosTotales || 0);
      const cantidadGlobal = Number(dataRango.cantidadVentas || 0);
      const detallesJuegos = dataRango.detalles || [];

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const dibujarEncabezadoYPies = (paginaActual) => {
        doc.setFillColor(2, 132, 199);
        doc.rect(0, 0, pageWidth, 40, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.text("PIXELWORKS", 20, 20);
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text("Reporte de Ventas Detallado", 20, 30);

        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text(`PixelWorks — Página ${paginaActual}`, 20, pageHeight - 15);
      };

      let infoY = 52;
      let pagina = 1;
      dibujarEncabezadoYPies(pagina);

      doc.setTextColor(80, 80, 80);
      doc.setFontSize(10);
      doc.text(`Fecha de emisión: ${formatearFecha(new Date())}`, 20, infoY);
      infoY += 6;

      doc.setFont("helvetica", "bold");
      if (pdfInicio || pdfFin) {
        doc.setTextColor(2, 132, 199);
        doc.text(
          `Periodo evaluado: ${pdfInicio || "Inicio"} al ${pdfFin || "Actualidad"}`,
          20,
          infoY,
        );
      } else {
        doc.text(`Periodo evaluado: Histórico completo`, 20, infoY);
      }
      infoY += 6;

      if (pdfJuegosIds.length > 0) {
        doc.setTextColor(139, 92, 246);
        doc.text(
          `Filtro aplicado: ${pdfJuegosIds.length} juego(s) seleccionado(s)`,
          20,
          infoY,
        );
      } else {
        doc.text(`Filtro aplicado: Todos los juegos del catálogo`, 20, infoY);
      }
      infoY += 12;

      if (detallesJuegos.length > 0) {
        detallesJuegos.forEach((juego) => {
          if (infoY > 260) {
            doc.addPage();
            pagina++;
            dibujarEncabezadoYPies(pagina);
            infoY = 55;
          }

          doc.setFont("helvetica", "bold");
          doc.setFontSize(12);
          doc.setTextColor(2, 132, 199);
          doc.text(juego.nombre, 20, infoY);

          infoY += 7;
          doc.setFont("helvetica", "normal");
          doc.setTextColor(80, 80, 80);
          doc.text(`Unidades Vendidas:`, 20, infoY);
          doc.setTextColor(0, 0, 0);
          doc.text(`${juego.cantidad}`, 60, infoY);

          infoY += 7;
          doc.setTextColor(80, 80, 80);
          doc.text(`Ingresos Totales:`, 20, infoY);
          doc.setTextColor(16, 185, 129);
          doc.text(`${formatearMoneda(juego.ingresos)}`, 60, infoY);

          infoY += 12;
        });
      } else {
        doc.setFont("helvetica", "italic");
        doc.text(
          "No se registraron ventas en este periodo / filtro.",
          20,
          infoY,
        );
        infoY += 15;
      }

      if (infoY > 240) {
        doc.addPage();
        pagina++;
        dibujarEncabezadoYPies(pagina);
        infoY = 55;
      }

      doc.setDrawColor(200, 200, 200);
      doc.line(20, infoY, 190, infoY);
      infoY += 12;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(2, 132, 199);
      doc.text("Total General del Reporte", 20, infoY);

      infoY += 8;
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text("Unidades Vendidas Totales: ", 20, infoY);
      doc.setTextColor(0, 0, 0);
      doc.text(`${cantidadGlobal}`, 80, infoY);

      infoY += 8;
      doc.setTextColor(80, 80, 80);
      doc.text("Ingresos Generales Totales:", 20, infoY);
      doc.setTextColor(16, 185, 129);
      doc.text(`${formatearMoneda(ingresosGlobales)}`, 80, infoY);

      doc.save(`Reporte_PixelWorks_${new Date().getTime()}.pdf`);
      setModalAbierto(false);
      setPdfJuegosIds([]);
    } catch (err) {
      alert("No se pudo generar el PDF. Revisa la consola.");
    } finally {
      setGenerandoPdf(false);
    }
  };

  if (cargando)
    return (
      <div className="flex justify-center py-20">
        <i className="pi pi-spin pi-spinner text-4xl text-sky-400" />
      </div>
    );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Reportes</h1>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          className="bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 px-5 rounded-lg flex items-center gap-2 cursor-pointer"
        >
          <i className="pi pi-file-pdf text-xl" /> Generar Reporte PDF
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-lg">
          <p className="text-slate-400 text-sm">Ventas totales</p>
          <p className="text-3xl font-bold text-white mt-2">
            {ventas?.cantidadVentas ?? 0}
          </p>
          <p className="text-slate-500 text-sm mt-2">Unidades vendidas</p>
        </div>
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-lg">
          <p className="text-slate-400 text-sm">Ingresos totales</p>
          <p className="text-3xl font-bold text-white mt-2">
            {formatearMoneda(ventas?.ingresosTotales)}
          </p>
          <p className="text-slate-500 text-sm mt-2">Ganancia acumulada</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-lg mt-8">
        <div className="flex items-center gap-3 mb-6">
          <i className="pi pi-bell text-2xl text-amber-500" />
          <h2 className="text-xl font-bold text-white">
            Alertas de Inventario
          </h2>
        </div>
        {alertas.length === 0 ? (
          <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-xl p-4 flex items-center gap-3">
            <i className="pi pi-check-circle text-emerald-500 text-xl" />
            <p className="text-emerald-400 font-medium">
              Todos los juegos activos tienen claves disponibles.
            </p>
          </div>
        ) : (
          <div>
            <div className="bg-amber-950/20 border border-amber-900/50 rounded-xl p-4 mb-4 flex items-start gap-3">
              <i className="pi pi-exclamation-triangle text-amber-500 text-xl mt-0.5" />
              <div>
                <h3 className="text-amber-500 font-bold">Atención requerida</h3>
                <p className="text-slate-300 text-sm mt-1">
                  Hay {alertas.length} juegos sin claves disponibles.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alertas.map((juego) => (
                <div
                  key={juego.id}
                  className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col justify-between"
                >
                  <span
                    className="text-white font-bold truncate mb-3"
                    title={juego.nombre}
                  >
                    {juego.nombre}
                  </span>
                  <Link to="/claves-activacion" className="w-full">
                    <button className="w-full bg-slate-800 hover:bg-slate-700 text-sky-400 text-sm font-semibold py-2 rounded-lg border border-slate-700 cursor-pointer">
                      <i className="pi pi-plus-circle mr-2" /> Agregar claves
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-white">
                <i className="pi pi-sliders-h text-sky-400 mr-2" /> Filtros
              </h3>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-slate-400 hover:text-white"
              >
                <i className="pi pi-times text-lg" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm mb-3">
                  Si no seleccionas nada se incluirá el histórico completo
                </p>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Juego
                </label>
                <MultiSelect
                  value={pdfJuegosIds}
                  options={catalogo}
                  onChange={(e) => setPdfJuegosIds(e.value)}
                  optionLabel="nombre"
                  optionValue="id"
                  filter
                  placeholder="Seleccione un juego"
                  maxSelectedLabels={3}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl shadow-inner min-h-[42px] items-center"
                  panelClassName="bg-slate-900 text-white border border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                    Desde
                  </label>
                  <input
                    type="date"
                    value={pdfInicio}
                    onChange={(e) => setPdfInicio(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                    Hasta
                  </label>
                  <input
                    type="date"
                    value={pdfFin}
                    onChange={(e) => setPdfFin(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setModalAbierto(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-sm"
              >
                Cancelar
              </button>
              <button
                disabled={generandoPdf}
                onClick={generarPDFParametrizado}
                className="px-5 py-2 rounded-xl bg-red-600 text-white font-semibold text-sm disabled:opacity-50"
              >
                {generandoPdf ? "Generando..." : "Descargar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
