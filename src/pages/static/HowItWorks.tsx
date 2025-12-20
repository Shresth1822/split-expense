import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function HowItWorks() {
  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">How it Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert">
            <p className="text-lg text-muted-foreground">
              Getting started with SplitExpense is simple.
            </p>
            <ol className="list-decimal pl-6 space-y-4 mt-4">
              <li>
                <strong>Create a Group:</strong> Start by creating a group for a
                trip, house, or event.
              </li>
              <li>
                <strong>Add Friends:</strong> Invite your friends to join the
                group via email.
              </li>
              <li>
                <strong>Add Expenses:</strong> whenever someone pays for
                something, add it to the group.
              </li>
              <li>
                <strong>Settle Up:</strong> At the end of the month or trip, see
                who owes whom and settle debts instantly.
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
