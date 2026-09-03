import { createMiddleware } from 'hono/factory';
import { getCookie } from 'hono/cookie';

import { query } from './db.js';
import { cookieNames } from './env.js';

export interface SessionUser {
  id: number;
  name: string | null;
  email: string | null;
  currency: string;
}

export type AuthEnv = { Variables: { user: SessionUser } };

/**
 * SSO with SplitPro: NextAuth uses database sessions, so the raw cookie value is the
 * `Session.sessionToken`. The cookie is host-only and path `/`, hence the app must be served on the
 * same host (e.g. `/stats` behind the SplitPro Next.js rewrite).
 */
export const requireUser = createMiddleware<AuthEnv>(async (c, next) => {
  const token = cookieNames.map((name) => getCookie(c, name)).find(Boolean);
  if (!token) {
    return c.json({ error: 'unauthorized' }, 401);
  }

  const { rows } = await query<SessionUser>(
    `SELECT u.id, u.name, u.email, u.currency
     FROM "Session" s
     JOIN "User" u ON u.id = s."userId"
     WHERE s."sessionToken" = $1 AND s.expires > now()`,
    [token],
  );

  const user = rows[0];
  if (!user) {
    return c.json({ error: 'unauthorized' }, 401);
  }

  c.set('user', user);
  await next();
});
