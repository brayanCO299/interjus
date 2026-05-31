// src/app/page.tsx
'use client';
import React, { useState } from 'react';
import { Scale } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Función para manejar el Registro
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    // Extraer los datos del formulario usando los atributos "name"
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        alert('¡Registro exitoso! Ya puedes iniciar sesión.');
        setIsRegister(false); // Volver a la pantalla de login
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert('Error de conexión. Revisa tu consola.');
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar el Login
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        // Guardamos los datos del usuario en el navegador
        localStorage.setItem('interjus_user', JSON.stringify(result.user));
        // Redirigimos al feed
        router.push('/feed');
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert('Error de conexión. Revisa tu consola.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col justify-center items-center p-4">
      <div className="text-center mb-6">
        <div className="flex justify-center items-center gap-3 text-red-900 mb-1">
          <Scale size={56} className="drop-shadow-sm" />
          <h1 className="text-5xl font-black tracking-tight select-none">InterJus</h1>
        </div>
        <p className="text-neutral-500 tracking-widest text-xs font-bold uppercase">From COBYTE</p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md border-t-8 border-red-900">
        {!isRegister ? (
          <div>
            <h2 className="text-xl font-bold mb-4 text-center text-gray-800">Acceso Institucional</h2>
            <form className="flex flex-col gap-3" onSubmit={handleLogin}>
              <input type="email" name="correo" placeholder="Correo Institucional" className="p-3 border text-black bg-white rounded focus:ring-2 focus:ring-red-900 outline-none transition" required />
              <input type="password" name="contrasena" placeholder="Contraseña" className="p-3 border text-black bg-white rounded focus:ring-2 focus:ring-red-900 outline-none transition" required />
              <button disabled={loading} className="bg-red-900 text-white p-3 rounded font-bold hover:bg-red-950 transition shadow-sm mt-2 disabled:bg-red-700">
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </form>
            <div className="text-center mt-6 pt-4 border-t">
              <button onClick={() => setIsRegister(true)} disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded font-bold text-sm hover:bg-green-700 transition disabled:bg-green-400">
                Crear cuenta nueva
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold mb-4 text-center text-gray-800">Registro de Personal</h2>
            <form className="flex flex-col gap-3 text-sm" onSubmit={handleRegister}>
              <input type="text" name="nombres" placeholder="Nombres Completos" className="p-2.5 border text-black bg-white rounded" required />
              <input type="email" name="correo" placeholder="Correo Electrónico" className="p-2.5 border text-black bg-white rounded" required />
              <input type="password" name="contrasena" placeholder="Establecer Contraseña" className="p-2.5 border text-black bg-white rounded" required />
              <select name="area" className="p-2.5 border text-gray-700 bg-white rounded" required>
                <option value="">Seleccione su Área...</option>
                <option value="Pool de Sanción">Pool de Sanción</option>
                <option value="Informática">Informática</option>
                <option value="Traductores">Traductores</option>
                <option value="Mesa de Partes">Mesa de Partes</option>
                <option value="Equipo Multidisciplinario">Equipo Multidisciplinario</option>
                <option value="Notificadores">Notificadores</option>
                <option value="Pool de Traducción">Pool de Traducción</option>
              </select>
              <input type="text" name="profesion" placeholder="Profesión" className="p-2.5 border text-black bg-white rounded" required />
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 px-1">Fecha de Nacimiento</label>
                <input type="date" name="fecha_nacimiento" className="p-2.5 border text-black bg-white rounded" required />
              </div>
              <input type="text" name="cargo" placeholder="Cargo Actual" className="p-2.5 border text-black bg-white rounded" required />
              
              <button disabled={loading} className="bg-green-600 text-white p-2.5 rounded font-bold hover:bg-green-700 transition mt-2 disabled:bg-green-400">
                {loading ? 'Registrando...' : 'Registrarse'}
              </button>
              <button type="button" onClick={() => setIsRegister(false)} disabled={loading} className="text-red-900 font-semibold text-center mt-2 hover:underline">
                ¿Ya tienes cuenta? Ingresa aquí
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}