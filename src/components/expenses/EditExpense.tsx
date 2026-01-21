import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import type { GroupMember, Profile } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const expenseSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  date: z.string(),
  paidBy: z.string(),
  splitType: z.enum(["equal", "exact", "percentage"]),
});

type ExpenseForm = z.infer<typeof expenseSchema>;

interface EditExpenseProps {
  expenseId: string | null;
  groupId: string;
  members: (GroupMember & { profiles: Profile })[];
  isOpen: boolean;
  onClose: () => void;
}

export function EditExpense({
  expenseId,
  groupId,
  members,
  isOpen,
  onClose,
}: EditExpenseProps) {
  const queryClient = useQueryClient();
  const [splitDetails, setSplitDetails] = useState<Record<string, number>>({});

  const { register, handleSubmit, setValue, watch } = useForm<ExpenseForm>({
    resolver: zodResolver(expenseSchema) as any,
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      splitType: "equal",
    },
  });

  // Fetch Expense Details
  const { data: expenseData, isLoading } = useQuery({
    queryKey: ["expense", expenseId],
    enabled: !!expenseId && isOpen,
    queryFn: async () => {
      // 1. Fetch Expense
      const { data: expense, error: expError } = await supabase
        .from("expenses")
        .select("*")
        .eq("id", expenseId)
        .single();

      if (expError) throw expError;

      // 2. Fetch Splits
      const { data: splits, error: splitError } = await supabase
        .from("expense_splits")
        .select("user_id, amount")
        .eq("expense_id", expenseId);

      if (splitError) throw splitError;

      return { expense, splits };
    },
  });

  // Populate Form on Data Load
  useEffect(() => {
    if (expenseData) {
      setValue("description", expenseData.expense.description);
      setValue("amount", expenseData.expense.amount);
      setValue("date", expenseData.expense.date.split("T")[0]);
      setValue("paidBy", expenseData.expense.paid_by);

      // Determine Split Type Logic (simplified inference)
      // This is tricky because we don't store "splitType" in DB.
      // We can try to guess or just default to 'exact' if uneven, or 'equal' if even.
      // For now, let's default to "equal" if amounts are roughly same, else "exact".

      const totalAmount = expenseData.expense.amount;
      const numSplits = expenseData.splits?.length || 0;
      const isRoughlyEqual = expenseData.splits?.every(
        (s) => Math.abs(s.amount - totalAmount / numSplits) < 0.05,
      );

      if (isRoughlyEqual && numSplits === members.length) {
        setValue("splitType", "equal");
      } else {
        setValue("splitType", "exact");
        const details: Record<string, number> = {};
        expenseData.splits?.forEach((s) => {
          details[s.user_id] = s.amount;
        });
        setSplitDetails(details);
      }
    }
  }, [expenseData, setValue, members.length]);

  const updateExpense = useMutation({
    mutationFn: async (data: ExpenseForm) => {
      if (!expenseId) throw new Error("No expense ID");

      // 1. Update Expense
      const { error: expenseError } = await supabase
        .from("expenses")
        .update({
          description: data.description,
          amount: data.amount,
          date: data.date,
          paid_by: data.paidBy,
        })
        .eq("id", expenseId);

      if (expenseError) throw expenseError;

      // 2. Calculate New Splits
      const splits = calculateSplits(
        data.amount,
        members,
        data.splitType,
        splitDetails,
      );

      // 3. Replace Splits (Delete All + Insert New)
      // A. Delete existing
      const { error: deleteError } = await supabase
        .from("expense_splits")
        .delete()
        .eq("expense_id", expenseId);

      if (deleteError) throw deleteError;

      // B. Insert new
      const { error: insertError } = await supabase
        .from("expense_splits")
        .insert(
          splits.map((s) => ({
            expense_id: expenseId,
            user_id: s.userId,
            amount: s.amount,
            owed_to: data.paidBy,
          })),
        );

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      queryClient.invalidateQueries({ queryKey: ["balances"] });
      queryClient.invalidateQueries({ queryKey: ["recent-activity"] });
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      toast.success("Expense updated successfully");
      onClose();
    },
    onError: (err: any) => {
      toast.error("Failed to update expense: " + err.message);
    },
  });

  const onSubmit = (data: ExpenseForm) => {
    updateExpense.mutate(data);
  };

  // Helper to distribute splits (Duplicated from AddExpense for now, should be util)
  const calculateSplits = (
    amount: number,
    members: (GroupMember & { profiles: Profile })[],
    type: string,
    details: Record<string, number>,
  ) => {
    if (type === "equal") {
      const splitAmount = amount / members.length;
      return members.map((m) => ({
        userId: m.user_id,
        amount: Number(splitAmount.toFixed(2)),
      }));
    }

    if (type === "exact") {
      return members.map((m) => ({
        userId: m.user_id,
        amount: details[m.user_id] || 0,
      }));
    }

    if (type === "percentage") {
      return members.map((m) => ({
        userId: m.user_id,
        amount: Number(((amount * (details[m.user_id] || 0)) / 100).toFixed(2)),
      }));
    }

    return members.map((m) => ({ userId: m.user_id, amount: 0 }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>
              Modify expense details and splits.
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="py-8 text-center">Loading details...</div>
          ) : (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  className="col-span-3"
                  {...register("description")}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  className="col-span-3"
                  {...register("amount")}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  className="col-span-3"
                  {...register("date")}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="paidBy" className="text-right">
                  Paid By
                </Label>
                <Select
                  onValueChange={(val) => setValue("paidBy", val)}
                  defaultValue={watch("paidBy")}
                  value={watch("paidBy")}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select who paid" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((m) => (
                      <SelectItem key={m.user_id} value={m.user_id}>
                        {m.profiles.full_name || m.profiles.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Split Type Selector */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="splitType" className="text-right">
                  Split Type
                </Label>
                <Select
                  onValueChange={(val) => {
                    setValue(
                      "splitType",
                      val as "equal" | "exact" | "percentage",
                    );
                    // Don't clear splitDetails here on edit, maybe user wants to switch back
                  }}
                  defaultValue={watch("splitType") || "equal"}
                  value={watch("splitType")}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select split type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equal">Equal</SelectItem>
                    <SelectItem value="exact">Exact Amount</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Split Details Inputs */}
              {watch("splitType") !== "equal" && (
                <div className="space-y-4 border-t pt-4">
                  <Label className="block mb-2">Split Details</Label>
                  {members.map((member) => (
                    <div
                      key={member.user_id}
                      className="grid grid-cols-4 items-center gap-4"
                    >
                      <Label
                        className="text-right text-xs truncate"
                        title={
                          member.profiles.full_name ||
                          member.profiles.email ||
                          ""
                        }
                      >
                        {member.profiles.full_name?.split(" ")[0] || "User"}
                      </Label>
                      <Input
                        type="number"
                        placeholder={
                          watch("splitType") === "percentage" ? "%" : "₹"
                        }
                        className="col-span-3 h-8"
                        step="0.01"
                        value={splitDetails[member.user_id] || ""}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setSplitDetails((prev) => ({
                            ...prev,
                            [member.user_id]: val,
                          }));
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateExpense.isPending}>
              {updateExpense.isPending ? "Updating..." : "Update Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
