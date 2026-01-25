import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useFriends } from "@/hooks/useFriends";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

export function ReportsPeople({ expenses }: { expenses: any[] }) {
  const { user } = useAuth();
  const { data: friends } = useFriends();

  const friendStats = useMemo(() => {
    if (!user || !friends) return [];

    const stats = new Map<
      string,
      {
        id: string;
        name: string;
        avatar_url: string;
        totalShared: number;
        netBalance: number;
        lastTransaction: string | null;
      }
    >();

    // Initialize friends
    friends.forEach((f) => {
      if (f.status === "accepted") {
        stats.set(f.id, {
          id: f.id,
          name: f.full_name || f.email || "Unknown",
          avatar_url: f.avatar_url || "",
          totalShared: 0,
          netBalance: 0, // + means they owe me, - means I owe them
          lastTransaction: null,
        });
      }
    });

    expenses.forEach((exp) => {
      // Logic:
      // 1. Calculate Net Balance impact
      // 2. Identify shared expenses

      const payerId = exp.paid_by;
      const splits = exp.expense_splits || [];

      // If I paid, everyone else in splits owes me
      if (payerId === user.id) {
        splits.forEach((s: any) => {
          if (s.user_id !== user.id) {
            // Someone else
            const friend = stats.get(s.user_id);
            if (friend) {
              friend.netBalance += s.amount;
              friend.totalShared += s.amount;
              if (
                !friend.lastTransaction ||
                new Date(exp.date) > new Date(friend.lastTransaction)
              ) {
                friend.lastTransaction = exp.date;
              }
            }
          }
        });
      } else {
        // Someone else paid
        // Did I split?
        const mySplit = splits.find((s: any) => s.user_id === user.id);
        if (mySplit && payerId) {
          const friend = stats.get(payerId);
          if (friend) {
            friend.netBalance -= mySplit.amount; // I owe them
            friend.totalShared += mySplit.amount;
            if (
              !friend.lastTransaction ||
              new Date(exp.date) > new Date(friend.lastTransaction)
            ) {
              friend.lastTransaction = exp.date;
            }
          }
        }
      }
    });

    return Array.from(stats.values()).sort(
      (a, b) => b.totalShared - a.totalShared,
    );
  }, [expenses, user, friends]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {friendStats.map((friend) => (
          <Card
            key={friend.id}
            className="overflow-hidden hover:shadow-md transition-shadow"
          >
            <CardContent className="p-0">
              <div className="p-6 flex items-center gap-4 border-b">
                <Avatar className="h-12 w-12 border-2 border-primary/10">
                  <AvatarImage src={friend.avatar_url} />
                  <AvatarFallback>{friend.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg leading-none">
                    {friend.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {friend.lastTransaction
                      ? `Last activity: ${new Date(friend.lastTransaction).toLocaleDateString()}`
                      : "No activity yet"}
                  </p>
                </div>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4 bg-muted/20">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    Shared Vol.
                  </p>
                  <p className="text-lg font-bold">
                    ₹{friend.totalShared.toFixed(0)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    Net Balance
                  </p>
                  <p
                    className={`text-lg font-bold ${friend.netBalance >= 0 ? "text-emerald-500" : "text-destructive"}`}
                  >
                    {friend.netBalance >= 0 ? "+" : ""}₹
                    {friend.netBalance.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {friend.netBalance > 0
                      ? "Owes you"
                      : friend.netBalance < 0
                        ? "You owe"
                        : "Settled"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {friendStats.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
            <User className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No friends found or no shared expenses yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
