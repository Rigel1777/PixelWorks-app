import { useEffect, useRef, useState } from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";

import Swal from "sweetalert2";

import { desarrolladorService } from "../../services/desarrolladorService";
import { useAuth } from "../../auth/AuthContext";

const DESARROLLADOR_VACIO = {
  id: null,
  nombre: "",
  descripcion: "",
  tipo: null,
  pais: "",
};

const NOMBRE_MIN = 3;
const NOMBRE_MAX = 50;
const DESCRIPCION_MAX = 100;
const PAIS_MAX = 50;

const tiposDesarrollador = [
  {
    label: "Empresa",
    value: "E",
  },
  {
    label: "Indie",
    value: "I",
  },
];

export default function Desarrolladores() {
  const [desarrolladores, setDesarrolladores] =
    useState([]);

  const [desarrollador, setDesarrollador] =
    useState({
      ...DESARROLLADOR_VACIO,
    });

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

  const toast = useRef(null);

  const { tienePermiso } = useAuth();

  const puedeAdministrar =
    tienePermiso(["ADMIN"]);



  useEffect(() => {
    cargarDesarrolladores();
  }, []);

  const cargarDesarrolladores = async () => {
    setLoading(true);

    try {
      const data =
        await desarrolladorService.getAll();

      setDesarrolladores(data);
    } catch (error) {
      console.error(error);

      mostrarToast(
        "error",
        "Error",
        obtenerMensajeError(
          error,
          "No se pudieron obtener los desarrolladores."
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

 

  const obtenerEtiquetaTipo = (tipo) => {
    if (tipo === "E") {
      return "Empresa";
    }

    if (tipo === "I") {
      return "Indie";
    }

    return "—";
  };

  const tipoBody = (rowData) => {
    const tipo = rowData.tipo;

    return (
      <span
        className="
          inline-flex
          items-center
          px-2.5
          py-1
          rounded-full
          text-xs
          font-semibold
          bg-slate-800
          text-slate-200
          border
          border-slate-700
        "
      >
        {obtenerEtiquetaTipo(tipo)}
      </span>
    );
  };



  const abrirNuevo = () => {
    setDesarrollador({
      ...DESARROLLADOR_VACIO,
    });

    setSubmitted(false);
    setDialogVisible(true);
  };



  const abrirEditar = (rowData) => {
    setDesarrollador({
      id: rowData.id,
      nombre: rowData.nombre ?? "",
      descripcion:
        rowData.descripcion ?? "",
      tipo: rowData.tipo ?? null,
      pais: rowData.pais ?? "",
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
      desarrollador.nombre.trim();

    const descripcion =
      desarrollador.descripcion
        ?.trim() ?? "";

    const pais =
      desarrollador.pais
        ?.trim() ?? "";

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
      descripcion.length >
      DESCRIPCION_MAX
    ) {
      return `La descripción no puede superar los ${DESCRIPCION_MAX} caracteres.`;
    }

    if (!desarrollador.tipo) {
      return "Debe seleccionar el tipo de desarrollador.";
    }

    if (pais.length > PAIS_MAX) {
      return `El país no puede superar los ${PAIS_MAX} caracteres.`;
    }

    const nombreNormalizado =
      nombre.toLowerCase();

    const duplicado =
      desarrolladores.some(
        (item) =>
          item.id !==
            desarrollador.id &&
          item.nombre
            ?.trim()
            .toLowerCase() ===
            nombreNormalizado
      );

    if (duplicado) {
      return `Ya existe un desarrollador registrado con el nombre "${nombre}".`;
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
        desarrollador.nombre.trim(),

      descripcion:
        desarrollador.descripcion
          ?.trim() || null,

      tipo:
        desarrollador.tipo,

      pais:
        desarrollador.pais?.trim() ||
        null,
    };

    try {
      if (desarrollador.id) {
        const actualizado =
          await desarrolladorService.update(
            desarrollador.id,
            dto
          );

        setDesarrolladores(
          (actuales) =>
            actuales.map((item) =>
              item.id ===
              actualizado.id
                ? actualizado
                : item
            )
        );

        mostrarToast(
          "success",
          "Desarrollador actualizado",
          "El desarrollador se actualizó correctamente."
        );
      } else {
        const nuevo =
          await desarrolladorService.create(
            dto
          );

        setDesarrolladores(
          (actuales) => [
            nuevo,
            ...actuales,
          ]
        );

        mostrarToast(
          "success",
          "Desarrollador registrado",
          "El desarrollador se registró correctamente."
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
          "Ocurrió un error al guardar el desarrollador."
        )
      );
    } finally {
      setGuardando(false);
    }
  };

 

  const confirmarEliminar = (
    rowData
  ) => {
    Swal.fire({
      title:
        "¿Eliminar desarrollador?",

      html: `
        Esta acción no se puede deshacer.<br/>
        Se eliminará <b>${rowData.nombre}</b>.
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
      await desarrolladorService.delete(
        id
      );

      setDesarrolladores(
        (actuales) =>
          actuales.filter(
            (item) =>
              item.id !== id
          )
      );

      mostrarToast(
        "success",
        "Desarrollador eliminado",
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

          aria-label="
            Editar desarrollador
          "

          onClick={() =>
            abrirEditar(rowData)
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

          aria-label="
            Eliminar desarrollador
          "

          onClick={() =>
            confirmarEliminar(
              rowData
            )
          }
        />
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

          {/* TÍTULO */}

          <div className="mb-5">

            <h2
              className="
                m-0
                text-2xl
                font-bold
                text-white
              "
            >
              Desarrolladores
            </h2>

            <p
              className="
                m-0
                mt-1
                text-sm
                text-slate-400
              "
            >
              Gestiona los desarrolladores
              de videojuegos de PixelWorks.
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

                value={
                  globalFilter
                }

                onChange={(e) =>
                  setGlobalFilter(
                    e.target.value
                  )
                }

                placeholder="
                  Buscar desarrollador...
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
                label="
                  Nuevo desarrollador
                "

                icon="pi pi-plus"

                onClick={
                  abrirNuevo
                }

                className="
                  w-full
                  md:w-auto
                "
              />
            )}

          </div>

        </div>

       

        <div className="p-4">

          <DataTable
            value={
              desarrolladores
            }

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
              "descripcion",
              "pais",
              "tipo",
            ]}

            responsiveLayout="stack"

            breakpoint="768px"

            stripedRows

            size="small"

            emptyMessage="
              No se encontraron desarrolladores.
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
              header="Nombre"
              sortable
              className="
                font-semibold
              "
            />

         

            <Column
              field="descripcion"
              header="Descripción"
              sortable

              body={(rowData) =>
                rowData.descripcion ||
                "—"
              }
            />

     

            <Column
              field="tipo"
              header="Tipo"
              sortable
              body={tipoBody}
            />


            <Column
              field="pais"
              header="País"
              sortable

              body={(rowData) =>
                rowData.pais ||
                "—"
              }
            />

          

            {puedeAdministrar && (
              <Column
                header="Acciones"
                body={accionesBody}
                exportable={false}

                style={{
                  minWidth: "9rem",
                }}
              />
            )}

          </DataTable>

        </div>

      </div>

     

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
          width: "36rem",
        }}

        breakpoints={{
          "960px": "75vw",
          "641px": "92vw",
        }}

        header={
          desarrollador.id
            ? "Actualizar desarrollador"
            : "Nuevo desarrollador"
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
                desarrollador.id
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

       

        <div className="field">

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

            value={
              desarrollador.nombre
            }

            onChange={(e) =>
              setDesarrollador({
                ...desarrollador,
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
              !!errorValidacion
            }
          />

        </div>

    

        <div className="field mt-4">

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

            value={
              desarrollador.descripcion
            }

            onChange={(e) =>
              setDesarrollador({
                ...desarrollador,
                descripcion:
                  e.target.value,
              })
            }

            rows={4}

            autoResize

            maxLength={
              DESCRIPCION_MAX
            }

            placeholder="
              Describe brevemente al desarrollador...
            "

            className="
              w-full
            "
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
              {
                desarrollador
                  .descripcion
                  ?.length ?? 0
              }
              /
              {
                DESCRIPCION_MAX
              }
            </small>

          </div>

        </div>

       

        <div className="field mt-4">

          <label
            htmlFor="tipo"
            className="
              font-semibold
              block
              mb-2
              text-slate-700
            "
          >
            Tipo
          </label>

          <Dropdown
            id="tipo"

            value={
              desarrollador.tipo
            }

            options={
              tiposDesarrollador
            }

            optionLabel="label"

            optionValue="value"

            onChange={(e) =>
              setDesarrollador({
                ...desarrollador,
                tipo: e.value,
              })
            }

            placeholder="
              Seleccione el tipo
            "

            className="
              w-full
            "

            invalid={
              submitted &&
              !desarrollador.tipo
            }
          />

          {submitted &&
            !desarrollador.tipo && (
              <small
                className="
                  p-error
                  block
                  mt-1
                "
              >
                Debe seleccionar
                el tipo de
                desarrollador.
              </small>
            )}

        </div>

    

        <div className="field mt-4">

          <label
            htmlFor="pais"
            className="
              font-semibold
              block
              mb-2
              text-slate-700
            "
          >
            País
          </label>

          <InputText
            id="pais"

            value={
              desarrollador.pais
            }

            onChange={(e) =>
              setDesarrollador({
                ...desarrollador,
                pais: e.target.value,
              })
            }

            maxLength={
              PAIS_MAX
            }

            placeholder="
              Ej. Estados Unidos
            "

            className="
              w-full
            "
          />

        </div>

      

        {errorValidacion && (
          <small
            className="
              p-error
              block
              mt-3
            "
          >
            {errorValidacion}
          </small>
        )}

      </Dialog>

    </div>
  );
}