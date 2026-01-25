import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export function useReportData() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["report-data", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Fetch all expenses involved with the user (paid by user OR split with user)
      // Actually simpler: Fetch all expenses where user is part of the group OR involving the user directly?
      // For simplicity in this personal app, we fetch all expenses from groups the user is in.

      const { data: expenses, error } = await supabase
        .from("expenses")
        .select(
          `
          *,
          profiles:paid_by (*),
          group:groups (*),
          expense_splits (
            *,
            profiles:user_id (*)
          )
        `,
        )
        .order("date", { ascending: false });

      if (error) throw error;

      return expenses || [];
    },
  });
}
