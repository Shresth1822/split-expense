import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Features() {
  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert">
            <p className="text-lg text-muted-foreground">
              Discover what makes Splitify the best way to manage shared
              expenses.
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>
                <strong>Expense Tracking:</strong> Easily add and organize
                expenses.
              </li>
              <li>
                <strong>Group Management:</strong> Create groups for trips,
                households, and more.
              </li>
              <li>
                <strong>Smart Splitting:</strong> Split equally, unequally, by
                percentage, or by shares.
              </li>
              <li>
                <strong>Debt Simplification:</strong> Minimize the number of
                transactions needed to settle up.
              </li>
              <li>
                <strong>Activity Feed:</strong> Keep track of who paid what and
                when.
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
