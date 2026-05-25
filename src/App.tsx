import { BrowserRouter, Routes, Route } from "react-router-dom";

import AuthProvider from "./auth/AuthProvider";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Schedule from "./pages/Schedule";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="clients" element={<Clients />} />
              <Route path="schedule" element={<Schedule />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
