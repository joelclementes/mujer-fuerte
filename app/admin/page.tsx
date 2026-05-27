"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type TipoNotificacion = "exito" | "error";

export default function AdminPage() {
  const router = useRouter();

  const [avisos, setAvisos] = useState<any[]>([]);
  const [titulo, setTitulo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [cargando, setCargando] = useState(false);

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
      await cargarAvisos();
      mostrarNotificacion("exito", "Aviso publicado correctamente.");
    }

    setCargando(false);
  }

  async function confirmarEliminarAviso() {
    if (!avisoAEliminar) return;

    setEliminando(true);

    if (avisoAEliminar.archivo_path) {
      await supabase.storage.from("avisos").remove([avisoAEliminar.archivo_path]);
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
                className="h-30 w-30 object-contain"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                Sociedad Femenil
              </p>

              <h1 className="mt-1 text-3xl font-black leading-none tracking-tight text-stone-900">
                Mujer Fuerte
              </h1>

              <p className="mt-2 text-sm leading-snug text-stone-600">
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

          <textarea
            placeholder="Mensaje para las hermanas"
            rows={5}
            className="w-full rounded-2xl border border-amber-200 bg-amber-50/40 p-4 text-lg outline-none transition focus:border-amber-500 focus:bg-white"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
          />

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
                <div className="mb-3 inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
                  Publicado
                </div>

                <h3 className="text-xl font-bold text-stone-900">
                  {aviso.titulo}
                </h3>

                <p className="mt-1 text-sm font-medium text-stone-500">
                  {fecha}
                </p>

                {aviso.mensaje && (
                  <p className="mt-3 whitespace-pre-line text-stone-700">
                    {aviso.mensaje}
                  </p>
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

                <button
                  onClick={() => setAvisoAEliminar(aviso)}
                  className="mt-4 w-full rounded-2xl border border-red-200 bg-red-50 py-3 font-bold text-red-700 transition hover:bg-red-100"
                >
                  Eliminar aviso
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}