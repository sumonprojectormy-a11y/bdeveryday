declare module '@/lib/generated/news.mjs' {
  const worker: { fetch(request: Request, environment: import('./reference-types').ReferenceEnvironment): Promise<Response> };
  export default worker;
}
