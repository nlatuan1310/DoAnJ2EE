import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Investments from "./pages/Investments";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/investments" element={<Investments />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;
