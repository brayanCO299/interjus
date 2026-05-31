// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { correo, contrasena } = body;

        // Buscamos al usuario en la base de datos de Neon
        // Asegúrate de que tu SELECT sea así:
const result = await query(
`SELECT id, nombres, area, cargo, profesion, correo, rol FROM usuarios WHERE correo = $1 AND contrasena = $2`,
[correo, contrasena]
);

        if (result.rows.length === 0) {
            return NextResponse.json({ success: false, error: 'Correo o contraseña incorrectos.' }, { status: 401 });
        }

        const user = result.rows[0];

        // LÓGICA DE PERMISOS: 
        // Asignamos el rol 'ADMIN' a los de Informática (o a un cargo específico) para que puedan ver los campos "Buscar" y "Estado". 
        // Los demás serán 'OPERADOR' y no verán esos campos.
        const rol = user.area === 'Informática' ? 'ADMIN' : 'OPERADOR';

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.nombres,
                area: user.area,
                rol: rol
            }
        });

    } catch (error) {
        console.error('Error en el login:', error);
        return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
    }
}