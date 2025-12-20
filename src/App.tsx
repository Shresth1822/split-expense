import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { ThemeProvider } from "@/components/ui/theme-provider";

const queryClient = new QueryClient();

import { Toaster } from "@/components/ui/sonner";

import { Dashboard } from "./pages/Dashboard";
import { Groups } from "./pages/groups/Groups";
import { GroupDetails } from "./pages/groups/GroupDetails";
import { Friends } from "./pages/friends/Friends";
import { Profile } from "./pages/settings/Profile";

import { Features } from "./pages/static/Features";
import { HowItWorks } from "./pages/static/HowItWorks";
import { FAQ } from "./pages/static/FAQ";
import { PrivacyPolicy } from "./pages/static/PrivacyPolicy";
import { TermsOfService } from "./pages/static/TermsOfService";
import { CookiePolicy } from "./pages/static/CookiePolicy";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/groups" element={<Groups />} />
                  <Route path="/groups/:id" element={<GroupDetails />} />
                  <Route path="/friends" element={<Friends />} />
                  <Route path="/profile" element={<Profile />} />

                  {/* Static Pages */}
                  <Route path="/features" element={<Features />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/cookie-policy" element={<CookiePolicy />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
