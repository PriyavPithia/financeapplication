export type CurrencyCode = "GBP" | "USD" | "EUR" | "JPY";

export interface Stock {
  id: string;
  symbol: string;
  shares: number;
  brokerageAccount: string;
  isCash?: boolean;
  cashCurrency?: CurrencyCode;
} 