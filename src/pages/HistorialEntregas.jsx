
// Archivo: src/pages/HistorialEntregas.jsx

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  TextField,
  Button
} from "@mui/material";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";

export default function HistorialEntregas() {
  const [entregas, setEntregas] = useState([]);
  const [filtro, setFiltro] = useState({ cliente: "", repartidor: "", fecha: "" });

  useEffect(() => {
    const obtenerEntregas = async () => {
      const snapshot = await getDocs(collection(firestore, "pedidos"));
      const completados = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(p => p.estado === "Entregado");
      setEntregas(completados);
    };
    obtenerEntregas();
  }, []);

  const handleFiltro = (e) => {
    setFiltro({ ...filtro, [e.target.name]: e.target.value });
  };

  const entregasFiltradas = entregas.filter(p =>
    p.cliente.toLowerCase().includes(filtro.cliente.toLowerCase()) &&
    p.repartidor?.toLowerCase().includes(filtro.repartidor.toLowerCase()) &&
    p.fecha?.includes(filtro.fecha)
  );

  const descargarRecibo = (pedido) => {
    const contenido = `Recibo de Entrega\nCliente: ${pedido.cliente}\nDirección: ${pedido.direccion}\nFecha: ${pedido.fecha}\nEstado: ${pedido.estado}`;
    const blob = new Blob([contenido], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Recibo_${pedido.cliente}_${pedido.fecha}.txt`;
    link.click();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Historial de Entregas</Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField label="Cliente" name="cliente" onChange={handleFiltro} />
        <TextField label="Repartidor" name="repartidor" onChange={handleFiltro} />
        <TextField label="Fecha" name="fecha" onChange={handleFiltro} type="date" InputLabelProps={{ shrink: true }} />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f0f0f0" }}>
            <TableRow>
              <TableCell>Cliente</TableCell>
              <TableCell>Repartidor</TableCell>
              <TableCell>Dirección</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entregasFiltradas.map(p => (
              <TableRow key={p.id}>
                <TableCell>{p.cliente}</TableCell>
                <TableCell>{p.repartidor || "–"}</TableCell>
                <TableCell>{p.direccion}</TableCell>
                <TableCell>{p.fecha}</TableCell>
                <TableCell>{p.estado}</TableCell>
                <TableCell>
                  <Button onClick={() => descargarRecibo(p)} variant="outlined" size="small">
                    Descargar recibo
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {entregasFiltradas.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">No se encontraron entregas</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
