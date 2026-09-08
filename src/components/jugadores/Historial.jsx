import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import axiosClient from "../../services/axiosClient";
import { Link } from "react-router-dom";

export default function Historial() {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const copiarClave = (clave) => {
    navigator.clipboard.writeText(clave);
    toast.current?.show({
      severity: "success",
      summary: "Clave copiada",
      detail: "Código copiado al portapapeles",
      life: 2000,
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <Toast ref={toast} position="bottom-right" />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Mi Biblioteca</h1>
        <p className="text-slate-400 mt-2">Tus juegos adquiridos y claves de activación.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <i className="pi pi-spin pi-spinner text-4xl text-sky-500" />
        </div>
      ) : compras.length === 0 ? (
        <div className="text-center py-20 border border-slate-800 rounded-2xl bg-slate-900/50">
          <i className="pi pi-folder-open text-6xl text-slate-600 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Biblioteca vacía</h2>
          <p className="text-slate-400 mb-6">Aún no tienes juegos. ¡Explora la tienda para empezar tu colección!</p>
          <Link to="/tienda">
            <Button label="Ir al catálogo" icon="pi pi-compass" className="bg-sky-600 hover:bg-sky-500 border-none" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {compras.flatMap((compra) => 
            // Recorremos los detalles de cada factura para pintar cada juego comprado
            (compra.detalles || []).map((detalle, index) => {
              const nombreJuego = detalle.productoNombre || detalle.nombreProducto || "Juego de PixelWorks";
              const claves = detalle.claves || [];
              const fechaCompra = compra.fechaVenta ? new Date(compra.fechaVenta).toLocaleDateString() : "Reciente";

              return (
                <div key={`${compra.id}-${index}`} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white truncate mb-1">{nombreJuego}</h3>
                    <p className="text-xs text-slate-400 mb-4">Adquirido el: {fechaCompra}</p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Clave de activación:</span>
                    {claves.length > 0 ? (
                      claves.map((clave, idx) => (
                        <div key={idx} className="bg-slate-950 border border-slate-700 p-2.5 rounded-lg flex items-center justify-between">
                          <code className="text-sky-400 font-mono text-xs tracking-wider">{clave}</code>
                          <Button 
                            icon="pi pi-copy" 
                            rounded 
                            text 
                            severity="info" 
                            aria-label="Copiar"
                            tooltip="Copiar clave"
                            tooltipOptions={{ position: "top" }}
                            onClick={() => copiarClave(clave)} 
                          />
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-red-400">Sin claves asignadas</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}