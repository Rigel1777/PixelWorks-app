import { useEffect, useRef, useState } from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { MultiSelect } from "primereact/multiselect";
import { Toast } from "primereact/toast";

import Swal from "sweetalert2";

import { ofertaService } from "../../services/ofertaService";
import { ofertaProductoService } from "../../services/ofertaProductoService";
import { productoService } from "../../services/productoService";

import { useAuth } from "../../auth/AuthContext";

const OFERTA_VACIA = {
  id: null,
  nombre: "",
  porcentajeDescuento: null,
  fechaInicio: null,
  fechaFin: null,
};

const NOMBRE_MIN = 3;
const NOMBRE_MAX = 50;

export default function Ofertas() {
  const [ofertas, setOfertas] = useState([]);

  const [productos, setProductos] =
    useState([]);

  const [relaciones, setRelaciones] =
    useState([]);

  const [oferta, setOferta] =
    useState({ ...OFERTA_VACIA });

  const [productosSeleccionados, setProductosSeleccionados] =
    useState([]);

  const [dialogVisible, setDialogVisible] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  const [globalFilter, setGlobalFilter] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [guardando, setGuardando] =
    useState(false);

  const [loadingProductos, setLoadingProductos] =
    useState(false);

  const toast = useRef(null);

  const { tienePermiso } = useAuth();

  const puedeAdministrar =
    tienePermiso([
      "ADMIN",
      "DESARROLLADOR",
    ]);

  // =========================================================
  // CARGA INICIAL
  // =========================================================

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);

    try {
      const [
        ofertasData,
        productosData,
        relacionesData,
      ] = await Promise.all([
        ofertaService.getAll(),
        productoService.getAll(),
        ofertaProductoService.getAll(),
      ]);

      setOfertas(ofertasData);
      setProductos(productosData);
      setRelaciones(relacionesData);
    } catch (error) {
      console.error(error);

      mostrarToast(
        "error",
        "Error",
        obtenerMensajeError(
          error,
          "No se pudieron cargar los datos de ofertas."
        )
      );
    } finally {
      setLoading(false);
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
  // ABRIR NUEVA
  // =========================================================

  const abrirNueva = () => {
    setOferta({
      ...OFERTA_VACIA,
    });

    setProductosSeleccionados([]);

    setSubmitted(false);

    setDialogVisible(true);
  };

  // =========================================================
  // ABRIR EDITAR
  // =========================================================

  const abrirEditar = async (
    rowData
  ) => {
    setSubmitted(false);

    setOferta({
      id: rowData.id,

      nombre:
        rowData.nombre ?? "",

      porcentajeDescuento:
        rowData.porcentajeDescuento ??
        null,

      fechaInicio:
        rowData.fechaInicio
          ? new Date(
              `${rowData.fechaInicio}T00:00:00`
            )
          : null,

      fechaFin:
        rowData.fechaFin
          ? new Date(
              `${rowData.fechaFin}T00:00:00`
            )
          : null,
    });

    try {
      const relacionesActuales =
        await ofertaProductoService.getAll();

      const idsProductos =
        relacionesActuales
          .filter(
            (relacion) =>
              relacion.ofertaId ===
              rowData.id
          )
          .map(
            (relacion) =>
              relacion.productoId
          );

      setRelaciones(
        relacionesActuales
      );

      setProductosSeleccionados(
        idsProductos
      );
    } catch (error) {
      console.error(error);

      mostrarToast(
        "error",
        "Error",
        obtenerMensajeError(
          error,
          "No se pudieron cargar los juegos de la oferta."
        )
      );

      setProductosSeleccionados([]);
    }

    setDialogVisible(true);
  };

  // =========================================================
  // CERRAR
  // =========================================================

  const cerrarDialog = () => {
    if (!guardando) {
      setDialogVisible(false);
    }
  };

  // =========================================================
  // VALIDACIÓN
  // =========================================================

  const validarFormulario = () => {
    const nombre =
      oferta.nombre?.trim() ?? "";

    if (!nombre) {
      return "El nombre es requerido.";
    }

    if (nombre.length < NOMBRE_MIN) {
      return `El nombre debe tener al menos ${NOMBRE_MIN} caracteres.`;
    }

    if (nombre.length > NOMBRE_MAX) {
      return `El nombre no puede superar los ${NOMBRE_MAX} caracteres.`;
    }

    if (
      oferta.porcentajeDescuento ===
        null ||
      oferta.porcentajeDescuento ===
        undefined
    ) {
      return "El porcentaje de descuento es requerido.";
    }

    if (
      oferta.porcentajeDescuento <= 0 ||
      oferta.porcentajeDescuento > 100
    ) {
      return "El descuento debe ser mayor a 0 y no puede superar el 100%.";
    }

    if (!oferta.fechaInicio) {
      return "La fecha de inicio es requerida.";
    }

    if (!oferta.fechaFin) {
      return "La fecha de fin es requerida.";
    }

    if (
      oferta.fechaInicio >
      oferta.fechaFin
    ) {
      return "La fecha de inicio no puede ser posterior a la fecha de fin.";
    }

    const nombreNormalizado =
      nombre.toLowerCase();

    const duplicado =
      ofertas.some(
        (item) =>
          item.id !== oferta.id &&
          item.nombre
            ?.trim()
            .toLowerCase() ===
            nombreNormalizado
      );

    if (duplicado) {
      return `Ya existe una oferta registrada con el nombre "${nombre}".`;
    }

    return null;
  };

  const errorValidacion =
    submitted
      ? validarFormulario()
      : null;

  // =========================================================
  // FORMATO FECHA
  // =========================================================

  const formatearFecha = (
    fecha
  ) => {
    if (!fecha) {
      return null;
    }

    const year =
      fecha.getFullYear();

    const month =
      String(
        fecha.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        fecha.getDate()
      ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // =========================================================
  // CREAR RELACIONES
  // =========================================================

  const crearRelaciones = async (
    ofertaId,
    productosIds
  ) => {
    for (const productoId of productosIds) {
      await ofertaProductoService.create({
        ofertaId,
        productoId,
      });
    }
  };

  // =========================================================
  // SINCRONIZAR RELACIONES
  // =========================================================

  const sincronizarRelaciones = async (
    ofertaId,
    nuevosIds
  ) => {
    const actuales =
      relaciones.filter(
        (relacion) =>
          relacion.ofertaId ===
          ofertaId
      );

    const actualesIds =
      actuales.map(
        (relacion) =>
          relacion.productoId
      );

    // -------------------------------------------------------
    // PRODUCTOS NUEVOS
    // -------------------------------------------------------

    const productosAgregar =
      nuevosIds.filter(
        (productoId) =>
          !actualesIds.includes(
            productoId
          )
      );

    // -------------------------------------------------------
    // PRODUCTOS ELIMINADOS
    // -------------------------------------------------------

    const productosEliminar =
      actuales.filter(
        (relacion) =>
          !nuevosIds.includes(
            relacion.productoId
          )
      );

    // -------------------------------------------------------
    // CREAR NUEVAS RELACIONES
    // -------------------------------------------------------

    const nuevasRelaciones = [];

    for (
      const productoId
      of productosAgregar
    ) {
      const nueva =
        await ofertaProductoService.create({
          ofertaId,
          productoId,
        });

      nuevasRelaciones.push(
        nueva
      );
    }

    // -------------------------------------------------------
    // ELIMINAR RELACIONES
    // -------------------------------------------------------

    for (
      const relacion
      of productosEliminar
    ) {
      await ofertaProductoService.delete(
        relacion.id
      );
    }

    // -------------------------------------------------------
    // ACTUALIZAR ESTADO LOCAL
    // -------------------------------------------------------

    setRelaciones((actuales) => {
      const idsEliminados =
        new Set(
          productosEliminar.map(
            (item) => item.id
          )
        );

      return [
        ...actuales.filter(
          (item) =>
            !idsEliminados.has(
              item.id
            )
        ),
        ...nuevasRelaciones,
      ];
    });
  };

  // =========================================================
  // GUARDAR OFERTA
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

    const dto = {
      nombre:
        oferta.nombre.trim(),

      porcentajeDescuento:
        oferta.porcentajeDescuento,

      fechaInicio:
        formatearFecha(
          oferta.fechaInicio
        ),

      fechaFin:
        formatearFecha(
          oferta.fechaFin
        ),
    };

    try {
      let ofertaGuardada;

      // =====================================================
      // ACTUALIZAR
      // =====================================================

      if (oferta.id) {
        ofertaGuardada =
          await ofertaService.update(
            oferta.id,
            dto
          );

        setOfertas(
          (actuales) =>
            actuales.map((item) =>
              item.id ===
              ofertaGuardada.id
                ? ofertaGuardada
                : item
            )
        );

        await sincronizarRelaciones(
          ofertaGuardada.id,
          productosSeleccionados
        );

        mostrarToast(
          "success",
          "Oferta actualizada",
          "La oferta y sus juegos asociados fueron actualizados correctamente."
        );
      }

      // =====================================================
      // CREAR
      // =====================================================

      else {
        ofertaGuardada =
          await ofertaService.create(
            dto
          );

        setOfertas(
          (actuales) => [
            ofertaGuardada,
            ...actuales,
          ]
        );

        if (
          productosSeleccionados.length >
          0
        ) {
          const nuevasRelaciones =
            [];

          for (
            const productoId
            of productosSeleccionados
          ) {
            const relacion =
              await ofertaProductoService.create({
                ofertaId:
                  ofertaGuardada.id,
                productoId,
              });

            nuevasRelaciones.push(
              relacion
            );
          }

          setRelaciones(
            (actuales) => [
              ...actuales,
              ...nuevasRelaciones,
            ]
          );
        }

        mostrarToast(
          "success",
          "Oferta registrada",
          "La oferta y sus juegos asociados fueron registrados correctamente."
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
          "Ocurrió un error al guardar la oferta o sus juegos asociados."
        )
      );
    } finally {
      setGuardando(false);
    }
  };

  // =========================================================
  // ELIMINAR OFERTA
  // =========================================================

  const confirmarEliminar = (
    rowData
  ) => {
    Swal.fire({
      title:
        "¿Eliminar oferta?",

      html: `
        Esta acción no se puede deshacer.<br/>
        Se eliminará <b>${rowData.nombre}</b> y sus asociaciones con juegos.
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
          eliminar(
            rowData.id,
            rowData.nombre
          );
        }
      }
    );
  };

  const eliminar = async (
    id,
    nombre
  ) => {
    try {
      // =====================================================
      // PRIMERO ELIMINAR RELACIONES
      // =====================================================

      const relacionesOferta =
        relaciones.filter(
          (relacion) =>
            relacion.ofertaId === id
        );

      for (
        const relacion
        of relacionesOferta
      ) {
        await ofertaProductoService.delete(
          relacion.id
        );
      }

      // =====================================================
      // DESPUÉS ELIMINAR OFERTA
      // =====================================================

      await ofertaService.delete(
        id
      );

      setOfertas(
        (actuales) =>
          actuales.filter(
            (item) =>
              item.id !== id
          )
      );

      setRelaciones(
        (actuales) =>
          actuales.filter(
            (item) =>
              item.ofertaId !== id
          )
      );

      mostrarToast(
        "success",
        "Oferta eliminada",
        `"${nombre}" fue eliminada correctamente.`
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

  // =========================================================
  // CANTIDAD DE JUEGOS
  // =========================================================

  const cantidadProductosBody = (
    rowData
  ) => {
    const cantidad =
      relaciones.filter(
        (relacion) =>
          relacion.ofertaId ===
          rowData.id
      ).length;

    return (
      <span
        className="
          inline-flex
          items-center
          gap-2
          px-3
          py-1
          rounded-full
          bg-slate-800
          text-slate-200
          border
          border-slate-700
          text-sm
          font-semibold
        "
      >
        <i className="pi pi-discord text-sky-400" />
        {cantidad}
      </span>
    );
  };

  // =========================================================
  // DESCUENTO
  // =========================================================

  const descuentoBody = (
    rowData
  ) => (
    <span
      className="
        inline-flex
        items-center
        px-3
        py-1
        rounded-full
        bg-slate-800
        text-slate-100
        border
        border-slate-700
        font-semibold
        text-sm
      "
    >
      {Number(
        rowData.porcentajeDescuento
      ).toFixed(2)}
      %
    </span>
  );

  // =========================================================
  // FECHAS
  // =========================================================

  const fechaBody = (
    rowData,
    campo
  ) => {
    return (
      rowData[campo] ||
      "—"
    );
  };

  // =========================================================
  // ESTADO
  // =========================================================

  const estadoBody = (
    rowData
  ) => {
    const hoy =
      new Date();

    hoy.setHours(
      0,
      0,
      0,
      0
    );

    const inicio =
      rowData.fechaInicio
        ? new Date(
            `${rowData.fechaInicio}T00:00:00`
          )
        : null;

    const fin =
      rowData.fechaFin
        ? new Date(
            `${rowData.fechaFin}T23:59:59`
          )
        : null;

    if (
      inicio &&
      fin &&
      hoy < inicio
    ) {
      return (
        <span
          className="
            inline-flex
            px-2.5
            py-1
            rounded-full
            text-xs
            font-semibold
            bg-slate-800
            text-slate-300
            border
            border-slate-700
          "
        >
          Próxima
        </span>
      );
    }

    if (
      inicio &&
      fin &&
      hoy > fin
    ) {
      return (
        <span
          className="
            inline-flex
            px-2.5
            py-1
            rounded-full
            text-xs
            font-semibold
            bg-red-950
            text-red-300
            border
            border-red-800
          "
        >
          Finalizada
        </span>
      );
    }

    return (
      <span
        className="
          inline-flex
          px-2.5
          py-1
          rounded-full
          text-xs
          font-semibold
          bg-green-950
          text-green-300
          border
          border-green-800
        "
      >
        Activa
      </span>
    );
  };

  // =========================================================
  // ACCIONES
  // =========================================================

  const accionesBody = (
    rowData
  ) => {
    if (!puedeAdministrar) {
      return null;
    }

    return (
      <div
        className="
          flex
          gap-2
          justify-center
        "
      >

        {/* EDITAR */}

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

          onClick={() =>
            abrirEditar(rowData)
          }
        />

        {/* ELIMINAR */}

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

          onClick={() =>
            confirmarEliminar(
              rowData
            )
          }
        />

      </div>
    );
  };

  // =========================================================
  // OPCIONES DE PRODUCTOS
  // =========================================================

  const opcionesProductos =
    productos.map((producto) => ({
      label:
        producto.nombre,
      value:
        producto.id,
    }));

  // =========================================================
  // RESUMEN DE SELECCIÓN
  // =========================================================

  const plantillaSeleccion =
    (opciones) => {
      if (
        !opciones ||
        opciones.length === 0
      ) {
        return "Seleccionar juegos";
      }

      if (
        opciones.length === 1
      ) {
        return "1 juego seleccionado";
      }

      return `${opciones.length} juegos seleccionados`;
    };

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

          <div className="mb-5">

            <h2
              className="
                m-0
                text-2xl
                font-bold
                text-white
              "
            >
              Ofertas
            </h2>

            <p
              className="
                m-0
                mt-1
                text-sm
                text-slate-400
              "
            >
              Administra las promociones,
              descuentos y juegos asociados.
            </p>

          </div>

          {/* =================================================
              BUSCADOR + BOTÓN
          ================================================== */}

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

                value={
                  globalFilter
                }

                onChange={(e) =>
                  setGlobalFilter(
                    e.target.value
                  )
                }

                placeholder="
                  Buscar oferta...
                "

                className="
                  w-full
                  pl-11
                  bg-slate-900
                  border-slate-700
                  text-white
                "
              />

            </div>

            {puedeAdministrar && (
              <Button
                label="Nueva oferta"
                icon="pi pi-plus"
                onClick={
                  abrirNueva
                }

                className="
                  w-full
                  md:w-auto
                "
              />
            )}

          </div>

        </div>

        {/* ===================================================
            TABLA
        ==================================================== */}

        <div className="p-4">

          <DataTable
            value={ofertas}

            loading={loading}

            paginator

            rows={10}

            rowsPerPageOptions={[
              5,
              10,
              25,
              50,
            ]}

            globalFilter={
              globalFilter
            }

            globalFilterFields={[
              "nombre",
            ]}

            responsiveLayout="stack"

            breakpoint="768px"

            stripedRows

            size="small"

            emptyMessage="
              No se encontraron ofertas.
            "

            className="
              pixelworks-table
              bg-slate-950
              text-slate-200
            "

            tableClassName="
              bg-slate-950
              text-slate-200
            "
          >

            <Column
              field="nombre"
              header="Oferta"
              sortable
              className="
                font-semibold
              "
            />

            <Column
              field="
                porcentajeDescuento
              "
              header="Descuento"
              sortable
              body={
                descuentoBody
              }
            />

            <Column
              field="fechaInicio"
              header="Inicio"
              sortable
              body={(rowData) =>
                fechaBody(
                  rowData,
                  "fechaInicio"
                )
              }
            />

            <Column
              field="fechaFin"
              header="Fin"
              sortable
              body={(rowData) =>
                fechaBody(
                  rowData,
                  "fechaFin"
                )
              }
            />

            <Column
              header="Juegos"
              body={
                cantidadProductosBody
              }
            />

            <Column
              header="Estado"
              body={
                estadoBody
              }
            />

            {puedeAdministrar && (
              <Column
                header="Acciones"
                body={
                  accionesBody
                }
                exportable={
                  false
                }

                style={{
                  minWidth:
                    "9rem",
                }}
              />
            )}

          </DataTable>

        </div>

      </div>

      {/* =====================================================
          DIALOG
      ====================================================== */}

      <Dialog
        visible={
          dialogVisible
        }

        onHide={
          cerrarDialog
        }

        modal

        draggable={false}

        resizable={false}

        closable={!guardando}

        style={{
          width: "42rem",
        }}

        breakpoints={{
          "960px": "80vw",
          "641px": "94vw",
        }}

        header={
          oferta.id
            ? "Actualizar oferta"
            : "Nueva oferta"
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
              disabled={
                guardando
              }
              onClick={
                cerrarDialog
              }
            />

            <Button
              label={
                oferta.id
                  ? "Actualizar"
                  : "Guardar"
              }

              icon="pi pi-save"

              loading={
                guardando
              }

              onClick={
                guardar
              }
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

          {/* =================================================
              NOMBRE
          ================================================== */}

          <div>

            <label
              htmlFor="nombre"
              className="
                block
                font-semibold
                mb-2
                text-slate-700
              "
            >
              Nombre
            </label>

            <InputText
              id="nombre"

              value={
                oferta.nombre
              }

              onChange={(e) =>
                setOferta({
                  ...oferta,
                  nombre:
                    e.target.value,
                })
              }

              maxLength={
                NOMBRE_MAX
              }

              autoFocus

              className="w-full"

              invalid={
                submitted &&
                !oferta.nombre.trim()
              }

              placeholder="
                Ej. Black Friday
              "
            />

          </div>

          {/* =================================================
              DESCUENTO
          ================================================== */}

          <div>

            <label
              htmlFor="descuento"
              className="
                block
                font-semibold
                mb-2
                text-slate-700
              "
            >
              Porcentaje de descuento
            </label>

            <div
              className="
                flex
                items-center
                gap-2
              "
            >

              <InputNumber
                id="descuento"

                value={
                  oferta.porcentajeDescuento
                }

                onValueChange={(e) =>
                  setOferta({
                    ...oferta,
                    porcentajeDescuento:
                      e.value,
                  })
                }

                min={0}

                max={100}

                minFractionDigits={0}

                maxFractionDigits={2}

                useGrouping={
                  false
                }

                className="flex-1"

                inputClassName="
                  w-full
                "

                invalid={
                  submitted &&
                  (
                    oferta.porcentajeDescuento ===
                      null ||
                    oferta.porcentajeDescuento <=
                      0 ||
                    oferta.porcentajeDescuento >
                      100
                  )
                }

                placeholder="0"
              />

              <span
                className="
                  text-lg
                  font-bold
                  text-slate-600
                "
              >
                %
              </span>

            </div>

          </div>

          {/* =================================================
              FECHAS
          ================================================== */}

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
                htmlFor="fechaInicio"
                className="
                  block
                  font-semibold
                  mb-2
                  text-slate-700
                "
              >
                Fecha de inicio
              </label>

              <Calendar
                id="fechaInicio"

                value={
                  oferta.fechaInicio
                }

                onChange={(e) =>
                  setOferta({
                    ...oferta,
                    fechaInicio:
                      e.value,
                  })
                }

                dateFormat="yy-mm-dd"

                showIcon

                className="w-full"

                inputClassName="
                  w-full
                "

                maxDate={
                  oferta.fechaFin ||
                  undefined
                }
              />

            </div>

            <div>

              <label
                htmlFor="fechaFin"
                className="
                  block
                  font-semibold
                  mb-2
                  text-slate-700
                "
              >
                Fecha de fin
              </label>

              <Calendar
                id="fechaFin"

                value={
                  oferta.fechaFin
                }

                onChange={(e) =>
                  setOferta({
                    ...oferta,
                    fechaFin:
                      e.value,
                  })
                }

                dateFormat="yy-mm-dd"

                showIcon

                className="w-full"

                inputClassName="
                  w-full
                "

                minDate={
                  oferta.fechaInicio ||
                  undefined
                }
              />

            </div>

          </div>

          {/* =================================================
              JUEGOS
          ================================================== */}

          <div>

            <label
              htmlFor="juegos"
              className="
                block
                font-semibold
                mb-2
                text-slate-700
              "
            >
              Juegos incluidos en la oferta
            </label>

            <MultiSelect
              id="juegos"

              value={
                productosSeleccionados
              }

              options={
                opcionesProductos
              }

              onChange={(e) =>
                setProductosSeleccionados(
                  e.value
                )
              }

              optionLabel="label"

              optionValue="value"

              placeholder="
                Seleccionar juegos
              "

              selectedItemsLabel="
                {0} juegos seleccionados
              "

              display="chip"

              filter

              filterPlaceholder="
                Buscar juego...
              "

              showClear

              disabled={
                guardando ||
                loadingProductos
              }

              className="
                w-full
              "

              panelClassName="
                pixelworks-dropdown-panel
              "

              maxSelectedLabels={3}

              emptyMessage="
                No hay juegos disponibles.
              "

              emptyFilterMessage="
                No se encontraron juegos.
              "

            />

            <small
              className="
                block
                mt-2
                text-slate-500
              "
            >
              Selecciona los juegos a los que
              se aplicará este descuento.
            </small>

          </div>

          {/* =================================================
              RESUMEN
          ================================================== */}

          <div
            className="
              p-4
              rounded-xl
              bg-slate-900
              border
              border-slate-700
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
                  pi-tag
                  text-sky-400
                "
              />

              <div>

                <p
                  className="
                    m-0
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  Juegos asociados
                </p>

                <p
                  className="
                    m-0
                    mt-1
                    text-xs
                    text-slate-400
                  "
                >
                  {
                    productosSeleccionados.length
                  }{" "}
                  {productosSeleccionados.length ===
                  1
                    ? "juego seleccionado"
                    : "juegos seleccionados"}
                </p>

              </div>

            </div>

          </div>

          {/* =================================================
              ERROR
          ================================================== */}

          {errorValidacion && (
            <small
              className="
                p-error
                block
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