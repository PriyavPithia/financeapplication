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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCY_RATES } from "@/lib/config";

const formSchema = z.object({
  from: z.enum(["GBP", "USD", "EUR", "JPY", "INR", "TSHS", "KES", "AUD", "CAD", "CHF", "CNY"]),
  to: z.enum(["GBP", "USD", "EUR", "JPY", "INR", "TSHS", "KES", "AUD", "CAD", "CHF", "CNY"]),
}).refine((data) => data.from !== data.to, {
  message: "From and To currencies must be different",
  path: ["to"],
});

interface AddCurrencyPairDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (from: keyof typeof CURRENCY_RATES, to: keyof typeof CURRENCY_RATES) => void;
  existingPairs: Array<{ from: keyof typeof CURRENCY_RATES; to: keyof typeof CURRENCY_RATES }>;
}

const CURRENCY_LABELS = {
  GBP: "GBP (£) - British Pound",
  USD: "USD ($) - US Dollar",
  EUR: "EUR (€) - Euro",
  JPY: "JPY (¥) - Japanese Yen",
  INR: "INR (₹) - Indian Rupee",
  TSHS: "TSHS (TSh) - Tanzanian Shilling",
  KES: "KES (KSh) - Kenyan Shilling",
  AUD: "AUD ($) - Australian Dollar",
  CAD: "CAD ($) - Canadian Dollar",
  CHF: "CHF (Fr) - Swiss Franc",
  CNY: "CNY (¥) - Chinese Yuan",
};

export function AddCurrencyPairDialog({
  open,
  onOpenChange,
  onAdd,
  existingPairs,
}: AddCurrencyPairDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      from: "USD",
      to: "GBP",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const pairExists = existingPairs.some(
      (pair) => pair.from === values.from && pair.to === values.to
    );

    if (pairExists) {
      form.setError("to", { message: "This currency pair already exists" });
      return;
    }

    onAdd(values.from, values.to);
    onOpenChange(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Currency Pair</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="from"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Currency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      {Object.entries(CURRENCY_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To Currency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      {Object.entries(CURRENCY_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Add Currency Pair
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}