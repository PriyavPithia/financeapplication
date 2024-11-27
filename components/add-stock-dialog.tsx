"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFinanceStore } from "@/lib/store";
import { FINNHUB_API_KEY } from "@/lib/config";

const formSchema = z.object({
  brokerageAccount: z.string().min(1, { message: "Brokerage account is required" }),
  isCash: z.boolean().default(false),
  symbol: z.string().optional(),
  shares: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Amount must be a positive number",
  }),
  cashCurrency: z.enum(["GBP", "USD", "EUR", "JPY"]).optional(),
}).refine((data) => {
  if (!data.isCash && (!data.symbol || data.symbol.length === 0)) {
    return false;
  }
  return true;
}, {
  message: "Stock symbol is required for non-cash positions",
  path: ["symbol"],
}).refine((data) => {
  if (data.isCash && !data.cashCurrency) {
    return false;
  }
  return true;
}, {
  message: "Currency is required for cash positions",
  path: ["cashCurrency"],
});

export function AddStockDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const addStock = useFinanceStore((state) => state.addStock);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brokerageAccount: "",
      isCash: false,
      symbol: "",
      shares: "",
      cashCurrency: undefined,
    },
  });

  const isCash = form.watch("isCash");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.isCash) {
      addStock({
        symbol: `CASH_${values.cashCurrency}`,
        shares: Number(values.shares),
        brokerageAccount: values.brokerageAccount,
        isCash: true,
        cashCurrency: values.cashCurrency,
      });
      onOpenChange(false);
      form.reset();
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${values.symbol}&token=${FINNHUB_API_KEY}`
      );
      const data = await response.json();
      
      if (data.error || !data.c) {
        form.setError("symbol", { message: "Invalid stock symbol" });
        return;
      }

      addStock({
        symbol: values.symbol!.toUpperCase(),
        shares: Number(values.shares),
        brokerageAccount: values.brokerageAccount,
        isCash: false,
      });
      
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error validating stock:", error);
      form.setError("symbol", { message: "Error validating stock symbol" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add to Portfolio</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="brokerageAccount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brokerage Account</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., eToro, Interactive Investor, E*TRADE"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isCash"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>This is a cash balance</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {!isCash && (
              <FormField
                control={form.control}
                name="symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Symbol</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="AAPL"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="shares"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isCash ? "Amount" : "Number of Shares"}</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step={isCash ? "0.01" : "1"} 
                      min="0" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isCash && (
              <FormField
                control={form.control}
                name="cashCurrency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="JPY">JPY (¥)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Validating..." : "Add to Portfolio"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}