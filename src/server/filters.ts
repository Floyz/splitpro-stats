import { z } from 'zod';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD');

export const filtersSchema = z.object({
  /** Inclusive lower bound (expense date). */
  from: isoDate.optional(),
  /** Exclusive upper bound (expense date). */
  to: isoDate.optional(),
  groupId: z.coerce.number().int().positive().optional(),
  currency: z
    .string()
    .regex(/^[A-Z]{3}$/)
    .optional(),
  limit: z.coerce.number().int().min(1).max(200).default(20),
});

export type Filters = z.infer<typeof filtersSchema>;

/**
 * Positional parameters shared by every spend query:
 * $1 user id, $2 from (nullable), $3 to (nullable), $4 group id (nullable), $5 currency (nullable).
 */
export const filterParams = (userId: number, f: Filters): unknown[] => [
  userId,
  f.from ?? null,
  f.to ?? null,
  f.groupId ?? null,
  f.currency ?? null,
];

/**
 * Expenses the current user takes part in, with the user's own share.
 * Sign convention (SplitPro `calculateParticipantSplit`): the payer's participant row holds
 * `amount - ownShare`, other rows hold `-share`; so `share = (paidBy = me ? amount : 0) - ep.amount`.
 * Settlements and currency conversions are balance transfers, not spending: excluded.
 */
export const MY_EXPENSES_CTE = `
  my_exp AS (
    SELECT e.id, e.name, e.category, e.currency, e."expenseDate", e."groupId", e."paidBy", e.amount,
           (CASE WHEN e."paidBy" = $1 THEN e.amount ELSE 0 END) - ep.amount AS my_share
    FROM "Expense" e
    JOIN "ExpenseParticipant" ep ON ep."expenseId" = e.id AND ep."userId" = $1
    WHERE e."deletedAt" IS NULL
      AND e."splitType" NOT IN ('SETTLEMENT', 'CURRENCY_CONVERSION')
      AND ($2::date IS NULL OR e."expenseDate" >= $2::date)
      AND ($3::date IS NULL OR e."expenseDate" < $3::date)
      AND ($4::int IS NULL OR e."groupId" = $4::int)
      AND ($5::text IS NULL OR e.currency = $5::text)
  )`;
