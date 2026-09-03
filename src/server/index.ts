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
  console.error(`${c.req.method} ${c.req.path} failed:`, error);
  if ('ZodError' === error.name) {
    return c.json({ error: 'invalid query' }, 400);
  }
  // Database errors are the usual suspect on a fresh deployment: surface the message.
  return c.json({ error: `internal error (${error.message})` }, 500);
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
