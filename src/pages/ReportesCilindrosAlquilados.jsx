import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper } from "@mui/material";

export default function CilindrosAlquilados() {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        // Traer todos los pedidos
        const pedidosSnap = await getDocs(collection(firestore, "pedido"));
        const pedidosData = pedidosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        console.log("Pedidos totales:", pedidosData);

        // Filtrar pedidos donde el cliente tiene cilindro
        const pedidosConCilindro = pedidosData.filter(p => p.cliente_tiene_cilindro === true);

        // Traer todos los usuarios
        const usuariosSnap = await getDocs(collection(firestore, "usuarios"));
        const usuariosMap = {};
        usuariosSnap.docs.forEach(doc => {
          usuariosMap[doc.id] = doc.data();
        });

        console.log("Usuarios totales:", usuariosMap);

        // Combinar datos de usuario con pedidos
        const listaFinal = pedidosConCilindro.map(pedido => {
          const usuario = usuariosMap[pedido.id_usuario];
          return {
            id: pedido.id,
            nombre: usuario?.nombre || "N/A",
            telefono: usuario?.telefono || "N/A",
            direccionCliente: usuario?.direccion || "N/A",
            direccionEntrega: pedido.direccion_entrega || "N/A",
            fechaPedido: pedido.fecha_pedido || "N/A",
          };
        });

        console.log("Pedidos finales CilindrosAlquilados:", listaFinal);
        setPedidos(listaFinal);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };

    obtenerDatos();
  }, []);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
        Reporte: Clientes con cilindros alquilados
      </Typography>

      {pedidos.length === 0 ? (
        <Typography>No hay clientes con cilindros actualmente.</Typography>
      ) : (
        <Paper>
          <Table>
            <TableHead sx={{ backgroundColor: "#1976d2" }}>
              <TableRow>
                <TableCell sx={{ color: "white" }}>Nombre</TableCell>
                <TableCell sx={{ color: "white" }}>Teléfono</TableCell>
                <TableCell sx={{ color: "white" }}>Dirección Cliente</TableCell>
                <TableCell sx={{ color: "white" }}>Dirección Entrega</TableCell>
                <TableCell sx={{ color: "white" }}>Fecha del pedido</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pedidos.map(pedido => (
                <TableRow key={pedido.id}>
                  <TableCell>{pedido.nombre}</TableCell>
                  <TableCell>{pedido.telefono}</TableCell>
                  <TableCell>{pedido.direccionCliente}</TableCell>
                  <TableCell>{pedido.direccionEntrega}</TableCell>
                  <TableCell>{pedido.fechaPedido}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
}
