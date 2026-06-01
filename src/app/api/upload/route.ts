import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configuración de tus credenciales de Cloudinary (Mantén las tuyas intactas)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ success: false, error: 'No se cargó ningún archivo' }, { status: 400 });
        }

        // Convertimos el archivo a buffer para procesarlo de forma segura
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // DETERMINACIÓN DINÁMICA DEL TIPO DE ARCHIVO
        const esDocumento = 
            file.type === 'application/pdf' || 
            file.name.endsWith('.pdf') || 
            file.name.endsWith('.doc') || 
            file.name.endsWith('.docx') || 
            file.name.endsWith('.xls') || 
            file.name.endsWith('.xlsx');

        // Configuramos las opciones de Cloudinary según el archivo
        const opcionesUpload: any = {
            folder: 'interjus_multimedia',
            // SI ES DOCUMENTO: Forzamos 'raw' para que no rompa el binario del PDF
            // SI ES FOTO/VIDEO: Usamos 'auto' para que mantenga la optimización visual
            resource_type: esDocumento ? 'raw' : 'auto',
            public_id: file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, "_")
        };

        // Ejecutamos la subida mediante streaming directo
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(opcionesUpload, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }).end(buffer);
        }) as any;

        return NextResponse.json({ 
            success: true, 
            url: uploadResult.secure_url 
        });

    } catch (error: any) {
        console.error("Error crítico en /api/upload:", error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}