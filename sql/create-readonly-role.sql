-- Run once as the SplitPro database owner (POSTGRES_USER), e.g.:
--   docker exec -i splitpro-db psql -U postgres -d splitpro < create-readonly-role.sql
-- Replace the password and, if needed, the database name.

CREATE ROLE splitpro_stats LOGIN PASSWORD 'change-me';

GRANT CONNECT ON DATABASE splitpro TO splitpro_stats;
GRANT USAGE ON SCHEMA public TO splitpro_stats;
GRANT SELECT ON
  "Expense",
  "ExpenseParticipant",
  "Group",
  "GroupUser",
  "User",
  "Session",
  "BalanceView"
TO splitpro_stats;

-- SplitPro migrations may drop/recreate views (BalanceView) or add tables: keep SELECT on them.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT ON TABLES TO splitpro_stats;

-- Belt and braces: every transaction of this role is read-only.
ALTER ROLE splitpro_stats SET default_transaction_read_only = on;
