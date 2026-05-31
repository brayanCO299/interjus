// src/app/api/usuarios/cumpleanos/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const hoy = new Date();
        const mes = hoy.getMonth() + 1;
        const dia = hoy.getDate();

        // Probemos una consulta simplificada para ver si el problema es la columna
        const result = await query(
            `SELECT nombres, area FROM usuarios 
    WHERE EXTRACT(MONTH FROM fecha_nacimiento) = $1
    AND EXTRACT(DAY FROM fecha_nacimiento) = $2`,
            [mes, dia]
        );

        return NextResponse.json({ success: true, cumpleaneros: result.rows });
    } catch (error: any) {
        console.error('Error detallado:', error.message); // Esto aparecerá en tu terminal de VS Code
        return NextResponse.json({
            success: false,
            error: error.message // Esto nos dirá exactamente qué columna falta o está mal
        }, { status: 500 });
    }
}