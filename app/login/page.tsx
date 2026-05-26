'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function iniciarSesion(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert('Correo o contraseña incorrectos');
      return;
    }

    router.push('/admin');
  }

  return (
    <main className="min-h-screen bg-[#fff7f9] px-4 py-8">
      <section className="mx-auto max-w-md rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-center text-3xl font-bold text-amber-900">
          Mujer Fuerte
        </h1>
        <p className="mt-2 text-center text-lg text-amber-700">
          Administración
        </p>

        <form onSubmit={iniciarSesion} className="mt-8 space-y-4">
          <input
            type="email"
            placeholder="Correo"
            className="w-full rounded-2xl border p-4 text-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Contraseña"
            className="w-full rounded-2xl border p-4 text-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="w-full rounded-2xl bg-amber-700 py-4 text-lg font-bold text-white">
            Entrar
          </button>
        </form>
      </section>
    </main>
  );
}