import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";

const queryClient = new QueryClient();

function Dashboard() {
  return (
    <div>
      <h1>Dashboard Placeholder</h1>
    </div>
  );
}

import { Groups } from "./pages/groups/Groups";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/groups" element={<Groups />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
