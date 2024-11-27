"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, PlusIcon, Pencil, Trash2Icon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFinanceStore } from "@/lib/store";
import { CURRENCY_RATES } from "@/lib/config";
import { AddFutureExpenseDialog } from "./add-future-expense-dialog";
import { EditFutureExpenseDialog } from "./edit-future-expense-dialog";

export function FutureExpenses() {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const { futureExpenses, removeFutureExpense } = useFinanceStore();

  const totalFutureExpenses = futureExpenses.reduce(
    (total, expense) => total + expense.amount * CURRENCY_RATES[expense.currency],
    0
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Future Expenses</CardTitle>
          <CardDescription>
            Planned expenses: £
            {totalFutureExpenses.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </CardDescription>
        </div>
        <Button onClick={() => setShowAddExpense(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Future Expense
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {futureExpenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No future expenses added yet.
            </div>
          ) : (
            futureExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted"
              >
                <div>
                  <h3 className="font-medium">{expense.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <CalendarIcon className="h-3 w-3" />
                    <span>
                      Due: {format(new Date(expense.date), "dd MMM yyyy")}
                    </span>
                  </div>
                  {expense.notes && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {expense.notes}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium">
                      {expense.currency} {expense.amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      £
                      {(
                        expense.amount * CURRENCY_RATES[expense.currency]
                      ).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingExpense(expense)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFutureExpense(expense.id)}
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
      <AddFutureExpenseDialog
        open={showAddExpense}
        onOpenChange={setShowAddExpense}
      />
      {editingExpense && (
        <EditFutureExpenseDialog
          open={!!editingExpense}
          onOpenChange={() => setEditingExpense(null)}
          expense={editingExpense}
        />
      )}
    </Card>
  );
}