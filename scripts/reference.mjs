import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const news = new URL('reference/news/', root);
execFileSync(process.execPath, ['worker/build.mjs'], { cwd: news, stdio: 'inherit' });
const target = new URL('lib/generated/', root);
mkdirSync(target, { recursive: true });
writeFileSync(new URL('news.mjs', target), readFileSync(new URL('dist/server/index.js', news)));
const companions = Object.fromEntries(['compare', 'jobs', 'shop'].map(name => [
  name, readFileSync(new URL('reference/' + name + '/dist/index.html', root), 'utf8')
]));
writeFileSync(new URL('companions.json', target), JSON.stringify(companions));
