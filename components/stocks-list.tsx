"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PlusIcon,
  TrendingDown,
  TrendingUp,
  Trash2Icon,
  RefreshCw,
  Pencil,
} from "lucide-react";
import { useFinanceStore } from "@/lib/store";
import { AddStockDialog } from "./add-stock-dialog";
import { EditStockDialog } from "./edit-stock-dialog";
import { FINNHUB_API_KEY, CURRENCY_RATES } from "@/lib/config";

interface StockData {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
}

interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  percentChange: number;
}

interface BrokerageTotal {
  total: number;
  dailyChange: number;
  percentChange: number;
}

export function StocksList({ showBrokerageSummary = false }) {
  const [showAddStock, setShowAddStock] = useState(false);
  const [editingStock, setEditingStock] = useState<any>(null);
  const [stockQuotes, setStockQuotes] = useState<Map<string, StockQuote>>(new Map());
  const [brokerageTotals, setBrokerageTotals] = useState<Map<string, BrokerageTotal>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const { stocks, removeStock } = useFinanceStore();

  // Group stocks by brokerage account
  const stocksByBrokerage = stocks.reduce((acc, stock) => {
    if (!acc[stock.brokerageAccount]) {
      acc[stock.brokerageAccount] = [];
    }
    acc[stock.brokerageAccount].push(stock);
    return acc;
  }, {} as Record<string, typeof stocks>);

  // Changed from React.useCallback to useCallback
  const fetchStockData = useCallback(async () => {
    if (stocks.length === 0) return;

    setIsLoading(true);
    const quotes = new Map<string, StockQuote>();
    const totals = new Map<string, BrokerageTotal>();

    try {
      await Promise.all(
        stocks.filter(stock => !stock.isCash).map(async (stock) => {
          const response = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${FINNHUB_API_KEY}`
          );
          const data: StockData = await response.json();

          if (data.c) {
            quotes.set(stock.symbol, {
              symbol: stock.symbol,
              price: data.c,
              change: data.d,
              percentChange: data.dp,
            });
          }
        })
      );

      // Calculate totals for each brokerage account
      Object.entries(stocksByBrokerage).forEach(([brokerage, brokerageStocks]) => {
        const stocksValue = brokerageStocks.reduce((sum, stock) => {
          if (stock.isCash) {
            return sum + (stock.shares * CURRENCY_RATES[stock.cashCurrency!]);
          }
          const quote = quotes.get(stock.symbol);
          return sum + (quote ? quote.price * stock.shares * 0.79 : 0);
        }, 0);

        const dailyChange = brokerageStocks.reduce((sum, stock) => {
          if (stock.isCash) return sum;
          const quote = quotes.get(stock.symbol);
          return sum + (quote ? quote.change * stock.shares * 0.79 : 0);
        }, 0);

        totals.set(brokerage, {
          total: stocksValue,
          dailyChange,
          percentChange: stocksValue > 0 ? (dailyChange / stocksValue) * 100 : 0,
        });
      });

      setStockQuotes(quotes);
      setBrokerageTotals(totals);
    } catch (error) {
      console.error("Error fetching stock data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [stocks, stocksByBrokerage]);

  useEffect(() => {
    fetchStockData();
    const interval = setInterval(fetchStockData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [fetchStockData]); // Update dependency

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Stock Portfolio</CardTitle>
          <CardDescription>Your investment holdings</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchStockData}
            disabled={isLoading || stocks.length === 0}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={() => setShowAddStock(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Position
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(stocksByBrokerage).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No stocks in your portfolio. Add some positions to get started.
            </div>
          ) : (
            Object.entries(stocksByBrokerage).map(([brokerage, brokerageStocks]) => {
              const totals = brokerageTotals.get(brokerage);
              
              return (
                <div key={brokerage} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{brokerage}</h3>
                    {totals && (
                      <div className="text-right">
                        <div className={`text-sm flex items-center ${
                          totals.dailyChange > 0 ? "text-green-500" : "text-red-500"
                        }`}>
                          {totals.dailyChange > 0 ? (
                            <TrendingUp className="h-4 w-4 mr-1" />
                          ) : (
                            <TrendingDown className="h-4 w-4 mr-1" />
                          )}
                          £{Math.abs(totals.dailyChange).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })} ({Math.abs(totals.percentChange).toFixed(2)}%)
                        </div>
                        <p className="font-semibold">
                          Total: £{totals.total.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {brokerageStocks.map((stock) => {
                      if (stock.isCash) {
                        const valueInGBP = stock.shares * CURRENCY_RATES[stock.cashCurrency!];
                        return (
                          <div
                            key={`${stock.brokerageAccount}-cash`}
                            className="flex items-center justify-between p-4 rounded-lg bg-muted"
                          >
                            <div>
                              <h3 className="font-medium">Cash Balance</h3>
                              <p className="text-sm text-muted-foreground">
                                {stock.cashCurrency}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="font-medium">
                                {stock.cashCurrency} {stock.shares.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                £{valueInGBP.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingStock(stock)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeStock(stock.symbol)}
                              >
                                <Trash2Icon className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      }

                      const quote = stockQuotes.get(stock.symbol);
                      if (!quote) return null;

                      const valueInGBP = quote.price * stock.shares * 0.79;
                      const changeInGBP = quote.change * stock.shares * 0.79;

                      return (
                        <div
                          key={stock.symbol}
                          className="flex items-center justify-between p-4 rounded-lg bg-muted"
                        >
                          <div>
                            <h3 className="font-medium">{stock.symbol}</h3>
                            <p className="text-sm text-muted-foreground">
                              {stock.shares} shares
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium">${quote.price.toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">
                              £
                              {valueInGBP.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p
                                className={`text-sm flex items-center ${
                                  changeInGBP > 0 ? "text-green-500" : "text-red-500"
                                }`}
                              >
                                {changeInGBP > 0 ? (
                                  <TrendingUp className="h-4 w-4 mr-1" />
                                ) : (
                                  <TrendingDown className="h-4 w-4 mr-1" />
                                )}
                                £{Math.abs(changeInGBP).toFixed(2)} (
                                {Math.abs(quote.percentChange).toFixed(2)}%)
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingStock(stock)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeStock(stock.symbol)}
                              >
                                <Trash2Icon className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
      <AddStockDialog open={showAddStock} onOpenChange={setShowAddStock} />
      {editingStock && (
        <EditStockDialog
          open={!!editingStock}
          onOpenChange={() => setEditingStock(null)}
          stock={editingStock}
        />
      )}
    </Card>
  );
}