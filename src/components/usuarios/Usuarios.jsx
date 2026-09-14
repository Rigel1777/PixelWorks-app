import { useEffect, useState } from "react";
import { usuarioService } from "../../services/usuarioService";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Swal from "sweetalert2";
import { useAuth } from "../../auth/AuthContext";

const ROLES = [
{
id: 1,
nombre: "ADMIN",
},
{
id: 2,
nombre: "JUGADOR",
},
];

export default function Usuarios() {


const { usuario } = useAuth();

const [usuarios, setUsuarios] = useState([]);
const [busqueda, setBusqueda] = useState("");
const [cargando, setCargando] = useState(true);
const [cambiandoRol, setCambiandoRol] = useState(false);

useEffect(() => {
    cargarUsuarios();
}, []);

const cargarUsuarios = async () => {
    try {
        setCargando(true);

        const data = await usuarioService.listar();

        setUsuarios(Array.isArray(data) ? data : []);
    } catch (error) {
        console.error("Error al cargar usuarios:", error);

        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudieron cargar los usuarios.",
            confirmButtonText: "Aceptar",
        });
    } finally {
        setCargando(false);
    }
};

const cambiarRol = async (usuarioSeleccionado, idNuevoRol) => {

    if (!idNuevoRol) {
        return;
    }

    if (usuarioSeleccionado.id === usuario?.id) {

        if (idNuevoRol !== usuarioSeleccionado.idRol) {
            Swal.fire({
                icon: "warning",
                title: "Operación no permitida",
                text: "No puedes cambiar tu propio rol de administrador.",
                confirmButtonText: "Aceptar",
            });
        }

        return;
    }

    if (idNuevoRol === usuarioSeleccionado.idRol) {
        return;
    }

    const nuevoRol = ROLES.find(
        (rol) => rol.id === idNuevoRol
    );

    if (!nuevoRol) {
        return;
    }

    const resultado = await Swal.fire({
        icon: "question",
        title: "Cambiar rol",
        text: `¿Deseas cambiar el rol de ${usuarioSeleccionado.nombre} a ${nuevoRol.nombre}?`,
        showCancelButton: true,
        confirmButtonText: "Sí, cambiar",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
    });

    if (!resultado.isConfirmed) {
        return;
    }

    try {
        setCambiandoRol(true);

        await usuarioService.cambiarRol(
            usuarioSeleccionado.id,
            idNuevoRol
        );

        setUsuarios((actuales) =>
            actuales.map((item) =>
                item.id === usuarioSeleccionado.id
                    ? {
                          ...item,
                          idRol: nuevoRol.id,
                          rol: nuevoRol.nombre,
                      }
                    : item
            )
        );

        Swal.fire({
            icon: "success",
            title: "Rol actualizado",
            text: "El rol del usuario ha sido actualizado correctamente.",
            confirmButtonText: "Aceptar",
        });

    } catch (error) {
        console.error("Error al cambiar rol:", error);

        const mensaje =
            error?.response?.data?.message ||
            error?.response?.data?.mensaje ||
            "No se pudo actualizar el rol del usuario.";

        Swal.fire({
            icon: "error",
            title: "Error",
            text: mensaje,
            confirmButtonText: "Aceptar",
        });

        await cargarUsuarios();

    } finally {
        setCambiandoRol(false);
    }
};

const usuariosFiltrados = usuarios.filter((item) => {

    const texto = busqueda.toLowerCase().trim();

    if (!texto) {
        return true;
    }

    return (
        item.nombre?.toLowerCase().includes(texto) ||
        item.correo?.toLowerCase().includes(texto)
    );
});

const estadoBodyTemplate = (rowData) => {

    let claseEstado =
        "text-slate-300 bg-slate-700/40 border border-slate-600";

    if (rowData.estado === "ACTIVO") {
        claseEstado =
            "text-green-400 bg-green-400/10 border border-green-400/30";
    }

    if (rowData.estado === "INACTIVO") {
        claseEstado =
            "text-yellow-400 bg-yellow-400/10 border border-yellow-400/30";
    }

    if (rowData.estado === "BLOQUEADO") {
        claseEstado =
            "text-red-400 bg-red-400/10 border border-red-400/30";
    }

    return (
        <span
            className={`
                inline-flex
                items-center
                px-3
                py-1
                rounded-full
                text-xs
                font-semibold
                ${claseEstado}
            `}
        >
            {rowData.estado}
        </span>
    );
};

