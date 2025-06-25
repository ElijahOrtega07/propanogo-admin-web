import React, { useEffect, useState } from "react";
import {
  Box, Typography, Grid, Paper
} from "@mui/material";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";

export default function Dashboard() {
  const [totalPedidos, setTotalPedidos] = useState(0);
  const [galones, setGalones] = useState(0);
  const [enProceso, setEnProceso] = useState(0);
  const [repartidores, setRepartidores] = useState(0);
  const [ventasSemana, setVentasSemana] = useState([]);
  const [alertaInventario, setAlertaInventario] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const pedidosCol = collection(firestore, "pedidos");
    const snapshot = await getDocs(pedidosCol);
    const pedidos = snapshot.docs.map(doc => doc.data());

    const total = pedidos.length;
    const totalGalones = pedidos.reduce((sum, p) => sum + (p.galones || 0), 0);
    const enProcesoCount = pedidos.filter(p => p.estado === "En proceso").length;

    setTotalPedidos(total);
    setGalones(totalGalones);
    setEnProceso(enProcesoCount);
    setRepartidores(3); // simulado

    // Simulación gráfica
    setVentasSemana([
      { dia: "Lun", ventas: 120 },
      { dia: "Mar", ventas: 180 },
      { dia: "Mie", ventas: 130 },
      { dia: "Jue", ventas: 160 },
      { dia: "Vie", ventas: 300 },
      { dia: "Sab", ventas: 200 },
      { dia: "Dom", ventas: 170 },
    ]);

    // Alerta de inventario bajo
    if (totalGalones < 500) {
      setAlertaInventario(true);
    } else {
      setAlertaInventario(false);
    }
  };

  const cardStyle = {
    p: 2,
    borderRadius: 2,
    backgroundColor: "#f5f5f5",
    textAlign: "center",
    boxShadow: "0px 2px 5px rgba(0,0,0,0.1)"
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Inicio
      </Typography>

      {/* ALERTA */}
      {alertaInventario && (
        <Box mb={2}>
          <Paper sx={{ p: 2, backgroundColor: "#fff8e1" }}>
            <Typography sx={{ color: "#f57c00", fontWeight: "bold" }}>
              ⚠️ Alerta: Bajo inventario de galones. Verifica el stock.
            </Typography>
          </Paper>
        </Box>
      )}

      {/* TARJETAS */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={4} md={3}>
          <Paper sx={cardStyle}>
            <Typography sx={{ fontSize: "14px", color: "#555" }}>PEDIDOS TOTALES</Typography>
            <Typography sx={{ fontSize: "24px", fontWeight: "bold" }}>{totalPedidos}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <Paper sx={cardStyle}>
            <Typography sx={{ fontSize: "14px", color: "#555" }}>GALONES DESPACHADOS</Typography>
            <Typography sx={{ fontSize: "24px", fontWeight: "bold" }}>{galones}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <Paper sx={cardStyle}>
            <Typography sx={{ fontSize: "14px", color: "#555" }}>PEDIDOS EN PROCESO</Typography>
            <Typography sx={{ fontSize: "24px", fontWeight: "bold" }}>{enProceso}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <Paper sx={cardStyle}>
            <Typography sx={{ fontSize: "14px", color: "#555" }}>REPARTIDORES ACTIVOS</Typography>
            <Typography sx={{ fontSize: "24px", fontWeight: "bold" }}>{repartidores}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* GRÁFICO */}
      <Box sx={{ backgroundColor: "#fff", borderRadius: 2, p: 2, boxShadow: "0px 2px 5px rgba(0,0,0,0.1)" }}>
        <Typography variant="h6" gutterBottom>
          Ventas de la semana
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={ventasSemana}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dia" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="ventas" stroke="#1976d2" strokeWidth={3} dot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}