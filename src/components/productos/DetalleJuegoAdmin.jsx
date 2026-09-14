import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "primereact/button";

import { productoService } from "../../services/productoService";
import { categoriaService } from "../../services/categoriaService";
import { desarrolladorService } from "../../services/desarrolladorService";

export default function DetalleJuegoAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [juego, setJuego] = useState(null);
  const [categoria, setCategoria] = useState(null);
  const [desarrollador, setDesarrollador] =
    useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDetalle();
  }, [id]);

  const cargarDetalle = async () => {
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

      const encontrado =
        productosData.find(
          (producto) =>
            String(producto.id) ===
            String(id)
        );

      if (!encontrado) {
        setJuego(null);
        return;
      }

      setJuego(encontrado);

      const categoriaEncontrada =
        categoriasData.find(
          (item) =>
            Number(item.id) ===
            Number(encontrado.categoriaId)
        );

      const desarrolladorEncontrado =
        desarrolladoresData.find(
          (item) =>
            Number(item.id) ===
            Number(encontrado.desarrolladorId)
        );

      setCategoria(
        categoriaEncontrada || null
      );

      setDesarrollador(
        desarrolladorEncontrado || null
      );
    } catch (error) {
      console.error(
        "Error al cargar detalle administrativo del juego:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const volver = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div
        className="
          flex
          justify-center
          items-center
          min-h-[500px]
        "
      >
        <div className="text-center">
          <i
            className="
              pi
              pi-spin
              pi-spinner
              text-4xl
              text-sky-400
            "
          />

          <p
            className="
              text-slate-400
              mt-4
            "
          >
            Cargando información del juego...
          </p>
        </div>
      </div>
    );
  }

  if (!juego) {
    return (
      <div
        className="
          flex
          flex-col
          items-center
          justify-center
          min-h-[500px]
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

        <h2
          className="
            text-2xl
            font-bold
            text-white
            mt-5
          "
        >
          Juego no encontrado
        </h2>

        <p
          className="
            text-slate-400
            mt-2
          "
        >
          El juego que buscas no existe
          o fue eliminado.
        </p>

        <Button
          label="Volver al inicio"
          icon="pi pi-home"
          className="
            mt-6
            bg-transparent
            border-none
            text-white
            hover:bg-slate-800
          "
          onClick={volver}
        />
      </div>
    );
  }

  return (
    <div className="p-2 md:p-4">
      {/* =====================================================
          ENCABEZADO
      ====================================================== */}

      <div className="mb-6">
        <h1
          className="
            text-3xl
            font-bold
            text-white
          "
        >
          Detalle del juego
        </h1>

        <p
          className="
            text-slate-400
            mt-2
          "
        >
          Información administrativa del juego.
        </p>
      </div>

      {/* =====================================================
          CONTENIDO PRINCIPAL
      ====================================================== */}

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
            grid
            grid-cols-1
            lg:grid-cols-3
          "
        >
          {/* =================================================
              IMAGEN
          ================================================== */}

          <div
            className="
              lg:col-span-1
              bg-slate-900
              p-5
            "
          >
            <div
              className="
                w-full
                h-80
                lg:h-full
                min-h-[320px]
                rounded-2xl
                overflow-hidden
                bg-slate-950
                border
                border-slate-800
              "
            >
              {juego.imagen ? (
                <img
                  src={juego.imagen}
                  alt={juego.nombre}
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
              ) : (
                <div
                  className="
                    w-full
                    h-full
                    flex
                    items-center
                    justify-center
                    text-slate-600
                  "
                >
                  <div className="text-center">
                    <i
                      className="
                        pi
                        pi-image
                        text-6xl
                      "
                    />

                    <p className="mt-3">
                      Sin imagen
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* =================================================
              INFORMACIÓN
          ================================================== */}

          <div
            className="
              lg:col-span-2
              p-6
              md:p-8
            "
          >
            {/* NOMBRE Y PRECIO */}

            <div
              className="
                flex
                flex-col
                sm:flex-row
                sm:items-start
                sm:justify-between
                gap-4
              "
            >
              <div>
                <span
                  className="
                    inline-flex
                    items-center
                    px-3
                    py-1
                    rounded-full
                    bg-sky-500/10
                    border
                    border-sky-500/30
                    text-sky-400
                    text-xs
                    font-semibold
                  "
                >
                  Juego
                </span>

                <h2
                  className="
                    text-3xl
                    md:text-4xl
                    font-black
                    text-white
                    mt-3
                  "
                >
                  {juego.nombre}
                </h2>
              </div>

              <div
                className="
                  px-4
                  py-2
                  rounded-xl
                  bg-slate-900
                  border
                  border-slate-700
                  text-white
                  font-bold
                  text-xl
                  whitespace-nowrap
                "
              >
                $
                {Number(
                  juego.precio || 0
                ).toFixed(2)}
              </div>
            </div>

            {/* DESCRIPCIÓN */}

            <div className="mt-8">
              <h3
                className="
                  text-lg
                  font-semibold
                  text-white
                  mb-2
                "
              >
                Descripción
              </h3>

              <p
                className="
                  text-slate-400
                  leading-relaxed
                  whitespace-pre-line
                "
              >
                {juego.descripcion ||
                  "Descripción no disponible para este juego."}
              </p>
            </div>

            {/* INFORMACIÓN */}

            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                gap-4
                mt-8
              "
            >
              {/* CATEGORÍA */}

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
                  <div
                    className="
                      w-10
                      h-10
                      rounded-lg
                      bg-violet-500/10
                      border
                      border-violet-500/30
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <i
                      className="
                        pi
                        pi-tags
                        text-violet-400
                      "
                    />
                  </div>

                  <div>
                    <p
                      className="
                        text-xs
                        text-slate-500
                      "
                    >
                      Categoría
                    </p>

                    <p
                      className="
                        text-white
                        font-semibold
                        mt-1
                      "
                    >
                      {categoria?.nombre ||
                        "Sin categoría"}
                    </p>
                  </div>
                </div>
              </div>

              {/* DESARROLLADOR */}

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
                  <div
                    className="
                      w-10
                      h-10
                      rounded-lg
                      bg-amber-500/10
                      border
                      border-amber-500/30
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <i
                      className="
                        pi
                        pi-building
                        text-amber-400
                      "
                    />
                  </div>

                  <div>
                    <p
                      className="
                        text-xs
                        text-slate-500
                      "
                    >
                      Desarrollador
                    </p>

                    <p
                      className="
                        text-white
                        font-semibold
                        mt-1
                      "
                    >
                      {desarrollador?.nombre ||
                        "Sin desarrollador"}
                    </p>
                  </div>
                </div>
              </div>

              {/* FECHA */}

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
                  <div
                    className="
                      w-10
                      h-10
                      rounded-lg
                      bg-sky-500/10
                      border
                      border-sky-500/30
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <i
                      className="
                        pi
                        pi-calendar
                        text-sky-400
                      "
                    />
                  </div>

                  <div>
                    <p
                      className="
                        text-xs
                        text-slate-500
                      "
                    >
                      Fecha de lanzamiento
                    </p>

                    <p
                      className="
                        text-white
                        font-semibold
                        mt-1
                      "
                    >
                      {juego.anioLanzamiento ||
                        "Sin fecha"}
                    </p>
                  </div>
                </div>
              </div>

              {/* STOCK */}

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
                  <div
                    className={`
                      w-10
                      h-10
                      rounded-lg
                      flex
                      items-center
                      justify-center
                      ${
                        (juego.stock ??
                          0) > 0
                          ? "bg-green-500/10 border border-green-500/30"
                          : "bg-red-500/10 border border-red-500/30"
                      }
                    `}
                  >
                    <i
                      className={`
                        pi
                        ${
                          (juego.stock ??
                            0) > 0
                            ? "pi-key text-green-400"
                            : "pi-ban text-red-400"
                        }
                      `}
                    />
                  </div>

                  <div>
                    <p
                      className="
                        text-xs
                        text-slate-500
                      "
                    >
                      Stock disponible
                    </p>

                    <p
                      className={`
                        font-semibold
                        mt-1
                        ${
                          (juego.stock ??
                            0) > 0
                            ? "text-green-400"
                            : "text-red-400"
                        }
                      `}
                    >
                      {(juego.stock ??
                        0) > 0
                        ? `${juego.stock} claves disponibles`
                        : "Sin claves disponibles"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                BOTÓN VOLVER AL INICIO
            ================================================== */}

            <div
              className="
                flex
                justify-center
                mt-8
                pt-6
                border-t
                border-slate-700
              "
            >
              <Button
                label="Volver al inicio"
                icon="pi pi-home"
                className="
                  bg-transparent
                  border-none
                  text-white
                  hover:bg-slate-800
                  px-5
                "
                onClick={volver}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

