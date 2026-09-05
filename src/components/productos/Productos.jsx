import { useEffect, useRef, useState } from "react";

import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Toast } from "primereact/toast";

import Swal from "sweetalert2";

import { productoService } from "../../services/productoService";
import { categoriaService } from "../../services/categoriaService";
import { desarrolladorService } from "../../services/desarrolladorService";

import { useAuth } from "../../auth/AuthContext";

export default function Productos() {
  const toast = useRef(null);

  const { tienePermiso } = useAuth();

  const puedeAdministrar = tienePermiso([
    "ADMIN",
    "DESARROLLADOR",
  ]);

  

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [desarrolladores, setDesarrolladores] = useState([]);

  const [loading, setLoading] = useState(true);

  const [dialogVisible, setDialogVisible] = useState(false);

  const [productoSeleccionado, setProductoSeleccionado] =
    useState(null);

  const [submitted, setSubmitted] = useState(false);

  const [globalFilter, setGlobalFilter] = useState("");

  const [producto, setProducto] = useState({
    nombre: "",
    descripcion: "",
    anioLanzamiento: null,
    precio: null,
    imagen: "",
    categoriaId: null,
    desarrolladorId: null,
  });



  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      const [
        productosData,
        categoriasData,
        desarrolladoresData,
      ] = await Promise.all([
        productoService.getAll(),
        categoriaService.getAll(),
        desarrolladorService.getAll(),
      ]);

      setProductos(productosData);
      setCategorias(categoriasData);
      setDesarrolladores(desarrolladoresData);
    } catch (error) {
      mostrarError(error);
    } finally {
      setLoading(false);
    }
  };



  const mostrarExito = (mensaje) => {
    toast.current?.show({
      severity: "success",
      summary: "Operación exitosa",
      detail: mensaje,
      life: 3000,
    });
  };

  const mostrarError = (error) => {
    console.error(error);

    const mensaje =
      error?.response?.data?.message ||
      "No se pudieron cargar los datos.";

    toast.current?.show({
      severity: "error",
      summary: "Error",
      detail: mensaje,
      life: 4000,
    });
  };

 

  const abrirNuevo = () => {
    setProductoSeleccionado(null);

    setProducto({
      nombre: "",
      descripcion: "",
      anioLanzamiento: null,
      precio: null,
      imagen: "",
      categoriaId: null,
      desarrolladorId: null,
    });

    setSubmitted(false);
    setDialogVisible(true);
  };



  const abrirEditar = (productoActual) => {
    setProductoSeleccionado(productoActual);

    setProducto({
      nombre: productoActual.nombre || "",
      descripcion: productoActual.descripcion || "",

      anioLanzamiento: productoActual.anioLanzamiento
        ? new Date(`${productoActual.anioLanzamiento}T00:00:00`)
        : null,

      precio: productoActual.precio ?? null,

      imagen: productoActual.imagen || "",

      categoriaId: productoActual.categoriaId ?? null,

      desarrolladorId:
        productoActual.desarrolladorId ?? null,
    });

    setSubmitted(false);
    setDialogVisible(true);
  };

  

  const cerrarDialog = () => {
    setDialogVisible(false);
    setSubmitted(false);
  };



  const validarFormulario = () => {
    if (!producto.nombre.trim()) {
      return "El nombre es obligatorio.";
    }

    if (producto.nombre.trim().length > 50) {
      return "El nombre no puede superar 50 caracteres.";
    }

    if (
      producto.descripcion &&
      producto.descripcion.trim().length > 100
    ) {
      return "La descripción no puede superar 100 caracteres.";
    }

    if (
      producto.precio === null ||
      producto.precio === undefined
    ) {
      return "El precio es obligatorio.";
    }

    if (producto.precio < 0) {
      return "El precio no puede ser negativo.";
    }

    if (!producto.categoriaId) {
      return "Debe seleccionar una categoría.";
    }

    if (!producto.desarrolladorId) {
      return "Debe seleccionar un desarrollador.";
    }

   

    const nombreNormalizado =
      producto.nombre.trim().toLowerCase();

    const duplicado = productos.some((item) => {
      if (
        productoSeleccionado &&
        item.id === productoSeleccionado.id
      ) {
        return false;
      }

      return (
        item.nombre?.trim().toLowerCase() ===
        nombreNormalizado
      );
    });

    if (duplicado) {
      return "Ya existe un juego con ese nombre.";
    }

    return null;
  };

 

  const guardarProducto = async () => {
    setSubmitted(true);

    const errorValidacion = validarFormulario();

    if (errorValidacion) {
      toast.current?.show({
        severity: "warn",
        summary: "Validación",
        detail: errorValidacion,
        life: 3500,
      });

      return;
    }

    try {
      const dto = {
        nombre: producto.nombre.trim(),

        descripcion:
          producto.descripcion?.trim() || null,

        anioLanzamiento: producto.anioLanzamiento
          ? producto.anioLanzamiento
              .toISOString()
              .split("T")[0]
          : null,

        precio: producto.precio,

        imagen:
          producto.imagen?.trim() || null,

        categoriaId: producto.categoriaId,

        desarrolladorId:
          producto.desarrolladorId,
      };

     

      if (productoSeleccionado) {
        const actualizado =
          await productoService.update(
            productoSeleccionado.id,
            dto
          );

        setProductos((actuales) =>
          actuales.map((item) =>
            item.id === actualizado.id
              ? actualizado
              : item
          )
        );

        mostrarExito(
          "Juego actualizado correctamente."
        );
      }

      

      else {
        const nuevo =
          await productoService.create(dto);

        setProductos((actuales) => [
          ...actuales,
          nuevo,
        ]);

        mostrarExito(
          "Juego creado correctamente."
        );
      }

      cerrarDialog();
    } catch (error) {
      mostrarError(error);
    }
  };

  

  const eliminarProducto = async (productoActual) => {
    const resultado = await Swal.fire({
      title: "¿Eliminar juego?",
      text: `Se eliminará "${productoActual.nombre}".`,

      icon: "warning",

      showCancelButton: true,

      confirmButtonText: "Sí, eliminar",

      cancelButtonText: "Cancelar",

      reverseButtons: true,
    });

    if (!resultado.isConfirmed) {
      return;
    }

    try {
      await productoService.delete(
        productoActual.id
      );

      setProductos((actuales) =>
        actuales.filter(
          (item) => item.id !== productoActual.id
        )
      );

      mostrarExito(
        "Juego eliminado correctamente."
      );
    } catch (error) {
      mostrarError(error);
    }
  };



  const obtenerNombreCategoria = (id) => {
    const categoria = categorias.find(
      (item) => item.id === id
    );

    return categoria?.nombre || "Sin categoría";
  };

  const obtenerNombreDesarrollador = (id) => {
    const desarrollador = desarrolladores.find(
      (item) => item.id === id
    );

    return (
      desarrollador?.nombre ||
      "Sin desarrollador"
    );
  };

 

  const productosFiltrados = productos.filter(
    (item) => {
      const texto =
        globalFilter.trim().toLowerCase();

      if (!texto) {
        return true;
      }

      const nombre =
        item.nombre?.toLowerCase() || "";

      const descripcion =
        item.descripcion?.toLowerCase() || "";

      const categoria =
        obtenerNombreCategoria(
          item.categoriaId
        ).toLowerCase();

      const desarrollador =
        obtenerNombreDesarrollador(
          item.desarrolladorId
        ).toLowerCase();

      return (
        nombre.includes(texto) ||
        descripcion.includes(texto) ||
        categoria.includes(texto) ||
        desarrollador.includes(texto)
      );
    }
  );



  const renderImagen = (productoActual) => {
    if (!productoActual.imagen) {
      return (
        <div
          className="w-full h-full
                     flex items-center justify-center
                     bg-slate-950"
        >
          <div className="text-center">

            <i
              className="pi pi-image
                         text-5xl text-slate-600"
            />

            <p className="text-xs text-slate-500 mt-2">
              Sin imagen
            </p>

          </div>
        </div>
      );
    }

    return (
      <img
        src={productoActual.imagen}
        alt={productoActual.nombre}
        className="w-full h-full object-cover
                   transition-transform duration-500
                   group-hover:scale-105"
        onError={(e) => {
          e.currentTarget.onerror = null;

          e.currentTarget.src =
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%230f172a'/%3E%3Ctext x='400' y='215' text-anchor='middle' fill='%2364748b' font-size='28' font-family='Arial'%3ESin imagen%3C/text%3E%3C/svg%3E";
        }}
      />
    );
  };



  const renderCard = (productoActual) => {
    return (
      <div
        key={productoActual.id}
        className="
          group
          overflow-hidden
          rounded-2xl
          bg-slate-950
          border border-slate-700
          shadow-lg
          hover:border-slate-600
          hover:shadow-2xl
          hover:-translate-y-1
          transition-all
          duration-300
        "
      >

       

        <div
          className="
            relative
            w-full
            h-52
            overflow-hidden
            bg-slate-950
          "
        >

          {renderImagen(productoActual)}

       

          <div
            className="
              absolute
              top-3
              right-3
              px-3
              py-1.5
              rounded-lg
              bg-black/80
              backdrop-blur-sm
              border border-slate-700
              text-white
              font-bold
              text-sm
            "
          >
            $
            {Number(
              productoActual.precio || 0
            ).toFixed(2)}
          </div>

        </div>

      

        <div
          className="
            p-5
            bg-slate-950
          "
        >

       

          <h3
            className="
              text-xl
              font-bold
              text-white
              truncate
            "
            title={productoActual.nombre}
          >
            {productoActual.nombre}
          </h3>

        

          <p
            className="
              text-sm
              text-slate-300
              mt-2
              leading-relaxed
              line-clamp-2
              min-h-[42px]
            "
          >
            {productoActual.descripcion ||
              "Sin descripción disponible."}
          </p>

          {/* INFORMACIÓN */}

          <div
            className="
              mt-5
              space-y-3
            "
          >

       

            <div className="flex items-center gap-3">

              <i
                className="
                  pi pi-tags
                  text-slate-300
                  text-sm
                "
              />

              <span
                className="
                  text-sm
                  text-slate-200
                  truncate
                "
              >
                {obtenerNombreCategoria(
                  productoActual.categoriaId
                )}
              </span>

            </div>

          

            <div className="flex items-center gap-3">

              <i
                className="
                  pi pi-building
                  text-slate-300
                  text-sm
                "
              />

              <span
                className="
                  text-sm
                  text-slate-200
                  truncate
                "
              >
                {obtenerNombreDesarrollador(
                  productoActual.desarrolladorId
                )}
              </span>

            </div>

            {/* FECHA */}

            <div className="flex items-center gap-3">

              <i
                className="
                  pi pi-calendar
                  text-slate-300
                  text-sm
                "
              />

              <span
                className="
                  text-sm
                  text-slate-200
                "
              >
                {productoActual.anioLanzamiento ||
                  "Sin fecha"}
              </span>

            </div>

          </div>

       

          {puedeAdministrar && (
            <div
              className="
                flex
                justify-end
                gap-2
                mt-5
                pt-4
                border-t
                border-slate-700
              "
            >

              {/* EDITAR */}

              <Button
                icon="pi pi-pencil"
                rounded
                outlined
                severity="warning"
                tooltip="Editar juego"
                tooltipOptions={{
                  position: "top",
                }}
                onClick={() =>
                  abrirEditar(productoActual)
                }
              />

              {/* ELIMINAR */}

              <Button
                icon="pi pi-trash"
                rounded
                outlined
                severity="danger"
                tooltip="Eliminar juego"
                tooltipOptions={{
                  position: "top",
                }}
                onClick={() =>
                  eliminarProducto(
                    productoActual
                  )
                }
              />

            </div>
          )}

        </div>

      </div>
    );
  };



  const footerDialog = (
    <div
      className="
        flex
        justify-end
        gap-2
      "
    >

      <Button
        label="Cancelar"
        icon="pi pi-times"
        severity="secondary"
        outlined
        onClick={cerrarDialog}
      />

      <Button
        label={
          productoSeleccionado
            ? "Actualizar juego"
            : "Guardar juego"
        }
        icon="pi pi-check"
        onClick={guardarProducto}
      />

    </div>
  );

 

  return (
    <>
      <Toast ref={toast} />

      <div
        className="
          p-2
          sm:p-4
        "
      >

      

        <div className="mb-6">

          <h2
            className="
              text-3xl
              font-bold
              text-white
            "
          >
            Juegos
          </h2>

          <p
            className="
              text-slate-400
              mt-1
            "
          >
            Administra el catálogo de juegos
            de PixelWorks.
          </p>

        </div>

        

        <div
          className="
            flex
            flex-col
            md:flex-row
            md:items-center
            gap-3
            mb-7
          "
        >

       

          <div className="flex-1 relative">

            <i
              className="
                pi pi-search
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-slate-400
                z-10
              "
            />

            <InputText
              value={globalFilter}
              onChange={(e) =>
                setGlobalFilter(
                  e.target.value
                )
              }
              placeholder="Buscar juegos..."
              className="
                w-full
                pl-11
              "
            />

          </div>

        

          {puedeAdministrar && (
            <Button
              label="Nuevo juego"
              icon="pi pi-plus"
              onClick={abrirNuevo}
            />
          )}

        </div>

      

        <div className="mb-5">

          <span
            className="
              text-sm
              text-slate-400
            "
          >
            {productosFiltrados.length}{" "}
            {productosFiltrados.length === 1
              ? "juego encontrado"
              : "juegos encontrados"}
          </span>

        </div>

      

        {loading && (
          <div
            className="
              flex
              flex-col
              items-center
              justify-center
              py-20
            "
          >

            <i
              className="
                pi
                pi-spin
                pi-spinner
                text-4xl
                text-slate-500
              "
            />

            <p
              className="
                mt-4
                text-slate-400
              "
            >
              Cargando juegos...
            </p>

          </div>
        )}

        

        {!loading &&
          productosFiltrados.length === 0 && (
            <div
              className="
                flex
                flex-col
                items-center
                justify-center
                py-20
                text-center
              "
            >

              <div
                className="
                  w-20
                  h-20
                  rounded-full
                  bg-slate-900
                  border
                  border-slate-700
                  flex
                  items-center
                  justify-center
                "
              >

                <i
                  className="
                    pi
                    pi-search
                    text-3xl
                    text-slate-500
                  "
                />

              </div>

              <h3
                className="
                  text-xl
                  font-semibold
                  text-white
                  mt-5
                "
              >
                No se encontraron juegos
              </h3>

              <p
                className="
                  text-slate-400
                  mt-2
                  max-w-md
                "
              >
                No existen juegos que coincidan
                con la búsqueda actual.
              </p>

            </div>
          )}


        {!loading &&
          productosFiltrados.length > 0 && (
            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                xl:grid-cols-3
                2xl:grid-cols-4
                gap-6
              "
            >
              {productosFiltrados.map(
                renderCard
              )}
            </div>
          )}

      </div>

     

      <Dialog
        visible={dialogVisible}
        onHide={cerrarDialog}

        header={
          productoSeleccionado
            ? "Editar juego"
            : "Nuevo juego"
        }

        footer={footerDialog}

        modal

        style={{
          width: "700px",
        }}

        breakpoints={{
          "960px": "80vw",
          "640px": "95vw",
        }}
      >

        <div
          className="
            flex
            flex-col
            gap-5
          "
        >

         

          <div>

            <label
              className="
                block
                font-medium
                text-slate-700
                mb-2
              "
            >
              Nombre del juego
            </label>

            <InputText
              value={producto.nombre}
              onChange={(e) =>
                setProducto({
                  ...producto,
                  nombre: e.target.value,
                })
              }
              maxLength={50}
              className="w-full"
              placeholder="Ej. Grand Theft Auto V"
              invalid={
                submitted &&
                !producto.nombre.trim()
              }
            />

            {submitted &&
              !producto.nombre.trim() && (
                <small className="text-red-500">
                  El nombre es obligatorio.
                </small>
              )}

          </div>

          

          <div>

            <label
              className="
                block
                font-medium
                text-slate-700
                mb-2
              "
            >
              Descripción
            </label>

            <InputTextarea
              value={producto.descripcion}
              onChange={(e) =>
                setProducto({
                  ...producto,
                  descripcion:
                    e.target.value,
                })
              }
              maxLength={100}
              rows={4}
              className="w-full"
              placeholder="Descripción breve del juego..."
            />

            <small className="text-slate-400">
              {producto.descripcion?.length || 0}
              /100
            </small>

          </div>

        

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              gap-4
            "
          >

            

            <div>

              <label
                className="
                  block
                  font-medium
                  text-slate-700
                  mb-2
                "
              >
                Categoría
              </label>

              <Dropdown
                value={producto.categoriaId}
                options={categorias}
                optionLabel="nombre"
                optionValue="id"
                placeholder="Seleccione una categoría"
                className="w-full"
                onChange={(e) =>
                  setProducto({
                    ...producto,
                    categoriaId:
                      e.value,
                  })
                }
              />

            </div>

           

            <div>

              <label
                className="
                  block
                  font-medium
                  text-slate-700
                  mb-2
                "
              >
                Desarrollador
              </label>

              <Dropdown
                value={
                  producto.desarrolladorId
                }
                options={desarrolladores}
                optionLabel="nombre"
                optionValue="id"
                placeholder="Seleccione un desarrollador"
                className="w-full"
                onChange={(e) =>
                  setProducto({
                    ...producto,
                    desarrolladorId:
                      e.value,
                  })
                }
              />

            </div>

          </div>

         

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              gap-4
            "
          >

          

            <div>

              <label
                className="
                  block
                  font-medium
                  text-slate-700
                  mb-2
                "
              >
                Fecha de lanzamiento
              </label>

              <Calendar
                value={
                  producto.anioLanzamiento
                }
                onChange={(e) =>
                  setProducto({
                    ...producto,
                    anioLanzamiento:
                      e.value,
                  })
                }
                dateFormat="yy-mm-dd"
                showIcon
                className="w-full"
                inputClassName="w-full"
              />

            </div>

           

            <div>

              <label
                className="
                  block
                  font-medium
                  text-slate-700
                  mb-2
                "
              >
                Precio
              </label>

              <InputNumber
                value={producto.precio}
                onValueChange={(e) =>
                  setProducto({
                    ...producto,
                    precio: e.value,
                  })
                }
                mode="currency"
                currency="USD"
                locale="en-US"
                min={0}
                minFractionDigits={2}
                maxFractionDigits={2}
                className="w-full"
                inputClassName="w-full"
                placeholder="$0.00"
              />

            </div>

          </div>

       

          <div>

            <label
              className="
                block
                font-medium
                text-slate-700
                mb-2
              "
            >
              Imagen del juego
            </label>

            <InputText
              value={producto.imagen}
              onChange={(e) =>
                setProducto({
                  ...producto,
                  imagen: e.target.value,
                })
              }
              maxLength={255}
              className="w-full"
              placeholder="https://..."
            />

            <small
              className="
                text-slate-400
              "
            >
              Ingresa la URL de la imagen
              que se mostrará en la tarjeta.
            </small>

          </div>

          

          {producto.imagen && (
            <div>

              <p
                className="
                  font-medium
                  text-slate-700
                  mb-2
                "
              >
                Vista previa
              </p>

              <div
                className="
                  relative
                  w-full
                  h-48
                  rounded-xl
                  overflow-hidden
                  bg-slate-950
                  border
                  border-slate-700
                "
              >

                <img
                  src={producto.imagen}
                  alt="Vista previa"
                  className="
                    w-full
                    h-full
                    object-cover
                  "
                  onError={(e) => {
                    e.currentTarget.style.display =
                      "none";
                  }}
                />

              </div>

            </div>
          )}

        </div>

      </Dialog>
    </>
  );
}