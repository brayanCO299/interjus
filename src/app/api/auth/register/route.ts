import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { nombres, correo, contrasena, area, profesion, fecha_nacimiento, cargo } = body;

        // Ejecutamos la inserción en la base de datos de Neon
        const result = await query(
            `INSERT INTO usuarios (nombres, correo, contrasena, area, profesion, fecha_nacimiento, cargo) 
    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, nombres, area`,
            [nombres, correo, contrasena, area, profesion, fecha_nacimiento, cargo]
        );

        return NextResponse.json({ success: true, user: result.rows[0] });
    } catch (error: any) {
        console.error('Error al registrar usuario en la BD:', error);

        // Validar si el correo ya existe (código de error unique_violation de PostgreSQL)
        if (error.code === '23505') {
            return NextResponse.json({ success: false, error: 'Este correo institucional ya está registrado.' }, { status: 400 });
        }

        return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
    }
}