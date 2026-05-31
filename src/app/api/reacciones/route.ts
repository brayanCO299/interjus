import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { post_id, usuario_id } = await request.json();

        // 1. Verificamos si la reacción ya existe en la base de datos
        const existeReaccion = await query(
            'SELECT id FROM reacciones WHERE publicacion_id = $1 AND usuario_id = $2',
            [post_id, usuario_id]
        );

        if (existeReaccion.rows.length > 0) {
            // 2. Si ya existe, significa que el usuario está quitando el "Me gusta"
            await query(
                'DELETE FROM reacciones WHERE publicacion_id = $1 AND usuario_id = $2',
                [post_id, usuario_id]
            );
        } else {
            // 3. Si no existe, insertamos el nuevo "Me gusta"
            await query(
                'INSERT INTO reacciones (publicacion_id, usuario_id) VALUES ($1, $2)',
                [post_id, usuario_id]
            );
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error en API reacciones:", error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}