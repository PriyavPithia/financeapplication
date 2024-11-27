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
import { useFinanceStore } from "@/lib/store";

const formSchema = z.object({
  shares: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Shares must be a positive number",
  }),
  vestingDate: z.string().min(1, { message: "Vesting date is required" }),
});

export function EditFutureStockDialog({
  open,
  onOpenChange,
  stock,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stock: {
    id: string;
    symbol: string;
    shares: number;
    vestingDate: string;
  };
}) {
  const updateFutureStock = useFinanceStore((state) => state.updateFutureStock);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shares: stock.shares.toString(),
      vestingDate: stock.vestingDate,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateFutureStock(stock.id, {
      shares: Number(values.shares),
      vestingDate: values.vestingDate,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit {stock.symbol} Future Grant</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <Button type="submit" className="w-full">
              Save Changes
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}