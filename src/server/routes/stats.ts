import { Hono } from 'hono';

import { resolveCategory } from '../../shared/categories.js';
import { toMinor } from '../../shared/money.js';
import type {
  BalancePoint,
  CategoryRow,
  GroupMonthRow,
  GroupRow,
  MeResponse,
  MonthRow,
  PayerRow,
  SummaryRow,
  TopExpenseRow,
} from '../../shared/api-types.js';
import { type AuthEnv, requireUser } from '../auth.js';
import { query } from '../db.js';
import { MY_EXPENSES_CTE, filterParams, filtersSchema } from '../filters.js';

export const statsApi = new Hono<AuthEnv>();

statsApi.get('/health', (c) => c.json({ ok: true }));

statsApi.use('*', requireUser);

const parseFilters = (c: { req: { query: () => Record<string, string> } }) =>
  filtersSchema.parse(c.req.query());

const num = (value: unknown): number => Number(value ?? 0);

statsApi.get('/me', async (c) => {
  const user = c.get('user');
  const [groups, currencies] = await Promise.all([
    query<{ id: number; name: string; archived: boolean }>(
      `SELECT g.id, g.name, (g."archivedAt" IS NOT NULL) AS archived
       FROM "GroupUser" gu JOIN "Group" g ON g.id = gu."groupId"
       WHERE gu."userId" = $1
       ORDER BY g."archivedAt" IS NOT NULL, g.name`,
      [user.id],
    ),
    query<{ currency: string }>(
      `SELECT DISTINCT e.currency
       FROM "Expense" e JOIN "ExpenseParticipant" ep ON ep."expenseId" = e.id AND ep."userId" = $1
       WHERE e."deletedAt" IS NULL
       ORDER BY e.currency`,
      [user.id],
    ),
  ]);

  const response: MeResponse = {
    user,
    groups: groups.rows,
    currencies: currencies.rows.map((r) => r.currency),
  };
  return c.json(response);
});

statsApi.get('/summary', async (c) => {
  const user = c.get('user');
  const f = parseFilters(c);
  const params = filterParams(user.id, f);

  const [spend, balance] = await Promise.all([
    query(
      `WITH ${MY_EXPENSES_CTE}
       SELECT currency,
              SUM(my_share) AS share,
              SUM(amount) FILTER (WHERE "paidBy" = $1) AS paid,
              COUNT(*) AS count,
              to_char(MIN("expenseDate"), 'YYYY-MM') AS first_month,
              to_char(MAX("expenseDate"), 'YYYY-MM') AS last_month
       FROM my_exp GROUP BY currency ORDER BY currency`,
      params,
    ),
    // Net position per currency from the live view (not date-filtered: a balance is a state).
    query(
      `SELECT currency, SUM(amount) AS balance
       FROM "BalanceView"
       WHERE "userId" = $1 AND ($2::int IS NULL OR "groupId" = $2::int)
       GROUP BY currency`,
      [user.id, f.groupId ?? null],
    ),
  ]);

  const balances = new Map(balance.rows.map((r) => [r.currency as string, toMinor(r.balance)]));
  const rows: SummaryRow[] = spend.rows.map((r) => ({
    currency: r.currency,
    share: toMinor(r.share),
    paid: toMinor(r.paid),
    count: num(r.count),
    firstMonth: r.first_month,
    lastMonth: r.last_month,
    balance: balances.get(r.currency) ?? '0',
  }));
  return c.json(rows);
});

statsApi.get('/spend/by-month', async (c) => {
  const user = c.get('user');
  const f = parseFilters(c);
  const { rows } = await query(
    `WITH ${MY_EXPENSES_CTE}
     SELECT to_char(date_trunc('month', "expenseDate"), 'YYYY-MM') AS month, currency,
            SUM(my_share) AS share,
            SUM(amount) FILTER (WHERE "paidBy" = $1) AS paid,
            COUNT(*) AS count
     FROM my_exp GROUP BY 1, 2 ORDER BY 1, 2`,
    filterParams(user.id, f),
  );
  const out: MonthRow[] = rows.map((r) => ({
    month: r.month,
    currency: r.currency,
    share: toMinor(r.share),
    paid: toMinor(r.paid),
    count: num(r.count),
  }));
  return c.json(out);
});

statsApi.get('/spend/by-category', async (c) => {
  const user = c.get('user');
  const f = parseFilters(c);
  const { rows } = await query(
    `WITH ${MY_EXPENSES_CTE}
     SELECT category, currency, SUM(my_share) AS share, COUNT(*) AS count
     FROM my_exp GROUP BY 1, 2 ORDER BY 3 DESC`,
    filterParams(user.id, f),
  );
  const out: CategoryRow[] = rows.map((r) => {
    const { section, item } = resolveCategory(r.category);
    return {
      category: r.category,
      section,
      item,
      currency: r.currency,
      share: toMinor(r.share),
      count: num(r.count),
    };
  });
  return c.json(out);
});

