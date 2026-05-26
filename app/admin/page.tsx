'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  const [avisos, setAvisos] = useState<any[]>([]);
  const [titulo, setTitulo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    verificarSesion();
    cargarAvisos();
  }, []);

  async function verificarSesion() {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      router.push('/login');
    }
  }

  async function cargarAvisos() {
    const { data } = await supabase
      .from('avisos')
      .select('*')
      .order('created_at', { ascending: false });

    setAvisos(data ?? []);
  }

  async function publicarAviso(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);

    let archivo_url = null;
    let archivo_path = null;
    let archivo_tipo = null;

    if (archivo) {
      const extension = archivo.name.split('.').pop();
      archivo_path = `${crypto.randomUUID()}.${extension}`;
      archivo_tipo = archivo.type;

      const { error: uploadError } = await supabase.storage
        .from('avisos')
        .upload(archivo_path, archivo);

      if (uploadError) {
        alert('No se pudo subir el archivo');
        setCargando(false);
        return;
      }

      const { data } = supabase.storage
        .from('avisos')
        .getPublicUrl(archivo_path);

      archivo_url = data.publicUrl;
    }

    const { error } = await supabase.from('avisos').insert({
      titulo,
      mensaje,
      archivo_url,
      archivo_path,
      archivo_tipo,
      publicado: true,
    });

    if (error) {
      alert('No se pudo guardar el aviso');
    } else {
      setTitulo('');
      setMensaje('');
      setArchivo(null);
      await cargarAvisos();
    }

    setCargando(false);
  }

  async function eliminarAviso(aviso: any) {
    const confirmar = confirm('¿Eliminar este aviso?');

    if (!confirmar) return;

    if (aviso.archivo_path) {
      await supabase.storage.from('avisos').remove([aviso.archivo_path]);
    }

    await supabase.from('avisos').delete().eq('id', aviso.id);

    await cargarAvisos();
  }

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <main className="min-h-screen bg-[#fff7f9] px-4 py-6">
      <section className="mx-auto max-w-2xl">
        <header className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-amber-900">Mujer Fuerte</h1>
          <p className="text-lg text-amber-700">Panel de avisos</p>

          <button
            onClick={cerrarSesion}
            className="mt-4 rounded-2xl bg-gray-100 px-4 py-3 font-semibold text-gray-700"
          >
            Cerrar sesión
          </button>
        </header>

        <form
          onSubmit={publicarAviso}
          className="mb-8 space-y-4 rounded-3xl bg-white p-5 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-amber-900">Nuevo aviso</h2>

          <input
            required
            placeholder="Título del aviso"
            className="w-full rounded-2xl border p-4 text-lg"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />

          <textarea
            placeholder="Escribe el aviso"
            rows={5}
            className="w-full rounded-2xl border p-4 text-lg"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
          />

          <input
            type="file"
            accept="image/*,.pdf"
            className="w-full rounded-2xl border bg-white p-4"
            onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
          />

          <button
            disabled={cargando}
            className="w-full rounded-2xl bg-amber-700 py-4 text-lg font-bold text-white"
          >
            {cargando ? 'Publicando...' : 'Publicar aviso'}
          </button>
        </form>

        <div className="space-y-4">
          {avisos.map((aviso) => (
            <article
              key={aviso.id}
              className="rounded-3xl bg-white p-5 shadow-sm"
            >
              <h3 className="text-xl font-bold text-amber-900">
                {aviso.titulo}
              </h3>

              {aviso.mensaje && (
                <p className="mt-2 whitespace-pre-line text-gray-700">
                  {aviso.mensaje}
                </p>
              )}

              {aviso.archivo_url && (
                <a
                  href={aviso.archivo_url}
                  target="_blank"
                  className="mt-3 block text-amber-700 underline"
                >
                  Ver archivo adjunto
                </a>
              )}

              <button
                onClick={() => eliminarAviso(aviso)}
                className="mt-4 w-full rounded-2xl bg-red-600 py-3 font-bold text-white"
              >
                Eliminar aviso
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}