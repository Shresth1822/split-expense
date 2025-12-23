import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TermsOfService() {
  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Terms of Service</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert space-y-4">
            <p className="text-muted-foreground">Last updated: December 2025</p>
            <p>
              By accessing the website at Splitify, you are agreeing to be bound
              by these terms of service, all applicable laws and regulations,
              and agree that you are responsible for compliance with any
              applicable local laws.
            </p>
            <h3 className="text-xl font-bold">Use License</h3>
            <p>
              Permission is granted to temporarily download one copy of the
              materials (information or software) on Splitify's website for
              personal, non-commercial transitory viewing only.
            </p>
            <h3 className="text-xl font-bold">Disclaimer</h3>
            <p>
              The materials on Splitify's website are provided on an 'as is'
              basis. Splitify makes no warranties, expressed or implied, and
              hereby disclaims and negates all other warranties including,
              without limitation, implied warranties or conditions of
              merchantability, fitness for a particular purpose, or
              non-infringement of intellectual property or other violation of
              rights.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
