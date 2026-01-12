import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useRecentActivity(limit = 10) {
  return useQuery({
    queryKey: ["recent-activity", limit],
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
        .limit(limit);

      if (error) throw error;
      return data;
    },
  });
}
