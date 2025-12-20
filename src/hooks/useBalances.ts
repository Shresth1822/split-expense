import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export function useBalances() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["balances", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return { totalOwed: 0, totalOwe: 0, balance: 0 };

      // 1. Get what I owe (where user_id is ME)
      const { data: debts, error: debtsError } = await supabase
        .from("expense_splits")
        .select("amount, owed_to")
        .eq("user_id", user.id)
        .neq("owed_to", user.id); // Strict: I owe someone else

      if (debtsError) throw debtsError;

      // 2. Get what I am owed (where owed_to is ME)
      const { data: owedToMeData, error: owedToMeError } = await supabase
        .from("expense_splits")
        .select("amount")
        .eq("owed_to", user.id)
        .neq("user_id", user.id); // Don't count money I owe to myself

      if (owedToMeError) throw owedToMeError;

      const totalIOweOthers = (debts || []).reduce(
        (acc, curr) => acc + Number(curr.amount),
        0
      );

      const totalOwedToMe = (owedToMeData || []).reduce(
        (acc, curr) => acc + Number(curr.amount),
        0
      );

      return {
        totalOwe: totalIOweOthers,
        totalOwed: totalOwedToMe,
        balance: totalOwedToMe - totalIOweOthers,
      };
    },
  });
}
