"use client";

import { useState } from "react";
import { Pencil, Trash2Icon, PlusIcon } from "lucide-react";
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
import { EditAccountDialog } from "./edit-account-dialog";
import { AddAccountDialog } from "./add-account-dialog";

const CURRENCY_SYMBOLS = {
  GBP: "£",
  USD: "$",
  EUR: "€",
  JPY: "¥",
};

export function AccountsList() {
  const { accounts, removeAccount } = useFinanceStore();
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [showAddAccount, setShowAddAccount] = useState(false);

  const calculateTotalInGBP = () => {
    return accounts.reduce((total, account) => {
      return total + account.balance * CURRENCY_RATES[account.currency];
    }, 0);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Accounts</CardTitle>
          <CardDescription>Overview of your bank accounts</CardDescription>
        </div>
        <Button onClick={() => setShowAddAccount(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Account
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {accounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No accounts added yet. Add an account to get started.
            </div>
          ) : (
            <>
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted"
                >
                  <div>
                    <h3 className="font-medium">{account.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {account.currency}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className="font-bold">
                        {CURRENCY_SYMBOLS[account.currency]}
                        {account.balance.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        £
                        {(
                          account.balance * CURRENCY_RATES[account.currency]
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
                        onClick={() => setEditingAccount(account)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAccount(account.id)}
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Balance (GBP)</span>
                  <span className="font-bold text-lg">
                    £
                    {calculateTotalInGBP().toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
      {editingAccount && (
        <EditAccountDialog
          open={!!editingAccount}
          onOpenChange={() => setEditingAccount(null)}
          account={editingAccount}
        />
      )}
      <AddAccountDialog open={showAddAccount} onOpenChange={setShowAddAccount} />
    </Card>
  );
}