import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AvatarUpload } from "@/components/profile/AvatarUpload";

export function Profile() {
  return (
    <div className="space-y-6 max-w-lg mx-auto mt-10">
      <h1 className="text-3xl font-bold tracking-tight text-center">
        Your Profile
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>
            Manage your profile picture and settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <AvatarUpload />

          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground text-center">
              More settings coming soon...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
