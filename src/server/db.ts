import pg from 'pg';

import { env } from './env.js';

// int8 (bigint) columns -> BigInt instead of lossy numbers. SUM(bigint) is numeric and stays a string;
// both are normalised by `toMinor` in shared/money.ts.
pg.types.setTypeParser(20, (value) => BigInt(value));

export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30_000,
});

export const query = <T extends pg.QueryResultRow>(text: string, params: unknown[] = []) =>
  pool.query<T>(text, params);
