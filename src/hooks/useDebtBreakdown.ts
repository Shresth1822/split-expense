import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export interface DebtItem {
  owedTo: {
    id: string;
    full_name: string | null;
    email: string | null;
  };
  totalAmount: number;
  expenses: {
    id: string;
    description: string;
    date: string;
    amount: number;
  }[];
  commonGroupId?: string;
}

export function useDebtBreakdown() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["debt-breakdown", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];

      // Fetch ALL splits involving me (either paying or owing)
      const { data, error } = await supabase
        .from("expense_splits")
        .select(
          `
          amount,
          user_id,
          owed_to,
          profiles:owed_to (id, full_name, email),
          payer_profile:user_id (id, full_name, email),
          expenses (id, description, date, group_id)
        `
        )
        .or(`user_id.eq.${user.id},owed_to.eq.${user.id}`);

      if (error) throw error;

      // Group by "The Other Person"
      const personBalances: Record<string, DebtItem> = {};

      data?.forEach((split: any) => {
        // Determine who is the "other" person in this transaction
        const isIOwe = split.user_id === user.id;
        const otherId = isIOwe ? split.owed_to : split.user_id;

        // Skip self-loops if they exist
        if (split.user_id === split.owed_to) return;

        if (!personBalances[otherId]) {
          const profile = isIOwe ? split.profiles : split.payer_profile;
          personBalances[otherId] = {
            owedTo: profile, // This is now "The Other Person"
            totalAmount: 0,
            expenses: [],
            commonGroupId: undefined,
          };
        }

        // Calculate Net Impact on ME
        // If I owe (user_id = ME), amount is ADDED to my debt.
        // If I am owed (owed_to = ME), amount is SUBTRACTED from my debt.
        const amount = Number(split.amount);
        if (isIOwe) {
          personBalances[otherId].totalAmount += amount;
          // Add detail: This is a debt
          if (split.expenses) {
            if (
              !personBalances[otherId].commonGroupId &&
              split.expenses.group_id
            ) {
              personBalances[otherId].commonGroupId = split.expenses.group_id;
            }
            personBalances[otherId].expenses.push({
              id: split.expenses.id,
              description: split.expenses.description,
              date: split.expenses.date,
              amount: amount,
            });
          }
        } else {
          personBalances[otherId].totalAmount -= amount;
          // Add detail: This is a payment/credit (Negative debt)
          if (split.expenses) {
            personBalances[otherId].expenses.push({
              id: split.expenses.id,
              description: `Paid by me: ${split.expenses.description}`,
              date: split.expenses.date,
              amount: -amount,
            });
          }
        }
      });

      // Return ALL non-settled balances (either I owe or I am owed)
      return Object.values(personBalances).filter(
        (item) => Math.abs(item.totalAmount) > 0.01
      );
    },
  });
}
