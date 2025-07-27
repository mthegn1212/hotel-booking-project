// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Header from "./components/Header";
import Auth from "./pages/Auth";
import ChangePassword from "./pages/ChangePassword";
import HotelDetail from "./pages/HotelDetail";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/hotels/:id" element={<HotelDetail />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
