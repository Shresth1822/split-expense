import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export interface Friend {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url?: string | null;
}

export function useFriends() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["friends", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];

      // 1. Get all groups I am a member of
      const { data: myGroups } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id);

      const groupIds = myGroups?.map((g) => g.group_id) || [];

      // 2. Get all members of those groups (excluding me)
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

      // 3. Get explicit friends
      const { data: explicitFriends } = await supabase
        .from("friendships")
        .select(
          `
          friend_id,
          profiles:friend_id (id, full_name, email, avatar_url)
        `
        )
        .eq("user_id", user.id);

      // 4. Deduplicate users
      const uniqueFriendsMap = new Map<string, Friend>();

      groupMembers.forEach((member: any) => {
        if (member.profiles) {
          uniqueFriendsMap.set(member.profiles.id, member.profiles);
        }
      });

      explicitFriends?.forEach((friend: any) => {
        if (friend.profiles) {
          uniqueFriendsMap.set(friend.profiles.id, friend.profiles);
        }
      });

      return Array.from(uniqueFriendsMap.values());
    },
  });
}
