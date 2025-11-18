import React, { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, Paper, IconButton, Modal
} from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";
import MapaPedido from "../components/MapaPedido";

export default function IntercambioCilindros() {
  const [pedidos, setPedidos] = useState([]);
  const [openMapa, setOpenMapa] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        // Traer todos los pedidos
        const pedidosSnap = await getDocs(collection(firestore, "pedidos"));
        const pedidosData = pedidosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Filtrar pedidos de tipo "intercambio"
        const pedidosIntercambio = pedidosData.filter(
          p => p.tipo_servicio?.toLowerCase() === "intercambio"
        );

        // Traer todos los usuarios
        const usuariosSnap = await getDocs(collection(firestore, "usuario"));
        const usuariosMap = {};
        usuariosSnap.docs.forEach(doc => {
          usuariosMap[doc.id] = doc.data();
        });

        // Agrupar pedidos por cliente y sumar cantidad de cilindros
        const clientesMap = {};
        pedidosIntercambio.forEach(pedido => {
          const usuario = usuariosMap[pedido.id_usuario];
          if (!usuario) return;

          const id = pedido.id_usuario;
          if (!clientesMap[id]) {
            clientesMap[id] = {
              id,
              nombre: usuario.nombre || "N/A",
              telefono: usuario.telefono || "N/A",
              direccionCliente: usuario.direccion || "N/A",
              cantidad_cilindros: pedido.cantidad_cilindros || 1,
              ubicacion_cliente: pedido.ubicacion_cliente || null,
              pedidos: [pedido],
            };
          } else {
            clientesMap[id].cantidad_cilindros += pedido.cantidad_cilindros || 1;
            clientesMap[id].pedidos.push(pedido);
          }
        });

        const listaFinal = Object.values(clientesMap);
        setPedidos(listaFinal);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };

    obtenerDatos();
  }, []);

  return (
    <Box p={2}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
        Reporte: Clientes que intercambiaron cilindros
      </Typography>

      {pedidos.length === 0 ? (
        <Typography>No hay registros de intercambio de cilindros.</Typography>
      ) : (
        <Paper>
          <Table>
            <TableHead sx={{ backgroundColor: "#1976d2" }}>
              <TableRow>
                <TableCell sx={{ color: "white" }}>Nombre</TableCell>
                <TableCell sx={{ color: "white" }}>Teléfono</TableCell>
                <TableCell sx={{ color: "white" }}>Dirección Cliente</TableCell>
                <TableCell sx={{ color: "white" }}>Cantidad de cilindros</TableCell>
                <TableCell sx={{ color: "white" }}>Ubicación</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pedidos.map(cliente => (
                <TableRow key={cliente.id}>
                  <TableCell>{cliente.nombre}</TableCell>
                  <TableCell>{cliente.telefono}</TableCell>
                  <TableCell>{cliente.direccionCliente}</TableCell>
                  <TableCell>{cliente.cantidad_cilindros}</TableCell>
                  <TableCell>
                    {cliente.ubicacion_cliente &&
                     cliente.ubicacion_cliente.latitude != null &&
                     cliente.ubicacion_cliente.longitude != null ? (
                      <IconButton
                        color="primary"
                        onClick={() => {
                          setPedidoSeleccionado(cliente);
                          setOpenMapa(true);
                        }}
                      >
                        <MapIcon />
                      </IconButton>
                    ) : (
                      "Sin ubicación"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Modal open={openMapa} onClose={() => setOpenMapa(false)}>
        <Box sx={{ width: "80%", height: "70%", margin: "5% auto", background: "#fff", borderRadius: 2, overflow: "hidden" }}>
          {pedidoSeleccionado && <MapaPedido pedido={pedidoSeleccionado} />}
        </Box>
      </Modal>
    </Box>
  );
}
