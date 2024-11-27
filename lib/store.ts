"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Stock, CurrencyCode } from './types';

interface Account {
  id: string;
  name: string;
  balance: number;
  currency: CurrencyCode;
}

interface FutureStock {
  id: string;
  symbol: string;
  shares: number;
  vestingDate: string;
}

interface FutureGain {
  id: string;
  name: string;
  amount: number;
  currency: CurrencyCode;
  type: "pension" | "other";
  vestingDate?: string;
}

interface FutureExpense {
  id: string;
  name: string;
  amount: number;
  currency: CurrencyCode;
  date: string;
  notes?: string;
}

interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: CurrencyCode;
  billingDate: number;
  isPaid: boolean;
}

export interface FinanceStore {
  accounts: Account[];
  stocks: Stock[];
  futureStocks: FutureStock[];
  futureGains: FutureGain[];
  futureExpenses: FutureExpense[];
  subscriptions: Subscription[];
  fixedExpenses: Subscription[];

  addAccount: (account: Omit<Account, "id">) => void;
  removeAccount: (id: string) => void;
  updateAccount: (id: string, data: Partial<Omit<Account, "id">>) => void;

  addStock: (stock: Omit<Stock, "id">) => void;
  removeStock: (symbol: string) => void;
  updateShares: (symbol: string, shares: number, brokerageAccount: string) => void;

  addFutureStock: (stock: Omit<FutureStock, "id">) => void;
  removeFutureStock: (id: string) => void;
  updateFutureStock: (id: string, data: Partial<Omit<FutureStock, "id">>) => void;

  addFutureGain: (gain: Omit<FutureGain, "id">) => void;
  removeFutureGain: (id: string) => void;
  updateFutureGain: (id: string, data: Partial<Omit<FutureGain, "id">>) => void;

  addFutureExpense: (expense: Omit<FutureExpense, "id">) => void;
  removeFutureExpense: (id: string) => void;
  updateFutureExpense: (id: string, data: Partial<Omit<FutureExpense, "id">>) => void;

  addSubscription: (subscription: Omit<Subscription, "id" | "isPaid">) => void;
  removeSubscription: (id: string) => void;
  updateSubscription: (id: string, data: Partial<Omit<Subscription, "id" | "isPaid">>) => void;
  toggleSubscriptionPaid: (id: string) => void;

  addFixedExpense: (expense: Omit<Subscription, "id" | "isPaid">) => void;
  removeFixedExpense: (id: string) => void;
  updateFixedExpense: (id: string, data: Partial<Omit<Subscription, "id" | "isPaid">>) => void;
  toggleFixedExpensePaid: (id: string) => void;
}

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set) => ({
      accounts: [],
      stocks: [],
      futureStocks: [],
      futureGains: [],
      futureExpenses: [],
      subscriptions: [],
      fixedExpenses: [],

      addAccount: (account) =>
        set((state) => ({
          accounts: [...state.accounts, { ...account, id: crypto.randomUUID() }],
        })),

      removeAccount: (id) =>
        set((state) => ({
          accounts: state.accounts.filter((a) => a.id !== id),
        })),

      updateAccount: (id, data) =>
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.id === id ? { ...a, ...data } : a
          ),
        })),

      addStock: (stock) =>
        set((state) => ({
          stocks: [...state.stocks, { ...stock, id: crypto.randomUUID() }],
        })),

      removeStock: (symbol) =>
        set((state) => ({
          stocks: state.stocks.filter((s) => s.symbol !== symbol),
        })),

      updateShares: (symbol, shares, brokerageAccount) =>
        set((state) => ({
          stocks: state.stocks.map((s) =>
            s.symbol === symbol ? { ...s, shares, brokerageAccount } : s
          ),
        })),

      addFutureStock: (stock) =>
        set((state) => ({
          futureStocks: [
            ...state.futureStocks,
            { ...stock, id: crypto.randomUUID() },
          ],
        })),

      removeFutureStock: (id) =>
        set((state) => ({
          futureStocks: state.futureStocks.filter((s) => s.id !== id),
        })),

      updateFutureStock: (id, data) =>
        set((state) => ({
          futureStocks: state.futureStocks.map((s) =>
            s.id === id ? { ...s, ...data } : s
          ),
        })),

      addFutureGain: (gain) =>
        set((state) => ({
          futureGains: [
            ...state.futureGains,
            { ...gain, id: crypto.randomUUID() },
          ],
        })),

      removeFutureGain: (id) =>
        set((state) => ({
          futureGains: state.futureGains.filter((g) => g.id !== id),
        })),

      updateFutureGain: (id, data) =>
        set((state) => ({
          futureGains: state.futureGains.map((g) =>
            g.id === id ? { ...g, ...data } : g
          ),
        })),

      addFutureExpense: (expense) =>
        set((state) => ({
          futureExpenses: [
            ...state.futureExpenses,
            { ...expense, id: crypto.randomUUID() },
          ],
        })),

      removeFutureExpense: (id) =>
        set((state) => ({
          futureExpenses: state.futureExpenses.filter((e) => e.id !== id),
        })),

      updateFutureExpense: (id, data) =>
        set((state) => ({
          futureExpenses: state.futureExpenses.map((e) =>
            e.id === id ? { ...e, ...data } : e
          ),
        })),

      addSubscription: (subscription) =>
        set((state) => ({
          subscriptions: [
            ...state.subscriptions,
            { ...subscription, id: crypto.randomUUID(), isPaid: false },
          ],
        })),

      removeSubscription: (id) =>
        set((state) => ({
          subscriptions: state.subscriptions.filter((s) => s.id !== id),
        })),

      updateSubscription: (id, data) =>
        set((state) => ({
          subscriptions: state.subscriptions.map((s) =>
            s.id === id ? { ...s, ...data } : s
          ),
        })),

      toggleSubscriptionPaid: (id) =>
        set((state) => ({
          subscriptions: state.subscriptions.map((s) =>
            s.id === id ? { ...s, isPaid: !s.isPaid } : s
          ),
        })),

      addFixedExpense: (expense) =>
        set((state) => ({
          fixedExpenses: [
            ...state.fixedExpenses,
            { ...expense, id: crypto.randomUUID(), isPaid: false },
          ],
        })),

      removeFixedExpense: (id) =>
        set((state) => ({
          fixedExpenses: state.fixedExpenses.filter((e) => e.id !== id),
        })),

      updateFixedExpense: (id, data) =>
        set((state) => ({
          fixedExpenses: state.fixedExpenses.map((e) =>
            e.id === id ? { ...e, ...data } : e
          ),
        })),

      toggleFixedExpensePaid: (id) =>
        set((state) => ({
          fixedExpenses: state.fixedExpenses.map((e) =>
            e.id === id ? { ...e, isPaid: !e.isPaid } : e
          ),
        })),
    }),
    {
      name: 'finance-storage',
    }
  )
);