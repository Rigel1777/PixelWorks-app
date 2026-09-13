import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import Swal from "sweetalert2";
import { compraService } from "../../services/compraService";

export default function Carrito() {
  const {
    carrito,
    eliminarDelCarrito,
    vaciarCarrito,
    total,
    actualizarCantidad,
  } = useCart();

  const [procesando, setProcesando] = useState(false);
  const [metodosPago, setMetodosPago] = useState([]);
  const [metodoSeleccionado, setMetodoSeleccionado] = useState("");
  const [cargandoMetodosPago, setCargandoMetodosPago] = useState(true);
  const [errorMetodosPago, setErrorMetodosPago] = useState(false);

  const navigate = useNavigate();

  const [datosTarjeta, setDatosTarjeta] = useState({
    numero: "",
    fecha: "",
    cvv: "",
    titular: "",
  });

  const [paypalEmail, setPaypalEmail] = useState("");

  useEffect(() => {
    let montado = true;

    const cargarMetodosPago = async () => {
      setCargandoMetodosPago(true);
      setErrorMetodosPago(false);

      try {
        const response = await fetchMetodosPago();

        if (!montado) {
          return;
        }

        setMetodosPago(response);

        if (response.length > 0) {
          setMetodoSeleccionado(String(response[0].id));
        } else {
          setMetodoSeleccionado("");
        }
      } catch (error) {
        console.error("Fallo al cargar métodos de pago", error);

        if (!montado) {
          return;
        }

        setMetodosPago([]);
        setMetodoSeleccionado("");
        setErrorMetodosPago(true);
      } finally {
        if (montado) {
          setCargandoMetodosPago(false);
        }
      }
    };

    cargarMetodosPago();

    return () => {
      montado = false;
    };
  }, []);

  const fetchMetodosPago = async () => {
    const token =
      localStorage.getItem("autofix_token") ||
      localStorage.getItem("pixelworks_token");

    const respuesta = await fetch(
      `${import.meta.env.VITE_API_URL}/api/metodos-pago`,
      {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      }
    );

    if (!respuesta.ok) {
      throw new Error(
        `Error al cargar métodos de pago: ${respuesta.status}`
      );
    }

    return await respuesta.json();
  };

  const manejarCambioTitular = (e) => {
    const valorLimpio = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");

    setDatosTarjeta({
      ...datosTarjeta,
      titular: valorLimpio,
    });
  };

  const manejarCambioFecha = (e) => {
    let valor = e.target.value.replace(/\D/g, "");

    if (valor.length > 4) {
      valor = valor.substring(0, 4);
    }

    if (valor.length >= 3) {
      valor = valor.substring(0, 2) + "/" + valor.substring(2, 4);
    }

    setDatosTarjeta({
      ...datosTarjeta,
      fecha: valor,
    });
  };

  const manejarCambioNumero = (e) => {
    let valor = e.target.value.replace(/\D/g, "");

    if (valor.length > 16) {
      valor = valor.substring(0, 16);
    }

    valor = valor.replace(/(.{4})/g, "$1 ").trim();

    setDatosTarjeta({
      ...datosTarjeta,
      numero: valor,
    });
  };

  const manejarCambioCVV = (e) => {
    let valor = e.target.value.replace(/\D/g, "");

    if (valor.length > 4) {
      valor = valor.substring(0, 4);
    }

    setDatosTarjeta({
      ...datosTarjeta,
      cvv: valor,
    });
  };

  const procesarCompra = async () => {
    if (carrito.length === 0) {
      return;
    }

    if (!metodoSeleccionado) {
      await Swal.fire({
        icon: "warning",
        title: "Método de pago requerido",
        text: "Selecciona un método de pago para continuar.",
        background: "#0f172a",
        color: "#f8fafc",
        confirmButtonColor: "#0284c7",
      });

      return;
    }

    const metodoActual =
      metodosPago
        .find((m) => m.id === Number(metodoSeleccionado))
        ?.nombre?.toLowerCase() || "";

    if (
      metodoActual.includes("debito") ||
      metodoActual.includes("crédito") ||
      metodoActual.includes("credito")
    ) {
      if (
        !datosTarjeta.numero ||
        !datosTarjeta.fecha ||
        !datosTarjeta.cvv ||
        !datosTarjeta.titular
      ) {
        await Swal.fire({
          icon: "warning",
          title: "Campos incompletos",
          text: "Por favor, llena los datos de tu tarjeta.",
          background: "#0f172a",
          color: "#f8fafc",
          confirmButtonColor: "#0284c7",
        });

        return;
      }
    } else if (metodoActual.includes("paypal")) {
      if (!paypalEmail.trim()) {
        await Swal.fire({
          icon: "warning",
          title: "Campos incompletos",
          text: "Ingresa tu correo de PayPal.",
          background: "#0f172a",
          color: "#f8fafc",
          confirmButtonColor: "#0284c7",
        });

        return;
      }
    }

    setProcesando(true);

    try {
      await compraService.procesarCheckout(
        carrito,
        Number(metodoSeleccionado)
      );

      vaciarCarrito();

      await Swal.fire({
        icon: "success",
        title: "¡Compra exitosa!",
        text: "Tus juegos y claves ya están en tu biblioteca.",
        background: "#0f172a",
        color: "#f8fafc",
        confirmButtonColor: "#0284c7",
      });

      navigate("/tienda/historial", { replace: true });
    } catch (error) {
      console.error("Error al procesar la compra:", error);

      const mensajeBackend =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Ocurrió un error inesperado al procesar la transacción.";

      await Swal.fire({
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

        <h2 className="text-3xl font-bold text-white mb-4">
          Tu carrito está vacío
        </h2>

        <p className="text-slate-400 mb-8">
          Parece que aún no has agregado juegos a tu lista.
        </p>

        <Link to="/tienda">
          <Button
            label="Ir al catálogo"
            icon="pi pi-arrow-left"
            className="bg-sky-600 hover:bg-sky-500 border-none px-6 py-3"
          />
        </Link>
      </div>
    );
  }

  const metodoSeleccionadoObj = metodosPago.find(
    (m) => m.id === Number(metodoSeleccionado)
  );

  const nombreMetodo = metodoSeleccionadoObj
    ? metodoSeleccionadoObj.nombre?.toLowerCase() || ""
    : "";

  const esTarjeta =
    nombreMetodo.includes("debito") ||
    nombreMetodo.includes("crédito") ||
    nombreMetodo.includes("credito");

  const esPaypal = nombreMetodo.includes("paypal");

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white border-l-4 border-sky-500 pl-3">
          Mi Carrito
        </h1>

        <p className="text-slate-400 mt-2">
          Revisa tus juegos antes de proceder al pago seguro.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {carrito.map((juego) => (
            <div
              key={juego.id}
              className="flex flex-col sm:flex-row gap-5 p-4 bg-slate-900 border border-slate-800 rounded-2xl items-center shadow-lg hover:border-sky-900/50 transition-colors"
            >
              <div className="w-full sm:w-28 h-20 shrink-0 rounded-xl overflow-hidden bg-slate-950 relative">
                {juego.imagen ? (
                  <img
                    src={juego.imagen}
                    alt={juego.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">
                    <i className="pi pi-image text-2xl" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 text-center sm:text-left w-full">
                <h3
                  className="text-lg font-bold text-white truncate"
                  title={juego.nombre}
                >
                  {juego.nombre}
                </h3>

                <div className="flex items-center justify-center sm:justify-start gap-4 mt-2">
                  <div className="flex flex-col items-center sm:items-start leading-tight">
                    {juego.precioConDescuento ? (
                      <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                        <span className="text-slate-500 line-through text-xs font-semibold">
                          ${Number(juego.precio).toFixed(2)}
                        </span>

                        <span className="text-green-400 font-bold text-lg">
                          $
                          {Number(juego.precioConDescuento).toFixed(2)}
                        </span>

                        <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          -{juego.porcentajeDescuento}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-sky-400 font-bold text-lg">
                        ${Number(juego.precio).toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center bg-slate-950 rounded-lg border border-slate-700 h-8 ml-auto sm:ml-0">
                    <button
                      onClick={() =>
                        actualizarCantidad(
                          juego.id,
                          (juego.cantidad || 1) - 1
                        )
                      }
                      disabled={(juego.cantidad || 1) <= 1}
                      className="px-3 h-full text-slate-400 hover:text-white hover:bg-slate-800 rounded-l-lg transition-colors flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <i className="pi pi-minus text-[10px]" />
                    </button>

                    <span className="px-3 h-full flex items-center text-white font-bold min-w-[2.5rem] justify-center border-x border-slate-700">
                      {juego.cantidad || 1}
                    </span>

                    <button
                      onClick={() =>
                        actualizarCantidad(
                          juego.id,
                          (juego.cantidad || 1) + 1
                        )
                      }
                      disabled={
                        (juego.cantidad || 1) >= (juego.stock ?? 0)
                      }
                      className="px-3 h-full text-slate-400 hover:text-white hover:bg-slate-800 rounded-r-lg transition-colors flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <i className="pi pi-plus text-[10px]" />
                    </button>
                  </div>
                </div>
              </div>

              <Button
                icon="pi pi-trash"
                rounded
                text
                severity="danger"
                aria-label="Eliminar"
                className="hover:bg-red-900/20"
                onClick={() => eliminarDelCarrito(juego.id)}
              />
            </div>
          ))}

          <div className="flex justify-end sm:justify-start mt-6">
            <Button
              label="Vaciar carrito"
              icon="pi pi-trash"
              text
              severity="danger"
              onClick={vaciarCarrito}
              size="small"
            />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit sticky top-24 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 border-b border-slate-800 pb-4">
            Resumen del Pedido
          </h2>

          <div className="flex justify-between items-center text-slate-300 mb-4">
            <span>Subtotal ({carrito.length} items)</span>
            <span className="font-bold text-white">
              ${total.toFixed(2)}
            </span>
          </div>

          <div className="flex flex-col mt-6 mb-2">
            <span className="text-slate-300 font-semibold mb-2 text-sm">
              Método de pago
            </span>

            <select
              className="bg-slate-950 border border-slate-700 text-white rounded-lg p-3 outline-none focus:border-sky-500 shadow-inner appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              value={metodoSeleccionado}
              onChange={(e) => setMetodoSeleccionado(e.target.value)}
              disabled={cargandoMetodosPago || errorMetodosPago}
            >
              {cargandoMetodosPago && (
                <option value="">Cargando...</option>
              )}

              {!cargandoMetodosPago &&
                !errorMetodosPago &&
                metodosPago.length === 0 && (
                  <option value="">
                    No hay métodos de pago disponibles
                  </option>
                )}

              {errorMetodosPago && (
                <option value="">
                  Error al cargar métodos de pago
                </option>
              )}

              {!cargandoMetodosPago &&
                !errorMetodosPago &&
                metodosPago.map((mp) => (
                  <option key={mp.id} value={mp.id}>
                    {mp.nombre}
                  </option>
                ))}
            </select>

            {errorMetodosPago && (
              <span className="text-red-400 text-xs mt-2">
                No fue posible cargar los métodos de pago.
              </span>
            )}

            {!cargandoMetodosPago &&
              !errorMetodosPago &&
              metodosPago.length === 0 && (
                <span className="text-yellow-400 text-xs mt-2">
                  No existen métodos de pago registrados.
                </span>
              )}
          </div>

          <div className="transition-all duration-300 overflow-hidden">
            {esTarjeta ? (
              <div className="mt-4 p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 shadow-inner">
                <div className="flex items-center gap-2 mb-2 text-slate-400 text-sm">
                  <i className="pi pi-credit-card" />
                  Datos de Tarjeta
                </div>

                <InputText
                  placeholder="0000 0000 0000 0000"
                  className="w-full bg-slate-900 border-slate-700 text-white rounded-lg px-3 py-2"
                  value={datosTarjeta.numero}
                  onChange={manejarCambioNumero}
                  maxLength={19}
                  inputMode="numeric"
                />

                <div className="flex gap-3">
                  <InputText
                    placeholder="MM/YY"
                    className="w-1/2 bg-slate-900 border-slate-700 text-white rounded-lg px-3 py-2"
                    value={datosTarjeta.fecha}
                    onChange={manejarCambioFecha}
                    maxLength={5}
                    inputMode="numeric"
                  />

                  <InputText
                    placeholder="CVV"
                    className="w-1/2 bg-slate-900 border-slate-700 text-white rounded-lg px-3 py-2"
                    value={datosTarjeta.cvv}
                    onChange={manejarCambioCVV}
                    maxLength={4}
                    type="password"
                    inputMode="numeric"
                  />
                </div>

                <InputText
                  placeholder="Nombre en la tarjeta"
                  className="w-full bg-slate-900 border-slate-700 text-white rounded-lg px-3 py-2 uppercase"
                  value={datosTarjeta.titular}
                  onChange={manejarCambioTitular}
                  maxLength={50}
                />
              </div>
            ) : esPaypal ? (
              <div className="mt-4 p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 shadow-inner">
                <div className="flex items-center gap-2 mb-2 text-sky-400 text-sm font-bold">
                  <i className="pi pi-paypal" />
                  PayPal Checkout
                </div>

                <InputText
                  placeholder="Correo electrónico asociado"
                  className="w-full bg-slate-900 border-slate-700 text-white rounded-lg px-3 py-2"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  type="email"
                />
              </div>
            ) : null}
          </div>

          <div className="flex justify-between items-center text-xl font-black text-white border-t border-slate-800 pt-6 mt-6 mb-8">
            <span>Total a pagar</span>

            <span className="text-sky-400">
              ${total.toFixed(2)}
            </span>
          </div>

          <Button
            label={procesando ? "Procesando pago..." : "Pagar Seguro"}
            icon={
              procesando
                ? "pi pi-spin pi-spinner"
                : "pi pi-lock"
            }
            className="w-full bg-sky-600 hover:bg-sky-500 border-none py-3 text-lg font-bold shadow-lg shadow-sky-600/20"
            disabled={
              procesando ||
              !metodoSeleccionado ||
              cargandoMetodosPago ||
              errorMetodosPago ||
              metodosPago.length === 0
            }
            onClick={procesarCompra}
          />

          <div className="text-center mt-4 flex items-center justify-center gap-2 text-slate-500 text-xs">
            <i className="pi pi-check-circle text-green-500" />
            Pago cifrado y protegido
          </div>
        </div>
      </div>
    </div>
  );
}