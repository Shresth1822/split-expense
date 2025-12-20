import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
    avatar_url: string;
    email: string;
  };
}

interface ExpenseCommentsProps {
  expenseId: string;
}

export function ExpenseComments({ expenseId }: ExpenseCommentsProps) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch Comments
  const { data: comments, isLoading } = useQuery({
    queryKey: ["comments", expenseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expense_comments")
        .select(
          `
                    id,
                    content,
                    created_at,
                    user_id,
                    profiles:user_id (full_name, avatar_url, email)
                `
        )
        .eq("expense_id", expenseId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as unknown as Comment[]; // Type casting for joined data
    },
  });

  // Add Comment Mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("expense_comments").insert({
        expense_id: expenseId,
        user_id: user.id,
        content: content.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["comments", expenseId] });
      // Scroll to bottom
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    },
    onError: (error) => {
      toast.error("Failed to add comment");
      console.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addCommentMutation.mutate(newComment);
  };

  // Scroll to bottom on load
  useEffect(() => {
    if (comments && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
        <div className="space-y-4 py-4">
          {comments?.length === 0 && (
            <p className="text-center text-sm text-muted-foreground italic">
              No comments yet. Start the conversation!
            </p>
          )}
          {comments?.map((comment) => {
            const isMe = comment.user_id === user?.id;
            return (
              <div
                key={comment.id}
                className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.profiles?.avatar_url} />
                  <AvatarFallback>
                    {comment.profiles?.full_name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`flex flex-col max-w-[80%] ${
                    isMe ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`px-3 py-2 rounded-lg text-sm ${
                      isMe ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    {comment.content}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1">
                    {comment.profiles?.full_name} •{" "}
                    {formatDistanceToNow(new Date(comment.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="pt-4 mt-auto flex gap-2 w-full">
        <Input
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={addCommentMutation.isPending}
          className="flex-1"
        />
        <Button
          type="submit"
          size="icon"
          disabled={addCommentMutation.isPending || !newComment.trim()}
        >
          {addCommentMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
