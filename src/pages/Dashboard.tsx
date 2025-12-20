import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, ArrowUpRight, ArrowDownLeft } from "lucide-react";

import { useBalances } from "@/hooks/useBalances";
import { useDebtBreakdown } from "@/hooks/useDebtBreakdown";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SettleDebt } from "@/components/settlement/SettleDebt";

import { useRecentActivity } from "@/hooks/useRecentActivity";

export function Dashboard() {
  const { user } = useAuth();
  const { data: balances, isLoading: loadingBalances } = useBalances();
  const { data: debts, isLoading: loadingDebts } = useDebtBreakdown();
  const { data: activity, isLoading: loadingActivity } = useRecentActivity();

  const isLoading = loadingBalances || loadingDebts || loadingActivity;

  if (isLoading) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  const { totalOwe = 0, totalOwed = 0, balance = 0 } = balances || {};

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">
        Welcome back, {user?.user_metadata?.full_name?.split(" ")[0] || "there"}
        !
      </h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                balance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {balance < 0 ? "-" : ""}₹{Math.abs(balance).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {balance === 0
                ? "You are all settled up"
                : balance > 0
                ? "You are owed in total"
                : "You owe in total"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">You Owe</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              ₹{totalOwe.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">You are Owed</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              ₹{totalOwed.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Your Debts</CardTitle>
          </CardHeader>
          <CardContent>
            {debts && debts.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {debts.map((debt) => (
                  <AccordionItem key={debt.owedTo.id} value={debt.owedTo.id}>
                    <AccordionTrigger className="hover:no-underline px-2">
                      <div className="flex justify-between w-full pr-4 items-center">
                        <div className="flex gap-4 items-center">
                          <span>{debt.owedTo.full_name || "User"}</span>
                          {debt.totalAmount > 0 && debt.commonGroupId && (
                            <SettleDebt
                              owedToId={debt.owedTo.id}
                              owedToName={debt.owedTo.full_name || "User"}
                              amount={debt.totalAmount}
                              groupId={debt.commonGroupId}
                            />
                          )}
                        </div>
                        <div className="text-right">
                          <span
                            className={`font-bold block ${
                              debt.totalAmount > 0
                                ? "text-red-500"
                                : "text-green-500"
                            }`}
                          >
                            ₹{Math.abs(debt.totalAmount).toFixed(2)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {debt.totalAmount > 0 ? "you owe" : "owes you"}
                          </span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-2">
                      <div className="space-y-2 pt-2">
                        {debt.expenses.map((expense) => (
                          <div
                            key={expense.id}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-muted-foreground">
                              {expense.description} (
                              {new Date(expense.date).toLocaleDateString()})
                            </span>
                            <span
                              className={
                                expense.amount < 0 ? "text-green-600" : ""
                              }
                            >
                              ₹{expense.amount.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className="text-sm text-muted-foreground py-4">
                You don't owe anyone anything! 🎉
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activity && activity.length > 0 ? (
              <div className="space-y-4">
                {activity.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium text-sm">{item.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.profiles?.full_name} added in{" "}
                        {item.groups?.name || "Group"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm">
                        ₹{item.amount.toFixed(2)}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No recent activity.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
