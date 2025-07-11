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
  const [enProceso, setEnProceso] = useState(0);
  const [repartidores, setRepartidores] = useState(0);
  const [ventasSemana, setVentasSemana] = useState([]);
  const [alertaInventario, setAlertaInventario] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
  try {
    const pedidosCol = collection(firestore, "pedidos");
    const pedidosSnap = await getDocs(pedidosCol);
    const pedidos = pedidosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const total = pedidos.length;
    const enProcesoCount = pedidos.filter(p =>
      p.estado === "Pendiente" || p.estado === "En camino"
    ).length;

    const detallesCol = collection(firestore, "detalle_pedido");
    const detallesSnap = await getDocs(detallesCol);
    const detalles = detallesSnap.docs.map(doc => doc.data());

    // Calcular cantidad total por día
    const dias = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
    const ventasPorDia = Array(7).fill(0);

    pedidos.forEach(pedido => {
      const cantidadTotalPedido = detalles
        .filter(d => d.id_pedido === pedido.id)
        .reduce((sum, d) => sum + (typeof d.cantidad === "number" ? d.cantidad : 0), 0);

      if (pedido.fecha_pedido) {
        const fecha = pedido.fecha_pedido.toDate ? pedido.fecha_pedido.toDate() : new Date(pedido.fecha_pedido);
        const dia = fecha.getDay();
        ventasPorDia[dia] += cantidadTotalPedido;
      }
    });

    const ventasData = dias.map((dia, i) => ({ dia, ventas: ventasPorDia[i] }));

    const usuariosCol = collection(firestore, "usuario");
    const usuariosSnap = await getDocs(usuariosCol);
    const usuarios = usuariosSnap.docs.map(doc => doc.data());
    const repartidoresCount = usuarios.filter(u => u.rol === "repartidor").length;

    setTotalPedidos(total);
    setEnProceso(enProcesoCount);
    setRepartidores(repartidoresCount);
    setVentasSemana(ventasData);

  } catch (error) {
    console.error("Error al cargar datos del dashboard:", error);
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

      
       <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={4} md={3}>
          <Paper sx={cardStyle}>
            <Typography sx={{ fontSize: "14px", color: "#555" }}>PEDIDOS TOTALES</Typography>
            <Typography sx={{ fontSize: "24px", fontWeight: "bold" }}>{totalPedidos}</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={4} md={3}>
          <Paper sx={cardStyle}>
            <Typography sx={{ fontSize: "14px", color: "#555" }}>Pedidos pendientes/en camino</Typography>
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
