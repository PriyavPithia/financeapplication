"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { CurrencyCode } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a valid positive number.",
  }),
  currency: z.enum(["GBP", "USD", "EUR", "JPY"] as const),
  billingDate: z.string().refine((val) => {
    const num = Number(val);
    return !isNaN(num) && num >= 1 && num <= 31;
  }, {
    message: "Billing date must be between 1 and 31",
  }),
});

interface EditSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription: {
    id: string;
    name: string;
    amount: number;
    currency: CurrencyCode;
    billingDate: number;
  };
  type: 'subscription' | 'fixed';
}

export function EditSubscriptionDialog({
  open,
  onOpenChange,
  subscription,
  type,
}: EditSubscriptionDialogProps) {
  const updateSubscription = useFinanceStore((state) => state.updateSubscription);
  const updateFixedExpense = useFinanceStore((state) => state.updateFixedExpense);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: subscription.name,
      amount: subscription.amount.toString(),
      currency: subscription.currency,
      billingDate: subscription.billingDate.toString(),
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const updateData = {
      name: values.name,
      amount: Number(values.amount),
      currency: values.currency,
      billingDate: Number(values.billingDate),
    };

    if (type === 'subscription') {
      updateSubscription(subscription.id, updateData);
    } else {
      updateFixedExpense(subscription.id, updateData);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Edit {type === 'subscription' ? 'Subscription' : 'Fixed Expense'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currency"
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
            <FormField
              control={form.control}
              name="billingDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billing Date</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="31"
                      {...field}
                    />
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