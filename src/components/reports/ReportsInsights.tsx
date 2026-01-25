import { useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Award,
  Lightbulb,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { startOfMonth, subMonths, isSameMonth, parseISO } from "date-fns";

export function ReportsInsights({ expenses }: { expenses: any[] }) {
  const insights = useMemo(() => {
    if (!expenses.length) return [];

    const computedInsights = [];
    const today = new Date();
    const lastMonthStart = startOfMonth(subMonths(today, 1));

    // 1. Month-over-Month Comparison
    const currentMonthExpenses = expenses.filter((e) =>
      isSameMonth(parseISO(e.date), today),
    );
    const lastMonthExpenses = expenses.filter((e) =>
      isSameMonth(parseISO(e.date), lastMonthStart),
    );

    const totalCurrent = currentMonthExpenses.reduce(
      (sum, e) => sum + e.amount,
      0,
    );
    const totalLast = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

    if (totalLast > 0) {
      const diff = totalCurrent - totalLast;
      const percent = ((diff / totalLast) * 100).toFixed(1);
      if (diff > 0) {
        computedInsights.push({
          type: "warning",
          icon: TrendingUp,
          title: "Spending Increased",
          description: `You've spent ${percent}% more this month compared to last month. (₹${totalCurrent.toFixed(0)} vs ₹${totalLast.toFixed(0)})`,
        });
      } else {
        computedInsights.push({
          type: "positive",
          icon: TrendingDown,
          title: "Spending Decreased",
          description: `Great job! Your spending is down by ${Math.abs(Number(percent))}% compared to last month.`,
        });
      }
    }

    // 2. Top Category Analysis
    if (currentMonthExpenses.length > 0) {
      const catMap: Record<string, number> = {};
      currentMonthExpenses.forEach((e) => {
        const cat = e.category || "General";
        catMap[cat] = (catMap[cat] || 0) + e.amount;
      });

      const topCat = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];
      if (topCat) {
        computedInsights.push({
          type: "info",
          icon: Lightbulb,
          title: "Top Category",
          description: `Most of your money this month went to **${topCat[0]}** (₹${topCat[1].toFixed(0)}).`,
        });
      }
    }

    // 3. High Value Transaction Alert
    const highValue = expenses.find(
      (e) => e.amount > 5000 && isSameMonth(parseISO(e.date), today),
    );
    if (highValue) {
      computedInsights.push({
        type: "alert",
        icon: AlertCircle,
        title: "High Expense Detected",
        description: `You had a large expense of ₹${highValue.amount} for "${highValue.description}" on ${new Date(highValue.date).toLocaleDateString()}.`,
      });
    }

    // 4. Frequent Spender (Group)
    // ... could add more logic here

    return computedInsights;
  }, [expenses]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {insights.map((insight, idx) => {
        const Icon = insight.icon;
        let colorClass = "text-blue-500 bg-blue-500/10";
        if (insight.type === "positive")
          colorClass = "text-emerald-500 bg-emerald-500/10";
        if (insight.type === "warning")
          colorClass = "text-orange-500 bg-orange-500/10";
        if (insight.type === "alert") colorClass = "text-red-500 bg-red-500/10";

        return (
          <Card
            key={idx}
            className="border-l-4"
            style={{ borderLeftColor: "currentColor" }}
          >
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className={`p-2 rounded-full ${colorClass}`}>
                <Icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">{insight.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {/* Parse simple markdown bolding */}
                {insight.description
                  .split("**")
                  .map((part, i) =>
                    i % 2 === 1 ? <strong key={i}>{part}</strong> : part,
                  )}
              </p>
            </CardContent>
          </Card>
        );
      })}

      {insights.length === 0 && (
        <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
          <Award className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>Not enough data to generate insights yet.</p>
        </div>
      )}
    </div>
  );
}
