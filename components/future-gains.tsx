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
import { AddFutureGainDialog } from "./add-future-gain-dialog";
import { EditFutureGainDialog } from "./edit-future-gain-dialog";

const GAIN_TYPE_LABELS = {
  pension: "Pension",
  other: "Other",
};

export function FutureGains() {
  const [showAddGain, setShowAddGain] = useState(false);
  const [editingGain, setEditingGain] = useState<any>(null);
  const { futureGains, removeFutureGain } = useFinanceStore();

  const totalFutureGains = futureGains.reduce(
    (total, gain) => total + gain.amount * CURRENCY_RATES[gain.currency],
    0
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Future Gains</CardTitle>
          <CardDescription>
            Expected future value: £
            {totalFutureGains.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </CardDescription>
        </div>
        <Button onClick={() => setShowAddGain(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Future Gain
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {futureGains.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No future gains added yet. Add your expected future gains to track them.
            </div>
          ) : (
            futureGains.map((gain) => (
              <div
                key={gain.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{gain.name}</h3>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {GAIN_TYPE_LABELS[gain.type]}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {gain.vestingDate && (
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        <span>
                          Vesting: {format(new Date(gain.vestingDate), "dd MMM yyyy")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium">
                      {gain.currency} {gain.amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      £
                      {(gain.amount * CURRENCY_RATES[gain.currency]).toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingGain(gain)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFutureGain(gain.id)}
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
      <AddFutureGainDialog open={showAddGain} onOpenChange={setShowAddGain} />
      {editingGain && (
        <EditFutureGainDialog
          open={!!editingGain}
          onOpenChange={() => setEditingGain(null)}
          gain={editingGain}
        />
      )}
    </Card>
  );
}