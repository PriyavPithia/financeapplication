"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, PlusIcon, Pencil, Trash2Icon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFinanceStore } from "@/lib/store";
import { FINNHUB_API_KEY } from "@/lib/config";
import { AddFutureStockDialog } from "./add-future-stock-dialog";
import { EditFutureStockDialog } from "./edit-future-stock-dialog";

interface StockQuote {
  c: number; // Current price
}

export function FutureStocks() {
  const [showAddStock, setShowAddStock] = useState(false);
  const [editingStock, setEditingStock] = useState<any>(null);
  const [stockPrices, setStockPrices] = useState<Record<string, number>>({});
  const { futureStocks, removeFutureStock } = useFinanceStore();

  useEffect(() => {
    const fetchStockPrices = async () => {
      if (futureStocks.length === 0) return;

      const uniqueSymbols = Array.from(
        new Set(futureStocks.map((s) => s.symbol))
      );
      const prices: Record<string, number> = {};

      await Promise.all(
        uniqueSymbols.map(async (symbol) => {
          try {
            const response = await fetch(
              `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
            );
            const data: StockQuote = await response.json();
            if (data.c) {
              prices[symbol] = data.c;
            }
          } catch (error) {
            console.error(`Error fetching price for ${symbol}:`, error);
          }
        })
      );

      setStockPrices(prices);
    };

    fetchStockPrices();
    const interval = setInterval(fetchStockPrices, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [futureStocks]);

  const calculateTotalValue = () => {
    return futureStocks.reduce((total, stock) => {
      const price = stockPrices[stock.symbol] || 0;
      return total + price * stock.shares * 0.79; // Convert to GBP
    }, 0);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Future Vested Stock</CardTitle>
          <CardDescription>
            Estimated future value: £
            {calculateTotalValue().toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </CardDescription>
        </div>
        <Button onClick={() => setShowAddStock(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Future Stock
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {futureStocks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No future stock grants added yet.
            </div>
          ) : (
            futureStocks.map((stock) => {
              const currentPrice = stockPrices[stock.symbol] || 0;
              const estimatedValue = currentPrice * stock.shares * 0.79; // Convert to GBP

              return (
                <div
                  key={stock.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{stock.symbol}</h3>
                      <span className="text-sm text-muted-foreground">
                        {stock.shares} shares
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <CalendarIcon className="h-3 w-3" />
                      <span>
                        Vesting: {format(new Date(stock.vestingDate), "dd MMM yyyy")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">
                        ${currentPrice.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        £
                        {estimatedValue.toLocaleString(undefined, {
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
                        onClick={() => removeFutureStock(stock.id)}
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
      <AddFutureStockDialog open={showAddStock} onOpenChange={setShowAddStock} />
      {editingStock && (
        <EditFutureStockDialog
          open={!!editingStock}
          onOpenChange={() => setEditingStock(null)}
          stock={editingStock}
        />
      )}
    </Card>
  );
}