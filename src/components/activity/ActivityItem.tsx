interface ActivityItemProps {
  item: {
    id: string;
    description: string;
    amount: number;
    date: string;
    type?: "expense" | "settlement";
    profiles?: { full_name: string | null };
    groups?: { name: string };
  };
}

export function ActivityItem({ item }: ActivityItemProps) {
  // Basic type inference if not explicitly provided (e.g. settlements usually have special descriptions or type field if added)
  // For now we assume the parent passes the correct structure or we infer 'expense' unless it's a settlement.
  // In Dashboard.tsx earlier, it was using `item.type`. We need to ensure the query returns it or we derive it.
  // The current query in useRecentActivity doesn't strictly return a 'type' column unless it exists in DB or is computed.
  // Wait, useRecentActivity select string: `id, description, amount, date, group_id, groups (name), profiles:paid_by (full_name)`
  // It does NOT select 'type'. The Dashboard code `item.type === "expense"` implies there might be a type in DB or it was being mocked/computed?
  // Let's look at schema... 'expenses' table has 'description'.
  // Settlements are often just expenses with no group_id or specific description?
  // Actually, looking at previous code, SettleUpModal creates an expense with description "Settlement".
  // So distinct type might not exist on the record directly unless we compute it.
  // Let's infer type based on description for now to match Dashboard logic, or update hook to return it if it's a column.
  // Checking schema: expenses table has no 'type' column.
  // Dashboard.tsx previously had `item.type === "expense"`. Logic might have been missing or I missed where it came from.
  // Ah, likely the previous Dashboard code was assuming it existed or it was being added in a transformation layer I didn't see.
  // Let's assume 'Settlement' description => type = 'settlement'.

  const isSettlement = item.description === "Settlement";
  const type = isSettlement ? "settlement" : "expense";

  return (
    <div className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-4">
        <div
          className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold ${
            type === "expense"
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
              : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          }`}
        >
          {item.profiles?.full_name?.substring(0, 2).toUpperCase() || "US"}
        </div>
        <div>
          <p className="font-medium text-sm">
            <span className="font-bold">
              {item.profiles?.full_name?.split(" ")[0] || "User"}
            </span>{" "}
            {type === "settlement" ? "settled up" : "added"}{" "}
            <span className="text-foreground/90">{item.description}</span>
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">
              {new Date(item.date).toLocaleDateString()}
            </span>
            {item.groups?.name && (
              <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold text-foreground/70">
                {item.groups.name}
              </span>
            )}
          </div>
        </div>
      </div>
      <div
        className={`text-right font-bold ${
          type === "settlement" ? "text-green-500" : "text-foreground"
        }`}
      >
        {type === "settlement" ? "+" : ""}₹{Math.abs(item.amount).toFixed(2)}
      </div>
    </div>
  );
}
