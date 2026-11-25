import 'server-only';
import { serverSupabase } from './supabase';
import { database } from './database';

export async function newsroomIdentity(request: Request) {
  const headers = new Headers(request.headers);
  headers.delete('oai-authenticated-user-id');
  headers.delete('oai-authenticated-user-email');
  if (!new URL(request.url).pathname.startsWith('/api/newsroom/')) return { request: new Request(request, { headers }) };
  const auth = await serverSupabase();
  const db = database();
  if (!auth || !db) return { request: new Request(request, { headers }) };
  const { data, error } = await auth.auth.getUser();
  if (error || !data.user?.email) return { request: new Request(request, { headers }) };
  const email = data.user.email.trim().toLowerCase();
  const owner = await auth.rpc('is_admin');
  const role = owner.data === true ? 'owner' :
    (await db.query('select role from newsroom_staff where email=$1', [email])).rows[0]?.role as string | undefined;
  if (role) {
    headers.set('oai-authenticated-user-id', data.user.id);
    headers.set('oai-authenticated-user-email', email);
  }
  return { request: new Request(request, { headers }), role, email };
}
