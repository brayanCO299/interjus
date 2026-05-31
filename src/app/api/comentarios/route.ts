import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { post_id, usuario_id, texto } = await request.json();
        
        // CORRECCIÓN: usamos 'contenido' en lugar de 'texto'
        await query(
            'INSERT INTO comentarios (publicacion_id, usuario_id, contenido) VALUES ($1, $2, $3)',
            [post_id, usuario_id, texto]
        );
        
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error al insertar comentario:', error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}