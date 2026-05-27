"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function HomePage() {
  const [avisos, setAvisos] = useState<any[]>([]);
  const [imagenAbierta, setImagenAbierta] = useState<string | null>(null);

  useEffect(() => {
    cargarAvisos();
  }, []);

  async function cargarAvisos() {
    const { data } = await supabase
      .from("avisos")
      .select("*")
      .eq("publicado", true)
      .order("created_at", { ascending: false });

    setAvisos(data ?? []);
  }

  return (
    <main className="min-h-screen bg-amber-50 px-4 py-6 text-stone-900">
      {imagenAbierta && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setImagenAbierta(null)}
        >
          <button
            type="button"
            onClick={() => setImagenAbierta(null)}
            className="absolute right-4 top-4 rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-stone-900"
          >
            Cerrar
          </button>

          <img
            src={imagenAbierta}
            alt="Imagen del aviso"
            className="max-h-[85vh] max-w-full object-contain"
          />
        </div>
      )}

      <section className="mx-auto max-w-2xl">
        <header className="mb-5 rounded-[2rem] bg-gradient-to-br from-amber-100 to-white p-4 shadow-sm ring-1 ring-amber-200">
          <div className="flex items-center gap-2">
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
        </header>

 <div className="space-y-5">
          {!avisos?.length && (
            <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm ring-1 ring-amber-100">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl">
                📌
              </div>

              <h2 className="text-2xl font-bold text-stone-900">
                No hay avisos por ahora
              </h2>

              <p className="mt-2 text-lg text-stone-600">
                Cuando se publique un aviso, aparecerá en esta sección.
              </p>
            </div>
          )}

          {avisos?.map((aviso) => {
            const esImagen = aviso.archivo_tipo?.startsWith("image/");
            const esPdf = aviso.archivo_tipo === "application/pdf";

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
                className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-amber-100"
              >
                <div className="p-5">
                  <div className="mb-3 inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
                    Aviso
                  </div>

                  <h2 className="text-2xl font-bold leading-tight text-stone-900">
                    {aviso.titulo}
                  </h2>

                  <p className="mt-2 text-sm font-medium text-stone-500">
                    Publicado el {fecha}
                  </p>

                  {aviso.mensaje && (
                    <div
                      className="mt-4 space-y-2 text-lg leading-relaxed text-stone-700 [&_em]:italic [&_li]:ml-5 [&_li]:list-disc [&_p]:leading-relaxed [&_strong]:font-bold [&_u]:underline [&_ul]:space-y-1"
                      dangerouslySetInnerHTML={{ __html: aviso.mensaje }}
                    />
                  )}

                  {esImagen && aviso.archivo_url && (
                    <button
                      type="button"
                      onClick={() => setImagenAbierta(aviso.archivo_url)}
                      className="mt-5 block w-full overflow-hidden rounded-2xl bg-amber-50 text-left"
                    >
                      <div className="relative h-72 w-full overflow-hidden rounded-2xl bg-amber-50 sm:h-96">
                        <Image
                          src={aviso.archivo_url}
                          alt={aviso.titulo}
                          fill
                          sizes="(max-width: 768px) 100vw, 672px"
                          className="object-cover"
                        />
                      </div>

                      <p className="px-4 py-3 text-center text-sm font-bold text-amber-800">
                        Tocar para ver imagen completa
                      </p>
                    </button>
                  )}

                  {esPdf && aviso.archivo_url && (
                    <a
                      href={aviso.archivo_url}
                      target="_blank"
                      className="mt-5 flex items-center justify-center rounded-2xl bg-amber-700 px-5 py-4 text-lg font-bold text-white shadow-sm transition hover:bg-amber-800"
                    >
                      Abrir documento
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <footer className="mt-8 text-center">
          <a
            href="/login"
            className="text-sm font-semibold text-amber-700 underline underline-offset-4"
          >
            Administración
          </a>
        </footer>
      </section>
    </main>
  );
}