import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Dashboard from "./pages/dashboard/Dashboard";
import Transactions from "./pages/finance/Transactions";
import Budgets from "./pages/finance/Budgets";
import Goals from "./pages/goals/Goals";
import GoalDetail from "./pages/goals/GoalDetail";
import Investments from "./pages/investments/Investments";
import ReceiptScanner from "./pages/ai/ReceiptScanner";
import Reports from "./pages/finance/Reports";
import Categories from "./pages/finance/Categories";
import FinancialAdvisor from "./pages/ai/FinancialAdvisor";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import { AuthProvider } from "./hooks/useAuth";
import Settings from "./pages/Settings";
import PersonalWallets from "./pages/wallets/PersonalWallets";
import GroupWallets from "./pages/wallets/GroupWallets";

const queryClient = new QueryClient();

// Admin Imports
import AdminLayout from "./layouts/AdminLayout";
import AdminRoute from "./components/admin/AdminRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAuditLog from "./pages/admin/AdminAuditLog";
import AdminCategories from "./pages/admin/AdminCategories";

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
              <Route path="/wallets/personal" element={<PersonalWallets />} />
              <Route path="/wallets/group" element={<GroupWallets />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/advisor" element={<FinancialAdvisor />} />
            </Route>

            {/* Admin Routes with Guard */}
            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/audit-log" element={<AdminAuditLog />} />
                <Route path="/admin/categories" element={<AdminCategories />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App;