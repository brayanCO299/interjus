import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// 1. LISTAR DOCUMENTOS OFICIALES
export async function GET() {
    try {
        const result = await query(`
            SELECT d.id, d.titulo, d.categoria, d.archivo_url, d.created_at, u.nombres as subido_por
            FROM documentos_oficiales d
            JOIN usuarios u ON d.usuario_id = u.id
            ORDER BY d.created_at DESC
        `);
        return NextResponse.json({ success: true, documentos: result.rows });
    } catch (error: any) {
        console.error("Error en GET /api/documentos:", error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// 2. REGISTRAR UN NUEVO DOCUMENTO
export async function POST(request: Request) {
    try {
        const { titulo, categoria, archivo_url, usuario_id } = await request.json();
        
        if (!titulo || !categoria || !archivo_url || !usuario_id) {
            return NextResponse.json({ success: false, error: 'Campos incompletos' }, { status: 400 });
        }

        await query(
            `INSERT INTO documentos_oficiales (titulo, categoria, archivo_url, usuario_id) 
            VALUES ($1, $2, $3, $4)`,
            [titulo, categoria, archivo_url, usuario_id]
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error en POST /api/documentos:", error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}