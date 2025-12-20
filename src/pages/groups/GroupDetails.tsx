import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Group, GroupMember, Profile } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AddExpense } from "@/components/expenses/AddExpense";

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
      // 1. Find user by email (Simplified: requires specific Supabase setup or edge function usually,
      // but for this demo we'll try to find in profiles directly if RLS allows,
      // OR we just rely on the user existing in auth. In a real app, this is an invitation flow.)

      // NOTE: Querying profiles by email might be RLS restricted.
      // For this "Resume Project", we will assume we can find the profile ID from the public profiles table.
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

  if (isLoading)
    return <div className="p-8 text-center">Loading group details...</div>;
  if (!group) return <div className="p-8 text-center">Group not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/groups">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
          <p className="text-muted-foreground">
            {group.group_members.length} members
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Expenses</CardTitle>
              <AddExpense groupId={id!} members={group.group_members} />
            </CardHeader>
            <CardContent>
              {group.expenses && group.expenses.length > 0 ? (
                <div className="space-y-4">
                  {group.expenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{expense.description}</p>
                        <p className="text-sm text-muted-foreground">
                          Paid by {expense.profiles?.full_name || "Unknown"} •{" "}
                          {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="font-bold text-lg">
                        ₹{expense.amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8 border rounded-lg border-dashed">
                  No expenses yet. Add one to get started!
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Members</CardTitle>
              <CardDescription>Manage who is in this group</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {group.group_members.map((member) => (
                  <div
                    key={member.user_id}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
                      {member.profiles.full_name?.[0] ||
                        member.profiles.email?.[0]}
                    </div>
                    <div className="overflow-hidden">
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

              <div className="border-t pt-4">
                <form onSubmit={handleInvite} className="space-y-2">
                  <Label>Add Member by Email</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="email@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
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
                    <p className="text-xs text-destructive">{inviteError}</p>
                  )}
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
