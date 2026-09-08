import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { Button } from "primereact/button";
import Swal from "sweetalert2";
import axiosClient from "../../services/axiosClient";

export default function Carrito() {
  const { carrito, eliminarDelCarrito, vaciarCarrito, total, actualizarCantidad } = useCart();
  const [procesando, setProcesando] = useState(false);
  const [metodosPago, setMetodosPago] = useState([]);
  const [metodoSeleccionado, setMetodoSeleccionado] = useState("");
  const navigate = useNavigate();

  // Cargar métodos de pago reales
  useEffect(() => {
    axiosClient.get("/api/metodos-pago")
      .then(res => {
        setMetodosPago(res.data);
        if (res.data.length > 0) setMetodoSeleccionado(res.data[0].id);
      })
      .catch(err => console.error("Fallo al cargar métodos de pago", err));
  }, []);

  const procesarCompra = async () => {
    if (carrito.length === 0 || !metodoSeleccionado) return;
    setProcesando(true);
    
    try {
      const payload = {
        metodoPagoId: Number(metodoSeleccionado), 
        items: carrito.map(juego => ({
          productoId: juego.id,
          cantidad: juego.cantidad || 1 
        }))
      };
      
      await axiosClient.post("/api/compras", payload);
      vaciarCarrito();
      
      await Swal.fire({
        icon: "success",
        title: "¡Compra exitosa!",
        text: "Tus juegos y claves ya están en tu biblioteca.",
        background: "#0f172a", 
        color: "#f8fafc", 
        confirmButtonColor: "#0284c7", 
      });
      
      navigate("/tienda/historial");
    } catch (error) {
      // Extracción profunda del error de Spring Boot para no mostrar alertas genéricas
      const mensajeBackend = error.response?.data?.message 
        || error.response?.data?.error 
        || (typeof error.response?.data === 'string' ? error.response.data : null)
        || "Ocurrió un error inesperado al procesar la transacción.";

      Swal.fire({
        icon: "error",
        title: "Transacción rechazada",
        text: mensajeBackend,
        background: "#0f172a",
        color: "#f8fafc",
        confirmButtonColor: "#0284c7",
      });
    } finally {
      setProcesando(false);
    }
  };

  if (carrito.length === 0) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <i className="pi pi-shopping-cart text-6xl text-slate-600 mb-6" />
        <h2 className="text-3xl font-bold text-white mb-4">Tu carrito está vacío</h2>
        <p className="text-slate-400 mb-8">Parece que aún no has agregado juegos a tu lista.</p>
        <Link to="/tienda">
          <Button label="Ir al catálogo" icon="pi pi-arrow-left" className="bg-sky-600 hover:bg-sky-500 border-none" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Mi Carrito</h1>
        <p className="text-slate-400 mt-2">Revisa los juegos antes de finalizar tu compra.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {carrito.map((juego) => (
            <div key={juego.id} className="flex flex-col sm:flex-row gap-5 p-5 bg-slate-900 border border-slate-800 rounded-2xl items-center shadow-lg transition-all hover:border-slate-700">
              <div className="w-full sm:w-32 h-24 shrink-0 rounded-xl overflow-hidden bg-slate-950">
                {juego.imagen ? (
                  <img src={juego.imagen} alt={juego.nombre} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">
                    <i className="pi pi-image text-3xl" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0 text-center sm:text-left w-full">
                <h3 className="text-lg font-bold text-white truncate" title={juego.nombre}>{juego.nombre}</h3>
                
                <div className="flex items-center justify-center sm:justify-start gap-4 mt-3">
                  <p className="text-sky-400 font-bold text-lg">${Number(juego.precio).toFixed(2)}</p>
                  
                  <div className="flex items-center bg-slate-950 rounded-lg border border-slate-700 h-8">
                    <button 
                      onClick={() => actualizarCantidad(juego.id, (juego.cantidad || 1) - 1)}
                      className="px-3 h-full text-slate-400 hover:text-white hover:bg-slate-800 rounded-l-lg transition-colors flex items-center justify-center"
                      disabled={(juego.cantidad || 1) <= 1} 
                    >
                      <i className="pi pi-minus text-[10px]" />
                    </button>
                    <span className="px-3 h-full flex items-center text-white font-bold min-w-[2.5rem] justify-center border-x border-slate-700">
                      {juego.cantidad || 1}
                    </span>
                    <button 
                      onClick={() => actualizarCantidad(juego.id, (juego.cantidad || 1) + 1)}
                      className="px-3 h-full text-slate-400 hover:text-white hover:bg-slate-800 rounded-r-lg transition-colors flex items-center justify-center"
                      disabled={(juego.cantidad || 1) >= juego.stock} 
                    >
                      <i className="pi pi-plus text-[10px]" />
                    </button>
                  </div>
                </div>
              </div>

              <Button 
                icon="pi pi-trash" 
                rounded text severity="danger" 
                aria-label="Eliminar"
                className="hover:bg-red-900/20"
                onClick={() => eliminarDelCarrito(juego.id)}
              />
            </div>
          ))}
          
          <div className="flex justify-end sm:justify-start mt-6">
            <Button label="Vaciar carrito" icon="pi pi-trash" text severity="danger" onClick={vaciarCarrito} size="small" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit sticky top-24 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6">Resumen</h2>
          
          <div className="flex justify-between items-center text-slate-300 mb-4">
            <span>Subtotal ({carrito.length} items)</span>
            <span>${total.toFixed(2)}</span>
          </div>
          
          <div className="flex flex-col border-b border-slate-800 pb-4 mb-4">
            <span className="text-slate-300 mb-2">Método de pago</span>
            <select 
              className="bg-slate-950 border border-slate-700 text-white rounded-lg p-2 outline-none focus:border-sky-500"
              value={metodoSeleccionado}
              onChange={(e) => setMetodoSeleccionado(e.target.value)}
            >
              {metodosPago.length === 0 && <option value="">Cargando métodos...</option>}
              {metodosPago.map(mp => (
                <option key={mp.id} value={mp.id}>{mp.nombre}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-between items-center text-xl font-black text-white pt-2 mb-8">
            <span>Total</span>
            <span className="text-sky-400">${total.toFixed(2)}</span>
          </div>

          <Button 
            label={procesando ? "Procesando pago..." : "Finalizar Compra"} 
            icon={procesando ? "pi pi-spin pi-spinner" : "pi pi-credit-card"} 
            className="w-full bg-sky-600 hover:bg-sky-500 border-none py-3"
            disabled={procesando || !metodoSeleccionado}
            onClick={procesarCompra}
          />
        </div>
      </div>
    </div>
  );
}