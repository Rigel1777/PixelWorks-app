import { useEffect, useRef, useState } from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Toast } from "primereact/toast";

import Swal from "sweetalert2";

import { categoriaService } from "../../services/categoriaService";

const CATEGORIA_VACIA = {
  id: null,
  nombre: "",
  descripcion: "",
};

const NOMBRE_MIN = 3;
const NOMBRE_MAX = 50;
const DESCRIPCION_MAX = 100;

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [categoria, setCategoria] =
    useState(CATEGORIA_VACIA);

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



  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    setLoading(true);

    try {
      const data =
        await categoriaService.getAll();

      setCategorias(data);
    } catch (error) {
      console.error(error);

      mostrarToast(
        "error",
        "Error",
        obtenerMensajeError(
          error,
          "No se pudieron obtener las categorías."
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
          ? 4000
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



  const abrirNueva = () => {
    setCategoria({
      ...CATEGORIA_VACIA,
    });

    setSubmitted(false);
    setDialogVisible(true);
  };

  

  const abrirEditar = (rowData) => {
    setCategoria({
      id: rowData.id,
      nombre: rowData.nombre ?? "",
      descripcion:
        rowData.descripcion ?? "",
    });

    setSubmitted(false);
    setDialogVisible(true);
  };

  

  const cerrarDialog = () => {
    if (!guardando) {
      setDialogVisible(false);
    }
  };

  

  const existeNombreDuplicado = () => {
    const nombre =
      categoria.nombre
        .trim()
        .toLowerCase();

    return categorias.some(
      (item) =>
        item.id !== categoria.id &&
        item.nombre
          ?.trim()
          .toLowerCase() === nombre
    );
  };

  const validarFormulario = () => {
    const nombre =
      categoria.nombre.trim();

    const descripcion =
      categoria.descripcion
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

    if (existeNombreDuplicado()) {
      return `Ya existe una categoría registrada con el nombre "${nombre}".`;
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
        categoria.nombre.trim(),

      descripcion:
        categoria.descripcion
          ?.trim() || null,
    };

    try {
      if (categoria.id) {
        await categoriaService.update(
          categoria.id,
          dto
        );

        mostrarToast(
          "success",
          "Categoría actualizada",
          "La categoría se actualizó correctamente."
        );
      } else {
        await categoriaService.create(
          dto
        );

        mostrarToast(
          "success",
          "Categoría registrada",
          "La categoría se registró correctamente."
        );
      }

      setDialogVisible(false);

      await cargarCategorias();
    } catch (error) {
      console.error(error);

      mostrarToast(
        "error",
        "Error",
        obtenerMensajeError(
          error,
          "Ocurrió un error al guardar la categoría."
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
      title: "¿Eliminar categoría?",

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
          eliminarCategoria(
            rowData.id,
            rowData.nombre
          );
        }
      }
    );
  };

  const eliminarCategoria = async (
    id,
    nombre
  ) => {
    try {
      await categoriaService.delete(
        id
      );

      mostrarToast(
        "success",
        "Categoría eliminada",
        `"${nombre}" fue eliminada correctamente.`
      );

      await cargarCategorias();
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
  ) => (
    <div className="flex justify-center gap-2">

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

        aria-label="Editar categoría"

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

        aria-label="Eliminar categoría"

        onClick={() =>
          confirmarEliminar(
            rowData
          )
        }
      />

    </div>
  );

 

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
              Categorías
            </h2>

            <p
              className="
                m-0
                mt-1
                text-sm
                text-slate-400
              "
            >
              Administración de las categorías
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
                value={globalFilter}
                onChange={(e) =>
                  setGlobalFilter(
                    e.target.value
                  )
                }

                placeholder="Buscar categoría..."

                className="
                  w-full
                  pl-11
                  bg-slate-900
                  border-slate-700
                  text-white
                "
              />

            </div>

           

            <Button
              label="Nueva categoría"
              icon="pi pi-plus"
              onClick={abrirNueva}

              className="
                w-full
                md:w-auto
              "
            />

          </div>

        </div>

       

        <div className="p-4">

          <DataTable
          value={categorias}
          loading={loading}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          globalFilter={globalFilter}
          responsiveLayout="stack"
          breakpoint="768px"
          stripedRows
          size="small"
          emptyMessage="No se encontraron categorías."
          sortMode="multiple"
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
              header="Categoría"
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
              header="Acciones"
              body={accionesBody}
              exportable={false}
              style={{
                minWidth: "9rem",
              }}
            />

          </DataTable>

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
          width: "32rem",
        }}

        breakpoints={{
          "960px": "70vw",
          "641px": "92vw",
        }}

        header={
          categoria.id
            ? "Actualizar categoría"
            : "Nueva categoría"
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
              onClick={
                cerrarDialog
              }
            />

            <Button
              label={
                categoria.id
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
              categoria.nombre
            }

            onChange={(e) =>
              setCategoria({
                ...categoria,
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
              categoria.descripcion
            }

            onChange={(e) =>
              setCategoria({
                ...categoria,
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
              Describe brevemente la categoría...
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
                categoria.descripcion
                  ?.length ?? 0
              }
              /
              {DESCRIPCION_MAX}
            </small>

          </div>

        </div>

      </Dialog>

    </div>
  );
}