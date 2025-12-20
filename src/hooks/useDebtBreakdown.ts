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
}

export function useDebtBreakdown() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["debt-breakdown", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];

      // Fetch all splits where I owe money (user_id = ME, owed_to != ME)
      const { data, error } = await supabase
        .from("expense_splits")
        .select(
          `
          amount,
          owed_to,
          profiles:owed_to (id, full_name, email),
          expenses (id, description, date)
        `
        )
        .eq("user_id", user.id)
        .neq("owed_to", user.id);

      if (error) throw error;

      // Group by 'owed_to' user
      const groupedDebts: Record<string, DebtItem> = {};

      data?.forEach((split: any) => {
        const owedToId = split.owed_to;
        const profile = split.profiles;
        const expense = split.expenses;

        if (!groupedDebts[owedToId]) {
          groupedDebts[owedToId] = {
            owedTo: profile,
            totalAmount: 0,
            expenses: [],
          };
        }

        groupedDebts[owedToId].totalAmount += Number(split.amount);
        if (expense) {
          groupedDebts[owedToId].expenses.push({
            id: expense.id,
            description: expense.description,
            date: expense.date,
            amount: Number(split.amount), // The amount I owe for THIS expense
          });
        }
      });

      return Object.values(groupedDebts);
    },
  });
}
