import { NextResponse } from 'next/server';
import { uploadLegalReference } from '@/lib/gemini';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

export async function POST(request: Request) {
    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Save to temp directory
        const tempPath = join(tmpdir(), `legal-ref-${Date.now()}.pdf`);
        await writeFile(tempPath, buffer);

        // Upload to Gemini
        const fileUri = await uploadLegalReference(tempPath, file.type);

        // Cleanup temp file
        await unlink(tempPath);

        if (!fileUri) {
            return NextResponse.json({ error: "Failed to upload to Gemini" }, { status: 500 });
        }

        return NextResponse.json({ success: true, fileUri });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
