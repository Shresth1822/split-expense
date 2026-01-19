import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileNav } from "./MobileNav";

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background pb-16 md:pb-0">
      <div className="hidden md:block">
        <Header />
      </div>
      <div className="md:hidden">
        {/* Simple Mobile Header (Logo only maybe?) or keep standard Header but simplified */}
        <Header />
      </div>

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>

      <MobileNav />
    </div>
  );
}
