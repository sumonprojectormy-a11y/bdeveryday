import 'server-only';
import { database } from './database';
import { records, type ContentRow } from './content-model';

export async function contentRows(kinds: string[]) {
  const db = database();
  if (!db) return null;
  const { rows } = await db.query<ContentRow>(
    'select kind,slug,position,active,payload from portal_content where kind=any($1::text[]) order by position,slug',
    [kinds]
  );
  return rows;
}

export function scriptJson(value: unknown) {
  return JSON.stringify(value).replaceAll('<', '\\u003c').replaceAll('\u2028', '\\u2028').replaceAll('\u2029', '\\u2029');
}

export async function newsConfiguration() {
  const rows = await contentRows(['layout','video','gallery','edition','navigation','copy','media']);
  if (!rows?.length) return null;
  const media = Object.fromEntries(records(rows,'media').map(({slug,data}) => [slug,data]));
  return {
    layout: Object.fromEntries(records(rows,'layout').map(({slug,data}) => [slug,data.items])),
    video: records(rows,'video').map(({slug,data}) => ({id:slug,...data})),
    gallery: records(rows,'gallery').map(({data}) => ({
      title: data.title, titleEn:data.titleEn,
      items: data.items.flatMap(item => media[item.media] ? [{article:item.article,photo:media[item.media]}] : [])
    })),
    edition: records(rows,'edition').map(({data}) => data),
    navigation: records(rows,'navigation').map(({data}) => data),
    copy: Object.fromEntries(records(rows,'copy').map(({slug,data}) => [slug,data]))
  };
}
