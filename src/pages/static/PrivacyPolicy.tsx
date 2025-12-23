import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PrivacyPolicy() {
  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert space-y-4">
            <p className="text-muted-foreground">Last updated: December 2025</p>
            <p>
              Your privacy is important to us. It is Splitify's policy to
              respect your privacy regarding any information we may collect from
              you across our website.
            </p>
            <h3 className="text-xl font-bold">Information We Collect</h3>
            <p>
              We only ask for personal information when we truly need it to
              provide a service to you. We collect it by fair and lawful means,
              with your knowledge and consent.
            </p>
            <h3 className="text-xl font-bold">How We Use Information</h3>
            <p>
              We use the information we collect to operate and maintain our
              Splitify service, including authenticating you, managing your
              groups and expenses, and improving our application.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
