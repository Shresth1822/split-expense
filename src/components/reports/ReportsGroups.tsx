import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Users } from "lucide-react";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#0088FE",
  "#00C49F",
];

export function ReportsGroups({ expenses }: { expenses: any[] }) {
  const groupStats = useMemo(() => {
    const grouped = expenses.reduce(
      (acc, curr) => {
        // Only consider group expenses
        if (!curr.group_id || !curr.group) return acc;

        const groupName = curr.group.name;
        if (!acc[groupName]) {
          acc[groupName] = { name: groupName, value: 0, count: 0 };
        }
        acc[groupName].value += curr.amount;
        acc[groupName].count += 1;
        return acc;
      },
      {} as Record<string, { name: string; value: number; count: number }>,
    );

    return Object.values(grouped).sort((a, b) => b.value - a.value);
  }, [expenses]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Group Spending
            </CardTitle>
            <CardDescription>
              Total expenses recorded in each group.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            {groupStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={groupStats}
                  layout="vertical"
                  margin={{ left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickFormatter={(val) => `₹${val}`} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(val: number) => `₹${val.toFixed(2)}`}
                    cursor={{ fill: "transparent" }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                    {groupStats.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No group expenses found.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed List */}
      <div className="grid gap-4 md:grid-cols-1">
        {groupStats.map((group) => (
          <Card
            key={group.name}
            className="flex items-center justify-between p-4"
          >
            <div className="flex flex-col">
              <span className="font-semibold">{group.name}</span>
              <span className="text-xs text-muted-foreground">
                {group.count} transactions
              </span>
            </div>
            <div className="text-right">
              <span className="font-bold text-lg">
                ₹{group.value.toFixed(2)}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
