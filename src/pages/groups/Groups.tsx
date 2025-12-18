import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Group } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";

export function Groups() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const { data: groups, isLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("groups")
        .select(
          `
          *,
          group_members!inner (user_id)
        `
        )
        .eq("group_members.user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Group[];
    },
  });

  const createGroup = useMutation({
    mutationFn: async (name: string) => {
      // 1. Create Group
      const { data: group, error: groupError } = await supabase
        .from("groups")
        .insert({
          name,
          created_by: user?.id,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // 2. Add creator as member
      const { error: memberError } = await supabase
        .from("group_members")
        .insert({
          group_id: group.id,
          user_id: user?.id,
        });

      if (memberError) throw memberError;

      return group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setIsCreating(false);
      setNewGroupName("");
    },
  });

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    createGroup.mutate(newGroupName);
  };

  if (isLoading) {
    return <div className="p-4">Loading groups...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Your Groups</h1>
        <Button onClick={() => setIsCreating(true)} className="gap-2">
          <Plus className="h-4 w-4" /> New Group
        </Button>
      </div>

      {isCreating && (
        <Card>
          <form onSubmit={handleCreateGroup}>
            <CardHeader>
              <CardTitle>Create New Group</CardTitle>
              <CardDescription>
                Give your group a name to get started.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name">Group Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Trip to Paris, Flat 304"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="ghost"
                type="button"
                onClick={() => setIsCreating(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createGroup.isPending}>
                {createGroup.isPending ? "Creating..." : "Create Group"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups?.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground p-10 border rounded-lg border-dashed">
            No groups found. Create one to get started!
          </div>
        ) : (
          groups?.map((group) => (
            <Link key={group.id} to={`/groups/${group.id}`}>
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xl font-medium">
                    {group.name}
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    Created {new Date(group.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

export default Groups;
