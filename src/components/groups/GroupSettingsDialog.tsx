import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Settings, Trash2, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import type { Group, GroupMember, Profile } from "@/types";

interface GroupSettingsDialogProps {
  group: Group & {
    group_members: (GroupMember & {
      profiles: Profile;
    })[];
  };
  currentUserId: string;
}

export function GroupSettingsDialog({
  group,
  currentUserId,
}: GroupSettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState(group.name);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const isCreator = group.created_by === currentUserId;

  const updateGroup = useMutation({
    mutationFn: async (newName: string) => {
      const { error } = await supabase
        .from("groups")
        .update({ name: newName })
        .eq("id", group.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", group.id] });
      toast.success("Group updated successfully");
      setOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update group");
    },
  });

  const deleteGroup = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("groups")
        .delete()
        .eq("id", group.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Group deleted successfully");
      navigate("/groups");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete group");
    },
  });

  const removeMember = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("group_id", group.id)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", group.id] });
      toast.success("Member removed successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove member");
    },
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    updateGroup.mutate(groupName);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Group Settings</DialogTitle>
          <DialogDescription>
            Manage group details and members here.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Rename Group */}
          <form onSubmit={handleUpdate} className="space-y-2">
            <Label htmlFor="name">Group Name</Label>
            <div className="flex gap-2">
              <Input
                id="name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
              <Button type="submit" disabled={updateGroup.isPending}>
                Save
              </Button>
            </div>
          </form>

          {/* Member Management */}
          <div className="space-y-2">
            <Label>Members</Label>
            <div className="rounded-md border p-2 space-y-2 max-h-[200px] overflow-y-auto">
              {group.group_members.map((member) => (
                <div
                  key={member.user_id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={member.profiles.avatar_url || ""} />
                      <AvatarFallback className="text-[10px]">
                        {member.profiles.full_name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col truncate">
                      <span className="text-sm font-medium truncate">
                        {member.profiles.full_name}
                      </span>
                      {member.user_id === group.created_by && (
                        <span className="text-[10px] text-muted-foreground">
                          Owner
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Allow removing if: 1. Current user is creator AND 2. Member is not the creator */}
                  {isCreator && member.user_id !== group.created_by && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeMember.mutate(member.user_id)}
                      disabled={removeMember.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Delete Group - Only for Creator */}
          {isCreator && (
            <div className="pt-4 border-t">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Group
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the group and remove all expense history.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteGroup.mutate()}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
