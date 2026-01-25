import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PieChart as PieChartIcon } from "lucide-react";

// Standard vibrant colors for charts
const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#a05195",
  "#d45087",
  "#f95d6a",
  "#ff7c43",
];

export function ReportsCategories({ expenses }: { expenses: any[] }) {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    format(new Date(), "yyyy-MM"),
  );

  // Get list of available months from data
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    expenses.forEach((e) => {
      months.add(e.date.slice(0, 7)); // yyyy-MM
    });
    return Array.from(months).sort().reverse();
  }, [expenses]);

  const pieChartData = useMemo(() => {
    if (!expenses) return [];

    const filtered = expenses.filter((e) => e.date.startsWith(selectedMonth));

    const grouped = filtered.reduce(
      (acc, curr) => {
        const cat = curr.category || "General";
        if (!acc[cat]) acc[cat] = 0;
        acc[cat] += curr.amount;
        return acc;
      },
      {} as Record<string, number>,
    );

    return (Object.entries(grouped) as [string, number][])
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses, selectedMonth]);

  const totalForSelectedMonth = pieChartData.reduce(
    (sum, item) => sum + item.value,
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <PieChartIcon className="h-5 w-5" /> Category Breakdown
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Month:</span>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableMonths.map((m) => (
                <SelectItem key={m} value={m}>
                  {format(parseISO(`${m}-01`), "MMMM yyyy")}
                </SelectItem>
              ))}
              {availableMonths.length === 0 && (
                <SelectItem value={format(new Date(), "yyyy-MM")}>
                  {format(new Date(), "MMMM yyyy")}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pie Chart Card */}
        <Card>
          <CardHeader>
            <CardTitle>Spending Distribution</CardTitle>
            <CardDescription>
              Where did your money go in{" "}
              {format(parseISO(`${selectedMonth}-01`), "MMMM yyyy")}?
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieChartData.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => `₹${Number(value).toFixed(2)}`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No expenses for this month.
              </div>
            )}
          </CardContent>
        </Card>

        {/* List View Card */}
        <Card>
          <CardHeader>
            <CardTitle>Category Details</CardTitle>
            <CardDescription>
              Total:{" "}
              <span className="text-primary font-bold">
                ₹{totalForSelectedMonth.toFixed(2)}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pieChartData.length > 0 ? (
              <div className="space-y-4">
                {pieChartData.map((item, index) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <span className="font-medium text-sm">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm">
                        ₹{item.value.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {((item.value / totalForSelectedMonth) * 100).toFixed(
                          1,
                        )}
                        %
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No data to display.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
