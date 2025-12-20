import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

import { useBalances } from "@/hooks/useBalances";
import { useDebtBreakdown } from "@/hooks/useDebtBreakdown";
import { Button } from "@/components/ui/button";

import { useRecentActivity } from "@/hooks/useRecentActivity";

export function Dashboard() {
  const { data: balances, isLoading: loadingBalances } = useBalances();
  const { data: debts, isLoading: loadingDebts } = useDebtBreakdown();
  const { data: activity, isLoading: loadingActivity } = useRecentActivity();

  const isLoading = loadingBalances || loadingDebts || loadingActivity;

  if (isLoading) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  const { totalOwe = 0, totalOwed = 0, balance = 0 } = balances || {};

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your expenses and balances
        </p>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 p-8 text-white shadow-2xl">
        <div className="relative z-10">
          <p className="text-blue-100 font-medium mb-1">Total Balance</p>
          <div className="flex items-center gap-4">
            <h2 className="text-5xl font-bold tracking-tight">
              {balance < 0 ? "-" : ""}₹{Math.abs(balance).toFixed(2)}
            </h2>
            {balance !== 0 && (
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  balance > 0
                    ? "bg-green-500/20 text-green-100 border border-green-500/30"
                    : "bg-red-500/20 text-red-100 border border-red-500/30"
                }`}
              >
                {balance > 0 ? "You are owed" : "You owe"}
              </span>
            )}
          </div>
        </div>
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-black/10 blur-3xl"></div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card/50 border-destructive/20 shadow-sm hover:bg-card/80 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-destructive">
              You owe
            </CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">
              ₹{totalOwe.toFixed(2)}
            </div>
            <div className="mt-4 flex justify-end">
              <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                <ArrowDownLeft className="h-4 w-4 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-green-500/20 shadow-sm hover:bg-card/80 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-500">
              You are owed
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              ₹{totalOwed.toFixed(2)}
            </div>
            <div className="mt-4 flex justify-end">
              <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Recent Activity Feed */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Recent Activity</h3>
            <Button variant="link" className="text-primary p-0 h-auto">
              View all
            </Button>
          </div>

          <div className="rounded-xl border bg-card/50 shadow-sm divide-y">
            {activity && activity.length > 0 ? (
              activity.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold ${
                        item.type === "expense"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      }`}
                    >
                      {item.profiles?.full_name
                        ?.substring(0, 2)
                        .toUpperCase() || "US"}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        <span className="font-bold">
                          {item.profiles?.full_name?.split(" ")[0]}
                        </span>{" "}
                        {item.type === "settlement" ? "settled up" : "added"}{" "}
                        <span className="text-foreground/90">
                          {item.description}
                        </span>
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
                      item.type === "settlement"
                        ? "text-green-500"
                        : "text-foreground"
                    }`}
                  >
                    {item.type === "settlement" ? "+" : ""}₹
                    {item.amount.toFixed(2)}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                No recent activity
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Friends/Debts */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Friends</h3>
            <Button variant="link" className="text-primary p-0 h-auto">
              View all
            </Button>
          </div>

          <Card className="bg-card/50 shadow-sm">
            <CardContent className="p-0">
              {debts && debts.length > 0 ? (
                <div className="divide-y">
                  {debts.map((debt: any) => (
                    <div
                      key={debt.owedTo.id}
                      className="p-4 flex items-center justify-between hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {debt.owedTo.full_name?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {debt.owedTo.full_name}
                          </p>
                          <p
                            className={`text-xs ${
                              debt.totalAmount > 0
                                ? "text-red-500"
                                : "text-green-500"
                            }`}
                          >
                            {debt.totalAmount > 0 ? "you owe" : "owes you"}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`font-bold text-sm ${
                          debt.totalAmount > 0
                            ? "text-red-500"
                            : "text-green-500"
                        }`}
                      >
                        ₹{Math.abs(debt.totalAmount).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  All settled up with friends!
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
