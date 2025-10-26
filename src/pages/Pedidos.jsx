import React, { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Tabs, Tab, Button, Select, MenuItem,
  FormControl, InputLabel, Modal, IconButton
} from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import {
  collection, onSnapshot, doc, updateDoc, getDocs
} from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";
import MapaPedido from "../components/MapaPedido";
import MapaRepartidores from "../components/MapaRepartidores";

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [estadoFiltro, setEstadoFiltro] = useState("Pendiente");
  const [usuarios, setUsuarios] = useState([]);
  const [repartidores, setRepartidores] = useState([]);
  const [asignaciones, setAsignaciones] = useState({});
  const [openMapaPedido, setOpenMapaPedido] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [openMapaGeneral, setOpenMapaGeneral] = useState(false);

  useEffect(() => {
    const pedidosQuery = collection(firestore, "pedidos");
    const unsubscribe = onSnapshot(pedidosQuery, (snapshot) => {
      const pedidosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPedidos(pedidosData);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function cargarUsuarios() {
      const usuariosCol = collection(firestore, "usuario");
      const snapshot = await getDocs(usuariosCol);
      const listaUsuarios = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsuarios(listaUsuarios);
      setRepartidores(listaUsuarios.filter(u => u.rol === "repartidor"));
    }
    cargarUsuarios();
  }, []);

  const colorEstado = (estado) => {
    switch (estado) {
      case "Pendiente": return "#fbc02d";
      case "En camino": return "#42a5f5";
      case "Entregado": return "#66bb6a";
      case "Asignado": return "#1976d2";
      case "Cancelado": return "#9e9e9e";
      default: return "#ccc";
    }
  };

  const handleAsignacionChange = (pedidoId, repartidorId) => {
    setAsignaciones(prev => ({ ...prev, [pedidoId]: repartidorId }));
  };

  const asignarRepartidor = async (pedidoId) => {
    const repartidorId = asignaciones[pedidoId];
    if (!repartidorId) {
      alert("Selecciona un repartidor antes de asignar");
      return;
    }
    try {
      const pedidoRef = doc(firestore, "pedidos", pedidoId);
      await updateDoc(pedidoRef, { id_repartidor: repartidorId });
      alert("Repartidor asignado correctamente");
      setAsignaciones(prev => ({ ...prev, [pedidoId]: "" }));
    } catch (error) {
      alert("Error al asignar repartidor: " + error.message);
    }
  };

  const nombreCliente = (id_usuario) => {
    const usuario = usuarios.find(u => u.id === id_usuario);
    return usuario?.nombre || usuario?.email || id_usuario || "Desconocido";
  };

  const pedidosFiltrados = pedidos.filter(
    p => p.estado === estadoFiltro || (estadoFiltro === "Cancelados" && p.estado === "Cancelado")
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Gestión de Pedidos</Typography>

      <Button
        variant="contained"
        color="primary"
        sx={{ mb: 2 }}
        onClick={() => setOpenMapaGeneral(true)}
      >
        🗺️ Ver Repartidores y Pedidos en Mapa
      </Button>

      <Modal open={openMapaGeneral} onClose={() => setOpenMapaGeneral(false)}>
        <Box sx={{
          width: "90%",
          height: "80%",
          margin: "5% auto",
          background: "#fff",
          borderRadius: "12px",
          overflow: "hidden",
        }}>
          <MapaRepartidores />
        </Box>
      </Modal>

      <Tabs
        value={estadoFiltro}
        onChange={(e, newValue) => setEstadoFiltro(newValue)}
        textColor="primary"
        indicatorColor="primary"
        sx={{ mb: 2 }}
      >
        {["Pendiente", "En camino", "Entregado", "Cancelados"].map(est => (
          <Tab key={est} label={est} value={est} />
        ))}
      </Tabs>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f0f0f0" }}>
            <TableRow>
              <TableCell>Cliente</TableCell>
              <TableCell>Dirección</TableCell>
              <TableCell>Sector</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Repartidor</TableCell>
              <TableCell>Asignar / Ubicación</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {pedidosFiltrados.map(pedido => (
              <TableRow key={pedido.id}>
                <TableCell>{nombreCliente(pedido.id_usuario)}</TableCell>
                <TableCell>{pedido.direccion_entrega || "––"}</TableCell>
                <TableCell>{pedido.notas || "––"}</TableCell>
                <TableCell>
                  <span style={{
                    backgroundColor: colorEstado(pedido.estado),
                    color: "#fff",
                    padding: "4px 8px",
                    borderRadius: "12px",
                    fontSize: "12px"
                  }}>
                    {pedido.estado}
                  </span>
                </TableCell>
                <TableCell>{pedido.fecha_pedido?.toDate?.().toLocaleString() || "––"}</TableCell>
                <TableCell>
                  {pedido.id_repartidor
                    ? repartidores.find(r => r.id === pedido.id_repartidor)?.nombre || "Desconocido"
                    : "–"}
                </TableCell>

                <TableCell>
                  {pedido.estado === "Pendiente" && (
                    <>
                      <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                        <InputLabel>Repartidor</InputLabel>
                        <Select
                          value={asignaciones[pedido.id] || pedido.id_repartidor || ""}
                          label="Repartidor"
                          onChange={(e) => handleAsignacionChange(pedido.id, e.target.value)}
                        >
                          <MenuItem value="">-- Ninguno --</MenuItem>
                          {repartidores.map(r => (
                            <MenuItem key={r.id} value={r.id}>
                              {r.nombre || r.email || r.id}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => asignarRepartidor(pedido.id)}
                        sx={{ mr: 1 }}
                      >
                        Asignar
                      </Button>

                      <IconButton
                        color="primary"
                        onClick={() => { setPedidoSeleccionado(pedido); setOpenMapaPedido(true); }}
                      >
                        <MapIcon />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {pedidosFiltrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No hay pedidos con estado "{estadoFiltro}"
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={openMapaPedido} onClose={() => setOpenMapaPedido(false)}>
        <Box sx={{
          width: "80%",
          height: "70%",
          margin: "5% auto",
          background: "#fff",
          borderRadius: "12px",
          overflow: "hidden",
        }}>
          {pedidoSeleccionado && <MapaPedido pedido={pedidoSeleccionado} />}
        </Box>
      </Modal>
    </Box>
  );
}
