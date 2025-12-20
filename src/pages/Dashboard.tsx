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

export function Dashboard() {
  const { user } = useAuth();
  const { data: balances, isLoading: loadingBalances } = useBalances();
  const { data: debts, isLoading: loadingDebts } = useDebtBreakdown();

  const isLoading = loadingBalances || loadingDebts;

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
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex justify-between w-full pr-4">
                        <span>{debt.owedTo.full_name || "User"}</span>
                        <span className="text-red-500 font-bold">
                          ₹{debt.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
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
                            <span>₹{expense.amount.toFixed(2)}</span>
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
            <p className="text-sm text-muted-foreground">No recent activity.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
