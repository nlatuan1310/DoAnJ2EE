import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Goals from "./pages/Goals";
import GoalDetail from "./pages/GoalDetail";
import Investments from "./pages/Investments";
import ReceiptScanner from "./pages/ReceiptScanner";
import Reports from "./pages/Reports";
import Categories from "./pages/Categories";
import FinancialAdvisor from "./pages/FinancialAdvisor";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import { AuthProvider } from "./hooks/useAuth";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

// Admin Imports
import AdminLayout from "./layouts/AdminLayout";
import AdminRoute from "./components/admin/AdminRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/smart-dashboard" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/budgets" element={<Budgets />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/goals/:id" element={<GoalDetail />} />
              <Route path="/investments" element={<Investments />} />
              <Route path="/receipt-scanner" element={<ReceiptScanner />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/advisor" element={<FinancialAdvisor />} />
            </Route>

            {/* Admin Routes with Guard */}
            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App;
