// Archivo: src/pages/Reportes.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend
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
      const pedidosSnapshot = await getDocs(collection(firestore, "pedidos"));
      const pedidos = pedidosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Ventas por día
      const ventasPorDia = {};
      pedidos.forEach(p => {
        const fecha = new Date(p.fecha);
        const dia = fecha.toLocaleDateString("es-ES", { weekday: "short" });
        ventasPorDia[dia] = (ventasPorDia[dia] || 0) + 1;
      });
      const ventas = Object.entries(ventasPorDia).map(([nombre, ventas]) => ({ nombre, ventas }));
      setVentasData(ventas);

      // Entregas por repartidor
      const entregasPorRepartidor = {};
      pedidos.forEach(p => {
        if (p.repartidor) {
          entregasPorRepartidor[p.repartidor] = (entregasPorRepartidor[p.repartidor] || 0) + 1;
        }
      });
      const repartidores = Object.entries(entregasPorRepartidor).map(([nombre, entregas]) => ({ nombre, entregas }));
      setRepartidoresData(repartidores);

      // Productos más vendidos (asumiendo p.producto: nombre)
      const productosContador = {};
      pedidos.forEach(p => {
        if (p.producto) {
          productosContador[p.producto] = (productosContador[p.producto] || 0) + 1;
        }
      });
      const productos = Object.entries(productosContador).map(([nombre, ventas]) => ({ nombre, ventas }));
      setProductosData(productos);
    };

    fetchData();
  }, []);

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

      <Button variant="contained" color="success" onClick={exportarExcel}>
        Exportar a Excel
      </Button>
    </Box>
  );
}
