import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Investments from "./pages/Investments";
import ReceiptScanner from "./pages/ReceiptScanner";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/investments" element={<Investments />} />
          <Route path="/receipt-scanner" element={<ReceiptScanner />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;
