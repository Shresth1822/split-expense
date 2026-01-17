import { useQuery } from "@tanstack/react-query";
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
  // const queryClient = useQueryClient(); // Unused

  return useQuery({
    queryKey: ["friends", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];

      // 1. Get explicit friends (BOTH accepted AND pending)
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

      // 2. Mappify users
      const uniqueFriendsMap = new Map<string, Friend>();

      // Process Explicit Friendships
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
