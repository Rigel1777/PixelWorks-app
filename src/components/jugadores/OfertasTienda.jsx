import { useEffect, useState } from "react";
import { productoService } from "../../services/productoService";
import { Button } from "primereact/button";
import { useCart } from "../../context/CartContext";
import { Link } from "react-router-dom";

export default function OfertasTienda() {
  const [juegosOferta, setJuegosOferta] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { agregarAlCarrito } = useCart();

  useEffect(() => {
    cargarOfertas();
  }, []);

  const cargarOfertas = async () => {
    try {
      setLoading(true);
      const data = await productoService.getAll();
      const filtrados = data.filter(juego => juego.porcentajeDescuento && Number(juego.porcentajeDescuento) > 0);
      setJuegosOferta(filtrados);
    } catch (error) {
      console.error("Error al cargar las ofertas:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderCard = (juego) => (
    <div
      key={juego.id}
      className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:-translate-y-1 transition-transform"
    >
      <div className="h-48 bg-slate-950 relative">
        {juego.imagen ? (
          <img src={juego.imagen} alt={juego.nombre} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600">
            <i className="pi pi-image text-4xl" />
          </div>
        )}
        
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
          <span className="bg-red-600 text-white font-bold px-2 py-0.5 rounded-md text-xs shadow-md">
            -{juego.porcentajeDescuento}%
          </span>
          <div className="bg-black/80 text-white font-bold px-3 py-1 rounded-lg backdrop-blur-sm flex items-center gap-2 shadow-lg">
            <span className="text-slate-400 line-through text-xs font-normal">${Number(juego.precio).toFixed(2)}</span>
            <span className="text-green-400">${Number(juego.precioConDescuento).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-white truncate" title={juego.nombre}>
          {juego.nombre}
        </h3>
        <p className="text-sm text-slate-400 mt-1 line-clamp-2 min-h-[40px]">
          {juego.descripcion || "Sin descripción"}
        </p>
        
        <div className="mt-5 pt-4 border-t border-slate-800">
          <Button 
            label={(juego.stock ?? 0) <= 0 ? "Sin existencias" : "Añadir al carrito"}
            icon={(juego.stock ?? 0) <= 0 ? "pi pi-ban" : "pi pi-shopping-cart"}
            disabled={(juego.stock ?? 0) <= 0}
            className={`w-full border-none transition-colors ${
              (juego.stock ?? 0) <= 0 
                ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                : "bg-sky-600 hover:bg-sky-500 text-white"
            }`}
            onClick={() => agregarAlCarrito(juego)}
          />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <i className="pi pi-spin pi-spinner text-4xl text-sky-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Ofertas</h1>
        <p className="text-slate-400 mt-2">Aprovecha los descuentos por tiempo limitado en PixelWorks.</p>
      </div>

      {juegosOferta.length === 0 ? (
        <div className="text-center py-20 border border-slate-800 rounded-2xl bg-slate-900/50">
          <i className="pi pi-tag text-6xl text-slate-600 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No hay ofertas activas</h2>
          <p className="text-slate-400 mb-6">Vuelve pronto para descubrir nuevas promociones en videojuegos.</p>
          <Link to="/tienda">
            <Button label="Ver todo el catálogo" icon="pi pi-arrow-left" className="bg-sky-600 hover:bg-sky-500 border-none" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {juegosOferta.map(renderCard)}
        </div>
      )}
    </div>
  );
}