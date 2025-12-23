import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CookiePolicy() {
  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Cookie Policy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert space-y-4">
            <p className="text-muted-foreground">Last updated: December 2025</p>
            <p>
              This is the Cookie Policy for Splitify, accessible from
              splitify.space.
            </p>
            <h3 className="text-xl font-bold">What Are Cookies</h3>
            <p>
              As is common practice with almost all professional websites this
              site uses cookies, which are tiny files that are downloaded to
              your computer, to improve your experience.
            </p>
            <h3 className="text-xl font-bold">How We Use Cookies</h3>
            <p>
              We use cookies for a variety of reasons detailed below.
              Unfortunately in most cases there are no industry standard options
              for disabling cookies without completely disabling the
              functionality and features they add to this site.
            </p>
            <p>
              We use cookies to manage your login session and authentication
              state.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
