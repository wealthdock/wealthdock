import { CategoryBudget, Transaction, ExpenseCategory } from '../types/budget';

export const EXPENSE_CATEGORY_MAP: Record<
  ExpenseCategory,
  { label: string; colorClass: string; bgClass: string }
> = {
  housing: { label: 'Housing', colorClass: 'text-indigo-400', bgClass: 'bg-indigo-500' },
  utilities: { label: 'Utilities', colorClass: 'text-sky-400', bgClass: 'bg-sky-500' },
  groceries: { label: 'Groceries', colorClass: 'text-emerald-400', bgClass: 'bg-emerald-500' },
  transportation: {
    label: 'Transportation',
    colorClass: 'text-amber-400',
    bgClass: 'bg-amber-500',
  },
  entertainment: { label: 'Entertainment', colorClass: 'text-pink-400', bgClass: 'bg-pink-500' },
  insurance: { label: 'Insurance', colorClass: 'text-teal-400', bgClass: 'bg-teal-500' },
  miscellaneous: { label: 'Miscellaneous', colorClass: 'text-zinc-400', bgClass: 'bg-zinc-500' },
};

export const INITIAL_BUDGETS: CategoryBudget[] = [
  { category: 'housing', limit: 2000 },
  { category: 'utilities', limit: 300 },
  { category: 'groceries', limit: 600 },
  { category: 'transportation', limit: 400 },
  { category: 'entertainment', limit: 500 },
  { category: 'insurance', limit: 250 },
  { category: 'miscellaneous', limit: 200 },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    date: '2026-08-01',
    amount: 2000,
    category: 'housing',
    description: 'Monthly Apartment Rent',
  },
  {
    id: 't2',
    date: '2026-08-01',
    amount: 15,
    category: 'entertainment',
    description: 'Netflix Subscription',
  },
  {
    id: 't3',
    date: '2026-08-02',
    amount: 150,
    category: 'groceries',
    description: 'Whole Foods Grocery Run',
  },
  {
    id: 't4',
    date: '2026-08-02',
    amount: 120,
    category: 'utilities',
    description: 'Electric Utility Bill',
  },
  {
    id: 't5',
    date: '2026-08-03',
    amount: 45,
    category: 'transportation',
    description: 'Shell Gas Station Fill-up',
  },
  {
    id: 't6',
    date: '2026-08-03',
    amount: 230,
    category: 'insurance',
    description: 'Auto & Health Premium',
  },
  {
    id: 't7',
    date: '2026-08-04',
    amount: 150,
    category: 'entertainment',
    description: 'Fancy Dinner with Friends',
  },
  {
    id: 't8',
    date: '2026-08-04',
    amount: 80,
    category: 'groceries',
    description: "Trader Joe's",
  },
  {
    id: 't9',
    date: '2026-08-05',
    amount: 85,
    category: 'miscellaneous',
    description: 'New Walking Shoes',
  },
  {
    id: 't10',
    date: '2026-08-05',
    amount: 370,
    category: 'entertainment',
    description: 'Concert Tickets & Drinks',
  },
];
