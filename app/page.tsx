import Image from "next/image";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const { data: avisos, error } = await supabase
    .from("avisos")
    .select("*")
    .eq("publicado", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error cargando avisos:", error);
  }

  return (
    <main className="min-h-screen bg-amber-50 px-4 py-6 text-stone-900">
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
                  {/* <div className="mb-3 inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
                    Aviso
                  </div> */}

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
                    <div className="mt-5 overflow-hidden rounded-2xl bg-amber-50">
                      <div className="relative h-72 w-full overflow-hidden rounded-2xl bg-amber-50 sm:h-96">
                        <Image
                          src={aviso.archivo_url}
                          alt={aviso.titulo}
                          fill
                          sizes="(max-width: 768px) 100vw, 672px"
                          className="object-cover"
                          loading="eager"
                          priority
                        />
                        {/* <Image
                          src={aviso.archivo_url}
                          alt={aviso.titulo}
                          fill
                          sizes="(max-width: 768px) 100vw, 672px"
                          className="object-cover"
                          priority={false}
                        /> */}
                      </div>
                      {/* <img
                        src={aviso.archivo_url}
                        alt={aviso.titulo}
                        className="w-full object-cover"
                      /> */}
                    </div>
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
          {/* <a
              href="/login"
              className="text-sm font-semibold text-amber-700 underline underline-offset-4"
            >
              Administración
            </a> */}
          <i className="text-sm text-stone-500 rounded-full">
            "Porque separados de mí nada podéis hacer. Juan 15:5b"
          </i>
        </footer>
      </section>
    </main>
  );
}
