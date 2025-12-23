import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQ() {
  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Is SplitExpense free?</AccordionTrigger>
              <AccordionContent>
                Yes! Splitify is currently completely free to use for all
                personal groups.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How do I settle a debt?</AccordionTrigger>
              <AccordionContent>
                You can settle up with a friend directly from the Dashboard or
                within a specific group.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>
                Can I split expenses unequally?
              </AccordionTrigger>
              <AccordionContent>
                Absolutely. You can choose to split expenses equally, by exact
                amounts, or by percentages.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
