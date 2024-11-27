"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useFinanceStore } from "@/lib/store";
import { CURRENCY_RATES, FINNHUB_API_KEY } from "@/lib/config";
import { format } from "date-fns";

export function TotalWealth() {
  const { accounts, stocks, subscriptions, futureGains } = useFinanceStore();
  const [stocksValue, setStocksValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const calculateAccountsTotal = () => {
    return accounts.reduce((total, account) => {
      return total + account.balance * CURRENCY_RATES[account.currency];
    }, 0);
  };

  const calculateUnpaidSubscriptions = () => {
    return subscriptions.reduce((total, sub) => {
      if (!sub.isPaid) {
        return total + sub.amount * CURRENCY_RATES[sub.currency];
      }
      return total;
    }, 0);
  };

  const calculateFutureGains = () => {
    return futureGains.reduce((total, gain) => {
      return total + gain.amount * CURRENCY_RATES[gain.currency];
    }, 0);
  };

  useEffect(() => {
    const fetchStockValues = async () => {
      if (stocks.length === 0) {
        setStocksValue(0);
        setIsLoading(false);
        return;
      }

      try {
        const promises = stocks.map((stock) =>
          fetch(
            `https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${FINNHUB_API_KEY}`
          ).then((res) => res.json())
        );

        const results = await Promise.all(promises);
        const totalValue = results.reduce((total, data, index) => {
          if (data.c) {
            return total + data.c * stocks[index].shares * 0.79; // Convert to GBP
          }
          return total;
        }, 0);

        setStocksValue(totalValue);
      } catch (error) {
        console.error("Error fetching stock values:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockValues();
  }, [stocks]);

  const accountsTotal = calculateAccountsTotal();
  const unpaidSubscriptions = calculateUnpaidSubscriptions();
  const futureGainsTotal = calculateFutureGains();
  const totalWealth = accountsTotal + stocksValue - unpaidSubscriptions;
  const potentialTotalWealth = totalWealth + futureGainsTotal;

  return (
    <Card className="bg-primary text-primary-foreground">
      <CardContent className="pt-6">
        <div className="grid gap-6">
          <div className="flex flex-col">
            <span className="text-sm">Current Total Wealth</span>
            <span className="text-2xl font-bold">
              {isLoading ? (
                "Calculating..."
              ) : (
                `£${totalWealth.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              )}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="block opacity-70">Bank Accounts</span>
              <span className="font-medium">
                £
                {accountsTotal.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div>
              <span className="block opacity-70">Stock Portfolio</span>
              <span className="font-medium">
                {isLoading ? (
                  "Loading..."
                ) : (
                  `£${stocksValue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                )}
              </span>
            </div>
            <div>
              <span className="block opacity-70">Unpaid Subscriptions</span>
              <span className="font-medium text-red-300">
                -£
                {unpaidSubscriptions.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
          <div className="border-t border-primary-foreground/20 pt-4">
            <div className="flex flex-col">
              <span className="text-sm">Potential Future Wealth</span>
              <span className="text-2xl font-bold">
                £
                {potentialTotalWealth.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className="text-sm opacity-70 mt-1">
                Including £{futureGainsTotal.toLocaleString()} in future gains
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}