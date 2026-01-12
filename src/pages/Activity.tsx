import { useRecentActivity } from "@/hooks/useRecentActivity";
import { ActivityItem } from "@/components/activity/ActivityItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react";

export function Activity() {
  const { data: activity, isLoading } = useRecentActivity(50); // Fetch last 50 items

  if (isLoading) {
    return <div className="p-8">Loading activity...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Recent Activity
        </h1>
        <p className="text-muted-foreground">
          View your latest expenses and settlements
        </p>
      </div>

      <Card className="bg-card/50 shadow-sm border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" /> All Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-md border bg-card/50 divide-y">
            {activity && activity.length > 0 ? (
              activity.map((item: any) => (
                <ActivityItem key={item.id} item={item} />
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                No activity found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
