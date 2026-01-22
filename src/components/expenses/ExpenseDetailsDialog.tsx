import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Receipt, Calendar, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ExpenseDetailsDialogProps {
  expenseId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ExpenseDetailsDialog({
  expenseId,
  isOpen,
  onClose,
}: ExpenseDetailsDialogProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["expense-details", expenseId],
    enabled: !!expenseId && isOpen,
    queryFn: async () => {
      // Fetch expense + paid_by profile
      const { data: expense, error: expError } = await supabase
        .from("expenses")
        .select(
          `
          *,
          profiles:paid_by (*)
        `,
        )
        .eq("id", expenseId)
        .single();

      if (expError) throw expError;

      // Fetch splits + user profiles
      const { data: splits, error: splitError } = await supabase
        .from("expense_splits")
        .select(
          `
          amount,
          profiles:user_id (*)
        `,
        )
        .eq("expense_id", expenseId);

      if (splitError) throw splitError;

      return { expense, splits };
    },
  });

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Expense Details</DialogTitle>
          <DialogDescription>
            Transaction receipt and split breakdown.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !data ? (
          <div className="py-8 text-center text-muted-foreground">
            Details not found
          </div>
        ) : (
          <div className="space-y-6">
            {/* Receipt Card */}
            <div className="rounded-xl border bg-card p-4 shadow-sm relative overflow-hidden">
              {/* Decorative receipt cuts */}
              <div className="absolute top-0 left-0 w-full h-1 bg-[linear-gradient(90deg,transparent_50%,#fff_50%)] bg-[length:10px_10px]" />

              <div className="text-center mb-6 pt-2">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-3">
                  <Receipt className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">
                  {data.expense.description}
                </h3>
                <div className="text-3xl font-bold mt-2 text-primary">
                  ₹{data.expense.amount.toFixed(2)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-4 border-t border-b py-4 border-dashed">
                <div className="space-y-1">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" /> Paid by
                  </span>
                  <div className="font-medium flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={data.expense.profiles?.avatar_url} />
                      <AvatarFallback className="text-[10px]">
                        {data.expense.profiles?.full_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    {data.expense.profiles?.full_name || "Unknown"}
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <span className="text-muted-foreground flex items-center justify-end gap-1">
                    <Calendar className="h-3 w-3" /> Date
                  </span>
                  <div className="font-medium">
                    {new Date(data.expense.date).toLocaleDateString(undefined, {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Split Breakdown
                </div>
                <ScrollArea className="h-[200px] -mr-4 pr-4">
                  <div className="space-y-3">
                    {data.splits?.map((split: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8 border bg-muted">
                            <AvatarImage src={split.profiles?.avatar_url} />
                            <AvatarFallback>
                              {split.profiles?.full_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">
                            {split.profiles?.full_name || "Unknown"}
                          </span>
                        </div>
                        <span className="font-bold text-sm">
                          ₹{split.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>

            <div className="text-center text-xs text-muted-foreground">
              Created on {new Date(data.expense.created_at).toLocaleString()}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
