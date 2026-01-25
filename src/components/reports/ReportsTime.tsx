import { useMemo, useState } from "react";
import { format, parseISO, eachDayOfInterval } from "date-fns";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ReportsTime({ expenses }: { expenses: any[] }) {
  const [timeRange, setTimeRange] = useState("30"); // days

  const chartData = useMemo(() => {
    if (!expenses.length) return [];

    // Sort expenses by date
    const sorted = [...expenses].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    // Create Date Map
    const dateMap = new Map<string, number>();

    // Fill with expenses
    sorted.forEach((e) => {
      const dateKey = format(parseISO(e.date), "yyyy-MM-dd");
      const current = dateMap.get(dateKey) || 0;
      dateMap.set(dateKey, current + e.amount);
    });

    // Generate all days in range for smooth chart
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - parseInt(timeRange));

    const days = eachDayOfInterval({ start: startDate, end: today });

    return days.map((day) => {
      const key = format(day, "yyyy-MM-dd");
      return {
        date: key,
        displayDate: format(day, "MMM dd"),
        amount: dateMap.get(key) || 0,
      };
    });
  }, [expenses, timeRange]);

  const totalInPeriod = chartData.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5" /> Spending Trends
        </h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 Days</SelectItem>
            <SelectItem value="30">Last 30 Days</SelectItem>
            <SelectItem value="90">Last 3 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Spending</CardTitle>
          <CardDescription>
            Total spent in this period:{" "}
            <span className="font-bold text-primary">
              ₹{totalInPeriod.toFixed(2)}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="displayDate"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
              />
              <YAxis hide />
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                opacity={0.3}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                formatter={(val: any) => `₹${Number(val).toFixed(2)}`}
                labelFormatter={(label) => label}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#8b5cf6"
                fillOpacity={1}
                fill="url(#colorAmount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
