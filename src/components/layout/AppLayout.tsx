import { useAuth } from "@/context/AuthContext";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { Button } from "../ui/button";

export function AppLayout() {
  const { signOut, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-card border-r transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center justify-between border-b px-4">
            <span className="text-lg font-bold text-primary">SplitExpense</span>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            <Link
              to="/"
              className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Dashboard
            </Link>
            <Link
              to="/groups"
              className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Groups
            </Link>
            <Link
              to="/friends"
              className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Friends
            </Link>
          </nav>

          <div className="border-t p-4">
            <div className="mb-4 flex items-center gap-3 px-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                {user?.email?.[0].toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="truncate text-sm font-medium">
                  {user?.user_metadata?.full_name || "User"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center border-b bg-card px-4 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="ml-4 text-lg font-bold text-primary">
            SplitExpense
          </span>
        </header>

        <main className="flex-1 overflow-y-auto bg-muted/10 p-4 md:p-6">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
