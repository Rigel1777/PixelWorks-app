import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { productoService } from "../../services/productoService";
import { Button } from "primereact/button";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../auth/AuthContext";

export default function DetalleJuego() {
  const { id } = useParams();
  const [juego, setJuego] = useState(null);
  const [loading, setLoading] = useState(true);
  const { agregarAlCarrito } = useCart();
  const { estaAutenticado } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const cargarJuego = async () => {
      try {
        setLoading(true);
        const dataJuegos = await productoService.getAll();
        const encontrado = dataJuegos.find((j) => String(j.id) === String(id));
        setJuego(encontrado || null);
      } catch (error) {
        console.error("Error al cargar detalle del juego:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarJuego();
  }, [id]);

  const manejarCompra = () => {
    if (!estaAutenticado) {
      navigate("/login");
    } else {
      agregarAlCarrito(juego);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <i className="pi pi-spin pi-spinner text-4xl text-sky-500" />
      </div>
    );
  }

  if (!juego) {
    return (
      <div className="text-center py-20 text-white">
        <h2 className="text-2xl font-bold mb-2">Juego no encontrado</h2>
        <p className="text-slate-400 mb-6">El juego que buscas no existe o fue eliminado.</p>
        <Link to="/tienda">
          <Button label="Volver a la tienda" icon="pi pi-arrow-left" className="bg-sky-600 hover:bg-sky-500 border-none" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto text-white">
      <div className="text-sm text-slate-400 mb-6 flex items-center gap-2">
        <Link to="/tienda" className="hover:text-sky-400"><i className="pi pi-home"></i> Tienda</Link>
        <i className="pi pi-angle-right text-xs"></i>
        <span className="text-slate-200">{juego.nombre}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 mb-10">
        <div className="lg:w-1/3">
          <div className="bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 h-96 relative">
            {juego.imagen ? (
              <img src={juego.imagen} alt={juego.nombre} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><i className="pi pi-image text-6xl text-slate-700"></i></div>
            )}
          </div>
        </div>

        <div className="lg:w-2/3 flex flex-col justify-center">
          {juego.porcentajeDescuento > 0 && (
            <span className="bg-red-600/20 text-red-400 border border-red-600 font-bold px-3 py-1 rounded-full text-xs w-fit mb-4">
              OFERTA ESPECIAL -{juego.porcentajeDescuento}%
            </span>
          )}
          <h1 className="text-3xl lg:text-4xl font-black mb-6 leading-tight">{juego.nombre} (PC) - Clave Global</h1>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="flex items-center gap-3"><i className="pi pi-globe text-2xl text-sky-400"></i><div><p className="font-bold">Global</p><p className="text-xs text-slate-400">Se puede activar en cualquier país</p></div></div>
            <div className="flex items-center gap-3"><i className="pi pi-key text-2xl text-slate-300"></i><div><p className="font-bold">Código Digital</p><p className="text-xs text-slate-400">Entrega inmediata en tu biblioteca</p></div></div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              {juego.precioConDescuento ? (
                <>
                  <span className="text-slate-500 line-through text-sm block">${Number(juego.precio).toFixed(2)} USD</span>
                  <span className="text-green-400 font-black text-3xl">${Number(juego.precioConDescuento).toFixed(2)} USD</span>
                </>
              ) : (
                <span className="text-sky-400 font-black text-3xl">${Number(juego.precio).toFixed(2)} USD</span>
              )}
              <p className="text-xs text-slate-400 mt-1">Precio final. Sin cargos ocultos.</p>
            </div>
            
            <Button 
              label={!estaAutenticado ? "Inicia sesión para comprar" : (juego.stock ?? 0) <= 0 ? "Agotado temporalmente" : "Añadir al carrito"}
              icon={!estaAutenticado ? "pi pi-user" : (juego.stock ?? 0) <= 0 ? "pi pi-ban" : "pi pi-shopping-cart"}
              className={`px-8 py-4 font-bold border-none transition-colors ${!estaAutenticado ? "bg-slate-700 hover:bg-slate-600" : "bg-sky-600 hover:bg-sky-500"}`}
              disabled={(juego.stock ?? 0) <= 0 && estaAutenticado}
              onClick={manejarCompra}
            />
          </div>
        </div>
      </div>

      <div className="bg-amber-900/20 border border-amber-600/50 rounded-xl p-5 flex items-start gap-4 mb-10">
        <i className="pi pi-info-circle text-amber-500 text-xl mt-0.5"></i>
        <div>
          <h4 className="font-bold text-amber-500 mb-1">Noticia importante:</h4>
          <p className="text-sm text-slate-300">Recibirás un código digital único para {juego.nombre}. Las claves no son reembolsables una vez activadas. Asegúrate de cumplir con los requisitos mínimos del sistema antes de procesar tu compra.</p>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4 border-b border-slate-800 pb-2">Acerca del juego</h3>
        <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">{juego.descripcion || "Descripción no disponible para este título."}</p>
      </div>
    </div>
  );
}