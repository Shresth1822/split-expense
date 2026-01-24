import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { ForgotPassword } from "./pages/auth/ForgotPassword";
import { UpdatePassword } from "./pages/auth/UpdatePassword";
import { ThemeProvider } from "@/components/ui/theme-provider";

const queryClient = new QueryClient();

import { Toaster } from "@/components/ui/sonner";

import { Dashboard } from "./pages/Dashboard";
import { Groups } from "./pages/groups/Groups";
import { GroupDetails } from "./pages/groups/GroupDetails";
import { JoinGroup } from "./pages/groups/JoinGroup";
import { Friends } from "./pages/friends/Friends";
import { Reports } from "@/pages/Reports";
import { Activity } from "./pages/Activity";
import { Profile } from "./pages/settings/Profile";

import { Features } from "./pages/static/Features";
import { HowItWorks } from "./pages/static/HowItWorks";
import { FAQ } from "./pages/static/FAQ";
import { PrivacyPolicy } from "./pages/static/PrivacyPolicy";
import { TermsOfService } from "./pages/static/TermsOfService";
import { CookiePolicy } from "./pages/static/CookiePolicy";
import { LandingPage } from "./pages/LandingPage";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/update-password" element={<UpdatePassword />} />

              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route element={<AppLayout />}>
                {/* Layout for static pages (header/footer) but public */}
                <Route path="/features" element={<Features />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/cookie-policy" element={<CookiePolicy />} />
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  {/* ... protected routes ... */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/groups" element={<Groups />} />
                  <Route path="/groups/:id" element={<GroupDetails />} />
                  <Route path="/friends" element={<Friends />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/activity" element={<Activity />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>
                <Route path="/join/:groupId" element={<JoinGroup />} />
              </Route>
            </Routes>
            <Toaster />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
