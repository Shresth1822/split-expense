import { supabase } from "@/lib/supabase";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { type Friend } from "@/hooks/useFriends";
import { useAuth } from "@/context/AuthContext";

interface FriendRequestsProps {
  requests: Friend[];
}

export function FriendRequests({ requests }: FriendRequestsProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const handleRequestMutation = useMutation({
    mutationFn: async ({
      friendId,
      action,
    }: {
      friendId: string;
      action: "accept" | "reject";
    }) => {
      if (action === "accept") {
        const { error } = await supabase
          .from("friendships")
          .update({ status: "accepted" })
          .eq("user_id", friendId) // The SENDER is the user_id (the one who sent request)
          .eq("friend_id", user?.id); // I am the friend_id (recipient)

        if (error) throw error;
      } else {
        // Rejecting means deleting the request rows
        // We delete where I am friend_id AND they are user_id
        const { error } = await supabase
          .from("friendships")
          .delete()
          .eq("user_id", friendId)
          .eq("friend_id", user?.id);

        if (error) throw error;
      }
    },
    onSuccess: (_, { action }) => {
      toast.success(
        action === "accept"
          ? "Friend request accepted!"
          : "Friend request rejected"
      );
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
    onError: (error) => {
      toast.error("Failed to process request: " + error.message);
    },
  });

  if (requests.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground bg-card/30 rounded-xl border border-dashed text-sm">
        No pending friend requests
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {requests.map((request) => (
        <div
          key={request.id}
          className="flex items-center justify-between p-4 rounded-xl border bg-card/50 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={request.avatar_url || ""} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {request.full_name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{request.full_name}</p>
              <p className="text-xs text-muted-foreground">{request.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
              onClick={() =>
                handleRequestMutation.mutate({
                  friendId: request.id,
                  action: "accept",
                })
              }
              disabled={handleRequestMutation.isPending}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={() =>
                handleRequestMutation.mutate({
                  friendId: request.id,
                  action: "reject",
                })
              }
              disabled={handleRequestMutation.isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
