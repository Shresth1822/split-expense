import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { type DebtItem } from "@/hooks/useDebtBreakdown";
import { useAuth } from "@/context/AuthContext";

interface SettleUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  debtItem: DebtItem | null;
}

export function SettleUpModal({
  isOpen,
  onClose,
  debtItem,
}: SettleUpModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState<string>("");

  // Initialize amount when modal opens
  if (isOpen && debtItem && amount === "") {
    setAmount(debtItem.totalAmount.toFixed(2));
  }

  /*
   * Updated Logic:
   * Settlements are now independent of groups. We don't send group_id.
   * The text "Warning: Could not determine shared group" is no longer needed.
   */

  const settleUpMutation = useMutation({
    mutationFn: async () => {
      if (!user || !debtItem) {
        throw new Error("Missing information to settle up");
      }

      const settleAmount = parseFloat(amount);
      if (isNaN(settleAmount) || settleAmount <= 0) {
        throw new Error("Invalid amount");
      }

      // 1. Create Expense ("Settlement") - No Group ID
      const { data: expenseData, error: expenseError } = await supabase
        .from("expenses")
        .insert({
          // group_id is intentionally omitted (NULL) so it doesn't appear in group feeds
          paid_by: user.id,
          description: "Settlement",
          amount: settleAmount,
          created_by: user.id,
          date: new Date().toISOString(),
        })
        .select()
        .single();

      if (expenseError) throw expenseError;

      // 2. Create Split (100% to the friend)
      // If I pay $50 to settle, it's effectively an expense where the friend "consumed" $50.
      const { error: splitError } = await supabase
        .from("expense_splits")
        .insert({
          expense_id: expenseData.id,
          user_id: debtItem.owedTo.id, // friend
          amount: settleAmount,
          owed_to: user.id, // I paid, so they owe me (cancelling out the debt)
        });

      if (splitError) throw splitError;

      return expenseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debt-breakdown"] });
      queryClient.invalidateQueries({ queryKey: ["balances"] });
      queryClient.invalidateQueries({ queryKey: ["recent-activity"] });
      onClose();
      setAmount("");
    },
    onError: (error: any) => {
      console.error("Settle up error:", error);
      alert(error.message);
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const handleSettle = () => {
    setIsLoading(true);
    settleUpMutation.mutate();
  };

  if (!debtItem) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settle Up</DialogTitle>
          <DialogDescription>
            Record a payment to <strong>{debtItem.owedTo.full_name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">
                ₹
              </span>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7"
                placeholder="0.00"
              />
            </div>
          </div>
          {/* Warning removed as group_id is no longer required */}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSettle} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Record Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
