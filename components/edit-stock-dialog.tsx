"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFinanceStore } from "@/lib/store";

const formSchema = z.object({
  shares: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }),
  brokerageAccount: z.string().min(1, { message: "Brokerage account is required" }),
  cashCurrency: z.enum(["GBP", "USD", "EUR", "JPY"]).optional(),
});

export function EditStockDialog({
  open,
  onOpenChange,
  stock,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stock: {
    symbol: string;
    shares: number;
    brokerageAccount: string;
    isCash?: boolean;
    cashCurrency?: "GBP" | "USD" | "EUR" | "JPY";
  };
}) {
  const updateShares = useFinanceStore((state) => state.updateShares);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shares: stock.shares.toString(),
      brokerageAccount: stock.brokerageAccount,
      cashCurrency: stock.cashCurrency,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateShares(stock.symbol, Number(values.shares), values.brokerageAccount);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Edit {stock.isCash ? "Cash Balance" : stock.symbol} Holdings
          </DialogTitle>
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
                    <Input {...field} />
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
                  <FormLabel>{stock.isCash ? "Amount" : "Number of Shares"}</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step={stock.isCash ? "0.01" : "1"} 
                      min="0" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {stock.isCash && (
              <FormField
                control={form.control}
                name="cashCurrency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled
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
            <Button type="submit" className="w-full">
              Save Changes
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}