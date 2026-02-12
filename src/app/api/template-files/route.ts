import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name');
  if (!name) return new Response('Missing name', { status: 400 });


  const base = path.join(process.cwd(), 'src', 'app', '(admin)', '(others-pages)', 'templates', 'add', 'template_images');
  const folderPath = path.join(base, name);
  if (!fs.existsSync(folderPath)) return new Response('Not found', { status: 404 });

  // Collect page images sorted by page_N.png
  const files = fs.readdirSync(folderPath).filter(f => /^page_\d+\.png$/.test(f)).sort((a,b)=>{
    const ai = parseInt(a.match(/page_(\d+)\.png/)?.[1] || '0',10);
    const bi = parseInt(b.match(/page_(\d+)\.png/)?.[1] || '0',10);
    return ai - bi;
  });

  if (files.length === 0) return new Response('No pages', { status: 404 });

  // Build HTML with each page using the template-images API as background and an editable overlay
  const pagesHtml = files.map((file, idx) => {
    const imgUrl = `/api/template-images?folder=${encodeURIComponent(name)}&file=${encodeURIComponent(file)}`;
    const pageIndex = idx + 1;
    return `
      <div class="template-page" data-page="${pageIndex}" style="position:relative; width:210mm; height:297mm; background-image:url('${imgUrl}'); background-size:cover; background-position:center; margin: 12px auto;">
        <div contenteditable="true" class="template-overlay" style="position:absolute; inset:0; padding:18mm; box-sizing:border-box; background:transparent;">
          <p><br></p>
        </div>
      </div>
    `;
  }).join('\n');

  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name}</title></head><body>${pagesHtml}</body></html>`;
  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
