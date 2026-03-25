import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Investments from "./pages/Investments";
import ReceiptScanner from "./pages/ReceiptScanner";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import { AuthProvider } from "./hooks/useAuth";

function App() {
  return (
<<<<<<< HEAD
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/investments" element={<Investments />} />
          <Route path="/receipt-scanner" element={<ReceiptScanner />} />
        </Route>
      </Routes>
    </BrowserRouter>
=======
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/receipt-scanner" element={<ReceiptScanner />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
>>>>>>> develop
  )
}

export default App;
