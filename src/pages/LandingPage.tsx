import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Zap, Shield } from "lucide-react";
import { InstallPWA } from "@/components/pwa/InstallPWA";

export function LandingPage() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // If user is logged in, redirect to Dashboard
  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Public Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <img
              src="/splitify-logo.png"
              alt="Splitify Logo"
              className="h-8 w-8 object-contain"
            />
            <span className="text-xl font-bold">Splitify</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32 lg:pb-32 xl:pb-36">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-8 lg:gap-y-20">
            <div className="relative z-10 mx-auto max-w-2xl lg:col-span-7 lg:max-w-none lg:pt-6 xl:col-span-6">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                Split Expenses, <br />
                <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
                  Not Friendships.
                </span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                The easiest way to track shared expenses, settle debts, and keep
                groups in sync. Perfect for roommates, trips, and friends.
              </p>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-4">
                <Link to="/register">
                  <Button size="lg" className="h-12 px-8 text-base">
                    Start Splitting Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/features">
                  <Button variant="outline" size="lg" className="h-12 px-8">
                    View Features
                  </Button>
                </Link>
              </div>
              <div className="mt-8">
                <InstallPWA />
              </div>
            </div>
            {/* Visual / Mockup */}
            <div className="relative mt-10 sm:mt-20 lg:col-span-5 lg:row-span-2 lg:mt-0 xl:col-span-6">
              <div className="absolute left-1/2 top-4 h-[1026px] w-[1026px] -translate-x-1/2 stroke-gray-300/10 [mask-image:linear-gradient(to_bottom,white,transparent)] sm:top-16 lg:-top-16 lg:ml-12 xl:-top-14 xl:ml-0">
                <svg
                  viewBox="0 0 1026 1026"
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full animate-spin-slow"
                >
                  <circle
                    cx="513"
                    cy="513"
                    r="513"
                    fill="url(#gradient)"
                    fillOpacity="0.1"
                  />
                  <defs>
                    <radialGradient id="gradient">
                      <stop offset="0%" stopColor="var(--primary)" />
                      <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                  </defs>
                </svg>
              </div>

              {/* Simple Feature Cards Array simulating preview */}
              <div className="-mx-4 h-[350px] px-9 [mask-image:linear-gradient(to_bottom,white,transparent)] sm:mx-0 lg:absolute lg:-inset-x-10 lg:-bottom-20 lg:-top-10 lg:h-auto lg:px-0 lg:pt-10 xl:-bottom-32">
                <div className="relative aspect-[366/729] mx-auto w-[300px] rounded-3xl border bg-background/50 shadow-2xl p-4 backdrop-blur-sm">
                  {/* Mock UI */}
                  <div className="space-y-4">
                    <div className="h-20 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 p-4 text-white">
                      <div className="text-xs opacity-70">Total Balance</div>
                      <div className="text-2xl font-bold">-₹225.00</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-24 rounded-xl bg-card border p-3">
                        <div className="text-xs text-muted-foreground">
                          You owe
                        </div>
                        <div className="text-red-500 font-bold mt-1">₹120</div>
                      </div>
                      <div className="h-24 rounded-xl bg-card border p-3">
                        <div className="text-xs text-muted-foreground">
                          Owed
                        </div>
                        <div className="text-green-500 font-bold mt-1">₹50</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container py-24 sm:py-32">
        <div className="grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-0">
          <div className="text-center md:flex md:items-start md:text-left lg:block lg:text-center">
            <div className="md:flex-shrink-0">
              <div className="flow-root">
                <div className="-my-1 rounded-2xl bg-primary/10 px-4 pb-2 pt-1 font-bold text-primary w-fit mx-auto md:mx-0 lg:mx-auto mb-4">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </div>
            <div className="mt-6 md:ml-4 md:mt-0 lg:ml-0 lg:mt-6">
              <h3 className="text-base font-semibold leading-6 text-foreground">
                Group Expenses
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Easily organize expenses by trips, house, or friends. Keep
                everything organized in one place.
              </p>
            </div>
          </div>

          <div className="text-center md:flex md:items-start md:text-left lg:block lg:text-center">
            <div className="md:flex-shrink-0">
              <div className="-my-1 rounded-2xl bg-primary/10 px-4 pb-2 pt-1 font-bold text-primary w-fit mx-auto md:mx-0 lg:mx-auto mb-4">
                <Zap className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-6 md:ml-4 md:mt-0 lg:ml-0 lg:mt-6">
              <h3 className="text-base font-semibold leading-6 text-foreground">
                Smart Balances
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                We automatically calculate who owes whom to minimize the number
                of transactions needed.
              </p>
            </div>
          </div>

          <div className="text-center md:flex md:items-start md:text-left lg:block lg:text-center">
            <div className="md:flex-shrink-0">
              <div className="-my-1 rounded-2xl bg-primary/10 px-4 pb-2 pt-1 font-bold text-primary w-fit mx-auto md:mx-0 lg:mx-auto mb-4">
                <Shield className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-6 md:ml-4 md:mt-0 lg:ml-0 lg:mt-6">
              <h3 className="text-base font-semibold leading-6 text-foreground">
                Secure & Private
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Your data is secure. No ads, no hidden fees. Just a fair and
                simple way to split bills.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
