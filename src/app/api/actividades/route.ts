import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// 1. OBTENER SOLO LAS ACTIVIDADES VIGENTES (FILTRADO AUTOMÁTICO DE PASADAS)
export async function GET() {
    try {
        const result = await query(`
            SELECT id, titulo, fecha_hora, usuario_id, created_at
            FROM actividades 
            -- Filtro estricto: la fecha de la actividad debe ser mayor o igual al minuto actual en Perú
            WHERE fecha_hora >= (NOW() AT TIME ZONE 'America/Lima')
            ORDER BY fecha_hora ASC 
            LIMIT 15
        `);

        // Formateamos las filas para limpiar cualquier desfase de huso horario del driver de Postgres
        const actividadesFormateadas = result.rows.map((act: any) => {
            const fechaOriginal = new Date(act.fecha_hora);
            
            // Forzamos a ajustar las 5 horas que sustrae el driver de PostgreSQL automáticamente
            fechaOriginal.setHours(fechaOriginal.getHours() + 5);

            const hoy = new Date();
            const mañana = new Date();
            mañana.setDate(hoy.getDate() + 1);

            const esMismoDia = (d1: Date, d2: Date) => 
                d1.getDate() === d2.getDate() && 
                d1.getMonth() === d2.getMonth() && 
                d1.getFullYear() === d2.getFullYear();

            return {
                ...act,
                fecha_limpia: fechaOriginal.toISOString(),
                recordar_manana: esMismoDia(fechaOriginal, mañana),
                es_hoy: esMismoDia(fechaOriginal, hoy)
            };
        });

        return NextResponse.json({ success: true, actividades: actividadesFormateadas });
    } catch (error: any) {
        console.error("Error en GET /api/actividades:", error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// 2. REGISTRAR ACTIVIDAD SIN ALTERACIÓN
export async function POST(request: Request) {
    try {
        const { titulo, fecha_hora, usuario_id } = await request.json();

        if (!titulo || !fecha_hora || !usuario_id) {
            return NextResponse.json({ success: false, error: 'Campos incompletos' }, { status: 400 });
        }

        const fechaFormateada = fecha_hora.replace('T', ' ');

        await query(
            `INSERT INTO actividades (titulo, fecha_hora, usuario_id) 
            VALUES ($1, $2::timestamp, $3)`,
            [titulo, fechaFormateada, usuario_id]
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error en POST /api/actividades:", error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}