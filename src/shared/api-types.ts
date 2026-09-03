import type { Minor } from './money.js';

export interface MeResponse {
  user: { id: number; name: string | null; email: string | null; currency: string };
  groups: Array<{ id: number; name: string; archived: boolean }>;
  currencies: string[];
}

export interface SummaryRow {
  currency: string;
  share: Minor;
  paid: Minor;
  count: number;
  firstMonth: string | null;
  lastMonth: string | null;
  balance: Minor;
}

export interface MonthRow {
  month: string;
  currency: string;
  share: Minor;
  paid: Minor;
  count: number;
}

export interface CategoryRow {
  category: string;
  section: string;
  item: string;
  currency: string;
  share: Minor;
  count: number;
}

export interface GroupRow {
  groupId: number | null;
  groupName: string;
  currency: string;
  share: Minor;
  count: number;
}

export interface GroupMonthRow {
  month: string;
  groupId: number | null;
  groupName: string;
  currency: string;
  share: Minor;
}

export interface PayerRow {
  payerId: number;
  payerName: string;
  currency: string;
  paid: Minor;
  count: number;
}

export interface BalancePoint {
  day: string;
  currency: string;
  balance: Minor;
}

export interface TopExpenseRow {
  id: string;
  name: string;
  category: string;
  currency: string;
  amount: Minor;
  share: Minor;
  expenseDate: string;
  groupName: string | null;
  payerName: string | null;
}
