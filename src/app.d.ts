import type { AuthUser } from '$lib/server/types';

declare global {
  namespace App {
    interface Locals {
      db: D1Database | null;
      user: AuthUser | null;
    }

    interface Platform {
      env: {
        DB: D1Database;
      };
      context: ExecutionContext;
      caches: CacheStorage;
      cf?: IncomingRequestCfProperties;
    }
  }
}

export {};
