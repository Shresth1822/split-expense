import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  MessageSquare,
  Receipt,
  Calendar,
  Users,
  MoreHorizontal,
  Plus,
  Link as LinkIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Group, GroupMember, Profile } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

import { useFriends } from "@/hooks/useFriends";
import { AddExpense } from "@/components/expenses/AddExpense";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ExpenseComments } from "@/components/expenses/ExpenseComments";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { EditExpense } from "@/components/expenses/EditExpense";
import { useAuth } from "@/context/AuthContext";
import { GroupSettingsDialog } from "@/components/groups/GroupSettingsDialog";

type GroupDetails = Group & {
  group_members: (GroupMember & {
    profiles: Profile;
  })[];
  expenses?: (import("@/types").Expense & {
    profiles: Profile;
  })[];
};

export function GroupDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editingExpense, setEditingExpense] = useState<string | null>(null);

  const { data: friends } = useFriends();

  const { data: group, isLoading } = useQuery({
    queryKey: ["group", id],
    queryFn: async () => {
      if (!id) throw new Error("No ID");
      const { data, error } = await supabase
        .from("groups")
        .select(
          `
          *,
          group_members (
            *,
            profiles:user_id (*)
          ),
          expenses (
            *,
            profiles:paid_by (*)
          )
        `
        )
        .eq("id", id)
        .order("date", { foreignTable: "expenses", ascending: false })
        .single();

      if (error) throw error;
      return data as GroupDetails;
    },
    enabled: !!id,
  });

  const addMember = useMutation({
    mutationFn: async (email: string) => {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();

      if (profileError || !profile) {
        throw new Error("User not found. They must register first.");
      }

      const { error: memberError } = await supabase
        .from("group_members")
        .insert({
          group_id: id,
          user_id: profile.id,
        });

      if (memberError) throw memberError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", id] });
      toast.success("Member added successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add member");
    },
  });

  const deleteExpense = useMutation({
    mutationFn: async (expenseId: string) => {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", expenseId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", id] });
      queryClient.invalidateQueries({ queryKey: ["balances"] });
      queryClient.invalidateQueries({ queryKey: ["recent-activity"] });
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      toast.success("Expense deleted successfully");
    },
    onError: (error: any) => {
      console.error("Failed to delete expense:", error);
      toast.error(error.message || "Failed to delete expense");
    },
  });

  const addFriend = useMutation({
    mutationFn: async (friendId: string) => {
      // Check if already friends via RLS or duplicate logic, but simple insert works often
      const { error } = await supabase.from("friendships").insert({
        user_id: user?.id,
        friend_id: friendId,
        status: "pending", // Explicitly pending
      });

      if (error) {
        if (error.code === "23505") {
          throw new Error("Friend request already sent.");
        }
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Friend request sent!");
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
    onError: (err: any) => {
      toast.error("Failed to send request: " + err.message);
    },
  });

  if (isLoading)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading group details...
      </div>
    );
  if (!group)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Group not found
      </div>
    );

  const totalExpenses =
    group.expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;

  const availableFriends = friends?.filter(
    (friend) =>
      !group.group_members.some((member) => member.user_id === friend.id) &&
      friend.status === "accepted"
  );

  return (
    <div className="space-y-8">
      {/* Header / Hero */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Link
            to="/groups"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <div className="flex items-center gap-1 text-sm font-medium">
              <ArrowLeft className="h-4 w-4" /> Back to Groups
            </div>
          </Link>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 p-8 text-white shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-end gap-6">
            <div>
              <Badge
                variant="secondary"
                className="mb-2 bg-white/20 hover:bg-white/30 text-white border-0"
              >
                {group.group_members.length} Members
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                {group.name}
              </h1>
              <div className="flex items-center gap-2 text-violet-100">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">
                  Created {new Date(group.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-violet-100 font-medium mb-1">Total Expenses</p>
              <h2 className="text-4xl font-bold tracking-tight">
                ₹{totalExpenses.toFixed(2)}
              </h2>
            </div>
          </div>
          {/* Abstract Background Shapes */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-black/10 blur-3xl"></div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_300px]">
        {/* Main Content: Expenses */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Receipt className="h-5 w-5" /> Expenses
            </h3>
            <AddExpense groupId={id!} members={group.group_members} />
          </div>

          <Card className="bg-card/50 border-0 shadow-none">
            <CardContent className="p-0">
              {group.expenses && group.expenses.length > 0 ? (
                <div className="space-y-3">
                  {group.expenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border bg-card hover:border-primary/50 transition-all duration-200 shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center text-primary border border-primary/20">
                          <span className="text-xs font-bold uppercase">
                            {new Date(expense.date).toLocaleString("default", {
                              month: "short",
                            })}
                          </span>
                          <span className="text-lg font-bold leading-none">
                            {new Date(expense.date).getDate()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-base">
                            {expense.description}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <span className="font-medium text-foreground/80">
                              {expense.profiles?.full_name?.split(" ")[0] ||
                                "Unknown"}
                            </span>{" "}
                            paid
                            <span className="font-bold text-foreground mx-1">
                              ₹{expense.amount.toFixed(2)}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 mt-3 sm:mt-0 w-full sm:w-auto">
                        <div className="text-right hidden sm:block">
                          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block">
                            Total
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 p-0 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                              >
                                <MessageSquare className="h-4 w-4" />
                                <span className="sr-only">Comments</span>
                              </Button>
                            </SheetTrigger>
                            <SheetContent>
                              <SheetHeader>
                                <SheetTitle>Comments</SheetTitle>
                                <SheetDescription>
                                  Discuss details for{" "}
                                  <strong>{expense.description}</strong>
                                </SheetDescription>
                              </SheetHeader>
                              <div className="mt-4 h-[calc(100vh-10rem)]">
                                <ExpenseComments expenseId={expense.id} />
                              </div>
                            </SheetContent>
                          </Sheet>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 p-0 rounded-full"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setEditingExpense(expense.id)}
                                className="cursor-pointer"
                              >
                                Edit Expense
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive cursor-pointer"
                                onClick={() => deleteExpense.mutate(expense.id)}
                              >
                                Delete Expense
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-card/30 rounded-xl border border-dashed">
                  <Receipt className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <h3 className="text-lg font-medium">No expenses yet</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Add an expense to start tracking group spending.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Members */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Users className="h-5 w-5" /> Members
            </h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const link = `${window.location.origin}/join/${id}`;
                  navigator.clipboard.writeText(link);
                  toast.success("Invite link copied to clipboard!");
                }}
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Invite Link
              </Button>
              {user && (
                <GroupSettingsDialog group={group} currentUserId={user.id} />
              )}
            </div>
          </div>

          <Card className="bg-card/50 shadow-sm border-0">
            <CardContent className="p-4 space-y-6">
              <div className="space-y-3">
                {group.group_members.map((member) => {
                  const friendStatus = friends?.find(
                    (f) => f.id === member.user_id
                  )?.status;

                  const isMe = member.user_id === user?.id;

                  return (
                    <div
                      key={member.user_id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-card transition-colors group"
                    >
                      <Avatar className="h-10 w-10 border-2 border-background">
                        <AvatarImage src={member.profiles.avatar_url || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {member.profiles.full_name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate">
                          {member.profiles.full_name || "User"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {member.profiles.email}
                        </p>
                      </div>

                      {/* Friend Action Buttons */}
                      {!isMe && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          {friendStatus === "accepted" ? (
                            <Badge
                              variant="outline"
                              className="text-[10px] text-green-600 border-green-200 bg-green-50"
                            >
                              Friend
                            </Badge>
                          ) : friendStatus === "pending" ? (
                            <Badge
                              variant="outline"
                              className="text-[10px] text-yellow-600 border-yellow-200 bg-yellow-50"
                            >
                              Sent
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                              title="Add Friend"
                              disabled={addFriend.isPending}
                              onClick={() => addFriend.mutate(member.user_id)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {availableFriends && availableFriends.length > 0 && (
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-3">Add Member</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                    {availableFriends.map((friend) => (
                      <div
                        key={friend.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-card/50 border hover:bg-card transition-colors"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={friend.avatar_url || ""} />
                            <AvatarFallback className="text-[10px]">
                              {friend.full_name?.[0] || "F"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm truncate">
                            {friend.full_name || friend.email}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => {
                            if (friend.email) {
                              addMember.mutate(friend.email);
                            }
                          }}
                          disabled={addMember.isPending}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Expense Modal */}
      {editingExpense && (
        <EditExpense
          expenseId={editingExpense}
          groupId={id!}
          members={group.group_members}
          isOpen={!!editingExpense}
          onClose={() => setEditingExpense(null)}
        />
      )}
    </div>
  );
}
