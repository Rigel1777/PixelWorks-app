import { useEffect, useMemo, useState } from "react";

import { productoService } from "../../services/productoService";
import { categoriaService } from "../../services/categoriaService";
import { desarrolladorService } from "../../services/desarrolladorService";
import { ofertaService } from "../../services/ofertaService";
import { ofertaProductoService } from "../../services/ofertaProductoService";

import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Carousel } from "primereact/carousel";

import { useCart } from "../../context/CartContext";
import { useAuth } from "../../auth/AuthContext";

import { Link, useNavigate } from "react-router-dom";

export default function OfertasTienda() {
  const [ofertasOriginales, setOfertasOriginales] = useState([]);
  const [productosOferta, setProductosOferta] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const [loading, setLoading] = useState(true);

  const { estaAutenticado } = useAuth();
  const navigate = useNavigate();
  const { agregarAlCarrito } = useCart();

  useEffect(() => {
    cargarOfertas();
  }, []);

  const obtenerFechaActual = () => {
    const ahora = new Date();

    const anio = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const dia = String(ahora.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
  };

  const ofertaEstaActiva = (oferta) => {
    const hoy = obtenerFechaActual();

    return (
      oferta.fechaInicio <= hoy &&
      oferta.fechaFin >= hoy
    );
  };

  const cargarOfertas = async () => {
    try {
      setLoading(true);

      const [
        dataJuegos,
        dataCategorias,
        dataDesarrolladores,
        dataOfertas,
        dataRelaciones,
      ] = await Promise.all([
        productoService.getAll(),
        categoriaService.getAll(),
        desarrolladorService.getAll(),
        ofertaService.getAll(),
        ofertaProductoService.getAll(),
      ]);

      const ofertasActivas = dataOfertas.filter(ofertaEstaActiva);

      /*
       * Creamos un mapa de productos para poder relacionarlos
       * rápidamente con OfertaProducto.
       */
      const productosMap = new Map();

      dataJuegos.forEach((juego) => {
        const categoria = dataCategorias.find(
          (item) => item.id === juego.categoriaId
        );

        const desarrollador = dataDesarrolladores.find(
          (item) => item.id === juego.desarrolladorId
        );

        productosMap.set(juego.id, {
          ...juego,
          categoriaNombre: categoria
            ? categoria.nombre
            : "Sin categoría",
          desarrolladorNombre: desarrollador
            ? desarrollador.nombre
            : "Independiente",
        });
      });

      /*
       * Mapa de ofertas activas.
       */
      const ofertasMap = new Map();

      ofertasActivas.forEach((oferta) => {
        ofertasMap.set(oferta.id, {
          ...oferta,
          productos: [],
        });
      });

      /*
       * Relacionamos:
       *
       * OfertaProducto
       *      ↓
       * Oferta
       *      ↓
       * Producto
       */
      dataRelaciones.forEach((relacion) => {
        const oferta = ofertasMap.get(relacion.ofertaId);
        const producto = productosMap.get(relacion.productoId);

        if (!oferta || !producto) {
          return;
        }

        /*
         * Solo agregamos juegos que actualmente tienen
         * una oferta válida en el DTO del producto.
         */
        const tieneDescuento =
          producto.porcentajeDescuento !== null &&
          producto.porcentajeDescuento !== undefined &&
          Number(producto.porcentajeDescuento) > 0;

        if (!tieneDescuento) {
          return;
        }

        const productoYaAgregado = oferta.productos.some(
          (item) => item.id === producto.id
        );

        if (!productoYaAgregado) {
          oferta.productos.push(producto);
        }
      });

      /*
       * Eliminamos ofertas que no tienen juegos asociados.
       */
      const ofertasFinales = Array.from(ofertasMap.values()).filter(
        (oferta) => oferta.productos.length > 0
      );

      setOfertasOriginales(ofertasFinales);

      /*
       * Para el carrusel tomamos todos los juegos que tienen
       * una oferta activa.
       *
       * Se evita repetir un mismo juego.
       */
      const juegosCarruselMap = new Map();

      ofertasFinales.forEach((oferta) => {
        oferta.productos.forEach((juego) => {
          if (!juegosCarruselMap.has(juego.id)) {
            juegosCarruselMap.set(juego.id, juego);
          }
        });
      });

      setProductosOferta(Array.from(juegosCarruselMap.values()));
    } catch (error) {
      console.error("Error al cargar las ofertas:", error);
      setOfertasOriginales([]);
      setProductosOferta([]);
    } finally {
      setLoading(false);
    }
  };

  /*
   * Filtrado de ofertas.
   *
   * La búsqueda es por juego, pero conserva agrupada
   * la oferta a la que pertenece.
   */
  const ofertasFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    if (!termino) {
      return ofertasOriginales;
    }

    return ofertasOriginales
      .map((oferta) => {
        const productosFiltrados = oferta.productos.filter((juego) =>
          juego.nombre.toLowerCase().includes(termino)
        );

        return {
          ...oferta,
          productos: productosFiltrados,
        };
      })
      .filter((oferta) => oferta.productos.length > 0);
  }, [busqueda, ofertasOriginales]);

  /*
   * Carrusel
   */
  const responsiveOptions = [
    {
      breakpoint: "1400px",
      numVisible: 3,
      numScroll: 1,
    },
    {
      breakpoint: "1199px",
      numVisible: 2,
      numScroll: 1,
    },
    {
      breakpoint: "767px",
      numVisible: 1,
      numScroll: 1,
    },
  ];

  const carouselTemplate = (juego) => {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl mx-2 overflow-hidden shadow-xl relative group">
        <div className="h-64 bg-slate-950 relative overflow-hidden">

          <Link
            to={`/tienda/juego/${juego.id}`}
            className="block w-full h-full"
          >
            {juego.imagen ? (
              <img
                src={juego.imagen}
                alt={juego.nombre}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <i className="pi pi-image text-5xl text-slate-600" />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
          </Link>

          <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-md shadow pointer-events-none">
            -{Number(juego.porcentajeDescuento)}%
          </div>

          <div className="absolute bottom-0 left-0 p-4 w-full flex flex-col justify-end">
            <span className="bg-sky-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider mb-2 w-fit shadow pointer-events-none">
              Oferta
            </span>

            <Link to={`/tienda/juego/${juego.id}`}>
              <h3 className="text-xl font-black text-white truncate drop-shadow-md hover:text-sky-400 transition-colors">
                {juego.nombre}
              </h3>
            </Link>

            <div className="flex justify-between items-end mt-2">
              <div className="pointer-events-none">
                <span className="text-slate-400 line-through text-xs">
                  ${Number(juego.precio).toFixed(2)}
                </span>

                <span className="text-green-400 font-bold text-lg block">
                  $
                  {Number(
                    juego.precioConDescuento ?? juego.precio
                  ).toFixed(2)}
                </span>
              </div>

              <Button
                icon={
                  !estaAutenticado
                    ? "pi pi-user"
                    : (juego.stock ?? 0) <= 0
                      ? "pi pi-ban"
                      : "pi pi-cart-plus"
                }
                rounded
                className={`border-none shadow-lg ${
                  !estaAutenticado
                    ? "bg-slate-700 hover:bg-slate-600 text-white"
                    : (juego.stock ?? 0) <= 0
                      ? "bg-slate-800 text-slate-500"
                      : "bg-sky-600 hover:bg-sky-500"
                }`}
                onClick={() =>
                  !estaAutenticado
                    ? navigate("/login")
                    : agregarAlCarrito(juego)
                }
                disabled={
                  (juego.stock ?? 0) <= 0 && estaAutenticado
                }
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  /*
   * Tarjeta individual del juego dentro de una oferta.
   */
  const renderCard = (juego) => {
    return (
      <div
        key={juego.id}
        className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col group"
      >
        <Link
          to={`/tienda/juego/${juego.id}`}
          className="block h-48 bg-slate-950 relative shrink-0 overflow-hidden"
        >
          {juego.imagen ? (
            <img
              src={juego.imagen}
              alt={juego.nombre}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600">
              <i className="pi pi-image text-4xl" />
            </div>
          )}

          <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
            <span className="bg-red-600 text-white font-bold px-2 py-0.5 rounded-md text-xs shadow-md">
              -{Number(juego.porcentajeDescuento)}%
            </span>

            <div className="bg-slate-950/90 text-white font-bold px-3 py-1 rounded-lg backdrop-blur-md flex items-center gap-2 shadow-lg border border-slate-800">
              <span className="text-slate-500 line-through text-[10px] font-normal">
                ${Number(juego.precio).toFixed(2)}
              </span>

              <span className="text-green-400">
                $
                {Number(
                  juego.precioConDescuento ?? juego.precio
                ).toFixed(2)}
              </span>
            </div>
          </div>
        </Link>

        <div className="p-5 flex flex-col flex-1 bg-gradient-to-b from-slate-900 to-slate-950">
          <Link to={`/tienda/juego/${juego.id}`}>
            <h3
              className="text-lg font-bold text-white truncate hover:text-sky-400 transition-colors"
              title={juego.nombre}
            >
              {juego.nombre}
            </h3>
          </Link>

          <div className="flex gap-2 mt-2 flex-wrap">
            <span className="text-slate-400 border border-slate-700 text-[10px] uppercase font-bold px-2 py-1 rounded-md">
              {juego.categoriaNombre || "Sin categoría"}
            </span>

            <span className="bg-sky-900/20 text-sky-400 border border-sky-900/50 text-[10px] uppercase font-bold px-2 py-1 rounded-md">
              {juego.desarrolladorNombre || "Independiente"}
            </span>
          </div>

          <p className="text-sm text-slate-500 mt-3 line-clamp-2 min-h-[40px]">
            {juego.descripcion || "Sin descripción"}
          </p>

          <div className="flex items-center gap-2 mt-4">
            {(juego.stock ?? 0) > 0 ? (
              <>
                <i className="pi pi-key text-green-400" />
                <span className="text-xs text-green-400 font-semibold">
                  {juego.stock} claves disponibles
                </span>
              </>
            ) : (
              <>
                <i className="pi pi-ban text-red-400" />
                <span className="text-xs text-red-400 font-semibold">
                  Sin claves disponibles
                </span>
              </>
            )}
          </div>

          <div className="mt-auto pt-5">
            <Button
              label={
                !estaAutenticado
                  ? "Inicia sesión"
                  : (juego.stock ?? 0) <= 0
                    ? "Agotado"
                    : "Al carrito"
              }
              icon={
                !estaAutenticado
                  ? "pi pi-user"
                  : (juego.stock ?? 0) <= 0
                    ? "pi pi-ban"
                    : "pi pi-shopping-cart"
              }
              disabled={
                (juego.stock ?? 0) <= 0 && estaAutenticado
              }
              className={`w-full border-none transition-colors shadow-md ${
                !estaAutenticado
                  ? "bg-slate-700 hover:bg-slate-600 text-white"
                  : (juego.stock ?? 0) <= 0
                    ? "bg-slate-800 text-slate-500"
                    : "bg-sky-600 hover:bg-sky-500 text-white"
              }`}
              onClick={() =>
                !estaAutenticado
                  ? navigate("/login")
                  : agregarAlCarrito(juego)
              }
            />
          </div>
        </div>
      </div>
    );
  };

  /*
   * Formato de fecha para mostrar al usuario.
   */
  const formatearFecha = (fecha) => {
    if (!fecha) {
      return "";
    }

    const partes = fecha.split("-");

    if (partes.length !== 3) {
      return fecha;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <i className="pi pi-spin pi-spinner text-4xl text-sky-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12">

      {productosOferta.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-white border-l-4 border-sky-500 pl-3">
              Grandes Ofertas
            </h2>

            <span className="text-sm text-slate-500">
              Juegos en promoción
            </span>
          </div>

          <Carousel
            value={productosOferta.slice(0, 8)}
            numVisible={3}
            numScroll={1}
            responsiveOptions={responsiveOptions}
            itemTemplate={carouselTemplate}
            circular
            autoplayInterval={4500}
            className="custom-carousel"
          />
        </section>
      )}

      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-black text-white border-l-4 border-sky-500 pl-3">
            Ofertas disponibles
          </h2>

          <p className="text-slate-400 mt-2">
            Explora nuestras promociones y encuentra tus videojuegos favoritos.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-2 md:p-3 rounded-2xl mb-10 shadow-lg">
          <div className="relative flex items-center">
            <i className="pi pi-search absolute left-4 text-slate-400 z-10" />

            <InputText
              placeholder="Buscar juego en oferta..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl outline-none focus:border-sky-500 hover:border-slate-700 transition-colors shadow-inner"
            />
          </div>
        </div>

        {ofertasOriginales.length === 0 ? (
          <div className="text-center py-20 border border-slate-800 rounded-2xl bg-slate-900/50">
            <i className="pi pi-tag text-6xl text-slate-600 mb-4" />

            <h2 className="text-2xl font-bold text-white mb-2">
              No hay ofertas activas
            </h2>

            <p className="text-slate-400 mb-6">
              Vuelve pronto para descubrir nuevas promociones en videojuegos.
            </p>

            <Link to="/tienda">
              <Button
                label="Ver todo el catálogo"
                icon="pi pi-arrow-left"
                className="bg-sky-600 hover:bg-sky-500 border-none"
              />
            </Link>
          </div>
        ) : ofertasFiltradas.length === 0 ? (
          <div className="text-center py-20 border border-slate-800 rounded-2xl bg-slate-900/50">
            <i className="pi pi-search text-6xl text-slate-600 mb-4" />

            <h2 className="text-2xl font-bold text-white mb-2">
              No se encontraron juegos
            </h2>

            <p className="text-slate-400">
              Prueba con otro nombre de videojuego.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {ofertasFiltradas.map((oferta) => (
              <section
                key={oferta.id}
                className="border border-slate-800 rounded-2xl bg-slate-900/40 overflow-hidden"
              >
                <div className="p-6 border-b border-slate-800 bg-slate-900">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-black text-white">
                        {oferta.nombre}
                      </h3>

                      <p className="text-slate-400 text-sm mt-1">
                        Del {formatearFecha(oferta.fechaInicio)} al{" "}
                        {formatearFecha(oferta.fechaFin)}
                      </p>
                    </div>

                    <div className="bg-red-600/10 border border-red-500/30 text-red-400 font-black px-4 py-2 rounded-xl w-fit">
                      Hasta {Number(oferta.porcentajeDescuento)}% OFF
                    </div>
                  </div>
                </div>

                <div className="p-5 md:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {oferta.productos.map(renderCard)}
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}