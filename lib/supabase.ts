import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { publicConfig } from './config';

export async function serverSupabase() {
  const config = publicConfig();
  if (!config) return null;
  const jar = await cookies();
  return createServerClient(config.url, config.key, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: values => {
        try {
          for (const { name, value, options } of values) jar.set(name, value, options);
        } catch {
          // Proxy refreshes cookies before protected server components render.
        }
      }
    }
  });
}

export function serviceSupabase() {
  const config = publicConfig();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return config && key ? createClient(config.url, key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }
  }) : null;
}

export async function adminSession() {
  const client = await serverSupabase();
  if (!client) return null;
  const { data, error } = await client.auth.getUser();
  if (error || !data.user?.email) return null;
  const { data: allowed, error: permissionError } = await client.rpc('is_admin');
  return permissionError || allowed !== true ? null : { client, user: data.user };
}
