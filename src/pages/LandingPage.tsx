import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowRight,
  CheckCircle2,
  Users,
  Wallet,
  Receipt,
  Download,
  ShieldCheck,
  Zap,
  Globe,
  Smartphone,
} from "lucide-react";
import { InstallPWA } from "@/components/pwa/InstallPWA";

export function LandingPage() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is logged in, redirect to Dashboard
  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-1">
              <img
                src="/splitify-logo.png"
                alt="Logo"
                className="h-8 w-8 object-contain"
              />
            </div>
            <span className="text-xl font-bold tracking-tight">Splitify</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden sm:block">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button className="rounded-full px-6">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Abstract Background Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/10 rounded-full blur-[120px]"></div>
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="inline-flex items-center rounded-full border bg-background/50 px-3 py-1 text-sm font-medium backdrop-blur-sm mb-6">
              <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
              v1.0 is now live
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
              Split expenses, <br />
              <span className="text-primary">keep the friendship.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              The smartest way to track bills, settle debts, and manage shared
              expenses. Perfect for trips, roommates, and groups.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button
                  size="lg"
                  className="h-12 px-8 rounded-full text-lg w-full sm:w-auto"
                >
                  Start Splitting Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <div className="w-full sm:w-auto">
                <InstallPWA
                  variant="outline"
                  size="lg"
                  className="h-12 w-full sm:w-auto rounded-full"
                />
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required. Free forever.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Feature Tabs */}
      <section className="py-20 bg-muted/30 border-y">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Built for every situation
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Whether you are travelling the world or just sharing a pizza,
              Splitify adapts to your needs.
            </p>
          </div>

          <Tabs defaultValue="groups" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-muted rounded-full">
              <TabsTrigger
                value="groups"
                className="rounded-full py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Users className="w-4 h-4 mr-2" /> Groups & Trips
              </TabsTrigger>
              <TabsTrigger
                value="expenses"
                className="rounded-full py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Receipt className="w-4 h-4 mr-2" /> Smart Splitting
              </TabsTrigger>
              <TabsTrigger
                value="settle"
                className="rounded-full py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Wallet className="w-4 h-4 mr-2" /> Easy Settlement
              </TabsTrigger>
            </TabsList>

            <div className="mt-8 rounded-2xl border bg-background/50 backdrop-blur-sm p-6 sm:p-10 shadow-xl">
              <TabsContent
                value="groups"
                className="mt-0 focus-visible:outline-none"
              >
                <div className="grid md:grid-cols-2 gap-10 items-center">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold">Organize any trip</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Create groups for your weekend gateways, long vacations,
                      or shared apartments. Add members instantly via invite
                      links.
                    </p>
                    <ul className="space-y-2 pt-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span>Unlimited Groups</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span>Works Offline</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span>Invite via Link</span>
                      </li>
                    </ul>
                  </div>
                  <div className="relative h-64 bg-gradient-to-br from-blue-500/10 to-violet-500/10 rounded-xl border flex items-center justify-center overflow-hidden">
                    {/* Mock UI Element */}
                    <div className="w-48 bg-card rounded-lg shadow-lg border p-4 transform rotate-[-3deg] hover:rotate-0 transition-transform duration-500">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-bold">Trip to Paris</div>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 bg-muted rounded w-3/4"></div>
                        <div className="h-2 bg-muted rounded w-1/2"></div>
                      </div>
                      <div className="mt-4 flex -space-x-2">
                        <div className="w-6 h-6 rounded-full bg-red-400 border-2 border-background"></div>
                        <div className="w-6 h-6 rounded-full bg-blue-400 border-2 border-background"></div>
                        <div className="w-6 h-6 rounded-full bg-green-400 border-2 border-background"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="expenses"
                className="mt-0 focus-visible:outline-none"
              >
                <div className="grid md:grid-cols-2 gap-10 items-center">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold">
                      Limitless Flexibility
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Split bills exactly how you want. Support for equal
                      splits, exact amounts, or percentages.
                    </p>
                    <ul className="space-y-2 pt-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span>Split Equally</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span>Split by Percentage</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span>Split by Shares</span>
                      </li>
                    </ul>
                  </div>
                  <div className="relative h-64 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl border flex items-center justify-center">
                    <div className="w-56 bg-card rounded-lg shadow-lg border p-4 space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span className="font-medium">Dinner</span>
                        <span className="font-bold">₹1,200</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>You paid</span>
                        <span className="text-green-600">₹800</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Sarah owes</span>
                        <span className="text-red-500">₹400</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="settle"
                className="mt-0 focus-visible:outline-none"
              >
                <div className="grid md:grid-cols-2 gap-10 items-center">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold">Simplify Debts</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Splitify uses an algorithm to minimize the number of
                      transactions needed to settle up.
                    </p>
                    <ul className="space-y-2 pt-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span>Minimize Transactions</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span>Record Cash Payments</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span>Real-time Balance</span>
                      </li>
                    </ul>
                  </div>
                  <div className="relative h-64 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border flex items-center justify-center">
                    <div className="text-center">
                      <div className="bg-green-100 text-green-700 p-3 rounded-full inline-block mb-3">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <div className="font-bold text-lg">
                        You are all settled up!
                      </div>
                      <div className="text-sm text-muted-foreground">
                        No pending debts.
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How it works</h2>
            <p className="text-muted-foreground">
              Three steps to financial peace of mind.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="relative p-6 pt-10 border rounded-2xl text-center bg-card hover:shadow-lg transition-shadow">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg">
                1
              </div>
              <h3 className="text-xl font-bold mb-3 mt-4">Create a Group</h3>
              <p className="text-muted-foreground">
                Start a group for your house, trip, or event and invite your
                friends in seconds.
              </p>
            </div>

            <div className="relative p-6 pt-10 border rounded-2xl text-center bg-card hover:shadow-lg transition-shadow">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg">
                2
              </div>
              <h3 className="text-xl font-bold mb-3 mt-4">Add Expenses</h3>
              <p className="text-muted-foreground">
                Enter bills as they happen. We'll handle the math efficiently.
              </p>
            </div>

            <div className="relative p-6 pt-10 border rounded-2xl text-center bg-card hover:shadow-lg transition-shadow">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg">
                3
              </div>
              <h3 className="text-xl font-bold mb-3 mt-4">Settle Up</h3>
              <p className="text-muted-foreground">
                Check who owes who and record payments when you get paid back.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Grid */}
      <section className="py-16 bg-muted/20 border-t">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <ShieldCheck className="w-10 h-10 text-primary" />
              <div className="font-semibold">Secure Data</div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Globe className="w-10 h-10 text-primary" />
              <div className="font-semibold">Web & Mobile</div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Zap className="w-10 h-10 text-primary" />
              <div className="font-semibold">Fast Sync</div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Smartphone className="w-10 h-10 text-primary" />
              <div className="font-semibold">PWA Ready</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-10">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Is Splitify really free?</AccordionTrigger>
              <AccordionContent>
                Yes! Splitify is completely free to use. No hidden fees, no
                subscription models for essential features.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Do I need to download an app?</AccordionTrigger>
              <AccordionContent>
                No download required! Splitify works in your browser. However,
                you can "Install" it to your home screen for a native app-like
                experience (PWA) on iOS and Android.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Can I backdate expenses?</AccordionTrigger>
              <AccordionContent>
                Absolutely. When adding an expense, you can choose any date from
                the past to ensure your records are accurate.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>How do I settle a debt?</AccordionTrigger>
              <AccordionContent>
                Just click "Settle Up" in your dashboard or group view. You can
                record a cash payment or use your preferred payment app
                externally, then log it here.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <img
              src="/splitify-logo.png"
              alt="Logo"
              className="h-6 w-6 grayscale opacity-50"
            />
            <span className="font-bold text-muted-foreground">Splitify</span>
          </div>
          <div className="flex gap-8 text-sm text-muted-foreground hover:[&>a]:text-foreground">
            <Link to="/features">Features</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <a href="mailto:support@splitify.app">Contact</a>
          </div>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Splitify. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
