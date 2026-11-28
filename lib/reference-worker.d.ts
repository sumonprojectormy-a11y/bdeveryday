declare module '@/lib/generated/news.mjs' {
  export function sitemapPaths(environment: import('./reference-types').ReferenceEnvironment): Promise<Array<[string, string | undefined]>>;
  const worker: { fetch(request: Request, environment: import('./reference-types').ReferenceEnvironment): Promise<Response> };
  export default worker;
}
