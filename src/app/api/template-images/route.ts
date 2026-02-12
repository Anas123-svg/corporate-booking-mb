import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const folder = searchParams.get('folder');
  const file = searchParams.get('file');

  if (!folder || !file) return new Response('Missing params', { status: 400 });

  // Validate folder exists in our index

  // Resolve path to template_images
  const base = path.join(process.cwd(), 'src', 'app', '(admin)', '(others-pages)', 'templates', 'add', 'template_images');
  const safeFolder = path.join(base, folder);
  const safeFile = path.join(safeFolder, file);

  try {
    if (!fs.existsSync(safeFile)) return new Response('Not found', { status: 404 });
  const buffer = fs.readFileSync(safeFile);
    const ext = path.extname(file).toLowerCase();
    const contentType = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'application/octet-stream';
  // Create a proper ArrayBuffer copy for the Blob
  const ab = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
  const blob = new Blob([ab], { type: contentType });
  return new Response(blob, { status: 200, headers: { 'Content-Type': contentType } });
  } catch (err) {
    return new Response('Error', { status: 500 });
  }
}
