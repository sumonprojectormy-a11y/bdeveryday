import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { publicConfig } from './lib/config';

export async function proxy(request: NextRequest) {
  const config = publicConfig();
  const admin = /^\/admin\/?$/.test(request.nextUrl.pathname);
  if (!config) {
    return admin ? NextResponse.redirect(new URL('/admin/login?state=configuration', request.url)) : NextResponse.next();
  }
  let response = NextResponse.next({ request });
  const client = createServerClient(config.url, config.key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: values => {
        for (const { name, value } of values) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of values) response.cookies.set(name, value, options);
      }
    }
  });
  const { data } = await client.auth.getClaims();
  const allowed = admin && data?.claims?.sub ? (await client.rpc('is_admin')).data === true : false;
  if (admin && !allowed) {
    const path = data?.claims?.sub ? '/admin/login?state=restricted' : '/admin/login';
    const redirect = NextResponse.redirect(new URL(path, request.url));
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
    return redirect;
  }
  return response;
}

export const config = { matcher: ['/admin/:path*', '/api/newsroom/:path*'] };
