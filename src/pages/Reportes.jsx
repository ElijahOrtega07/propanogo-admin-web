// Archivo: src/pages/Reportes.jsx
import React, { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Button, MenuItem, Select, FormControl, InputLabel
} from "@mui/material";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend
} from "recharts";
import * as XLSX from "xlsx";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";

export default function Reportes() {
  const [periodo, setPeriodo] = useState("Dia");
  const [ventasData, setVentasData] = useState([]);
  const [repartidoresData, setRepartidoresData] = useState([]);
  const [productosData, setProductosData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      // Obtener pedidos
      const pedidosSnapshot = await getDocs(collection(firestore, "pedidos"));
      const pedidos = pedidosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Obtener usuarios (repartidores)
      const usuariosSnapshot = await getDocs(collection(firestore, "usuario"));
      const usuarios = usuariosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const mapaRepartidores = {};
      usuarios.forEach(u => {
        if (u.rol === "repartidor") {
          mapaRepartidores[u.uid] = u.nombre;
        }
      });

      // Obtener detalle_pedido y productos
      const detalleSnapshot = await getDocs(collection(firestore, "detalle_pedido"));
      const detalles = detalleSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const productosSnapshot = await getDocs(collection(firestore, "producto"));
      const productosDocs = productosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const mapaProductos = {};
      productosDocs.forEach(p => {
        mapaProductos[p.id] = p.producto;
      });

      // Ventas por periodo usando fecha_entrega o fecha_pedido
      const ventasPorPeriodo = {};
      pedidos.forEach(p => {
        if (p.estado !== "Entregado") return; // solo entregados

        let fechaBase = null;
        if (p.fecha_entrega && typeof p.fecha_entrega.toDate === "function") {
          fechaBase = p.fecha_entrega.toDate();
        } else if (p.fecha_entrega) {
          fechaBase = new Date(p.fecha_entrega);
        } else if (p.fecha_pedido) {
          fechaBase = new Date(p.fecha_pedido);
        }

        if (!fechaBase || isNaN(fechaBase.getTime())) return;

        let clave = "";
        if (periodo === "Dia") {
          clave = fechaBase.toLocaleDateString("es-ES", { weekday: "short" });
        } else if (periodo === "Semana") {
          const año = fechaBase.getFullYear();
          const semana = Math.ceil(fechaBase.getDate() / 7);
          clave = `Sem ${semana} - ${año}`;
        } else if (periodo === "Mes") {
          clave = fechaBase.toLocaleDateString("es-ES", { month: "short", year: "numeric" });
        }

        ventasPorPeriodo[clave] = (ventasPorPeriodo[clave] || 0) + 1;
      });
      const ventas = Object.entries(ventasPorPeriodo).map(([nombre, ventas]) => ({ nombre, ventas }));
      setVentasData(ventas);

      // Entregas por repartidor con nombre real
      const entregasPorRepartidor = {};
      pedidos.forEach(p => {
        if (p.estado === "Entregado" && p.id_repartidor) {
          const nombre = mapaRepartidores[p.id_repartidor] || "Sin nombre";
          entregasPorRepartidor[nombre] = (entregasPorRepartidor[nombre] || 0) + 1;
        }
      });
      const repartidores = Object.entries(entregasPorRepartidor).map(([nombre, entregas]) => ({ nombre, entregas }));
      setRepartidoresData(repartidores);

      // Productos más vendidos usando cantidad desde detalle_pedido
      const productosContador = {};
      detalles.forEach(d => {
        const nombre = mapaProductos[d.id_producto] || "Desconocido";
        productosContador[nombre] = (productosContador[nombre] || 0) + (d.cantidad || 0);
      });
      const productos = Object.entries(productosContador).map(([nombre, ventas]) => ({ nombre, ventas }));
      setProductosData(productos);
    };

    fetchData();
  }, [periodo]);

  const exportarExcel = () => {
    const wb = XLSX.utils.book_new();

    const sheet1 = XLSX.utils.json_to_sheet(ventasData);
    const sheet2 = XLSX.utils.json_to_sheet(repartidoresData);
    const sheet3 = XLSX.utils.json_to_sheet(productosData);

    XLSX.utils.book_append_sheet(wb, sheet1, "Ventas");
    XLSX.utils.book_append_sheet(wb, sheet2, "Repartidores");
    XLSX.utils.book_append_sheet(wb, sheet3, "Productos");

    XLSX.writeFile(wb, "reporte_propanoGO.xlsx");
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reportes y Estadísticas
      </Typography>

      <FormControl sx={{ mb: 3, minWidth: 120 }} size="small">
        <InputLabel>Periodo</InputLabel>
        <Select
          value={periodo}
          label="Periodo"
          onChange={(e) => setPeriodo(e.target.value)}
        >
          <MenuItem value="Dia">Día</MenuItem>
          <MenuItem value="Semana">Semana</MenuItem>
          <MenuItem value="Mes">Mes</MenuItem>
        </Select>
      </FormControl>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">Ventas</Typography>
        <LineChart width={600} height={250} data={ventasData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="nombre" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="ventas" stroke="#8884d8" />
        </LineChart>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">Entregas por Repartidor</Typography>
        <BarChart width={600} height={250} data={repartidoresData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="nombre" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="entregas" fill="#82ca9d" />
        </BarChart>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">Productos más Vendidos</Typography>
        <BarChart width={600} height={250} data={productosData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="nombre" type="category" />
          <Tooltip />
          <Bar dataKey="ventas" fill="#8884d8" />
        </BarChart>
      </Paper>

      <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
        <Button variant="contained" color="success" onClick={exportarExcel}>
          Exportar a Excel
        </Button>
      </Box>
    </Box>
  );
}
