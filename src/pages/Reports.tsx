import { useState } from "react";
import { useReportData } from "@/hooks/useReportData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { ReportsOverview } from "@/components/reports/ReportsOverview";
import { ReportsGroups } from "@/components/reports/ReportsGroups";
import { ReportsCategories } from "@/components/reports/ReportsCategories";
import { ReportsTime } from "@/components/reports/ReportsTime";
import { ReportsPeople } from "@/components/reports/ReportsPeople";
import { ReportsInsights } from "@/components/reports/ReportsInsights";
import { ReportsSettlements } from "@/components/reports/ReportsSettlements";

export function Reports() {
  const { data: expenses, isLoading } = useReportData();
  const [activeTab, setActiveTab] = useState("overview");

  const downloadCSV = () => {
    if (!expenses || expenses.length === 0) return;

    // Header
    const headers = [
      "Date",
      "Description",
      "Amount",
      "Category",
      "Paid By",
      "Group",
    ];
    const rows = expenses.map((e) => [
      new Date(e.date).toLocaleDateString(),
      `"${e.description}"`, // Escape quotes
      e.amount.toFixed(2),
      e.category || "General",
      e.profiles?.full_name || "Unknown",
      e.group?.name || "No Group",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `splitify_report_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const expenseList = expenses || [];

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Financial Reports
          </h1>
          <p className="text-muted-foreground mt-2">
            Advanced analytics and spending insights.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={downloadCSV}
          disabled={expenseList.length === 0}
        >
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-2">
          <TabsList className="w-full justify-start md:justify-center h-auto p-1 bg-muted/50">
            <TabsTrigger value="overview" className="px-4 py-2">
              Overview
            </TabsTrigger>
            <TabsTrigger value="groups" className="px-4 py-2">
              Groups
            </TabsTrigger>
            <TabsTrigger value="categories" className="px-4 py-2">
              Categories
            </TabsTrigger>
            <TabsTrigger value="time" className="px-4 py-2">
              Time
            </TabsTrigger>
            <TabsTrigger value="people" className="px-4 py-2">
              People
            </TabsTrigger>
            <TabsTrigger value="insights" className="px-4 py-2">
              Insights
            </TabsTrigger>
            <TabsTrigger value="settlements" className="px-4 py-2">
              Settlements
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-6">
          <TabsContent value="overview">
            <ReportsOverview expenses={expenseList} />
          </TabsContent>

          <TabsContent value="groups">
            <ReportsGroups expenses={expenseList} />
          </TabsContent>

          <TabsContent value="categories">
            <ReportsCategories expenses={expenseList} />
          </TabsContent>

          <TabsContent value="time">
            <ReportsTime expenses={expenseList} />
          </TabsContent>

          <TabsContent value="people">
            <ReportsPeople expenses={expenseList} />
          </TabsContent>

          <TabsContent value="insights">
            <ReportsInsights expenses={expenseList} />
          </TabsContent>

          <TabsContent value="settlements">
            <ReportsSettlements expenses={expenseList} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
