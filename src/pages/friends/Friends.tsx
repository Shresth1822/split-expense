import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Mail } from "lucide-react";
import { useFriends } from "@/hooks/useFriends";
import { AddFriend } from "@/components/friends/AddFriend";

export function Friends() {
  const { data: friends, isLoading } = useFriends();

  if (isLoading) {
    return <div className="p-8">Loading friends...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Friends</h1>
        <AddFriend />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Friends</CardTitle>
          <CardDescription>People you are in groups with.</CardDescription>
        </CardHeader>
        <CardContent>
          {friends && friends.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center space-x-4 rounded-md border p-4"
                >
                  <Avatar>
                    <AvatarImage src={friend.avatar_url || ""} />
                    <AvatarFallback>
                      {friend.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {friend.full_name}
                    </p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="mr-1 h-3 w-3" />
                      {friend.email}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-4 opacity-20" />
              <p>No friends found yet.</p>
              <p className="text-sm">
                Create a group and add members to see them here!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
