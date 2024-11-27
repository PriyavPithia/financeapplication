"use client";

import { useState } from "react";
import { CalendarIcon, PlusIcon, Pencil, Trash2Icon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFinanceStore } from "@/lib/store";
import { CURRENCY_RATES } from "@/lib/config";
import { AddSubscriptionDialog } from "./add-subscription-dialog";
import { EditSubscriptionDialog } from "./edit-subscription-dialog";

export function ExpensesCard() {
  const [showAddSubscription, setShowAddSubscription] = useState(false);
  const [showAddFixedExpense, setShowAddFixedExpense] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<any>(null);
  const [editingFixedExpense, setEditingFixedExpense] = useState<any>(null);
  const { 
    subscriptions, 
    removeSubscription, 
    toggleSubscriptionPaid,
    fixedExpenses,
    removeFixedExpense,
    toggleFixedExpensePaid,
  } = useFinanceStore();

  // Group subscriptions by billing date
  const groupedSubscriptions = subscriptions.reduce((acc, sub) => {
    if (!acc[sub.billingDate]) {
      acc[sub.billingDate] = [];
    }
    acc[sub.billingDate].push(sub);
    return acc;
  }, {} as Record<number, typeof subscriptions>);

  // Group fixed expenses by billing date
  const groupedFixedExpenses = fixedExpenses.reduce((acc, exp) => {
    if (!acc[exp.billingDate]) {
      acc[exp.billingDate] = [];
    }
    acc[exp.billingDate].push(exp);
    return acc;
  }, {} as Record<number, typeof fixedExpenses>);

  // Calculate total monthly expenses in GBP (only unpaid)
  const totalMonthlySubscriptions = subscriptions.reduce((total, sub) => {
    if (!sub.isPaid) {
      return total + sub.amount * CURRENCY_RATES[sub.currency];
    }
    return total;
  }, 0);

  const totalMonthlyFixedExpenses = fixedExpenses.reduce((total, exp) => {
    if (!exp.isPaid) {
      return total + exp.amount * CURRENCY_RATES[exp.currency];
    }
    return total;
  }, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Expenses</CardTitle>
        <CardDescription>
          Total Remaining: £
          {(totalMonthlySubscriptions + totalMonthlyFixedExpenses).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="subscriptions">
          <TabsList className="mb-4">
            <TabsTrigger value="subscriptions">
              Subscriptions (£{totalMonthlySubscriptions.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })})
            </TabsTrigger>
            <TabsTrigger value="fixed">
              Fixed Expenses (£{totalMonthlyFixedExpenses.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="subscriptions">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setShowAddSubscription(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Subscription
              </Button>
            </div>
            <div className="space-y-6">
              {subscriptions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No subscriptions added yet. Add your recurring expenses to track them.
                </div>
              ) : (
                Object.entries(groupedSubscriptions)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([date, subs]) => (
                    <div key={date} className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarIcon className="h-4 w-4" />
                        <span>Due on {date}th of every month</span>
                      </div>
                      <div className="grid gap-2">
                        {subs.map((sub) => (
                          <div
                            key={sub.id}
                            className={`flex items-center justify-between p-4 rounded-lg bg-muted ${
                              sub.isPaid ? "opacity-60" : ""
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <Checkbox
                                checked={sub.isPaid}
                                onCheckedChange={() => toggleSubscriptionPaid(sub.id)}
                                aria-label="Mark as paid"
                              />
                              <div>
                                <h4 className="font-medium">{sub.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {sub.currency} {sub.amount.toFixed(2)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium mr-4">
                                £
                                {(
                                  sub.amount * CURRENCY_RATES[sub.currency]
                                ).toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </p>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingSubscription(sub)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeSubscription(sub.id)}
                              >
                                <Trash2Icon className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="fixed">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setShowAddFixedExpense(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Fixed Expense
              </Button>
            </div>
            <div className="space-y-6">
              {fixedExpenses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No fixed expenses added yet. Add your monthly fixed expenses to track them.
                </div>
              ) : (
                Object.entries(groupedFixedExpenses)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([date, expenses]) => (
                    <div key={date} className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarIcon className="h-4 w-4" />
                        <span>Due on {date}th of every month</span>
                      </div>
                      <div className="grid gap-2">
                        {expenses.map((expense) => (
                          <div
                            key={expense.id}
                            className={`flex items-center justify-between p-4 rounded-lg bg-muted ${
                              expense.isPaid ? "opacity-60" : ""
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <Checkbox
                                checked={expense.isPaid}
                                onCheckedChange={() => toggleFixedExpensePaid(expense.id)}
                                aria-label="Mark as paid"
                              />
                              <div>
                                <h4 className="font-medium">{expense.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {expense.currency} {expense.amount.toFixed(2)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium mr-4">
                                £
                                {(
                                  expense.amount * CURRENCY_RATES[expense.currency]
                                ).toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </p>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingFixedExpense(expense)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFixedExpense(expense.id)}
                              >
                                <Trash2Icon className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <AddSubscriptionDialog
        open={showAddSubscription}
        onOpenChange={setShowAddSubscription}
        type="subscription"
      />
      <AddSubscriptionDialog
        open={showAddFixedExpense}
        onOpenChange={setShowAddFixedExpense}
        type="fixed"
      />
      {editingSubscription && (
        <EditSubscriptionDialog
          open={!!editingSubscription}
          onOpenChange={() => setEditingSubscription(null)}
          subscription={editingSubscription}
          type="subscription"
        />
      )}
      {editingFixedExpense && (
        <EditSubscriptionDialog
          open={!!editingFixedExpense}
          onOpenChange={() => setEditingFixedExpense(null)}
          subscription={editingFixedExpense}
          type="fixed"
        />
      )}
    </Card>
  );
}