import React, { useState, useEffect } from "react";
import {
  Box, Typography, Table, TableHead, TableRow,
  TableCell, TableBody, TableContainer, Paper,
  TextField
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DownloadIcon from "@mui/icons-material/Download";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";
import { useLocation } from "react-router-dom";
import { jsPDF } from "jspdf"; // Importar jsPDF

export default function HistorialEntregas() {
  const [entregas, setEntregas] = useState([]);
  const [filtro, setFiltro] = useState({ cliente: "", repartidor: "", fecha: "" });

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const nombreRepartidor = params.get("repartidor");
    const nombreCliente = params.get("cliente");

    setFiltro((prev) => ({
      ...prev,
      repartidor: nombreRepartidor || "",
      cliente: nombreCliente || ""
    }));
  }, [location.search]);

  useEffect(() => {
    const obtenerEntregas = async () => {
      const pedidosSnapshot = await getDocs(collection(firestore, "pedidos"));
      const pedidosEntregados = [];

      for (const pedidoDoc of pedidosSnapshot.docs) {
        const pedido = { id: pedidoDoc.id, ...pedidoDoc.data() };

        if (pedido.estado === "Entregado") {
          let nombreCliente = "Desconocido";
          let nombreRepartidor = "–";

          if (pedido.id_usuario) {
            const clienteRef = doc(firestore, "usuario", pedido.id_usuario);
            const clienteSnap = await getDoc(clienteRef);
            if (clienteSnap.exists()) {
              nombreCliente = clienteSnap.data().nombre || "Sin nombre";
            }
          }

          if (pedido.id_repartidor) {
            const repartidorRef = doc(firestore, "usuario", pedido.id_repartidor);
            const repartidorSnap = await getDoc(repartidorRef);
            if (repartidorSnap.exists()) {
              nombreRepartidor = repartidorSnap.data().nombre || "Sin nombre";
            }
          }

          pedidosEntregados.push({
            ...pedido,
            clienteNombre: nombreCliente,
            repartidorNombre: nombreRepartidor,
            direccion_entrega: pedido.direccion_entrega,
            fecha_pedido: pedido.fecha_pedido?.toDate().toISOString().slice(0, 10) || "",
            notas: pedido.notas,
            ubicacion_cliente: pedido.ubicacion_cliente?.latitude
              ? {
                  latitude: pedido.ubicacion_cliente.latitude,
                  longitude: pedido.ubicacion_cliente.longitude,
                }
              : null,
          });
        }
      }

      setEntregas(pedidosEntregados);
    };

    obtenerEntregas();
  }, []);

  const handleFiltro = (e) => {
    setFiltro({ ...filtro, [e.target.name]: e.target.value });
  };

  const entregasFiltradas = entregas.filter(p =>
    (p.clienteNombre || "").toLowerCase().includes(filtro.cliente.toLowerCase()) &&
    (p.repartidorNombre || "").toLowerCase().includes(filtro.repartidor.toLowerCase()) &&
    (p.fecha_pedido || "").includes(filtro.fecha)
  );

  // Función para descargar recibo en PDF
  const descargarRecibo = (pedido) => {
    const doc = new jsPDF();

    const lineHeight = 10;
    let y = 10;

    doc.setFontSize(16);
    doc.text(" Recibo de Entrega", 10, y);
    y += lineHeight * 1.5;

    doc.setFontSize(12);
    doc.text(`Cliente: ${pedido.clienteNombre}`, 10, y);
    y += lineHeight;
    doc.text(`Repartidor: ${pedido.repartidorNombre}`, 10, y);
    y += lineHeight;
    doc.text(`Dirección: ${pedido.direccion_entrega || "–"}`, 10, y);
    y += lineHeight;
    doc.text(`Fecha del pedido: ${pedido.fecha_pedido || "–"}`, 10, y);
    y += lineHeight;
    doc.text(`Notas: ${pedido.notas || "–"}`, 10, y);
    y += lineHeight;

    const ubicacionTexto = pedido.ubicacion_cliente
      ? `${pedido.ubicacion_cliente.latitude}, ${pedido.ubicacion_cliente.longitude}`
      : "–";
    doc.text(`Ubicación: ${ubicacionTexto}`, 10, y);
    y += lineHeight;

    doc.text(`Estado: ${pedido.estado}`, 10, y);
    y += lineHeight * 2;

    doc.text("Gracias por su preferencia.", 10, y);

    // Descargar el PDF con nombre personalizado
    doc.save(`Recibo_${pedido.clienteNombre}_${pedido.fecha_pedido}.pdf`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Historial de Entregas</Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField label="Cliente" name="cliente" value={filtro.cliente} onChange={handleFiltro} />
        <TextField label="Repartidor" name="repartidor" value={filtro.repartidor} onChange={handleFiltro} />
        <TextField
          label="Fecha"
          name="fecha"
          type="date"
          value={filtro.fecha}
          onChange={handleFiltro}
          InputLabelProps={{ shrink: true }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f0f0f0" }}>
            <TableRow>
              <TableCell>Cliente</TableCell>
              <TableCell>Repartidor</TableCell>
              <TableCell>Dirección</TableCell>
              <TableCell>Fecha Pedido</TableCell>
              <TableCell>Notas</TableCell>
              <TableCell>Ubicación</TableCell>
              <TableCell>Acción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entregasFiltradas.map(p => (
              <TableRow key={p.id}>
                <TableCell>{p.clienteNombre}</TableCell>
                <TableCell>{p.repartidorNombre}</TableCell>
                <TableCell>{p.direccion_entrega || "–"}</TableCell>
                <TableCell>{p.fecha_pedido || "–"}</TableCell>
                <TableCell>{p.notas || "–"}</TableCell>
                <TableCell>
                  {p.ubicacion_cliente
                    ? `${p.ubicacion_cliente.latitude}, ${p.ubicacion_cliente.longitude}`
                    : "–"}
                </TableCell>
                <TableCell>
                  <Tooltip title="Descargar recibo">
                    <IconButton onClick={() => descargarRecibo(p)} color="primary">
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
