import { z } from 'zod';

const schema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  PORT: z.coerce.number().int().positive().default(3100),
  BASE_PATH: z.string().default('/stats'),
  SESSION_COOKIE_NAMES: z
    .string()
    .default('__Secure-next-auth.session-token,next-auth.session-token'),
  STATIC_DIR: z.string().default('dist/web'),
  /** Where to send unauthenticated visitors (SplitPro sign-in page, same origin). */
  SIGNIN_URL: z.string().default('/auth/signin'),
});

export const env = schema.parse(process.env);

/** Normalised base path: '' or '/stats' (no trailing slash). */
export const basePath = env.BASE_PATH.replace(/\/+$/, '');

export const cookieNames = env.SESSION_COOKIE_NAMES.split(',')
  .map((name) => name.trim())
  .filter(Boolean);
