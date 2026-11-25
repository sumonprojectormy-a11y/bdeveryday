export function publicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !key) return null;
  try {
    const parsed = new URL(url);
    return (parsed.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(parsed.hostname)) ? { url, key } : null;
  } catch {
    return null;
  }
}