const rolBodyTemplate = (rowData) => {

    const esUsuarioActual = rowData.id === usuario?.id;

    return (
        <Dropdown
            value={rowData.idRol}
            options={ROLES}
            optionLabel="nombre"
            optionValue="id"
            onChange={(e) =>
                cambiarRol(rowData, e.value)
            }
            disabled={
                esUsuarioActual ||
                cambiandoRol
            }
            className="
                w-full
                md:w-48
                bg-slate-900
                border-slate-700
                text-white
            "
            panelClassName="
                bg-slate-900
                border-slate-700
                text-white
            "
        />
    );
};

return (
    <div className="space-y-6">

        {/* =====================================================
            ENCABEZADO
        ===================================================== */}

        <div>
            <h1 className="text-3xl font-bold text-white">
                Gestión de Usuarios
            </h1>

            <p className="text-slate-400 mt-2">
                Consulta los usuarios registrados y administra sus roles.
            </p>
        </div>


        {/* =====================================================
            CONTENEDOR PRINCIPAL
        ===================================================== */}

        <div
            className="
                bg-slate-950
                border
                border-slate-700
                rounded-2xl
                shadow-xl
                overflow-hidden
            "
        >

            {/* =================================================
                BARRA DE BÚSQUEDA
            ================================================= */}

            <div
                className="
                    p-4
                    bg-slate-900
                    border-b
                    border-slate-700
                "
            >

                <div
                    className="
                        flex
                        flex-col
                        md:flex-row
                        md:items-center
                        md:justify-between
                        gap-3
                    "
                >

                    <div className="relative w-full md:max-w-md">

                        <i
                            className="
                                pi
                                pi-search
                                absolute
                                left-3
                                top-1/2
                                -translate-y-1/2
                                text-slate-500
                                z-10
                            "
                        />

                        <InputText
                            value={busqueda}
                            onChange={(e) =>
                                setBusqueda(e.target.value)
                            }
                            placeholder="Buscar por nombre o correo..."
                            className="
                                w-full
                                h-[42px]
                                pl-10
                                bg-slate-950
                                border-slate-700
                                text-white
                                placeholder:text-slate-500
                            "
                        />

                    </div>

                    <Button
                        label="Actualizar"
                        icon="pi pi-refresh"
                        outlined
                        loading={cargando}
                        onClick={cargarUsuarios}
                        className="
                            text-white
                            border-slate-600
                            hover:bg-slate-800
                        "
                    />

                </div>
            </div>


            {/* =================================================
                TABLA
            ================================================= */}

            <DataTable
                value={usuariosFiltrados}
                loading={cargando}
                paginator
                rows={10}
                emptyMessage="No se encontraron usuarios."
                className="
                    bg-slate-950
                    text-white
                    [&_.p-datatable-wrapper]:bg-slate-950
                    [&_.p-datatable-table]:bg-slate-950
                    [&_.p-paginator]:bg-slate-900
                    [&_.p-paginator]:border-t
                    [&_.p-paginator]:border-slate-700
                    [&_.p-paginator_.p-paginator-current]:text-slate-300
                    [&_.p-paginator_.p-paginator-element]:text-slate-300
                    [&_.p-paginator_.p-paginator-element]:bg-transparent
                    [&_.p-paginator_.p-paginator-element]:border-none
                    [&_.p-paginator_.p-paginator-element:hover]:bg-slate-800
                    [&_.p-paginator_.p-paginator-element:hover]:text-white
                    [&_.p-paginator_.p-highlight]:bg-slate-700
                    [&_.p-paginator_.p-highlight]:text-white
                    [&_.p-paginator_.p-disabled]:text-slate-600
                    [&_.p-paginator_.p-dropdown]:bg-slate-950
                    [&_.p-paginator_.p-dropdown]:border-slate-700
                    [&_.p-paginator_.p-dropdown]:text-white
                "
                rowClassName={() => "bg-slate-950"}
                stripedRows
            >

                <Column
                    field="nombre"
                    header="Nombre"
                    sortable
                    headerClassName="
                        bg-slate-900
                        text-white
                        border-b
                        border-slate-700
                    "
                    bodyClassName="
                        bg-slate-950
                        text-white
                    "
                />

                <Column
                    field="correo"
                    header="Correo"
                    sortable
                    headerClassName="
                        bg-slate-900
                        text-white
                        border-b
                        border-slate-700
                    "
                    bodyClassName="
                        bg-slate-950
                        text-slate-300
                    "
                />

                <Column
                    header="Estado"
                    body={estadoBodyTemplate}
                    headerClassName="
                        bg-slate-900
                        text-white
                        border-b
                        border-slate-700
                    "
                    bodyClassName="
                        bg-slate-950
                    "
                />

                <Column
                    header="Rol"
                    body={rolBodyTemplate}
                    headerClassName="
                        bg-slate-900
                        text-white
                        border-b
                        border-slate-700
                    "
                    bodyClassName="
                        bg-slate-950
                    "
                />

            </DataTable>

        </div>

    </div>
);

}
