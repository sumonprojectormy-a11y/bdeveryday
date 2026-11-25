import worker from '@/lib/generated/news.mjs';
import { referenceEnvironment, database } from '@/lib/database';
import { contentRows, newsConfiguration, scriptJson } from '@/lib/content';
import { companion, renderCompanion } from '@/lib/companions';
import { newsroomIdentity } from '@/lib/newsroom';
import { createOrder } from '@/lib/orders';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handle(request: Request) {
  const { pathname } = new URL(request.url);
  try {
    if (pathname === '/api/orders' && request.method === 'POST') return await createOrder(request);
    const page = companion(pathname);
    if (page && ['GET','HEAD'].includes(request.method)) {
      const kinds = page === 'shop' ? ['product','delivery-zone'] : [page === 'compare' ? 'comparison' : 'opportunity'];
      const html = renderCompanion(page, await contentRows(kinds));
      return new Response(request.method === 'HEAD' ? null : html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
    }
    if (!database() && pathname === '/api/reader-submissions') {
      return Response.json({ error: 'Reader submissions require a configured database.' }, { status: 503 });
    }
    const verified = await newsroomIdentity(request);
    const result = await worker.fetch(verified.request, referenceEnvironment(verified.role, verified.email));
    if (request.method !== 'GET' || !result.ok || !result.headers.get('Content-Type')?.startsWith('text/html')) return result;
    const config = await newsConfiguration();
    if (!config) return result;
    const html = (await result.text()).replace('</head>', () => '<script>window.portalContent=' + scriptJson(config) + '</script></head>');
    const headers = new Headers(result.headers);
    headers.delete('Content-Length');
    return new Response(html, { status: result.status, headers });
  } catch (error) {
    console.error('BD Everyday request failed', pathname, error instanceof Error ? error.message : 'Unknown error');
    return Response.json({ error: 'This service is temporarily unavailable.' }, { status: 503 });
  }
}

export { handle as GET, handle as HEAD, handle as POST };
