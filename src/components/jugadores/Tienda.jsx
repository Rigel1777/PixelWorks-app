import { useEffect, useState } from "react";
import { productoService } from "../../services/productoService";
import { categoriaService } from "../../services/categoriaService";
import { desarrolladorService } from "../../services/desarrolladorService";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Carousel } from "primereact/carousel";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../auth/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Tienda() {
  const [juegosOriginales, setJuegosOriginales] = useState([]);
  const [juegosFiltrados, setJuegosFiltrados] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { estaAutenticado } = useAuth();
  const navigate = useNavigate();
  const { agregarAlCarrito } = useCart();

  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [ordenPrecio, setOrdenPrecio] = useState("asc");

  useEffect(() => {
    cargarCatalogo();
  }, []);

  useEffect(() => {
    let resultado = [...juegosOriginales];

    if (categoriaSeleccionada) {
      resultado = resultado.filter((juego) => juego.categoriaId === categoriaSeleccionada);
    }

    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase();
      resultado = resultado.filter(
        (juego) =>
          juego.nombre.toLowerCase().includes(termino) ||
          juego.desarrolladorNombre.toLowerCase().includes(termino),
      );
    }

    resultado.sort((a, b) => {
      const precioA = Number(a.precioConDescuento ?? a.precio);
      const precioB = Number(b.precioConDescuento ?? b.precio);
      if (ordenPrecio === "asc") {
        return precioA - precioB;
      } else {
        return precioB - precioA;
      }
    });

    setJuegosFiltrados(resultado);
  }, [busqueda, categoriaSeleccionada, ordenPrecio, juegosOriginales]);

  const cargarCatalogo = async () => {
    try {
      setLoading(true);
      const [dataJuegos, dataCategorias, dataDesarrolladores] = await Promise.all([
        productoService.getAll(),
        categoriaService.getAll(),
        desarrolladorService.getAll(),
      ]);

      setCategorias(dataCategorias);

      const juegosEnriquecidos = dataJuegos.map((juego) => {
        const cat = dataCategorias.find((c) => c.id === juego.categoriaId);
        const des = dataDesarrolladores.find((d) => d.id === juego.desarrolladorId);
        return {
          ...juego,
          categoriaNombre: cat ? cat.nombre : "",
          desarrolladorNombre: des ? des.nombre : "",
        };
      });

      setJuegosOriginales(juegosEnriquecidos);
      setJuegosFiltrados(juegosEnriquecidos);
    } catch (error) {
      console.error("Error al cargar la tienda:", error);
    } finally {
      setLoading(false);
    }
  };

  const responsiveOptions = [
    { breakpoint: "1400px", numVisible: 4, numScroll: 1 },
    { breakpoint: "1199px", numVisible: 3, numScroll: 1 },
    { breakpoint: "767px", numVisible: 2, numScroll: 1 },
    { breakpoint: "575px", numVisible: 1, numScroll: 1 },
  ];

  const opcionesOrden = [
    { label: "Precio: del más bajo al más alto", value: "asc" },
    { label: "Precio: del más alto al más bajo", value: "desc" },
  ];

  const carouselTemplate = (juego) => {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl mx-2 overflow-hidden shadow-xl relative group">
        <div className="h-64 bg-slate-950 relative overflow-hidden">
          
          <Link to={`/tienda/juego/${juego.id}`} className="block w-full h-full">
            {juego.imagen ? (
              <img src={juego.imagen} alt={juego.nombre} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><i className="pi pi-image text-5xl text-slate-600" /></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
          </Link>

          <div className="absolute bottom-0 left-0 p-4 w-full flex flex-col justify-end">
            <span className="bg-sky-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider mb-2 w-fit shadow pointer-events-none">Destacado</span>
            
            <Link to={`/tienda/juego/${juego.id}`}>
              <h3 className="text-xl font-black text-white truncate drop-shadow-md hover:text-sky-400 transition-colors">{juego.nombre}</h3>
            </Link>
            
            <div className="flex justify-between items-end mt-2">
              <div className="pointer-events-none">
                {juego.precioConDescuento ? (
                  <div className="flex flex-col">
                    <span className="text-slate-400 line-through text-xs">${Number(juego.precio).toFixed(2)}</span>
                    <span className="text-green-400 font-bold text-lg">${Number(juego.precioConDescuento).toFixed(2)}</span>
                  </div>
                ) : (
                  <span className="text-sky-400 font-bold text-lg block">${Number(juego.precio).toFixed(2)}</span>
                )}
              </div>
              <Button 
                icon={!estaAutenticado ? "pi pi-user" : (juego.stock ?? 0) <= 0 ? "pi pi-ban" : "pi pi-cart-plus"} 
                rounded 
                className={`border-none shadow-lg ${!estaAutenticado ? "bg-slate-700 hover:bg-slate-600 text-white" : (juego.stock ?? 0) <= 0 ? "bg-slate-800 text-slate-500" : "bg-sky-600 hover:bg-sky-500"}`}
                onClick={() => !estaAutenticado ? navigate("/login") : agregarAlCarrito(juego)}
                disabled={(juego.stock ?? 0) <= 0 && estaAutenticado}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCard = (juego) => (
    <div key={juego.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col group">
      
      <Link to={`/tienda/juego/${juego.id}`} className="block h-48 bg-slate-950 relative shrink-0 overflow-hidden">
        {juego.imagen ? (
          <img src={juego.imagen} alt={juego.nombre} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600"><i className="pi pi-image text-4xl" /></div>
        )}
        
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
          {juego.porcentajeDescuento > 0 && (
            <span className="bg-red-600 text-white font-bold px-2 py-0.5 rounded-md text-xs shadow-md">
              -{juego.porcentajeDescuento}%
            </span>
          )}
          <div className="bg-slate-950/90 text-white font-bold px-3 py-1 rounded-lg backdrop-blur-md flex items-center gap-2 shadow-lg border border-slate-800">
            {juego.precioConDescuento ? (
              <>
                <span className="text-slate-500 line-through text-[10px] font-normal">${Number(juego.precio).toFixed(2)}</span>
                <span className="text-green-400">${Number(juego.precioConDescuento).toFixed(2)}</span>
              </>
            ) : (
              <span>${Number(juego.precio).toFixed(2)}</span>
            )}
          </div>
        </div>
      </Link>

      <div className="p-5 flex flex-col flex-1 bg-gradient-to-b from-slate-900 to-slate-950">
        <Link to={`/tienda/juego/${juego.id}`}>
          <h3 className="text-lg font-bold text-white truncate hover:text-sky-400 transition-colors" title={juego.nombre}>{juego.nombre}</h3>
        </Link>
        
        <div className="flex gap-2 mt-2">
          <span className="text-slate-400 border border-slate-700 text-[10px] uppercase font-bold px-2 py-1 rounded-md">
            {juego.categoriaNombre || "Sin categoría"}
          </span>
          <span className="bg-sky-900/20 text-sky-400 border border-sky-900/50 text-[10px] uppercase font-bold px-2 py-1 rounded-md">
            {juego.desarrolladorNombre || "Independiente"}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-3">
      <i
        className={`pi ${
          (juego.stock ?? 0) > 0
            ? "pi-key text-green-400"
            : "pi-ban text-red-400"
        } text-sm`}
      />

      <span
        className={`text-xs font-semibold ${
          (juego.stock ?? 0) > 0
            ? "text-green-400"
            : "text-red-400"
        }`}
      >
        {(juego.stock ?? 0) > 0
          ? `${juego.stock} claves disponibles`
          : "Sin claves disponibles"}
      </span>
    </div>

        <p className="text-sm text-slate-500 mt-3 line-clamp-2 min-h-[40px]">{juego.descripcion || "Sin descripción"}</p>
        
        <div className="mt-auto pt-5">
          <Button 
            label={!estaAutenticado ? "Inicia sesión" : (juego.stock ?? 0) <= 0 ? "Agotado" : "Al carrito"}
            icon={!estaAutenticado ? "pi pi-user" : (juego.stock ?? 0) <= 0 ? "pi pi-ban" : "pi pi-shopping-cart"}
            disabled={(juego.stock ?? 0) <= 0 && estaAutenticado}
            className={`w-full border-none transition-colors shadow-md ${!estaAutenticado ? "bg-slate-700 hover:bg-slate-600 text-white" : (juego.stock ?? 0) <= 0 ? "bg-slate-800 text-slate-500" : "bg-sky-600 hover:bg-sky-500 text-white"}`}
            onClick={() => !estaAutenticado ? navigate("/login") : agregarAlCarrito(juego)}
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
    <div className="max-w-7xl mx-auto space-y-10">
      {!loading && juegosOriginales.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-black text-white mb-6 border-l-4 border-sky-500 pl-3">
            Juegos Populares
          </h2>
          <Carousel
            value={juegosOriginales.slice(0, 8)}
            numVisible={4}
            numScroll={1}
            responsiveOptions={responsiveOptions}
            itemTemplate={carouselTemplate}
            circular
            autoplayInterval={4000}
            className="custom-carousel"
          />
        </div>
      )}

      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-2xl font-black text-white border-l-4 border-sky-500 pl-3">
            Explorar Catálogo
          </h2>

          <Dropdown
            value={ordenPrecio}
            options={opcionesOrden}
            onChange={(e) => setOrdenPrecio(e.value)}
            placeholder="Ordenar por precio"
            className="w-full md:w-80 bg-slate-900 border border-slate-800 text-white rounded-xl flex items-center hover:border-slate-700 transition-colors shadow-inner min-h-[45px]"
          />
        </div>

        <div className="bg-slate-900 border border-slate-800 p-2 md:p-3 rounded-2xl mb-8 shadow-lg flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 flex items-center">
            <i className="pi pi-search absolute left-4 text-slate-400 z-10" />
            <InputText
              placeholder="Buscar por título o desarrollador..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl outline-none focus:border-sky-500 hover:border-slate-700 transition-colors shadow-inner"
            />
          </div>

          <Dropdown
            value={categoriaSeleccionada}
            options={categorias}
            optionLabel="nombre"
            optionValue="id"
            onChange={(e) => setCategoriaSeleccionada(e.value)}
            placeholder="Todas las categorías"
            filter
            filterPlaceholder="Buscar categoría..."
            showClear
            className="w-full md:w-80 bg-slate-950 border border-slate-800 text-white rounded-xl flex items-center hover:border-slate-700 transition-colors shadow-inner min-h-[48px]"
          />
        </div>

        {juegosFiltrados.length === 0 ? (
          <div className="text-center py-20 border border-slate-800 rounded-2xl bg-slate-900/50">
            <i className="pi pi-search text-6xl text-slate-600 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              No se encontraron juegos
            </h2>
            <p className="text-slate-400">
              Prueba con otro término o elimina los filtros.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {juegosFiltrados.map(renderCard)}
          </div>
        )}
      </div>
    </div>
  );
}