import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import worker, { sitemapPaths } from '../lib/generated/news.mjs';

const guides = JSON.parse(readFileSync(new URL('../reference/news/worker/published-guides.json', import.meta.url)));
const origin = 'https://bdeveryday.com';
const prefixes = ['', '/en'];
const demo = 'bogura-school-fair';
const sample = 'metro-day-planner';
const row = id => ({
  id, title: 'Published newsroom headline', summary: 'Published summary', body: 'Published body',
  updated_at: '2026-11-28T00:00:00.000Z', status: 'published'
});
const environment = (rows = []) => ({
  DB: {
    prepare(sql) {
      assert.match(sql, /status='published' AND publish_at<=\?/);
      return {
        bind: (...values) => ({
          first: async () => rows.find(record => record.id === values[0]) ?? null,
          all: async () => ({ results: rows })
        })
      };
    }
  },
  BUCKET: {
    async get() {
      return Response.json({ title: 'Published newsroom headline', summary: 'Published summary', body: 'Published body' });
    }
  }
});
const fetchRoute = (path, env = environment(), method = 'GET') =>
  worker.fetch(new Request(origin + path, { method }), env);

test('only reviewed guides and newsroom publications appear in both editions; static routes stay intact', async () => {
  assert.ok(guides.includes(sample));
  assert.ok(!guides.includes(demo));
  const rows = [row('new-reported-article'), row(demo), row(sample)];
  const paths = await sitemapPaths(environment(rows));
  const articles = paths.filter(([path]) => path.includes('/article/'));
  assert.equal(articles.length, (guides.length + 2) * prefixes.length);
  assert.equal(new Set(paths.map(([path]) => path)).size, paths.length);
  const lookup = new Map(paths);
  for (const path of ['/', '/about', '/contact', '/privacy-policy', '/en/']) {
    assert.ok(lookup.has(path), path);
  }
  for (const prefix of prefixes) {
    for (const record of rows) assert.equal(lookup.get(prefix + '/article/' + record.id), record.updated_at);
    assert.ok(!lookup.has(prefix + '/article/lost-sock-committee'));
  }
  const robots = await (await fetchRoute('/robots.txt')).text();
  assert.match(robots, /Sitemap: https:\/\/bdeveryday\.com\/sitemap\.xml/);
  assert.doesNotMatch(robots, /Disallow:\s*\/(?:en\/)?article/);
});

test('reviewed guide pages retain bilingual links and are indexable', async () => {
  for (const prefix of prefixes) {
    for (const id of guides) {
      const path = prefix + '/article/' + id;
      const response = await fetchRoute(path);
      const html = await response.text();
      assert.equal(response.status, 200, path);
      assert.equal(response.headers.get('x-robots-tag'), null, path);
      assert.ok(html.includes('rel="canonical" href="' + origin + path + '"'), path);
      assert.ok(html.includes('hreflang="bn" href="' + origin + '/article/' + id + '"'), path);
      assert.ok(html.includes('hreflang="en" href="' + origin + '/en/article/' + id + '"'), path);
      assert.doesNotMatch(html, /<(?:meta|p)[^>]*>(?:Demo article\.|নমুনা প্রতিবেদন।)|<meta name="robots" content="noindex">/, path);
    }
  }
});

test('demo pages still load but get noindex on GET and HEAD, in both editions', async () => {
  const paths = new Map(await sitemapPaths(environment()));
  for (const prefix of prefixes) {
    for (const id of [demo, 'lost-sock-committee', 'diaspora-canada']) {
      const path = prefix + '/article/' + id;
      assert.ok(!paths.has(path), path);
      const response = await fetchRoute(path);
      assert.equal(response.status, 200, path);
      assert.equal(response.headers.get('x-robots-tag'), 'noindex', path);
      assert.match(await response.text(), /<meta name="robots" content="noindex">/);
      const head = await fetchRoute(path, environment(), 'HEAD');
      assert.equal(head.headers.get('x-robots-tag'), 'noindex', path);
      assert.equal(await head.text(), '');
    }
  }
});

test('published newsroom articles supersede bundled content with the same slug', async () => {
  for (const prefix of prefixes) {
    const response = await fetchRoute(prefix + '/article/' + demo, environment([row(demo)]));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('x-robots-tag'), null);
    const html = await response.text();
    assert.match(html, /<h1>Published newsroom headline<\/h1>/);
    assert.doesNotMatch(html, /<meta name="robots" content="noindex">/);
  }
});
