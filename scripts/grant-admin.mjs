import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import pg from 'pg';

const connectionString = process.env.SUPABASE_DATABASE_URL;
if (!connectionString) throw new Error('Set SUPABASE_DATABASE_URL before running this command.');
const prompt = createInterface({ input: stdin, output: stdout });
let email;
try { email = (await prompt.question('Existing Supabase Auth user email: ')).trim().toLowerCase(); }
finally { prompt.close(); }
if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('Enter a valid email address.');
const client = new pg.Client({ connectionString });
await client.connect();
try {
  const { rows } = await client.query('select id from auth.users where lower(email)=$1 and email_confirmed_at is not null',[email]);
  if (rows.length !== 1) throw new Error('Create and confirm this user in Supabase Authentication first.');
  await client.query('insert into portal_private.admins(user_id) values($1) on conflict(user_id) do nothing',[rows[0].id]);
  console.log('Administrator access granted.');
} finally { await client.end(); }
