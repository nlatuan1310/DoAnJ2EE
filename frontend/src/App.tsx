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
import Analytics from "./pages/Analytics";
import FinancialAdvisor from "./pages/FinancialAdvisor";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Settings from "./pages/Settings";

import { AuthProvider, useAuth } from "./hooks/useAuth";
import LandingPage from "./pages/LandingPage";
import { Navigate } from "react-router-dom";

import PersonalWallets from "./pages/PersonalWallets";
import GroupWallets from "./pages/GroupWallets";
const queryClient = new QueryClient();

// Admin Imports
import AdminLayout from "./layouts/AdminLayout";
import AdminRoute from "./components/admin/AdminRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";

/**
 * AppContent handles components that need useAuth hook
 */
function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - No Layout */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Landing Page - No Layout (Unauthenticated only) */}
        {!isAuthenticated && <Route path="/" element={<LandingPage />} />}

        {/* Authenticated Routes - With MainLayout */}
        <Route element={<MainLayout />}>
          {/* Home Page for authenticated users */}
          {isAuthenticated && <Route path="/" element={<Home />} />}
          
          {/* All other protected routes */}
          <Route path="/smart-dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/transactions" element={isAuthenticated ? <Transactions /> : <Navigate to="/login" />} />
          <Route path="/analytics" element={isAuthenticated ? <Analytics /> : <Navigate to="/login" />} />
          <Route path="/budgets" element={isAuthenticated ? <Budgets /> : <Navigate to="/login" />} />
          <Route path="/goals" element={isAuthenticated ? <Goals /> : <Navigate to="/login" />} />
          <Route path="/goals/:id" element={isAuthenticated ? <GoalDetail /> : <Navigate to="/login" />} />
          <Route path="/investments" element={isAuthenticated ? <Investments /> : <Navigate to="/login" />} />
          <Route path="/receipt-scanner" element={isAuthenticated ? <ReceiptScanner /> : <Navigate to="/login" />} />
          <Route path="/reports" element={isAuthenticated ? <Reports /> : <Navigate to="/login" />} />
          <Route path="/categories" element={isAuthenticated ? <Categories /> : <Navigate to="/login" />} />
          <Route path="/wallets/personal" element={isAuthenticated ? <PersonalWallets /> : <Navigate to="/login" />} />
          <Route path="/wallets/group" element={isAuthenticated ? <GroupWallets /> : <Navigate to="/login" />} />
          <Route path="/settings" element={isAuthenticated ? <Settings /> : <Navigate to="/login" />} />
          <Route path="/advisor" element={isAuthenticated ? <FinancialAdvisor /> : <Navigate to="/login" />} />
        </Route>

        {/* Admin Routes with Guard */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>
        </Route>

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App;
