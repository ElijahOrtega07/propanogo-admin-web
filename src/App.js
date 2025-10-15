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
import ReportesCilindrosAlquilados from "./pages/ReportesCilindrosAlquilados";
import ReportesIntercambioCilindros from "./pages/ReportesIntercambioCilindros";
import Perfil from "./pages/Perfil";




function App() {
  return (
    <Routes>
      {/* Cambié path login de "/" a "/login" */}
      <Route path="/login" element={<Login />} />

      {/* Ruta protegida para el AdminLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="pedidos" element={<Pedidos />} />
        <Route path="repartidores" element={<Repartidores />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="inventario" element={<Inventario />} />
        <Route path="reportes" element={<Reportes />} />
        <Route path="historial" element={<HistorialEntregas />} />
        <Route path="configuracion" element={<Configuracion />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
        <Route path="reportes/cilindros-alquilados" element={<ReportesCilindrosAlquilados />} />
        <Route path="reportes/intercambio-cilindros" element={<ReportesIntercambioCilindros />} />
        <Route path="/perfil" element={<Perfil />} />





      </Route>

      {/* Redirigir cualquier ruta desconocida al login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
