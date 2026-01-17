import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function JoinGroup() {
  const { groupId } = useParams<{ groupId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"checking" | "joining" | "error">(
    "checking"
  );
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function handleJoin() {
      if (!user || !groupId) return;

      try {
        // 1. Verify Group Exists
        const { data: group, error: groupError } = await supabase
          .from("groups")
          .select("name")
          .eq("id", groupId)
          .single();

        if (groupError || !group) {
          setStatus("error");
          setErrorMsg("Group not found or link is invalid.");
          return;
        }

        // 2. Check if already a member
        const { data: membership, error: _memberCheckError } = await supabase
          .from("group_members")
          .select("group_id")
          .eq("group_id", groupId)
          .eq("user_id", user.id)
          .single(); // .single() returns error if no rows found (which is good here)

        if (membership) {
          // Already a member
          toast.info(`You are already a member of "${group.name}"`);
          navigate(`/groups/${groupId}`);
          return;
        }

        // 3. Join Group
        setStatus("joining");
        const { error: joinError } = await supabase
          .from("group_members")
          .insert({
            group_id: groupId,
            user_id: user.id,
          });

        if (joinError) throw joinError;

        toast.success(`Successfully joined "${group.name}"!`);
        navigate(`/groups/${groupId}`);
      } catch (err: any) {
        console.error("Join Group Error:", err);
        setStatus("error");
        setErrorMsg(err.message || "Failed to join group.");
      }
    }

    handleJoin();
  }, [user, groupId, navigate]);

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
        <h2 className="text-2xl font-bold text-destructive mb-2">Error</h2>
        <p className="text-muted-foreground mb-6">{errorMsg}</p>
        <button
          onClick={() => navigate("/groups")}
          className="text-primary underline hover:text-primary/80"
        >
          Go back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <h2 className="text-xl font-medium">
        {status === "checking" ? "Checking invitation..." : "Joining group..."}
      </h2>
      <p className="text-muted-foreground text-sm">
        Please wait while we set things up.
      </p>
    </div>
  );
}
