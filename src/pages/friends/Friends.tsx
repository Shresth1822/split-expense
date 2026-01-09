import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  Clock,
} from "lucide-react";
import { useFriends } from "@/hooks/useFriends";
import { useDebtBreakdown } from "@/hooks/useDebtBreakdown";
import { AddFriend } from "@/components/friends/AddFriend";
import { FriendRequests } from "@/components/friends/FriendRequests";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { UserMinus } from "lucide-react";

export function Friends() {
  const { data: allFriends, isLoading: friendsLoading } = useFriends();
  const { data: debts, isLoading: debtsLoading } = useDebtBreakdown();
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const deleteFriendMutation = useMutation({
    mutationFn: async (friendId: string) => {
      // Delete records where I am user_Id OR friend_id
      const { error } = await supabase
        .from("friendships")
        .delete()
        .or(
          `and(user_id.eq.${user?.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user?.id})`
        );

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Friend removed");
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
    onError: (error) => {
      toast.error("Failed to remove friend: " + error.message);
    },
  });

  if (friendsLoading || debtsLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading friends...
      </div>
    );
  }

  // Filter Friends vs Requests
  const acceptedFriends =
    allFriends?.filter((f) => f.status === "accepted") || [];
  const incomingRequests =
    allFriends?.filter(
      (f) => f.status === "pending" && f.request_direction === "received"
    ) || [];

  // Also track sent requests if needed, but for now just incoming + accepted
  const sentRequests =
    allFriends?.filter(
      (f) => f.status === "pending" && f.request_direction === "sent"
    ) || [];

  // Calculate Stats (Only for accepted friends)
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

  const filteredAcceptedFriends = acceptedFriends.filter(
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

      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-6">
          <TabsTrigger value="friends">
            My Friends ({acceptedFriends.length})
          </TabsTrigger>
          <TabsTrigger value="requests">
            Requests
            {incomingRequests.length > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 h-5 px-1.5 rounded-full text-xs"
              >
                {incomingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="space-y-8">
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
                <div className="text-3xl font-bold">
                  {acceptedFriends.length}
                </div>
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
              {filteredAcceptedFriends.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredAcceptedFriends.map((friend) => {
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
                          </div>
                        </div>

                        <div className="text-right flex items-center gap-4">
                          {/* Balance Display */}
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

                          {/* Remove Friend Action (Only for explicit friends) */}
                          {friend.is_explicit && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  >
                                    <UserMinus className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Remove Friend?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove{" "}
                                      <strong>{friend.full_name}</strong> from
                                      your friends list? This will not delete
                                      their expense history.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      onClick={() =>
                                        deleteFriendMutation.mutate(friend.id)
                                      }
                                    >
                                      Remove
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
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

          {/* Sent Requests List (Optional Section) */}
          {sentRequests.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4" /> Sent Requests
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 opacity-70">
                {sentRequests.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20"
                  >
                    <Avatar className="h-8 w-8 opacity-70">
                      <AvatarFallback>
                        {req.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                      <p className="font-medium">{req.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Request Sent
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests">
          <Card className="bg-transparent border-0 shadow-none">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg">Incoming Requests</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <FriendRequests requests={incomingRequests} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
