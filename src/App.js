import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Pedidos from "./pages/Pedidos";
import Repartidores from "./pages/Repartidores";
import Clientes from "./pages/Clientes";
import Inventario from "./pages/Inventario"
import Reportes from "./pages/Reportes";
import HistorialEntregas from "./pages/HistorialEntregas";
import Configuracion from "./pages/Configuracion.jsx";


import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="pedidos" element={<Pedidos />} />
        <Route path="repartidores" element={<Repartidores />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="/inventario" element={<Inventario />} />
        <Route path="reportes" element={<Reportes />} />
        <Route path="historial" element={<HistorialEntregas />} />
        <Route path="configuracion" element={<Configuracion />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
