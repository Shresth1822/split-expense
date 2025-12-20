import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
} from "lucide-react";
import { useFriends } from "@/hooks/useFriends";
import { useDebtBreakdown } from "@/hooks/useDebtBreakdown";
import { AddFriend } from "@/components/friends/AddFriend";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function Friends() {
  const { data: friends, isLoading: friendsLoading } = useFriends();
  const { data: debts, isLoading: debtsLoading } = useDebtBreakdown();
  const [searchTerm, setSearchTerm] = useState("");

  if (friendsLoading || debtsLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading friends...
      </div>
    );
  }

  // Calculate Stats
  let totalOwed = 0;
  let totalOwe = 0;

  // Map debts to a dictionary for easy lookup
  const balanceMap: Record<string, number> = {};

  debts?.forEach((debt) => {
    balanceMap[debt.owedTo.id] = debt.totalAmount;
    if (debt.totalAmount < 0) {
      totalOwed += Math.abs(debt.totalAmount);
    } else {
      totalOwe += debt.totalAmount;
    }
  });

  const filteredFriends = friends?.filter(
    (f) =>
      f.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Friends</h1>
          <p className="text-muted-foreground">
            Manage your friends and balances
          </p>
        </div>
        <AddFriend />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card/50 border-green-500/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total you're owed
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              ₹{totalOwed.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-destructive/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total you owe
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <ArrowDownLeft className="h-4 w-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">
              ₹{totalOwe.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total friends
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{friends?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search friends..."
          className="pl-10 h-12 bg-card/50"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Friends Grid */}
      <Card className="bg-transparent border-0 shadow-none">
        <CardContent className="p-0">
          {filteredFriends && filteredFriends.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredFriends.map((friend) => {
                const balance = balanceMap[friend.id] || 0;
                return (
                  <div
                    key={friend.id}
                    className="group flex items-center justify-between p-4 rounded-xl border bg-card/50 hover:bg-card hover:border-primary/50 transition-all duration-200 shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-transparent group-hover:border-primary/20 transition-colors">
                        <AvatarImage src={friend.avatar_url || ""} />
                        <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
                          {friend.full_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="font-semibold leading-none">
                          {friend.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {friend.email}
                        </p>
                        {/* Optional: Add 'x expenses' badge here if data available */}
                      </div>
                    </div>

                    <div className="text-right">
                      {balance === 0 ? (
                        <Badge
                          variant="secondary"
                          className="bg-secondary/50 text-muted-foreground font-normal"
                        >
                          Settled up
                        </Badge>
                      ) : (
                        <>
                          <div
                            className={`text-lg font-bold ${
                              balance > 0
                                ? "text-destructive"
                                : "text-green-500"
                            }`}
                          >
                            {balance > 0 ? "-" : "+"}₹
                            {Math.abs(balance).toFixed(2)}
                          </div>
                          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                            {balance > 0 ? "you owe" : "owes you"}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-card/30 rounded-xl border border-dashed">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-medium">No friends found</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Try a different search term or add a new friend.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
