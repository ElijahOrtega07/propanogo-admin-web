import React, { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Tabs, Tab, Button
} from "@mui/material";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [estadoFiltro, setEstadoFiltro] = useState("Pendiente");

  useEffect(() => {
    obtenerPedidos();
  }, []);

  const obtenerPedidos = async () => {
    const snapshot = await getDocs(collection(firestore, "pedidos"));
    const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPedidos(lista);
  };

  const eliminarPedido = async (id) => {
    await deleteDoc(doc(firestore, "pedidos", id));
    obtenerPedidos(); // recarga la tabla
  };

  const estados = ["Pendiente", "En camino", "Entregado"];

  const colorEstado = (estado) => {
    switch (estado) {
      case "Pendiente":
        return "#fbc02d"; // amarillo
      case "En camino":
        return "#42a5f5"; // azul
      case "Entregado":
        return "#66bb6a"; // verde
      default:
        return "#ccc";
    }
  };

  const pedidosFiltrados = pedidos.filter(p => p.estado === estadoFiltro);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gestión de Pedidos
      </Typography>

      {/* Tabs de estado */}
      <Tabs
        value={estadoFiltro}
        onChange={(e, newValue) => setEstadoFiltro(newValue)}
        textColor="primary"
        indicatorColor="primary"
        sx={{ mb: 2 }}
      >
        {estados.map(est => (
          <Tab key={est} label={est} value={est} />
        ))}
      </Tabs>

      {/* Tabla */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f0f0f0" }}>
            <TableRow>
              <TableCell>Cliente</TableCell>
              <TableCell>Dirección</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Acción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pedidosFiltrados.map((pedido) => (
              <TableRow key={pedido.id}>
                <TableCell>{pedido.cliente}</TableCell>
                <TableCell>{pedido.direccion || "––"}</TableCell>
                <TableCell>
                  <span
                    style={{
                      backgroundColor: colorEstado(pedido.estado),
                      color: "#fff",
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontSize: "12px"
                    }}
                  >
                    {pedido.estado}
                  </span>
                </TableCell>
                <TableCell>{pedido.fecha || "––"}</TableCell>
                <TableCell>
                  <Button
                    color="error"
                    onClick={() => eliminarPedido(pedido.id)}
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {pedidosFiltrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No hay pedidos con estado "{estadoFiltro}"
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
