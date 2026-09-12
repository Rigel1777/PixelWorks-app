import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import axiosClient from "../../services/axiosClient";
import { Link } from "react-router-dom";

export default function Historial() {
  const [compras, setCompras] = useState([]);
  const [juegosProcesados, setJuegosProcesados] = useState([]);
  const [juegosFiltrados, setJuegosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [busqueda, setBusqueda] = useState("");
  const [ordenFecha, setOrdenFecha] = useState("desc");

  const toast = useRef(null);

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      const respuesta = await axiosClient.get("/api/compras/mis-juegos");
      setCompras(respuesta.data);
    } catch (error) {
      console.error("Error al cargar la biblioteca:", error);
    } finally {
      setLoading(false);
    }
  };

  // 1. Aplanar los datos: Convertimos las facturas en una lista de juegos individuales
  useEffect(() => {
    const lista = compras.flatMap((compra) => 
      (compra.detalles || []).map((detalle) => ({
        idFactura: compra.id,
        productoId: detalle.productoId,
        nombreJuego: detalle.productoNombre || detalle.nombreProducto || "Juego de PixelWorks",
        claves: detalle.claves || [],
        fechaRaw: compra.fechaVenta || new Date().toISOString(),
        fechaFormateada: compra.fechaVenta ? new Date(compra.fechaVenta).toLocaleDateString() : "Reciente"
      }))
    );
    setJuegosProcesados(lista);
  }, [compras]);

  // 2. Motor de búsqueda y ordenamiento
  useEffect(() => {
    let resultado = [...juegosProcesados];

    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase();
      resultado = resultado.filter(juego => 
        juego.nombreJuego.toLowerCase().includes(termino)
      );
    }

    resultado.sort((a, b) => {
      const fechaA = new Date(a.fechaRaw).getTime();
      const fechaB = new Date(b.fechaRaw).getTime();
      return ordenFecha === "desc" ? fechaB - fechaA : fechaA - fechaB;
    });

    setJuegosFiltrados(resultado);
  }, [busqueda, ordenFecha, juegosProcesados]);

  const copiarClave = (clave) => {
    navigator.clipboard.writeText(clave);
    toast.current?.show({
      severity: "success",
      summary: "Clave copiada",
      detail: "Código copiado al portapapeles",
      life: 2000,
    });
  };

  const opcionesOrden = [
    { label: "Más recientes primero", value: "desc" },
    { label: "Más antiguos primero", value: "asc" }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <Toast ref={toast} position="bottom-right" />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white border-l-4 border-sky-500 pl-3">Mi Biblioteca</h1>
        <p className="text-slate-400 mt-2">Tus juegos adquiridos y claves de activación[cite: 29].</p>
      </div>

      {/* --- PANEL DE BÚSQUEDA Y FILTRO --- */}
      {!loading && juegosProcesados.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 p-2 md:p-3 rounded-2xl mb-8 shadow-lg flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 flex items-center">
            <i className="pi pi-search absolute left-4 text-slate-400 z-10" />
            <InputText
              placeholder="Buscar juego en tu biblioteca..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl outline-none focus:border-sky-500 hover:border-slate-700 transition-colors shadow-inner"
            />
          </div>
          
          <Dropdown
            value={ordenFecha}
            options={opcionesOrden}
            onChange={(e) => setOrdenFecha(e.value)}
            className="w-full md:w-64 bg-slate-950 border border-slate-800 text-white rounded-xl flex items-center hover:border-slate-700 transition-colors shadow-inner min-h-[48px]"
          />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <i className="pi pi-spin pi-spinner text-4xl text-sky-500" />
        </div>
      ) : juegosProcesados.length === 0 ? (
        <div className="text-center py-20 border border-slate-800 rounded-2xl bg-slate-900/50">
          <i className="pi pi-folder-open text-6xl text-slate-600 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Biblioteca vacía</h2>
          <p className="text-slate-400 mb-6">Aún no tienes juegos. ¡Explora la tienda para empezar tu colección![cite: 29]</p>
          <Link to="/tienda">
            <Button label="Ir al catálogo" icon="pi pi-compass" className="bg-sky-600 hover:bg-sky-500 border-none" />
          </Link>
        </div>
      ) : juegosFiltrados.length === 0 ? (
        <div className="text-center py-20 border border-slate-800 rounded-2xl bg-slate-900/50">
          <i className="pi pi-search text-6xl text-slate-600 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No se encontraron juegos</h2>
          <p className="text-slate-400">Ningún juego de tu biblioteca coincide con "{busqueda}".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {juegosFiltrados.map((juego, index) => (
            <div key={`${juego.idFactura}-${juego.productoId}-${index}`} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg p-5 flex flex-col justify-between hover:border-sky-900/50 transition-colors">
              <div>
                <h3 className="text-lg font-bold text-white truncate mb-1" title={juego.nombreJuego}>{juego.nombreJuego}</h3>
                <p className="text-xs text-slate-400 mb-4">Adquirido el: {juego.fechaFormateada}</p>
              </div>

              <div className="space-y-2 mt-auto">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Clave de activación:</span>
                {juego.claves.length > 0 ? (
                  juego.claves.map((clave, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between shadow-inner">
                      <code className="text-sky-400 font-mono text-xs tracking-wider">{clave}</code>
                      <Button 
                        icon="pi pi-copy" 
                        rounded 
                        text 
                        className="text-slate-400 hover:text-white hover:bg-slate-800 h-8 w-8"
                        aria-label="Copiar"
                        tooltip="Copiar clave"
                        tooltipOptions={{ position: "top" }}
                        onClick={() => copiarClave(clave)} 
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-red-400 bg-red-950/30 p-2 rounded border border-red-900/50 text-center">Sin claves asignadas</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}