export interface Statement {
  bind(...values: unknown[]): Statement;
  first(): Promise<Record<string, unknown> | null>;
  all(): Promise<{ results: Record<string, unknown>[] }>;
  run(): Promise<{ meta: { changes: number } }>;
}

export interface ReferenceEnvironment {
  DB: { prepare(query: string): Statement };
  BUCKET: {
    get(key: string): Promise<Response | null>;
    put(key: string, value: Uint8Array | string, options?: { httpMetadata?: { contentType?: string } }): Promise<void>;
    delete(key: string): Promise<void>;
  };
  NEWSROOM_OWNER?: string;
}
