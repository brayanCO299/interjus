// src/app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

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
            return NextResponse.json({ success: false, error: 'No se envió ningún archivo.' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const url = await new Promise<string>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { resource_type: 'auto', folder: 'interjus_multimedia' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result?.secure_url as string);
                }
            );
            uploadStream.end(buffer);
        });

        return NextResponse.json({ success: true, url });
    } catch (error) {
        console.error('Error al subir a Cloudinary:', error);
        return NextResponse.json({ success: false, error: 'Error interno al procesar el archivo.' }, { status: 500 });
    }
}