statsApi.get('/spend/by-group', async (c) => {
  const user = c.get('user');
  const f = parseFilters(c);
  const { rows } = await query(
    `WITH ${MY_EXPENSES_CTE}
     SELECT g.id AS group_id, COALESCE(g.name, 'Friends') AS group_name, m.currency,
            SUM(m.my_share) AS share, COUNT(*) AS count
     FROM my_exp m LEFT JOIN "Group" g ON g.id = m."groupId"
     GROUP BY 1, 2, 3 ORDER BY 4 DESC`,
    filterParams(user.id, f),
  );
  const out: GroupRow[] = rows.map((r) => ({
    groupId: r.group_id,
    groupName: r.group_name,
    currency: r.currency,
    share: toMinor(r.share),
    count: num(r.count),
  }));
  return c.json(out);
});

statsApi.get('/spend/by-group-month', async (c) => {
  const user = c.get('user');
  const f = parseFilters(c);
  const { rows } = await query(
    `WITH ${MY_EXPENSES_CTE}
     SELECT to_char(date_trunc('month', m."expenseDate"), 'YYYY-MM') AS month,
            g.id AS group_id, COALESCE(g.name, 'Friends') AS group_name, m.currency,
            SUM(m.my_share) AS share
     FROM my_exp m LEFT JOIN "Group" g ON g.id = m."groupId"
     GROUP BY 1, 2, 3, 4 ORDER BY 1`,
    filterParams(user.id, f),
  );
  const out: GroupMonthRow[] = rows.map((r) => ({
    month: r.month,
    groupId: r.group_id,
    groupName: r.group_name,
    currency: r.currency,
    share: toMinor(r.share),
  }));
  return c.json(out);
});

statsApi.get('/payers', async (c) => {
  const user = c.get('user');
  const f = parseFilters(c);
  const { rows } = await query(
    `WITH ${MY_EXPENSES_CTE}
     SELECT u.id AS payer_id, COALESCE(u.name, u.email, '#' || u.id) AS payer_name, m.currency,
            SUM(m.amount) AS paid, COUNT(*) AS count
     FROM my_exp m JOIN "User" u ON u.id = m."paidBy"
     GROUP BY 1, 2, 3 ORDER BY 4 DESC`,
    filterParams(user.id, f),
  );
  const out: PayerRow[] = rows.map((r) => ({
    payerId: r.payer_id,
    payerName: r.payer_name,
    currency: r.currency,
    paid: toMinor(r.paid),
    count: num(r.count),
  }));
  return c.json(out);
});

statsApi.get('/balance/history', async (c) => {
  const user = c.get('user');
  const f = parseFilters(c);
  // Running net balance per currency (positive = others owe me). Settlements and conversions
  // are included here because they do move balances. Not filtered by date: the running sum needs
  // the full history; the frontend windows it.
  const { rows } = await query(
    `SELECT day, currency, SUM(delta) OVER (PARTITION BY currency ORDER BY day) AS balance
     FROM (
       SELECT date_trunc('day', e."expenseDate")::date AS day, e.currency, SUM(ep.amount) AS delta
       FROM "Expense" e
       JOIN "ExpenseParticipant" ep ON ep."expenseId" = e.id AND ep."userId" = $1
       WHERE e."deletedAt" IS NULL
         AND ($2::int IS NULL OR e."groupId" = $2::int)
         AND ($3::text IS NULL OR e.currency = $3::text)
       GROUP BY 1, 2
     ) daily
     ORDER BY day, currency`,
    [user.id, f.groupId ?? null, f.currency ?? null],
  );
  const out: BalancePoint[] = rows.map((r) => ({
    day: r.day instanceof Date ? r.day.toISOString().slice(0, 10) : String(r.day),
    currency: r.currency,
    balance: toMinor(r.balance),
  }));
  return c.json(out);
});

statsApi.get('/expenses/top', async (c) => {
  const user = c.get('user');
  const f = parseFilters(c);
  const { rows } = await query(
    `WITH ${MY_EXPENSES_CTE}
     SELECT m.id, m.name, m.category, m.currency, m.amount, m.my_share, m."expenseDate",
            g.name AS group_name, COALESCE(u.name, u.email) AS payer_name
     FROM my_exp m
     LEFT JOIN "Group" g ON g.id = m."groupId"
     LEFT JOIN "User" u ON u.id = m."paidBy"
     ORDER BY m.my_share DESC, m.amount DESC
     LIMIT $6`,
    [...filterParams(user.id, f), f.limit],
  );
  const out: TopExpenseRow[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    category: r.category,
    currency: r.currency,
    amount: toMinor(r.amount),
    share: toMinor(r.my_share),
    expenseDate: new Date(r.expenseDate).toISOString(),
    groupName: r.group_name,
    payerName: r.payer_name,
  }));
  return c.json(out);
});
