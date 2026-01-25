import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowRight, History } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function ReportsSettlements({ expenses }: { expenses: any[] }) {
  const { user } = useAuth();

  const settlements = useMemo(() => {
    // Filter expenses that look like settlements
    // Typically described as "Settlement" or has specific metadata?
    // In our app, we name them "Settlement".
    return expenses.filter(
      (e) =>
        e.description.toLowerCase() === "settlement" ||
        e.category?.toLowerCase() === "settlement",
    );
  }, [expenses]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" /> Settlement History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {settlements.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Payer</TableHead>
                  <TableHead></TableHead>
                  <TableHead>Receiver</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settlements.map((s) => {
                  const payer = s.profiles; // Payer profile
                  // Receiver is tricky because it's in splits.
                  // For settlement, typically 1 split to receiver.
                  const receiver = s.expense_splits?.[0]?.profiles; // Need to join properly?
                  // The hook uses `expense_splits(*, profiles:user_id(*))` so correct.

                  const isMePayer = s.paid_by === user?.id;

                  return (
                    <TableRow key={s.id}>
                      <TableCell>
                        {new Date(s.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {isMePayer ? "You" : payer?.full_name || "Unknown"}
                      </TableCell>
                      <TableCell>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </TableCell>
                      <TableCell>{receiver?.full_name || "Unknown"}</TableCell>
                      <TableCell className="text-right font-bold text-green-600">
                        ₹{s.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No settlement records found.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
