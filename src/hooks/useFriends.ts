import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export interface Friend {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url?: string | null;
  status: "accepted" | "pending"; // Added status
  request_direction?: "sent" | "received"; // Added to know filter logic
  is_explicit: boolean; // Added to distinguish explicit friends from group contacts
}

export function useFriends() {
  const { user } = useAuth();
  const queryClient = useQueryClient(); // Add queryClient mainly for consistency if needed, but not used here directly

  return useQuery({
    queryKey: ["friends", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];

      // 1. Get all groups I am a member of (To find "Group Friends")
      const { data: myGroups } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id);

      const groupIds = myGroups?.map((g) => g.group_id) || [];

      // 2. Get all members of those groups (excluding me) - These are implicitly "accepted" friends or contacts
      let groupMembers: any[] = [];
      if (groupIds.length > 0) {
        const { data: members } = await supabase
          .from("group_members")
          .select(
            `
            user_id,
            profiles:user_id (id, full_name, email, avatar_url)
          `
          )
          .in("group_id", groupIds)
          .neq("user_id", user.id);
        groupMembers = members || [];
      }

      // 3. Get explicit friends (BOTH accepted AND pending)
      // We need to check both directions: where I am user_id OR friend_id
      const { data: explicitFriends } = await supabase
        .from("friendships")
        .select(
          `
            user_id,
            friend_id,
            status,
            friend:friend_id (id, full_name, email, avatar_url),
            user:user_id (id, full_name, email, avatar_url)
            `
        )
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`); // Get all relationships involving me

      // 4. Mappify users
      const uniqueFriendsMap = new Map<string, Friend>();

      // A. Process Group Members (Implicit Friends - treated as accepted for now, or just contacts)
      groupMembers.forEach((member: any) => {
        if (member.profiles) {
          uniqueFriendsMap.set(member.profiles.id, {
            ...member.profiles,
            status: "accepted", // Implicitly accepted if in same group
            is_explicit: false,
          });
        }
      });

      // B. Process Explicit Friendships (Overwrites implicit if exists, providing more accurate status)
      explicitFriends?.forEach((rel: any) => {
        const isMeSender = rel.user_id === user.id;
        const otherProfile = isMeSender ? rel.friend : rel.user;

        if (otherProfile) {
          const direction = isMeSender ? "sent" : "received";
          uniqueFriendsMap.set(otherProfile.id, {
            ...otherProfile,
            status: rel.status,
            request_direction: direction,
            is_explicit: true,
          });
        }
      });

      return Array.from(uniqueFriendsMap.values());
    },
  });
}
