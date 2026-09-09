import { useEffect, useRef, useState } from "react";

import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";

import { productoService } from "../../services/productoService";
import { claveActivacionService } from "../../services/claveActivacionService";

import { useAuth } from "../../auth/AuthContext";

const CODIGO_REGEX =
  /^[A-Z0-9]{4,5}-[A-Z0-9]{4,5}-[A-Z0-9]{4,5}$/;

const CLAVE_VACIA = {
  productoId: null,
  codigo: "",
};

export default function ClavesActivacion() {
  const toast = useRef(null);

  const { tienePermiso } = useAuth();

  const puedeAgregar =
    tienePermiso([
      "ADMIN",
      "DESARROLLADOR",
    ]);

  const [productos, setProductos] =
    useState([]);

  const [clave, setClave] =
    useState({
      ...CLAVE_VACIA,
    });

  const [stock, setStock] =
    useState(null);

  const [loadingProductos, setLoadingProductos] =
    useState(true);

  const [loadingStock, setLoadingStock] =
    useState(false);

  const [guardando, setGuardando] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  // =========================================================
  // CARGAR JUEGOS
  // =========================================================

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    setLoadingProductos(true);

    try {
      const data =
        await productoService.getAll();

      setProductos(data);
    } catch (error) {
      console.error(error);

      mostrarToast(
        "error",
        "Error",
        obtenerMensajeError(
          error,
          "No se pudieron obtener los juegos."
        )
      );
    } finally {
      setLoadingProductos(false);
    }
  };

  // =========================================================
  // ALERTAS
  // =========================================================

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

  // =========================================================
  // CAMBIO DE JUEGO
  // =========================================================

  const manejarCambioProducto = async (
    productoId
  ) => {
    setClave((actual) => ({
      ...actual,
      productoId,
    }));

    setStock(null);

    if (!productoId) {
      return;
    }

    setLoadingStock(true);

    try {
      const respuesta =
        await claveActivacionService.contarStock(
          productoId
        );

      setStock(
        respuesta.stockDisponible
      );
    } catch (error) {
      console.error(error);

      mostrarToast(
        "error",
        "Error",
        obtenerMensajeError(
          error,
          "No se pudo consultar el stock del juego."
        )
      );
    } finally {
      setLoadingStock(false);
    }
  };

  // =========================================================
  // CAMBIO DE CÓDIGO (AUTO-FORMATO CON GUIONES)
  // =========================================================

  const manejarCambioCodigo = (valor) => {

    const limpio = valor.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

    let formateado = "";
    for (let i = 0; i < limpio.length && i < 12; i++) {
      if (i > 0 && i % 4 === 0) {
        formateado += "-";
      }
      formateado += limpio[i];
    }

    setClave((actual) => ({
      ...actual,
      codigo: formateado,
    }));
  };

  // =========================================================
  // VALIDACIÓN
  // =========================================================

  const validarFormulario = () => {
    if (!clave.productoId) {
      return "Debe seleccionar un juego.";
    }

    if (!clave.codigo.trim()) {
      return "El código de activación es obligatorio.";
    }

    if (
      !CODIGO_REGEX.test(
        clave.codigo.trim()
      )
    ) {
      return (
        "El formato del código no es válido. " +
        "Use el formato AAAA-1111-BBBB."
      );
    }

    return null;
  };

  // =========================================================
  // GUARDAR
  // =========================================================

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

    try {
      const dto = {
        productoId:
          clave.productoId,

        codigo:
          clave.codigo.trim(),

        // El backend establece DISPONIBLE
        // automáticamente.
        estado: null,

        detalleCompraId: null,
      };

      const respuesta =
        await claveActivacionService.guardar(
          dto
        );

      mostrarToast(
        "success",
        "Clave registrada",
        "La clave de activación fue agregada correctamente."
      );

      // Actualizar stock visualmente
      if (clave.productoId) {
        const stockActualizado =
          await claveActivacionService.contarStock(
            clave.productoId
          );

        setStock(
          stockActualizado.stockDisponible
        );
      }

      // Limpiar únicamente el código.
      setClave((actual) => ({
        ...actual,
        codigo: "",
      }));

      setSubmitted(false);

      return respuesta;
    } catch (error) {
      console.error(error);

      mostrarToast(
        "error",
        "Error",
        obtenerMensajeError(
          error,
          "No se pudo registrar la clave de activación."
        )
      );
    } finally {
      setGuardando(false);
    }
  };

  // =========================================================
  // JUEGO SELECCIONADO
  // =========================================================

  const productoSeleccionado =
    productos.find(
      (item) =>
        item.id === clave.productoId
    );

  // =========================================================
  // RENDER
  // =========================================================

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

        {/* ===================================================
            CABECERA
        ==================================================== */}

        <div
          className="
            px-5
            py-5
            border-b
            border-slate-700
          "
        >

          <h2
            className="
              m-0
              text-2xl
              font-bold
              text-white
            "
          >
            Claves de Activación
          </h2>

          <p
            className="
              m-0
              mt-1
              text-sm
              text-slate-400
            "
          >
            Administra el inventario de
            claves de activación de PixelWorks.
          </p>

        </div>

        {/* ===================================================
            CONTENIDO
        ==================================================== */}

        <div className="p-5">

          {/* =================================================
              INFORMACIÓN GENERAL
          ================================================== */}

          <div
            className="
              grid
              grid-cols-1
              lg:grid-cols-2
              gap-5
            "
          >

            {/* =================================================
                JUEGO
            ================================================== */}

            <div>

              <label
                htmlFor="producto"
                className="
                  block
                  font-semibold
                  mb-2
                  text-slate-200
                "
              >
                Juego
              </label>

              <Dropdown
                id="producto"

                value={
                  clave.productoId
                }

                options={productos}

                optionLabel="nombre"

                optionValue="id"

                placeholder={
                  loadingProductos
                    ? "Cargando juegos..."
                    : "Seleccione un juego"
                }

                disabled={
                  loadingProductos ||
                  guardando
                }

                onChange={(e) =>
                  manejarCambioProducto(
                    e.value
                  )
                }

                className="
                  w-full
                "

                filter

                showClear
              />

              {submitted &&
                !clave.productoId && (
                  <small
                    className="
                      p-error
                      block
                      mt-1
                    "
                  >
                    Debe seleccionar
                    un juego.
                  </small>
                )}

            </div>

            {/* =================================================
                STOCK
            ================================================== */}

            <div>

              <label
                className="
                  block
                  font-semibold
                  mb-2
                  text-slate-200
                "
              >
                Stock disponible
              </label>

              <div
                className="
                  h-[42px]
                  flex
                  items-center
                  gap-3
                  px-4
                  rounded-md
                  bg-slate-900
                  border
                  border-slate-700
                "
              >

                {loadingStock ? (
                  <i
                    className="
                      pi
                      pi-spin
                      pi-spinner
                      text-slate-400
                    "
                  />
                ) : (
                  <i
                    className="
                      pi
                      pi-key
                      text-sky-400
                    "
                  />
                )}

                <span
                  className="
                    text-white
                    font-bold
                  "
                >
                  {stock === null
                    ? "—"
                    : stock}
                </span>

                <span
                  className="
                    text-slate-400
                    text-sm
                  "
                >
                  {productoSeleccionado
                    ? productoSeleccionado.nombre
                    : "Seleccione un juego"}
                </span>

              </div>

            </div>

          </div>

          {/* =================================================
              AGREGAR CLAVE
          ================================================== */}

          {puedeAgregar && (
            <div
              className="
                mt-6
                pt-6
                border-t
                border-slate-700
              "
            >

              <h3
                className="
                  text-lg
                  font-bold
                  text-white
                  mb-4
                "
              >
                Agregar clave
              </h3>

              <div
                className="
                  flex
                  flex-col
                  md:flex-row
                  gap-3
                  md:items-end
                "
              >

                {/* CÓDIGO */}

                <div className="flex-1">

                  <label
                    htmlFor="codigo"
                    className="
                      block
                      font-semibold
                      mb-2
                      text-slate-200
                    "
                  >
                    Código de activación
                  </label>

                  <InputText
                    id="codigo"

                    value={
                      clave.codigo
                    }

                    onChange={(e) =>
                      manejarCambioCodigo(
                        e.target.value
                      )
                    }

                    maxLength={14} // 12 caracteres + 2 guiones

                    disabled={
                      guardando
                    }

                    placeholder="
                      Ej. ABCD-1234-EFGH
                    "

                    className="
                      w-full
                      bg-slate-900
                      border-slate-700
                      text-white
                      uppercase
                    "

                    invalid={
                      submitted &&
                      !CODIGO_REGEX.test(
                        clave.codigo.trim()
                      )
                    }
                  />

                  <small
                    className="
                      text-slate-500
                      block
                      mt-1
                    "
                  >
                    Formato: AAAA-1111-BBBB
                  </small>

                </div>

                {/* BOTÓN */}

                <Button
                  label="Agregar clave"
                  icon="pi pi-plus"
                  loading={
                    guardando
                  }

                  disabled={
                    !puedeAgregar ||
                    !clave.productoId
                  }

                  onClick={
                    guardar
                  }

                  className="
                    w-full
                    md:w-auto
                    bg-sky-600
                    border-sky-600
                    text-white
                    hover:bg-sky-500
                    hover:border-sky-500
                  "
                />

              </div>

              {submitted &&
                !clave.codigo.trim() && (
                  <small
                    className="
                      p-error
                      block
                      mt-1
                    "
                  >
                    El código de
                    activación es obligatorio.
                  </small>
                )}

            </div>
          )}

          {/* =================================================
              MENSAJE PARA USUARIOS SIN PERMISO
          ================================================== */}

          {!puedeAgregar && (
            <div
              className="
                mt-6
                p-4
                rounded-xl
                bg-slate-900
                border
                border-slate-700
                flex
                items-center
                gap-3
              "
            >

              <i
                className="
                  pi
                  pi-info-circle
                  text-sky-400
                "
              />

              <p
                className="
                  m-0
                  text-slate-300
                  text-sm
                "
              >
                No tienes permisos para
                agregar claves de activación.
              </p>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}