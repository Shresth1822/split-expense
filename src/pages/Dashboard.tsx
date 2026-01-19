import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

import { useBalances } from "@/hooks/useBalances";
import { useDebtBreakdown } from "@/hooks/useDebtBreakdown";
import { Button } from "@/components/ui/button";

import { useRecentActivity } from "@/hooks/useRecentActivity";

import { SettleUpModal } from "@/components/expenses/SettleUpModal";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ActivityItem } from "@/components/activity/ActivityItem";

export function Dashboard() {
  const navigate = useNavigate();
  const { data: balances, isLoading: loadingBalances } = useBalances();
  const { data: debts, isLoading: loadingDebts } = useDebtBreakdown();
  const { data: activity, isLoading: loadingActivity } = useRecentActivity();

  // State for Settle Up Modal
  const [settleUpTarget, setSettleUpTarget] = useState<any>(null);
  const isSettleModalOpen = !!settleUpTarget;

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
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 sm:p-8 text-white shadow-xl ring-1 ring-white/10">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-indigo-100 font-medium mb-1 flex items-center gap-2">
              Total Balance
            </p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
                {balance < 0 ? "-" : ""}₹{Math.abs(balance).toFixed(2)}
              </h2>
            </div>
            {balance !== 0 && (
              <div className="mt-3 inline-flex">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    balance > 0
                      ? "bg-emerald-400/20 text-emerald-100 ring-1 ring-emerald-400/30"
                      : "bg-rose-400/20 text-rose-100 ring-1 ring-rose-400/30"
                  }`}
                >
                  {balance > 0 ? "You are owed" : "You owe"}
                </span>
              </div>
            )}
          </div>
        </div>
        {/* Abstract Background Shapes */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-violet-400/20 blur-3xl"></div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        <Card className="bg-card/40 backdrop-blur-sm border-destructive/10 shadow-lg hover:shadow-destructive/5 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">
              You owe
            </CardTitle>
            <div className="p-2 bg-destructive/10 rounded-full">
              <ArrowDownLeft className="h-4 w-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-destructive">
              ₹{totalOwe.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-sm border-emerald-500/10 shadow-lg hover:shadow-emerald-500/5 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">
              You are owed
            </CardTitle>
            <div className="p-2 bg-emerald-500/10 rounded-full">
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-500">
              ₹{totalOwed.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Recent Activity Feed */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Recent Activity</h3>
            <Button
              variant="link"
              className="text-primary p-0 h-auto"
              onClick={() => navigate("/activity")}
            >
              View all
            </Button>
          </div>

          <div className="rounded-xl border bg-card/50 shadow-sm divide-y">
            {activity && activity.length > 0 ? (
              activity.map((item: any) => (
                <ActivityItem key={item.id} item={item} />
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
            <Button
              variant="link"
              className="text-primary p-0 h-auto"
              onClick={() => navigate("/friends")}
            >
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
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`font-bold text-sm ${
                            debt.totalAmount > 0
                              ? "text-red-500"
                              : "text-green-500"
                          }`}
                        >
                          ₹{Math.abs(debt.totalAmount).toFixed(2)}
                        </span>
                        {debt.totalAmount > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-xs px-2"
                            onClick={() => setSettleUpTarget(debt)}
                          >
                            Settle Up
                          </Button>
                        )}
                      </div>
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
      <SettleUpModal
        isOpen={isSettleModalOpen}
        onClose={() => setSettleUpTarget(null)}
        debtItem={settleUpTarget}
      />
    </div>
  );
}
