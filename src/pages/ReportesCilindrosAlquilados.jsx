import React, { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Modal
} from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";
import MapaPedido from "../components/MapaPedido";

export default function ReportesCilindrosAlquilados() {
  const [pedidos, setPedidos] = useState([]);
  const [openMapa, setOpenMapa] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        // Traer todos los pedidos
        const pedidosSnap = await getDocs(collection(firestore, "pedidos"));
        const pedidosData = pedidosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Traer todos los usuarios
        const usuariosSnap = await getDocs(collection(firestore, "usuario"));
        const listaUsuarios = usuariosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Filtrar pedidos con cilindros y combinar con usuario
        const pedidosConCilindro = pedidosData
          .filter(p => p.cliente_tiene_cilindro === true)
          .map(pedido => {
            const usuario = listaUsuarios.find(u => u.uid === pedido.id_usuario);
            return {
              ...pedido,
              nombre: usuario?.nombre || "N/A",
              telefono: usuario?.telefono || "N/A",
              direccionCliente: usuario?.direccion || "N/A",
            };
          });

        // Agrupar por usuario para sumar cantidad de cilindros
        const agrupados = [];
        pedidosConCilindro.forEach(p => {
          const index = agrupados.findIndex(a => a.id_usuario === p.id_usuario);
          if (index >= 0) {
            agrupados[index].cantidadCilindros += 1;
            agrupados[index].ubicacion_cliente = p.ubicacion_cliente; // tomar última ubicación
          } else {
            agrupados.push({
              ...p,
              cantidadCilindros: 1
            });
          }
        });

        setPedidos(agrupados);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };

    obtenerDatos();
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Clientes con Cilindros Alquilados
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#1976d2" }}>
            <TableRow>
              <TableCell sx={{ color: "white" }}>Nombre</TableCell>
              <TableCell sx={{ color: "white" }}>Teléfono</TableCell>
              <TableCell sx={{ color: "white" }}>Dirección</TableCell>
              <TableCell sx={{ color: "white" }}>Cantidad de cilindros</TableCell>
              <TableCell sx={{ color: "white" }}>Ubicación</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pedidos.map(pedido => (
              <TableRow key={pedido.id_usuario}>
                <TableCell>{pedido.nombre}</TableCell>
                <TableCell>{pedido.telefono}</TableCell>
                <TableCell>{pedido.direccionCliente}</TableCell>
                <TableCell>{pedido.cantidadCilindros}</TableCell>
                <TableCell>
                  {pedido.ubicacion_cliente &&
                   pedido.ubicacion_cliente.latitude != null &&
                   pedido.ubicacion_cliente.longitude != null ? (
                    <IconButton
                      color="primary"
                      onClick={() => {
                        setPedidoSeleccionado(pedido);
                        setOpenMapa(true);
                      }}
                    >
                      <MapIcon />
                    </IconButton>
                  ) : "Sin ubicación"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={openMapa} onClose={() => setOpenMapa(false)}>
        <Box sx={{ width: "80%", height: "70%", margin: "5% auto", background: "#fff", borderRadius: 2, overflow: "hidden" }}>
          {pedidoSeleccionado && <MapaPedido pedido={pedidoSeleccionado} />}
        </Box>
      </Modal>
    </Box>
  );
}
