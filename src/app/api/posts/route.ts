// src/app/api/posts/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const usuario_id = searchParams.get('usuario_id') || 0;

        const result = await query(`
            SELECT p.id, p.texto, p.multimedia_url, p.tipo_media, p.created_at, p.usuario_id, 
                u.nombres as autor_nombre, u.area as autor_area,
                (SELECT COUNT(*) FROM reacciones WHERE publicacion_id = p.id) as total_likes,
                EXISTS(
                    SELECT 1 FROM reacciones 
                    WHERE publicacion_id = p.id AND usuario_id = $1
                ) as dio_like,
                COALESCE(
                    (SELECT json_agg(c) FROM (
                        SELECT c.contenido, u2.nombres as autor_comentario 
                        FROM comentarios c 
                        JOIN usuarios u2 ON c.usuario_id = u2.id 
                        WHERE c.publicacion_id = p.id 
                        ORDER BY c.id ASC
                    ) c), '[]'::json
                ) as comentarios
            FROM publicaciones p
            JOIN usuarios u ON p.usuario_id = u.id
            ORDER BY p.created_at DESC 
            LIMIT 50
        `, [usuario_id]);

        return NextResponse.json({ success: true, posts: result.rows });
    } catch (error: any) {
        console.error("Error en GET /api/posts:", error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const usuario_id = body.usuario_id;
        const texto = body.texto || '';
        const multimedia_url = body.multimedia_url || null;
        const tipo_media = body.tipo_media || null;

        if (!usuario_id) {
            return NextResponse.json({ success: false, error: 'Falta el usuario_id' }, { status: 400 });
        }

        await query(
            `INSERT INTO publicaciones (usuario_id, texto, multimedia_url, tipo_media) 
            VALUES ($1, $2, $3, $4)`,
            [usuario_id, texto, multimedia_url, tipo_media]
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error crítico en POST /api/posts:", error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}