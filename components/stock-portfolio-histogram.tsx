"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useFinanceStore } from "@/lib/store";
import { FINNHUB_API_KEY } from "@/lib/config";

interface StockValue {
  symbol: string;
  value: number;
  shares: number;
  color: string;
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function StockPortfolioHistogram() {
  const { stocks } = useFinanceStore();
  const [stockValues, setStockValues] = useState<StockValue[]>([]);

  useEffect(() => {
    const fetchStockValues = async () => {
      if (stocks.length === 0) {
        setStockValues([]);
        return;
      }

      try {
        const values = await Promise.all(
          stocks.map(async (stock, index) => {
            const response = await fetch(
              `https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${FINNHUB_API_KEY}`
            );
            const data = await response.json();
            
            return {
              symbol: stock.symbol,
              shares: stock.shares,
              value: data.c * stock.shares * 0.79, // Convert to GBP
              color: COLORS[index % COLORS.length],
            };
          })
        );

        // Sort by value in descending order
        setStockValues(values.sort((a, b) => b.value - a.value));
      } catch (error) {
        console.error("Error fetching stock values:", error);
      }
    };

    fetchStockValues();
    const interval = setInterval(fetchStockValues, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [stocks]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="font-bold">{data.symbol}</span>
            <div className="text-sm text-muted-foreground">
              <div>Shares: {data.shares}</div>
              <div>
                Value: £
                {data.value.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Portfolio Distribution</CardTitle>
        <CardDescription>Stock holdings by value (GBP)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {stockValues.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stockValues}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis
                  dataKey="symbol"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) =>
                    `£${(value / 1000).toFixed(1)}k`
                  }
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {stockValues.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No stocks in portfolio
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}