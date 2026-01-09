import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function AddFriend() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const queryClient = useQueryClient();

  const addFriendMutation = useMutation({
    mutationFn: async (friendEmail: string) => {
      // 1. Find user by email
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", friendEmail.trim())
        .single();

      if (profileError || !profiles) {
        throw new Error("User not found with this email.");
      }

      if (profiles.id === user?.id) {
        throw new Error("You cannot add yourself as a friend.");
      }

      // 2. Check if already friends (optional, but good practice)
      // Supabase insert will fail on primary key violation if redundant, which is fine to catch.

      // 3. Insert friendship
      const { error } = await supabase.from("friendships").insert({
        user_id: user?.id,
        friend_id: profiles.id,
      });

      if (error) {
        if (error.code === "23505") {
          throw new Error("You are already friends with this user.");
        }
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Friend request sent!");
      setOpen(false);
      setEmail("");
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    addFriendMutation.mutate(email);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Friend
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a Friend</DialogTitle>
          <DialogDescription>
            Enter the email address of the person you want to add.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="friend@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                addFriendMutation.reset(); // Clear error on type
              }}
              required
            />
          </div>
          {addFriendMutation.isError && (
            <p className="text-sm text-red-500 font-medium">
              {addFriendMutation.error.message}
            </p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={addFriendMutation.isPending}>
              {addFriendMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Send Friend Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
