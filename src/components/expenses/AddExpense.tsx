import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const expenseSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  date: z.string(),
  paidBy: z.string(),
  splitType: z.enum(["equal", "exact", "percentage"]),
});

type ExpenseForm = z.infer<typeof expenseSchema>;

interface AddExpenseProps {
  groupId: string;
  members: (GroupMember & { profiles: Profile })[];
}

export function AddExpense({ groupId, members }: AddExpenseProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [splitDetails, setSplitDetails] = useState<Record<string, number>>({});

  const { register, handleSubmit, setValue, reset, watch } =
    useForm<ExpenseForm>({
      resolver: zodResolver(expenseSchema) as any,
      defaultValues: {
        date: new Date().toISOString().split("T")[0],
        paidBy: user?.id,
        splitType: "equal",
      },
    });

  const createExpense = useMutation({
    mutationFn: async (data: ExpenseForm) => {
      // 1. Create Expense
      const { data: expense, error: expenseError } = await supabase
        .from("expenses")
        .insert({
          group_id: groupId,
          description: data.description,
          amount: data.amount,
          date: data.date,
          paid_by: data.paidBy,
          created_by: user?.id,
        })
        .select()
        .single();

      if (expenseError) throw expenseError;

      // 2. Calculate Splits
      const splits = calculateSplits(
        data.amount,
        members,
        data.splitType,
        splitDetails,
        data.paidBy
      );

      // 3. Insert Splits
      const { error: splitError } = await supabase
        .from("expense_splits")
        .insert(
          splits.map((s) => ({
            expense_id: expense.id,
            user_id: s.userId,
            amount: s.amount,
            owed_to: data.paidBy, // Simple model: everyone owes the payer
          }))
        );

      if (splitError) throw splitError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      queryClient.invalidateQueries({ queryKey: ["balances"] });
      queryClient.invalidateQueries({ queryKey: ["recent-activity"] });
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      setIsOpen(false);
      reset();
      setSplitDetails({});
    },
  });

  const onSubmit = (data: ExpenseForm) => {
    createExpense.mutate(data);
  };

  // Helper to distribute splits
  const calculateSplits = (
    amount: number,
    members: (GroupMember & { profiles: Profile })[],
    type: string,
    details: Record<string, number>,
    _payerId: string
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Add Expense</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
            <DialogDescription>
              Create a new expense and split it among members.
            </DialogDescription>
          </DialogHeader>
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
              <Label htmlFor="paidBy" className="text-right">
                Paid By
              </Label>
              <Select
                onValueChange={(val) => setValue("paidBy", val)}
                defaultValue={user?.id}
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
                    val as "equal" | "exact" | "percentage"
                  );
                  setSplitDetails({});
                }}
                defaultValue="equal"
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
                        member.profiles.full_name || member.profiles.email || ""
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
          <DialogFooter>
            <Button type="submit" disabled={createExpense.isPending}>
              {createExpense.isPending ? "Saving..." : "Save Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
