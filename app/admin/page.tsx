"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import EditorMensaje from "@/components/EditorMensaje";

type TipoNotificacion = "exito" | "error";

export default function AdminPage() {
  const router = useRouter();

  const [avisos, setAvisos] = useState<any[]>([]);
  const [titulo, setTitulo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [editorKey, setEditorKey] = useState(0);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [cargando, setCargando] = useState(false);

  const [avisoEditando, setAvisoEditando] = useState<any | null>(null);
  const [tituloEditando, setTituloEditando] = useState("");
  const [mensajeEditando, setMensajeEditando] = useState("");
  const [editorEditarKey, setEditorEditarKey] = useState(0);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);

  const [notificacion, setNotificacion] = useState<{
    tipo: TipoNotificacion;
    mensaje: string;
  } | null>(null);

  const [avisoAEliminar, setAvisoAEliminar] = useState<any | null>(null);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    verificarSesion();
    cargarAvisos();
  }, []);

  function mostrarNotificacion(tipo: TipoNotificacion, mensaje: string) {
    setNotificacion({ tipo, mensaje });

    setTimeout(() => {
      setNotificacion(null);
    }, 3500);
  }

  async function verificarSesion() {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      router.push("/login");
    }
  }

  async function cargarAvisos() {
    const { data } = await supabase
      .from("avisos")
      .select("*")
      .order("created_at", { ascending: false });

    setAvisos(data ?? []);
  }

  async function publicarAviso(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);

    let archivo_url = null;
    let archivo_path = null;
    let archivo_tipo = null;

    if (archivo) {
      const extension = archivo.name.split(".").pop();
      archivo_path = `${crypto.randomUUID()}.${extension}`;
      archivo_tipo = archivo.type;

      const { error: uploadError } = await supabase.storage
        .from("avisos")
        .upload(archivo_path, archivo);

      if (uploadError) {
        mostrarNotificacion("error", "No se pudo subir el archivo.");
        setCargando(false);
        return;
      }

      const { data } = supabase.storage
        .from("avisos")
        .getPublicUrl(archivo_path);

      archivo_url = data.publicUrl;
    }

    const { error } = await supabase.from("avisos").insert({
      titulo,
      mensaje,
      archivo_url,
      archivo_path,
      archivo_tipo,
      publicado: true,
    });

    if (error) {
      mostrarNotificacion("error", "No se pudo guardar el aviso.");
    } else {
      setTitulo("");
      setMensaje("");
      setArchivo(null);
      setEditorKey((prev) => prev + 1);

      await cargarAvisos();

      mostrarNotificacion("exito", "Aviso publicado correctamente.");
    }

    setCargando(false);
  }

  function abrirEditorAviso(aviso: any) {
    setAvisoEditando(aviso);
    setTituloEditando(aviso.titulo ?? "");
    setMensajeEditando(aviso.mensaje ?? "");
    setEditorEditarKey((prev) => prev + 1);
  }

  function cancelarEdicion() {
    setAvisoEditando(null);
    setTituloEditando("");
    setMensajeEditando("");
    setEditorEditarKey((prev) => prev + 1);
  }

  async function guardarEdicionAviso(e: React.FormEvent) {
    e.preventDefault();

    if (!avisoEditando) return;

    setGuardandoEdicion(true);

    const { error } = await supabase
      .from("avisos")
      .update({
        titulo: tituloEditando,
        mensaje: mensajeEditando,
      })
      .eq("id", avisoEditando.id);

    if (error) {
      mostrarNotificacion("error", "No se pudo actualizar el aviso.");
    } else {
      await cargarAvisos();
      cancelarEdicion();
      mostrarNotificacion("exito", "Aviso actualizado correctamente.");
    }

    setGuardandoEdicion(false);
  }

  async function cambiarEstadoPublicado(aviso: any) {
    const nuevoEstado = !aviso.publicado;

    const { error } = await supabase
      .from("avisos")
      .update({
        publicado: nuevoEstado,
      })
      .eq("id", aviso.id);

    if (error) {
      mostrarNotificacion("error", "No se pudo cambiar el estado del aviso.");
      return;
    }

    setAvisos((prevAvisos) =>
      prevAvisos.map((item) =>
        item.id === aviso.id ? { ...item, publicado: nuevoEstado } : item,
      ),
    );

    mostrarNotificacion(
      "exito",
      nuevoEstado
        ? "El aviso ahora está visible para las hermanas."
        : "El aviso fue ocultado del visor público.",
    );
  }

  async function confirmarEliminarAviso() {
    if (!avisoAEliminar) return;

    setEliminando(true);

    if (avisoAEliminar.archivo_path) {
      await supabase.storage
        .from("avisos")
        .remove([avisoAEliminar.archivo_path]);
    }

    const { error } = await supabase
      .from("avisos")
      .delete()
      .eq("id", avisoAEliminar.id);

    if (error) {
      mostrarNotificacion("error", "No se pudo eliminar el aviso.");
    } else {
      await cargarAvisos();
      mostrarNotificacion("exito", "Aviso eliminado correctamente.");
    }

    setEliminando(false);
    setAvisoAEliminar(null);
  }

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-amber-50 px-4 py-6 text-stone-900">
      {notificacion && (
        <div className="fixed left-4 right-4 top-4 z-50 mx-auto max-w-md">
          <div
            className={`rounded-2xl px-5 py-4 text-center font-bold shadow-lg ring-1 ${
              notificacion.tipo === "exito"
                ? "bg-green-50 text-green-800 ring-green-200"
                : "bg-red-50 text-red-800 ring-red-200"
            }`}
          >
            {notificacion.mensaje}
          </div>
        </div>
      )}

      {avisoEditando && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 px-4 py-6">
          <div className="mx-auto w-full max-w-2xl rounded-[2rem] bg-white p-5 shadow-xl">
            <h2 className="text-2xl font-black text-stone-900">
              Modificar aviso
            </h2>

            <p className="mt-1 text-stone-600">
              Cambia el título o el mensaje del aviso seleccionado.
            </p>

            <form onSubmit={guardarEdicionAviso} className="mt-5 space-y-4">
              <input
                required
                placeholder="Título del aviso"
                className="w-full rounded-2xl border border-amber-200 bg-amber-50/40 p-4 text-lg outline-none transition focus:border-amber-500 focus:bg-white"
                value={tituloEditando}
                onChange={(e) => setTituloEditando(e.target.value)}
              />

              <div>
                <p className="mb-2 text-sm font-bold text-stone-700">
                  Mensaje para las hermanas
                </p>

                <EditorMensaje
                  key={editorEditarKey}
                  value={mensajeEditando}
                  onChange={setMensajeEditando}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={cancelarEdicion}
                  disabled={guardandoEdicion}
                  className="rounded-2xl bg-stone-100 px-5 py-4 font-bold text-stone-700 transition hover:bg-stone-200 disabled:opacity-60"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={guardandoEdicion}
                  className="rounded-2xl bg-amber-700 px-5 py-4 font-bold text-white transition hover:bg-amber-800 disabled:opacity-60"
                >
                  {guardandoEdicion ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {avisoAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl">
              ⚠️
            </div>

            <h2 className="text-center text-2xl font-black text-stone-900">
              ¿Eliminar aviso?
            </h2>

            <p className="mt-3 text-center text-stone-600">
              Esta acción eliminará el aviso y también su archivo adjunto, si lo
              tiene.
            </p>

            <p className="mt-4 rounded-2xl bg-stone-50 p-4 text-center font-bold text-stone-800">
              {avisoAEliminar.titulo}
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setAvisoAEliminar(null)}
                disabled={eliminando}
                className="rounded-2xl bg-stone-100 px-5 py-4 font-bold text-stone-700 transition hover:bg-stone-200 disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmarEliminarAviso}
                disabled={eliminando}
                className="rounded-2xl bg-red-600 px-5 py-4 font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {eliminando ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="mx-auto max-w-2xl">
        <header className="mb-5 rounded-[2rem] bg-gradient-to-br from-amber-100 to-white p-4 shadow-sm ring-1 ring-amber-200">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <img
                src="/logo_sin_fondo.png"
                alt="Mujer Fuerte"
                className="h-40 w-40 object-contain"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="mt-2 text-lg leading-snug text-stone-600">
                Avisos, documentos y comunicados importantes.
              </p>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={cerrarSesion}
              className="rounded-2xl bg-white px-4 py-3 font-bold text-stone-700 shadow-sm ring-1 ring-amber-200 transition hover:bg-amber-50"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <form
          onSubmit={publicarAviso}
          className="mb-8 space-y-4 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-amber-100"
        >
          <div>
            <h2 className="text-2xl font-bold text-stone-900">
              Publicar nuevo aviso
            </h2>

            <p className="mt-1 text-stone-600">
              Escribe el aviso y, si es necesario, adjunta una imagen o PDF.
            </p>
          </div>

          <input
            required
            placeholder="Título del aviso"
            className="w-full rounded-2xl border border-amber-200 bg-amber-50/40 p-4 text-lg outline-none transition focus:border-amber-500 focus:bg-white"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />

          <div>
            <p className="mb-2 text-sm font-bold text-stone-700">
              Mensaje para las hermanas
            </p>

            <EditorMensaje
              key={editorKey}
              value={mensaje}
              onChange={setMensaje}
            />
          </div>

          <label className="block rounded-2xl border border-dashed border-amber-300 bg-amber-50/60 p-4">
            <span className="block text-lg font-bold text-stone-800">
              Adjuntar imagen o PDF
            </span>

            <span className="mt-1 block text-sm text-stone-600">
              Opcional. Puedes subir una imagen o un documento PDF.
            </span>

            <input
              type="file"
              accept="image/*,.pdf"
              className="mt-4 w-full text-sm"
              onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
            />
          </label>

          <button
            disabled={cargando}
            className="w-full rounded-2xl bg-amber-700 py-4 text-lg font-bold text-white shadow-sm transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {cargando ? "Publicando..." : "Publicar aviso"}
          </button>
        </form>

        <div className="mb-4">
          <h2 className="text-2xl font-bold text-stone-900">
            Avisos publicados
          </h2>

          <p className="text-stone-600">
            Desde aquí puedes revisar o eliminar avisos.
          </p>
        </div>

        <div className="space-y-4">
          {!avisos.length && (
            <div className="rounded-[2rem] bg-white p-6 text-center shadow-sm ring-1 ring-amber-100">
              <p className="text-lg text-stone-600">
                Todavía no hay avisos publicados.
              </p>
            </div>
          )}

          {avisos.map((aviso) => {
            const fecha = new Date(aviso.created_at).toLocaleDateString(
              "es-MX",
              {
                day: "numeric",
                month: "long",
                year: "numeric",
              },
            );

            return (
              <article
                key={aviso.id}
                className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-amber-100"
              >
                {/* <div className="mb-3 inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
                  Publicado
                </div> */}

                <div
                  className={`mb-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                    aviso.publicado
                      ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                      : "bg-stone-100 text-stone-600 ring-1 ring-stone-200"
                  }`}
                >
                  {aviso.publicado ? "Publicado" : "Oculto"}
                </div>

                <h3 className="text-xl font-bold text-stone-900">
                  {aviso.titulo}
                </h3>

                <p className="mt-1 text-sm font-medium text-stone-500">
                  {fecha}
                </p>

                {aviso.mensaje && (
                  <div
                    className="mt-3 space-y-2 text-stone-700 [&_em]:italic [&_li]:ml-5 [&_li]:list-disc [&_p]:leading-relaxed [&_strong]:font-bold [&_u]:underline [&_ul]:space-y-1"
                    dangerouslySetInnerHTML={{ __html: aviso.mensaje }}
                  />
                )}

                {aviso.archivo_url && (
                  <a
                    href={aviso.archivo_url}
                    target="_blank"
                    className="mt-4 block rounded-2xl bg-amber-100 px-4 py-3 text-center font-bold text-amber-800 transition hover:bg-amber-200"
                  >
                    Ver archivo adjunto
                  </a>
                )}

                <div className="mt-4 rounded-2xl bg-stone-50 p-4 ring-1 ring-stone-100">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-stone-900">
                        Mostrar en avisos
                      </p>
                      <p className="text-sm text-stone-600">
                        {aviso.publicado
                          ? "Este aviso está visible para las hermanas."
                          : "Este aviso está oculto en el visor público."}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => cambiarEstadoPublicado(aviso)}
                      className={`relative inline-flex h-8 w-14 flex-shrink-0 rounded-full transition ${
                        aviso.publicado ? "bg-amber-700" : "bg-stone-300"
                      }`}
                      aria-pressed={aviso.publicado}
                      aria-label="Cambiar visibilidad del aviso"
                    >
                      <span
                        className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${
                          aviso.publicado ? "left-7" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    onClick={() => abrirEditorAviso(aviso)}
                    className="w-full rounded-2xl border border-amber-200 bg-amber-50 py-3 font-bold text-amber-800 transition hover:bg-amber-100"
                  >
                    Modificar aviso
                  </button>

                  <button
                    onClick={() => setAvisoAEliminar(aviso)}
                    className="w-full rounded-2xl border border-red-200 bg-red-50 py-3 font-bold text-red-700 transition hover:bg-red-100"
                  >
                    Eliminar aviso
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
