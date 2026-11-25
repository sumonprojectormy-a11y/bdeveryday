import 'server-only';
import { Pool } from 'pg';
import { serviceSupabase } from './supabase';
import type { ReferenceEnvironment, Statement } from './reference-types';

let pool: Pool | undefined;
export function database() {
  const connectionString = process.env.SUPABASE_DATABASE_URL?.trim();
  if (!connectionString) return null;
  pool ??= new Pool({ connectionString, max: 2, connectionTimeoutMillis: 5000, idleTimeoutMillis: 10000 });
  return pool;
}

function statement(query: string, values: unknown[] = []): Statement {
  let index = 0;
  const sql = query.replace(/\?/g, () => '$' + ++index);
  const execute = async () => {
    const db = database();
    if (db) {
      const result = await db.query(sql, values);
      for (const row of result.rows) {
        for (const key of Object.keys(row)) {
          if (row[key] instanceof Date) row[key] = row[key].toISOString();
        }
      }
      return result;
    }
    if (!/^SELECT\b/i.test(sql)) throw new Error('Supabase database is not configured.');
    return { rows: [], rowCount: 0 };
  };
  return {
    bind: (...next) => statement(query, next),
    async first() { return (await execute()).rows[0] ?? null; },
    async all() { return { results: (await execute()).rows }; },
    async run() { return { meta: { changes: (await execute()).rowCount ?? 0 } }; }
  };
}

export function referenceEnvironment(role?: string, email?: string): ReferenceEnvironment {
  return {
    DB: { prepare: statement },
    NEWSROOM_OWNER: role === 'owner' ? email : undefined,
    BUCKET: {
      async get(key) {
        const translation = /^english-v1\/([^/]+)\/[^/]+\/(?:full|card)\.json$/.exec(key);
        const db = database();
        if (translation && db) {
          const { rows } = await db.query(
            "select payload from portal_content where kind='translation' and slug=$1 and active",
            [decodeURIComponent(translation[1])]
          );
          if (rows[0]) return Response.json(rows[0].payload);
        }
        const service = serviceSupabase();
        if (!service) return null;
        const { data, error } = await service.storage.from('portal-private').download(key);
        if (error) return null;
        return new Response(data);
      },
      async put(key, value, options) {
        const service = serviceSupabase();
        if (!service) throw new Error('Supabase storage is not configured.');
        const contentType = options?.httpMetadata?.contentType ?? 'text/plain';
        const payload = typeof value === 'string' ? value : Buffer.from(value);
        const { error } = await service.storage.from('portal-private').upload(key, payload, { contentType, upsert: true });
        if (error) throw error;
      },
      async delete(key) {
        const service = serviceSupabase();
        if (!service) return;
        const { error } = await service.storage.from('portal-private').remove([key]);
        if (error) throw error;
      }
    }
  };
}
