"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { useFinanceStore } from "@/lib/store";
import { CURRENCY_RATES, FINNHUB_API_KEY } from "@/lib/config";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

const CHART_COLORS = {
  total: "hsl(var(--primary))",
  accounts: "hsl(var(--chart-1))",
  stocks: "hsl(var(--chart-2))",
};

export function OverviewChart() {
  const { accounts, stocks } = useFinanceStore();
  const [selectedView, setSelectedView] = useState<"all" | "accounts" | "stocks">("all");
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // Get accounts total in GBP
      const accountsTotal = accounts.reduce((total, account) => {
        return total + account.balance * CURRENCY_RATES[account.currency];
      }, 0);

      // Get stocks total in GBP
      let stocksTotal = 0;
      if (stocks.length > 0) {
        try {
          const promises = stocks.map((stock) =>
            fetch(
              `https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${FINNHUB_API_KEY}`
            ).then((res) => res.json())
          );

          const results = await Promise.all(promises);
          stocksTotal = results.reduce((total, data, index) => {
            if (data.c) {
              return total + data.c * stocks[index].shares * 0.79; // Convert to GBP
            }
            return total;
          }, 0);
        } catch (error) {
          console.error("Error fetching stock values:", error);
        }
      }

      // Create data point with current date
      const newDataPoint = {
        date: new Date().toISOString(),
        total: accountsTotal + stocksTotal,
        accounts: accountsTotal,
        stocks: stocksTotal,
      };

      // Update chart data (keeping last 30 data points)
      setChartData((prev) => {
        const updated = [...prev, newDataPoint].slice(-30);
        return updated;
      });
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [accounts, stocks]);

  const formatDate = (date: string) => {
    return format(new Date(date), "dd MMM HH:mm");
  };

  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-bold">Portfolio Overview</CardTitle>
          <CardDescription>Total value in GBP (£)</CardDescription>
        </div>
        <Select value={selectedView} onValueChange={(value: any) => setSelectedView(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Values</SelectItem>
            <SelectItem value="accounts">Accounts Only</SelectItem>
            <SelectItem value="stocks">Stocks Only</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
              <defs>
                {Object.entries(CHART_COLORS).map(([key, color]) => (
                  <linearGradient
                    key={key}
                    id={`gradient-${key}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `£${(value / 1000).toFixed(1)}k`}
                dx={-10}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="flex flex-col gap-1">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            {formatDate(payload[0].payload.date)}
                          </span>
                          {payload.map((entry: any) => (
                            <div key={entry.dataKey} className="flex justify-between gap-2">
                              <span className="capitalize">{entry.dataKey}:</span>
                              <span className="font-bold">
                                £{entry.value.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              {selectedView === "all" && (
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Total"
                  stroke={CHART_COLORS.total}
                  fill={`url(#gradient-total)`}
                  strokeWidth={2}
                />
              )}
              {(selectedView === "all" || selectedView === "accounts") && (
                <Area
                  type="monotone"
                  dataKey="accounts"
                  name="Accounts"
                  stroke={CHART_COLORS.accounts}
                  fill={`url(#gradient-accounts)`}
                  strokeWidth={2}
                />
              )}
              {(selectedView === "all" || selectedView === "stocks") && (
                <Area
                  type="monotone"
                  dataKey="stocks"
                  name="Stocks"
                  stroke={CHART_COLORS.stocks}
                  fill={`url(#gradient-stocks)`}
                  strokeWidth={2}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}