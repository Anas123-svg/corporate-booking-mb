import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const file = url.searchParams.get('file');
    if (!file) return NextResponse.json({ error: 'file param required' }, { status: 400 });

    // Validate against known filenames to avoid path traversal


    const base = path.join(process.cwd(), 'src', 'app', '(admin)', '(others-pages)', 'templates', 'add', 'Word');
    const filePath = path.join(base, file);
    const data = await fs.promises.readFile(filePath);

    const uint8 = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);

    return new Response(uint8 as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Length': String(data.length),
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}
