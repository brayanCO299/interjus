// src/app/api/usuarios/[id]/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // 1. Cambiamos el tipo a Promise
) {
    try {
        const { id } = await params; // 2. Desempaquetamos la promesa con await

        const result = await query(
            `SELECT id, nombres, area, cargo, profesion, fecha_nacimiento 
       FROM usuarios 
       WHERE id = $1`,
            [id] // 3. Usamos el id desempaquetado
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 });
        }

        return NextResponse.json({ success: true, usuario: result.rows[0] });
    } catch (error) {
        console.error('Error al obtener el perfil del usuario:', error);
        return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
    }
}