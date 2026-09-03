import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { type Context, Hono } from 'hono';
import { logger } from 'hono/logger';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { basePath, env } from './env.js';
import { statsApi } from './routes/stats.js';

const app = new Hono();

app.use('*', logger());

app.onError((error, c) => {
  console.error(error);
  const status = 'ZodError' === error.name ? 400 : 500;
  return c.json({ error: 'ZodError' === error.name ? 'invalid query' : 'internal error' }, status);
});

// API
app.route(`${basePath}/api`, statsApi);

// Static assets built by Vite (hashed, immutable) then SPA fallback to index.html.
const indexHtml = await readFile(path.join(env.STATIC_DIR, 'index.html'), 'utf8').catch(() => null);

app.use(
  `${basePath}/*`,
  serveStatic({
    root: env.STATIC_DIR,
    rewriteRequestPath: (requestPath) => requestPath.slice(basePath.length) || '/',
    onFound: (filePath, c) => {
      if (/\/assets\//.test(filePath)) {
        c.header('Cache-Control', 'public, max-age=31536000, immutable');
      }
    },
  }),
);

const spa = (c: Context) =>
  indexHtml ? c.html(indexHtml) : c.text('Frontend not built (run `pnpm build:web`)', 404);

app.get(`${basePath}/*`, (c) => spa(c));
app.get(basePath || '/', (c) => spa(c));

serve({ fetch: app.fetch, port: env.PORT, hostname: '0.0.0.0' }, (info) => {
  console.info(`splitpro-stats listening on http://${info.address}:${info.port}${basePath}`);
});
