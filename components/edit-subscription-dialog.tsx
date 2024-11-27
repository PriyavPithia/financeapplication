// Update the dialog props to handle both types
interface EditSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription: {
    id: string;
    name: string;
    amount: number;
    currency: "GBP" | "USD" | "EUR" | "JPY";
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
  // ... rest of the component remains the same, just update the onSubmit function:

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
        {/* ... rest of the component remains the same ... */}
      </DialogContent>
    </Dialog>
  );
}