import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import * as relations from './relations';

const fullSchema = { ...schema, ...relations };

type DbClient = ReturnType<typeof drizzle<typeof fullSchema>>;

let dbInstance: DbClient | null = null;

function getDbInstance(): DbClient {
  if (!dbInstance) {
    const sql = neon(getDatabaseUrl());
    dbInstance = drizzle(sql, { schema: fullSchema });
  }
  return dbInstance;
}

export const db = new Proxy({} as DbClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getDbInstance() as object, prop, receiver);
  },
}) as DbClient;

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE URL is not set in env');
  }
  return url;
}
