"use client";

import { useState, useEffect } from "react";
import { PlusIcon, Trash2Icon, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddCurrencyPairDialog } from "./add-currency-pair-dialog";
import { CURRENCY_RATES } from "@/lib/config";

interface CurrencyPair {
  id: string;
  from: keyof typeof CURRENCY_RATES;
  to: keyof typeof CURRENCY_RATES;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  GBP: "£",
  USD: "$",
  EUR: "€",
  JPY: "¥",
  INR: "₹",
  TSHS: "TSh",
  KES: "KSh",
  AUD: "$",
  CAD: "$",
  CHF: "Fr",
  CNY: "¥",
};

export function CurrenciesTab() {
  const [showAddPair, setShowAddPair] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [savedPairs, setSavedPairs] = useState<CurrencyPair[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("currencyPairs");
      return saved ? JSON.parse(saved) : [
        { id: "1", from: "USD", to: "GBP" },
        { id: "2", from: "EUR", to: "GBP" },
        { id: "3", from: "INR", to: "GBP" },
        { id: "4", from: "TSHS", to: "GBP" },
        { id: "5", from: "KES", to: "GBP" },
        { id: "6", from: "JPY", to: "GBP" },
      ];
    }
    return [];
  });

  const [rates, setRates] = useState<Record<string, number>>(CURRENCY_RATES);

  const updateRates = async () => {
    setIsLoading(true);
    // In a real app, you would fetch live rates from an API
    // For demo, we'll use the static rates with small random variations
    const newRates = { ...CURRENCY_RATES };
    Object.keys(newRates).forEach((currency) => {
      if (currency !== "GBP") {
        const variation = (Math.random() - 0.5) * 0.01; // ±0.5% variation
        newRates[currency as keyof typeof CURRENCY_RATES] *= (1 + variation);
      }
    });
    setRates(newRates);
    setIsLoading(false);
  };

  useEffect(() => {
    updateRates();
    const interval = setInterval(updateRates, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem("currencyPairs", JSON.stringify(savedPairs));
  }, [savedPairs]);

  const addPair = (from: keyof typeof CURRENCY_RATES, to: keyof typeof CURRENCY_RATES) => {
    setSavedPairs([...savedPairs, { id: crypto.randomUUID(), from, to }]);
  };

  const removePair = (id: string) => {
    setSavedPairs(savedPairs.filter((pair) => pair.id !== id));
  };

  const calculateRate = (from: keyof typeof CURRENCY_RATES, to: keyof typeof CURRENCY_RATES) => {
    return rates[from] / rates[to];
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Currency Exchange Rates</CardTitle>
          <CardDescription>Live currency conversion rates</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={updateRates}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={() => setShowAddPair(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Pair
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {savedPairs.map((pair) => (
            <div
              key={pair.id}
              className="flex items-center justify-between p-4 rounded-lg bg-muted"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {CURRENCY_SYMBOLS[pair.from]}{pair.from} → {CURRENCY_SYMBOLS[pair.to]}{pair.to}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-medium">
                  1 {CURRENCY_SYMBOLS[pair.from]} = {calculateRate(pair.from, pair.to).toFixed(4)} {CURRENCY_SYMBOLS[pair.to]}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removePair(pair.id)}
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <AddCurrencyPairDialog
        open={showAddPair}
        onOpenChange={setShowAddPair}
        onAdd={addPair}
        existingPairs={savedPairs}
      />
    </Card>
  );
}