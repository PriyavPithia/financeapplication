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
import { useFinanceStore } from "@/lib/store";
import { FINNHUB_API_KEY } from "@/lib/config";

const formSchema = z.object({
  symbol: z
    .string()
    .min(1, { message: "Stock symbol is required" })
    .max(5)
    .toUpperCase(),
  shares: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Shares must be a positive number",
  }),
  vestingDate: z.string().min(1, { message: "Vesting date is required" }),
});

export function AddFutureStockDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const addFutureStock = useFinanceStore((state) => state.addFutureStock);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symbol: "",
      shares: "",
      vestingDate: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
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

      addFutureStock({
        symbol: values.symbol,
        shares: Number(values.shares),
        vestingDate: values.vestingDate,
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
          <DialogTitle>Add Future Stock Grant</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <FormField
              control={form.control}
              name="shares"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Shares</FormLabel>
                  <FormControl>
                    <Input type="number" step="1" min="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="vestingDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vesting Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Validating..." : "Add Future Stock"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}