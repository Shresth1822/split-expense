import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SettleDebtProps {
  owedToId: string;
  owedToName: string;
  amount: number;
  groupId: string; // We need a group to record the transaction in
}

export function SettleDebt({
  owedToId,
  owedToName,
  amount,
  groupId,
}: SettleDebtProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [settleAmount, setSettleAmount] = useState(amount.toString());

  const settleMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;

      // 1. Create "Settlement" Expense
      // Paid by ME (user.id).
      const { data: expense, error: expenseError } = await supabase
        .from("expenses")
        .insert({
          group_id: groupId,
          description: "Settlement",
          amount: parseFloat(settleAmount),
          date: new Date().toISOString(),
          paid_by: user.id, // I paid
          created_by: user.id,
        })
        .select()
        .single();

      if (expenseError) throw expenseError;

      // 2. Create Split
      // The other person "owes" me this amount (mathematically cancelling out my debt to them)
      const { error: splitError } = await supabase
        .from("expense_splits")
        .insert({
          expense_id: expense.id,
          user_id: owedToId, // They are assigned this cost
          amount: parseFloat(settleAmount),
          owed_to: user.id, // They owe me
        });

      if (splitError) throw splitError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balances"] });
      queryClient.invalidateQueries({ queryKey: ["debt-breakdown"] });
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      setIsOpen(false);
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="h-8 border-green-600 text-green-600 hover:bg-green-50"
        >
          Settle Up
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settle Up with {owedToName}</DialogTitle>
          <DialogDescription>
            Record a cash/payment transaction to clear your debt.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              value={settleAmount}
              onChange={(e) => setSettleAmount(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={() => settleMutation.mutate()}
            disabled={settleMutation.isPending}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {settleMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Record Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
