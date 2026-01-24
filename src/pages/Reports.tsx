import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subMonths, parseISO } from "date-fns";
import { supabase } from "@/lib/supabase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, PieChart as PieChartIcon, BarChart3 } from "lucide-react";

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

interface BarChartData {
  name: string;
  amount: number;
  fullDate: string;
}

interface PieChartData {
  name: string;
  value: number;
}

export function Reports() {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    format(new Date(), "yyyy-MM"),
  );

  // Fetch all expenses to aggregate locally (or could filter via DB)
  // Fetching all for now since dataset is likely small for personal use
  const { data: expenses, isLoading } = useQuery({
    queryKey: ["all-expenses-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // --- Process Data for Bar Chart (Last 6 Months) ---
  const barChartData: BarChartData[] = useMemo(() => {
    if (!expenses) return [];

    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(new Date(), i);
      return format(d, "yyyy-MM");
    }).reverse();

    const grouped = expenses.reduce(
      (acc, curr) => {
        const monthKey = curr.date.slice(0, 7); // yyyy-MM
        if (!acc[monthKey]) acc[monthKey] = 0;
        acc[monthKey] += curr.amount;
        return acc;
      },
      {} as Record<string, number>,
    );

    return last6Months.map((month) => ({
      name: format(parseISO(`${month}-01`), "MMM"),
      amount: grouped[month] || 0,
      fullDate: month,
    }));
  }, [expenses]);

  // --- Process Data for Pie Chart (Selected Month) ---
  const pieChartData: PieChartData[] = useMemo(() => {
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
      .sort((a, b) => b.value - a.value); // Descending
  }, [expenses, selectedMonth]);

  const totalForSelectedMonth = pieChartData.reduce(
    (sum, item) => sum + item.value,
    0,
  );

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
        <p className="text-muted-foreground mt-2">
          Visualize your spending habits and group expenses.
        </p>
      </div>

      <Tabs defaultValue="monthly" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="monthly">Monthly Trends</TabsTrigger>
          <TabsTrigger value="category">Category Breakdown</TabsTrigger>
        </TabsList>

        {/* TAB 1: Monthly Trends (Bar Chart) */}
        <TabsContent value="monthly" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Monthly Spending
              </CardTitle>
              <CardDescription>
                Your total expenses over the last 6 months.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] sm:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    formatter={(value: any) => [
                      `₹${Number(value).toFixed(2)}`,
                      "Total",
                    ]}
                  />
                  <Bar
                    dataKey="amount"
                    fill="currentColor"
                    radius={[4, 4, 0, 0]}
                    className="fill-primary"
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Category Breakdown (Pie Chart) */}
        <TabsContent value="category" className="space-y-6 mt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" />
              Category Breakdown
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Month:</span>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {barChartData.map((d) => (
                    <SelectItem key={d.fullDate} value={d.fullDate}>
                      {d.name} {d.fullDate.split("-")[0]}
                    </SelectItem>
                  ))}
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
                        formatter={(value: any) =>
                          `₹${Number(value).toFixed(2)}`
                        }
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
                          <span className="font-medium text-sm">
                            {item.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sm">
                            ₹{item.value.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {(
                              (item.value / totalForSelectedMonth) *
                              100
                            ).toFixed(1)}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
