import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const { data: avisos } = await supabase
    .from('avisos')
    .select('*')
    .eq('publicado', true)
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-[#fff7f9] px-4 py-6 text-gray-900">
      <section className="mx-auto max-w-2xl">
        <header className="mb-8 rounded-3xl bg-white p-6 text-center shadow-sm">
          <h1 className="text-4xl font-bold text-amber-900">Mujer Fuerte</h1>
          <p className="mt-2 text-lg text-amber-700">Sociedad Femenil</p>
        </header>

        <div className="space-y-5">
          {!avisos?.length && (
            <div className="rounded-3xl bg-white p-6 text-center shadow-sm">
              <p className="text-lg text-gray-600">No hay avisos disponibles.</p>
            </div>
          )}

          {avisos?.map((aviso) => {
            const esImagen = aviso.archivo_tipo?.startsWith('image/');
            const esPdf = aviso.archivo_tipo === 'application/pdf';

            return (
              <article
                key={aviso.id}
                className="rounded-3xl bg-white p-5 shadow-sm"
              >
                <h2 className="text-2xl font-bold text-amber-900">
                  {aviso.titulo}
                </h2>

                {aviso.mensaje && (
                  <p className="mt-3 whitespace-pre-line text-lg leading-relaxed text-gray-700">
                    {aviso.mensaje}
                  </p>
                )}

                {esImagen && aviso.archivo_url && (
                  <img
                    src={aviso.archivo_url}
                    alt={aviso.titulo}
                    className="mt-4 w-full rounded-2xl"
                  />
                )}

                {esPdf && aviso.archivo_url && (
                  <a
                    href={aviso.archivo_url}
                    target="_blank"
                    className="mt-5 block rounded-2xl bg-amber-700 px-5 py-4 text-center text-lg font-bold text-white"
                  >
                    Ver documento PDF
                  </a>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}