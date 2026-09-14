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

const PRODUCTO_VACIO = {
  id: null,
  nombre: "",
  descripcion: "",
  anioLanzamiento: null,
  precio: null,
  imagen: "",
  categoriaId: null,
  desarrolladorId: null,
};

const NOMBRE_MAX = 50;
const DESCRIPCION_MAX = 100;

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
  const [guardando, setGuardando] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");

  const [producto, setProducto] =
    useState({ ...PRODUCTO_VACIO });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);

    try {
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
      console.error(error);

      mostrarToast(
        "error",
        "Error",
        obtenerMensajeError(
          error,
          "No se pudieron cargar los juegos."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const mostrarToast = (
    severity,
    summary,
    detail
  ) => {
    toast.current?.show({
      severity,
      summary,
      detail,
      life:
        severity === "error"
          ? 4500
          : 3000,
    });
  };

  const obtenerMensajeError = (
    error,
    mensajePredeterminado
  ) => {
    return (
      error?.response?.data?.message ||
      mensajePredeterminado
    );
  };

  const abrirNuevo = () => {
    setProducto({
      ...PRODUCTO_VACIO,
    });

    setProductoSeleccionado(null);
    setSubmitted(false);
    setDialogVisible(true);
  };

  const abrirEditar = (productoActual) => {
    setProductoSeleccionado(productoActual);

    setProducto({
      id: productoActual.id,
      nombre: productoActual.nombre ?? "",
      descripcion: productoActual.descripcion ?? "",

      anioLanzamiento:
        productoActual.anioLanzamiento
          ? new Date(
              `${productoActual.anioLanzamiento}T00:00:00`
            )
          : null,

      precio: productoActual.precio ?? null,
      imagen: productoActual.imagen ?? null,

      categoriaId:
        productoActual.categoriaId ?? null,

      desarrolladorId:
        productoActual.desarrolladorId ?? null,
    });

    setSubmitted(false);
    setDialogVisible(true);
  };

  const cerrarDialog = () => {
    if (!guardando) {
      setDialogVisible(false);
    }
  };

  const validarFormulario = () => {
    const nombre =
      producto.nombre?.trim() ?? "";

    const descripcion =
      producto.descripcion?.trim() ?? "";

    if (!nombre) {
      return "El nombre es requerido.";
    }

    if (nombre.length > NOMBRE_MAX) {
      return `El nombre no puede superar los ${NOMBRE_MAX} caracteres.`;
    }

    if (descripcion.length > DESCRIPCION_MAX) {
      return `La descripción no puede superar los ${DESCRIPCION_MAX} caracteres.`;
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
      nombre.toLowerCase();

    const duplicado = productos.some(
      (item) => {
        if (
          productoSeleccionado &&
          item.id === productoSeleccionado.id
        ) {
          return false;
        }

        return (
          item.nombre
            ?.trim()
            .toLowerCase() ===
          nombreNormalizado
        );
      }
    );

    if (duplicado) {
      return `Ya existe un juego registrado con el nombre "${nombre}".`;
    }

    return null;
  };

  const errorValidacion =
    submitted
      ? validarFormulario()
      : null;

  const guardar = async () => {
    setSubmitted(true);

    const error =
      validarFormulario();

    if (error) {
      mostrarToast(
        "warn",
        "Validación",
        error
      );

      return;
    }

    setGuardando(true);

    const dto = {
      nombre:
        producto.nombre.trim(),

      descripcion:
        producto.descripcion?.trim() ||
        null,

      anioLanzamiento:
        producto.anioLanzamiento
          ? producto.anioLanzamiento
              .toISOString()
              .split("T")[0]
          : null,

      precio:
        producto.precio,

      imagen:
        producto.imagen?.trim() ||
        null,

      categoriaId:
        producto.categoriaId,

      desarrolladorId:
        producto.desarrolladorId,
    };

    try {
      if (productoSeleccionado) {
        const actualizado =
          await productoService.update(
            productoSeleccionado.id,
            dto
          );

        setProductos(
          (actuales) =>
            actuales.map(
              (item) =>
                item.id ===
                actualizado.id
                  ? actualizado
                  : item
            )
        );

        mostrarToast(
          "success",
          "Juego actualizado",
          "El juego se actualizó correctamente."
        );
      } else {
        const nuevo =
          await productoService.create(
            dto
          );

        setProductos(
          (actuales) => [
            nuevo,
            ...actuales,
          ]
        );

        mostrarToast(
          "success",
          "Juego registrado",
          "El juego se registró correctamente."
        );
      }

      setDialogVisible(false);
    } catch (error) {
      console.error(error);

      mostrarToast(
        "error",
        "Error",
        obtenerMensajeError(
          error,
          "Ocurrió un error al guardar el juego."
        )
      );
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminar = (
    productoActual
  ) => {
    Swal.fire({
      title:
        "¿Eliminar juego?",

      html: `
        Esta acción no se puede deshacer.<br/>
        Se eliminará <b>${productoActual.nombre}</b>.
      `,

      icon: "warning",

      showCancelButton: true,

      confirmButtonText:
        "Sí, eliminar",

      cancelButtonText:
        "Cancelar",

      confirmButtonColor:
        "#dc2626",

      cancelButtonColor:
        "#475569",

      reverseButtons: true,
    }).then(
      ({ isConfirmed }) => {
        if (isConfirmed) {
          eliminarProducto(
            productoActual.id,
            productoActual.nombre
          );
        }
      }
    );
  };

  const eliminarProducto = async (
    id,
    nombre
  ) => {
    try {
      await productoService.delete(id);

      setProductos(
        (actuales) =>
          actuales.filter(
            (item) =>
              item.id !== id
          )
      );

      mostrarToast(
        "success",
        "Juego eliminado",
        `"${nombre}" fue eliminado correctamente.`
      );
    } catch (error) {
      console.error(error);

      mostrarToast(
        "error",
        "Error",
        obtenerMensajeError(
          error,
          `No se pudo eliminar "${nombre}".`
        )
      );
    }
  };

  const obtenerNombreCategoria = (
    id
  ) => {
    const categoria =
      categorias.find(
        (item) =>
          item.id === id
      );

    return (
      categoria?.nombre ||
      "Sin categoría"
    );
  };

  const obtenerNombreDesarrollador = (
    id
  ) => {
    const desarrollador =
      desarrolladores.find(
        (item) =>
          item.id === id
      );

    return (
      desarrollador?.nombre ||
      "Sin desarrollador"
    );
  };

  const productosFiltrados =
    productos.filter(
      (item) => {
        const texto =
          globalFilter
            .trim()
            .toLowerCase();

        if (!texto) {
          return true;
        }

        const nombre =
          item.nombre
            ?.toLowerCase() ||
          "";

        const descripcion =
          item.descripcion
            ?.toLowerCase() ||
          "";

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

  const renderImagen = (
    productoActual
  ) => {
    if (!productoActual.imagen) {
      return (
        <div
          className="
            w-full
            h-full
            flex
            items-center
            justify-center
            bg-slate-950
          "
        >
          <div className="text-center">
            <i
              className="
                pi
                pi-image
                text-5xl
                text-slate-600
              "
            />

            <p
              className="
                text-xs
                text-slate-500
                mt-2
              "
            >
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
        className="
          w-full
          h-full
          object-cover
          transition-transform
          duration-500
          group-hover:scale-105
        "
        onError={(e) => {
          e.currentTarget.onerror = null;

          e.currentTarget.src =
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%230f172a'/%3E%3Ctext x='400' y='215' text-anchor='middle' fill='%2364748b' font-size='28' font-family='Arial'%3ESin imagen%3C/text%3E%3C/svg%3E";
        }}
      />
    );
  };

  const renderCard = (
    productoActual
  ) => {
    return (
      <div
        key={productoActual.id}
        className="
          group
          overflow-hidden
          rounded-2xl
          bg-slate-950
          border
          border-slate-700
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
              border
              border-slate-700
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
            title={
              productoActual.nombre
            }
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

          <div
            className="
              mt-5
              space-y-3
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <i
                className="
                  pi
                  pi-tags
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

            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <i
                className="
                  pi
                  pi-building
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

            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <i
                className="
                  pi
                  pi-calendar
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
              <Button
                icon="pi pi-pencil"
                rounded
                outlined
                className="
                  text-yellow-400
                  border-yellow-400
                  hover:bg-yellow-400
                  hover:text-slate-950
                "
                tooltip="Editar"
                tooltipOptions={{
                  position: "top",
                }}
                aria-label="Editar juego"
                onClick={() =>
                  abrirEditar(
                    productoActual
                  )
                }
              />

              <Button
                icon="pi pi-trash"
                rounded
                outlined
                className="
                  text-red-400
                  border-red-400
                  hover:bg-red-500
                  hover:text-white
                "
                tooltip="Eliminar"
                tooltipOptions={{
                  position: "top",
                }}
                aria-label="Eliminar juego"
                onClick={() =>
                  confirmarEliminar(
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

  return (
    <div className="p-2 md:p-4">
      <Toast ref={toast} />

      <div
        className="
          rounded-2xl
          overflow-hidden
          bg-slate-950
          border
          border-slate-700
          shadow-xl
        "
      >
        <div
          className="
            px-5
            py-5
            border-b
            border-slate-700
          "
        >
          <div className="mb-5">
            <h2
              className="
                m-0
                text-2xl
                font-bold
                text-white
              "
            >
              Juegos
            </h2>

            <p
              className="
                m-0
                mt-1
                text-sm
                text-slate-400
              "
            >
              Administración de los juegos
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
            "
          >
            <div
              className="
                relative
                flex-1
              "
            >
              <i
                className="
                  pi
                  pi-search
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                  z-10
                "
              />

              <InputText
                type="search"
                value={globalFilter}
                onChange={(e) =>
                  setGlobalFilter(
                    e.target.value
                  )
                }
                placeholder="Buscar juego..."
                className="
                  w-full
                  pl-11
                  bg-slate-900
                  border-slate-700
                  text-white
                  placeholder:text-slate-500
                "
              />
            </div>

            {puedeAdministrar && (
              <Button
                label="Nuevo juego"
                icon="pi pi-plus"
                onClick={abrirNuevo}
                className="
                  w-full
                  md:w-auto
                "
              />
            )}
          </div>
        </div>

        <div className="p-4">
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
                  No existen juegos que
                  coincidan con la búsqueda
                  actual.
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
      </div>

      <Dialog
        visible={dialogVisible}
        onHide={cerrarDialog}
        modal
        draggable={false}
        resizable={false}
        closable={!guardando}
        style={{
          width: "42rem",
        }}
        breakpoints={{
          "960px": "78vw",
          "641px": "94vw",
        }}
        header={
          productoSeleccionado
            ? "Actualizar juego"
            : "Nuevo juego"
        }
        footer={
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
              disabled={guardando}
              onClick={cerrarDialog}
            />

            <Button
              label={
                productoSeleccionado
                  ? "Actualizar"
                  : "Guardar"
              }
              icon="pi pi-save"
              loading={guardando}
              onClick={guardar}
            />
          </div>
        }
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
              htmlFor="nombre"
              className="
                font-semibold
                block
                mb-2
                text-slate-700
              "
            >
              Nombre
            </label>

            <InputText
              id="nombre"
              value={producto.nombre}
              onChange={(e) =>
                setProducto({
                  ...producto,
                  nombre:
                    e.target.value,
                })
              }
              maxLength={NOMBRE_MAX}
              autoFocus
              className="w-full"
              invalid={
                submitted &&
                !producto.nombre.trim()
              }
              placeholder="Ej. Grand Theft Auto V"
            />

            {submitted &&
              !producto.nombre.trim() && (
                <small
                  className="
                    p-error
                    block
                    mt-1
                  "
                >
                  El nombre es requerido.
                </small>
              )}
          </div>

          <div>
            <label
              htmlFor="descripcion"
              className="
                font-semibold
                block
                mb-2
                text-slate-700
              "
            >
              Descripción
            </label>

            <InputTextarea
              id="descripcion"
              value={producto.descripcion}
              onChange={(e) =>
                setProducto({
                  ...producto,
                  descripcion:
                    e.target.value,
                })
              }
              rows={4}
              autoResize
              maxLength={DESCRIPCION_MAX}
              placeholder="Describe brevemente el juego..."
              className="w-full"
            />

            <div
              className="
                flex
                justify-end
                mt-1
              "
            >
              <small
                className="
                  text-slate-400
                "
              >
                {producto.descripcion?.length ??
                  0}
                /{DESCRIPCION_MAX}
              </small>
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
                htmlFor="categoria"
                className="
                  font-semibold
                  block
                  mb-2
                  text-slate-700
                "
              >
                Categoría
              </label>

              <Dropdown
                id="categoria"
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
                htmlFor="desarrollador"
                className="
                  font-semibold
                  block
                  mb-2
                  text-slate-700
                "
              >
                Desarrollador
              </label>

              <Dropdown
                id="desarrollador"
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
                htmlFor="anioLanzamiento"
                className="
                  font-semibold
                  block
                  mb-2
                  text-slate-700
                "
              >
                Fecha de lanzamiento
              </label>

              <Calendar
                id="anioLanzamiento"
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
                htmlFor="precio"
                className="
                  font-semibold
                  block
                  mb-2
                  text-slate-700
                "
              >
                Precio
              </label>

              <InputNumber
                id="precio"
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
              htmlFor="imagen"
              className="
                font-semibold
                block
                mb-2
                text-slate-700
              "
            >
              Imagen del juego
            </label>

            <InputText
              id="imagen"
              value={producto.imagen}
              onChange={(e) =>
                setProducto({
                  ...producto,
                  imagen:
                    e.target.value,
                })
              }
              maxLength={255}
              className="w-full"
              placeholder="https://..."
            />

            <small
              className="
                block
                mt-2
                text-slate-500
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
                  font-semibold
                  mb-2
                  text-slate-700
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

          {errorValidacion && (
            <small
              className="
                p-error
                block
                mt-1
              "
            >
              {errorValidacion}
            </small>
          )}
        </div>
      </Dialog>
    </div>
  );
}
