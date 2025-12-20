import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useRecentActivity() {
  return useQuery({
    queryKey: ["recent-activity"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select(
          `
          id,
          description,
          amount,
          date,
          group_id,
          groups (name),
          profiles:paid_by (full_name)
        `
        )
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });
}
