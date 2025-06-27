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
    try {
      // 1) Obtener todos los pedidos
      const pedidosCol = collection(firestore, "pedidos");
      const pedidosSnap = await getDocs(pedidosCol);
      const pedidos = pedidosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const total = pedidos.length;
      const enProcesoCount = pedidos.filter(p => p.estado === "En proceso").length;

      // 2) Obtener detalles de pedidos
      const detallesCol = collection(firestore, "detalle_pedido");
      const detallesSnap = await getDocs(detallesCol);
      const detalles = detallesSnap.docs.map(doc => doc.data());

      // 3) Sumar galones totales (usando campo galones en detalle_pedido)
      const totalGalones = detalles.reduce(
        (sum, d) => sum + (typeof d.galones === "number" ? d.galones : 0),
        0
      );

      // 4) Ventas por día (sumar galones por día de la semana)
      const dias = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
      const ventas = Array(7).fill(0);

      pedidos.forEach(pedido => {
        // Filtrar detalles que pertenecen al pedido
        const galonesPedido = detalles
          .filter(d => d.id_pedido === pedido.id)
          .reduce((sum, d) => sum + (typeof d.galones === "number" ? d.galones : 0), 0);

        if (pedido.fecha_pedido) {
          // Firestore Timestamp a Date
          const fecha = pedido.fecha_pedido.toDate ? pedido.fecha_pedido.toDate() : new Date(pedido.fecha_pedido);
          const dia = fecha.getDay(); // 0 = Domingo
          ventas[dia] += galonesPedido;
        }
      });

      const ventasData = dias.map((dia, i) => ({ dia, ventas: ventas[i] }));

      
      // 5) Contar repartidores activos (rol === "repartidor")
      const usuariosCol = collection(firestore, "usuario"); // <-- CORREGIDO
      const usuariosSnap = await getDocs(usuariosCol);
      const usuarios = usuariosSnap.docs.map(doc => doc.data());
      const repartidoresCount = usuarios.filter(u => u.rol === "repartidor").length;
      // ...


      // Actualizar estados
      setTotalPedidos(total);
      setGalones(totalGalones);
      setEnProceso(enProcesoCount);
      setRepartidores(repartidoresCount);
      setVentasSemana(ventasData);
      setAlertaInventario(totalGalones < 500);

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

      {alertaInventario && (
        <Box mb={2}>
          <Paper sx={{ p: 2, backgroundColor: "#fff8e1" }}>
            <Typography sx={{ color: "#f57c00", fontWeight: "bold" }}>
              ⚠️ Alerta: Bajo inventario de galones. Verifica el stock.
            </Typography>
          </Paper>
        </Box>
      )}

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
