import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users } from "lucide-react";

export function Friends() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Friends</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Friends</CardTitle>
          <CardDescription>
            Manage your friends and see who you split expenses with.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-10 text-muted-foreground">
          <Users className="h-10 w-10 mx-auto mb-4 opacity-20" />
          <p>Friend management coming soon!</p>
          <p className="text-sm">
            For now, simply add people to groups to split expenses.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
