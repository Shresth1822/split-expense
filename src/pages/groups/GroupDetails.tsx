import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  UserPlus,
  MessageSquare,
  Receipt,
  Calendar,
  Users,
  MoreHorizontal,
  Settings,
  Plus,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Group, GroupMember, Profile } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState("");

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
      setInviteEmail("");
      setInviteError("");
    },
    onError: (err: any) => {
      setInviteError(err.message);
    },
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    addMember.mutate(inviteEmail);
  };

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
    },
    onError: (error) => {
      console.error("Failed to delete expense:", error);
      alert("Failed to delete expense. You might not have permission.");
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
      !group.group_members.some((member) => member.user_id === friend.id)
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
                              <DropdownMenuItem disabled>
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
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          <Card className="bg-card/50 shadow-sm border-0">
            <CardContent className="p-4 space-y-6">
              <div className="space-y-3">
                {group.group_members.map((member) => (
                  <div
                    key={member.user_id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-card transition-colors"
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
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">Add Member</h4>
                <form onSubmit={handleInvite} className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Email address"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="bg-background"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={addMember.isPending}
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                  {inviteError && (
                    <p className="text-xs text-destructive mt-1">
                      {inviteError}
                    </p>
                  )}
                </form>

                {availableFriends && availableFriends.length > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    <h4 className="text-sm font-medium mb-3 text-muted-foreground">
                      Add from Friends
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
