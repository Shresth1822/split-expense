import { useMemo } from "react";
import { useBalances } from "@/hooks/useBalances";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownLeft, Wallet, CreditCard } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = ["#10b981", "#ef4444", "#3b82f6"]; // Green, Red, Blue

export function ReportsOverview({ expenses }: { expenses: any[] }) {
  const { data: balances } = useBalances();

  // Calculate total spending by YOU (expenses you paid for or your splits?)
  // Total Spending = Sum of your splits in all expenses
  // Total Paid = Sum of amounts you paid initially

  // For "Total Expenses" card, usually users want to know "How much did I consume?"
  // But calculating exact consumption requires complex split logic parsing if not explicitly stored.
  // For now, let's show "Total Expense Volume" (Total value of transactions involve in)
  // OR simpler: Total Amount Paid by User.

  const stats = useMemo(() => {
    if (!balances) return { totalOwe: 0, totalOwed: 0, balance: 0 };
    return balances;
  }, [balances]);

  const chartData = [
    { name: "You are Owed", value: stats.totalOwed },
    { name: "You Owe", value: stats.totalOwe },
    // A third category "Settled/Clear" doesn't make sense in specific numbers,
    // maybe "Net Balance" absolute if positive?
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${stats.balance >= 0 ? "text-emerald-500" : "text-destructive"}`}
            >
              {stats.balance >= 0 ? "+" : "-"}₹
              {Math.abs(stats.balance).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Overall financial position
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">You are Owed</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              ₹{stats.totalOwed.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Total incoming debt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">You Owe</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              ₹{stats.totalOwe.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Total outgoing debt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              ₹{expenses.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total transaction value involves you
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Debt Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.name === "You are Owed" ? COLORS[0] : COLORS[1]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => `₹${Number(val).toFixed(2)}`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                All settled up!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Placeholder for future insight or secondary chart */}
        <Card className="col-span-1 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border-dashed flex items-center justify-center">
          <div className="text-center p-6">
            <h3 className="text-lg font-semibold text-primary">
              Expense Health
            </h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
              {stats.balance > 0
                ? "You are currently in a positive position. Your friends owe you more than you owe them."
                : "You have some outstanding debts to settle. Check the settlement tab for details."}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
