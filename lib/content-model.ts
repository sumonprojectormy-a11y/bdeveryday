import { z } from 'zod';

const key = z.string().regex(/^[a-z0-9][a-z0-9-]{0,95}$/);
const text = z.string().trim().min(1).max(500);
const price = z.number().int().min(0).max(1_000_000);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const parsed = new Date(value + 'T00:00:00Z');
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0,10) === value;
});
const https = z.url().refine(value => new URL(value).protocol === 'https:');
const asset = z.union([z.string().regex(/^\/(?!\/)[a-zA-Z0-9_./-]+(?:\?[a-zA-Z0-9_=&%-]+)?$/), https]);
const href = z.union([z.string().regex(/^(\/(?!\/)|#)[a-zA-Z0-9_?&=./%/#-]*$/), https]);

export const models = {
  comparison: z.object({ category: z.number().int().min(1).max(3), name: text, detail: text, keywords: z.string(), offers: z.array(z.object({ merchant: text, price, delivery: price })).min(1).max(30) }),
  opportunity: z.object({ kind: z.number().int().min(1).max(4), title: text, location: text, eligibility: text, keywords: z.string(), description: z.string().trim().min(1).max(5000), deadline: date.optional(), demoDays: z.number().int().min(0).max(365).optional(), applyUrl: https.optional() }).refine(item => item.deadline || item.demoDays !== undefined, 'Enter a deadline or a demo offset.'),
  product: z.object({ name: text, category: text, description: text, keywords: z.string(), price, stock: z.number().int().min(0).max(100000) }),
  'delivery-zone': z.object({ label: text, fee: price }),
  layout: z.object({ items: z.array(key).max(12) }),
  video: z.object({ type: text, title: text, duration: z.string().regex(/^[\d০-৯]+:[\d০-৯]{2}$/), description: text, src: asset, poster: asset }),
  gallery: z.object({ title: text, titleEn: text.optional(), items: z.array(z.object({ media: key, article: key })).min(1).max(24) }),
  edition: z.object({ date, edition: z.enum(['morning','evening']), pages: z.array(z.array(key).min(1).max(15)).min(1).max(12) }),
  navigation: z.object({ label: text, labelEn: text.optional(), href }),
  copy: z.object({ bn: text, en: text.optional() }),
  translation: z.object({ title: text, summary: text, body: z.string().trim().min(1).max(16000) }),
  media: z.object({ url: asset, alt: text, altEn: text.optional(), source: https.optional(), creator: text.optional(), license: text.optional(), licenseUrl: https.optional() })
};

export const limits = {
  newsroom_articles: z.object({
    title: text.max(150), summary: text.max(300), body: z.string().trim().min(1).max(16000),
    category: text, author: text.max(100), district: z.string().nullable().optional(),
    country: z.string().nullable().optional(), status: z.enum(['draft','review','published']),
    breaking: z.union([z.literal(0),z.literal(1)]).default(0),
    publish_at: z.iso.datetime({ offset:true }).nullable().optional(),
    image_type: z.enum(['image/jpeg','image/png','image/webp']).nullable().optional()
  }),
  newsroom_staff: z.object({ role: z.enum(['editor','reporter']) }),
  live_events: z.object({ title: text.max(150), summary: text, started_at: z.iso.datetime({ offset:true }).optional(), ended_at: z.iso.datetime({ offset:true }).nullable().optional() }),
  live_updates: z.object({ event_id: key, headline: text.max(150), body: z.string().trim().min(1).max(5000), author: text.max(100) }),
  article_notes: z.object({ article_id: key, note: z.string().trim().min(1).max(1500), source: https.nullable().optional() }),
  reader_submissions: z.object({ reviewed_at: z.iso.datetime({ offset:true }).nullable() }),
  shop_orders: z.object({ status: z.enum(['received','confirmed','dispatched','delivered','cancelled']) })
};

export const orderInput = z.object({
  id: z.uuid(), zone: key, name: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^[+()\d০-৯\s-]{6,30}$/), address: z.string().trim().min(8).max(500),
  lines: z.array(z.object({ sku: key, quantity: z.number().int().min(1).max(25) })).min(1).max(20)
}).refine(order => new Set(order.lines.map(line => line.sku)).size === order.lines.length);

export type ContentKind = keyof typeof models;
export type ContentRow = { kind: string; slug: string; position: number; active: boolean; payload: unknown };

export function records<K extends ContentKind>(rows: ContentRow[], kind: K): { slug: string; data: z.output<(typeof models)[K]> }[] {
  return rows.filter(row => row.kind === kind && row.active).flatMap(row => {
    const result = models[kind].safeParse(row.payload);
    return result.success ? [{ slug: row.slug, data: result.data as z.output<(typeof models)[K]> }] : [];
  });
}
