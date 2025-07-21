import React, { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Tabs, Tab, Button, Select, MenuItem, FormControl, InputLabel, IconButton
} from "@mui/material";
import DeleteForeverRounded from "@mui/icons-material/DeleteForeverRounded";
import {
  collection, onSnapshot, doc, updateDoc, getDocs, deleteDoc
} from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [estadoFiltro, setEstadoFiltro] = useState("Pendiente");
  const [usuarios, setUsuarios] = useState([]); // Clientes y repartidores
  const [repartidores, setRepartidores] = useState([]);
  const [asignaciones, setAsignaciones] = useState({}); // pedidoId -> repartidorId

  // Escuchar pedidos en tiempo real
  useEffect(() => {
    const pedidosQuery = collection(firestore, "pedidos");
    const unsubscribe = onSnapshot(pedidosQuery, (snapshot) => {
      const pedidosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPedidos(pedidosData);
    });
    return () => unsubscribe();
  }, []);

  // Cargar usuarios y separar repartidores
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

  // Eliminar pedido con confirmación
  const eliminarPedido = async (id) => {
    if (!window.confirm("¿Eliminar este pedido?")) return;
    await deleteDoc(doc(firestore, "pedidos", id));
  };

  // Color según estado
  const colorEstado = (estado) => {
    switch (estado) {
      case "Pendiente": return "#fbc02d";
      case "En camino": return "#42a5f5";
      case "Entregado": return "#66bb6a";
      case "Asignado": return "#1976d2";
      default: return "#ccc";
    }
  };

  // Manejar cambio de repartidor asignado (en select)
  const handleAsignacionChange = (pedidoId, repartidorId) => {
    setAsignaciones(prev => ({ ...prev, [pedidoId]: repartidorId }));
  };

  // Guardar asignación en Firestore
  const asignarRepartidor = async (pedidoId) => {
    const repartidorId = asignaciones[pedidoId];
    if (!repartidorId) {
      alert("Selecciona un repartidor antes de asignar");
      return;
    }
    try {
      const pedidoRef = doc(firestore, "pedidos", pedidoId);
      await updateDoc(pedidoRef, {
        id_repartidor: repartidorId,
        // No se cambia estado aquí, solo asignar repartidor
      });
      alert("Repartidor asignado correctamente");
      setAsignaciones(prev => ({ ...prev, [pedidoId]: "" }));
    } catch (error) {
      alert("Error al asignar repartidor: " + error.message);
    }
  };

  // Obtener nombre del cliente para mostrar
  const nombreCliente = (id_usuario) => {
    const usuario = usuarios.find(u => u.id === id_usuario);
    return usuario?.nombre || usuario?.email || id_usuario || "Desconocido";
  };

  // Filtrar pedidos según estado seleccionado
  const pedidosFiltrados = pedidos.filter(p => p.estado === estadoFiltro);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gestión de Pedidos
      </Typography>

      <Tabs
        value={estadoFiltro}
        onChange={(e, newValue) => setEstadoFiltro(newValue)}
        textColor="primary"
        indicatorColor="primary"
        sx={{ mb: 2 }}
      >
        {["Pendiente", "En camino", "Entregado"].map(est => (
          <Tab key={est} label={est} value={est} />
        ))}
      </Tabs>

      <TableContainer component={Paper}>
        <Table>

          <TableHead sx={{ backgroundColor: "#f0f0f0" }}>
            <TableRow>
              <TableCell>Cliente</TableCell>
              <TableCell>Dirección</TableCell>
              <TableCell>sector</TableCell> 
              <TableCell>Zona</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Repartidor</TableCell> 
              <TableCell>Acción</TableCell>
              <TableCell>Asignar Repartidor</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {pedidosFiltrados.map((pedido) => (
              <TableRow key={pedido.id}>
                <TableCell>{nombreCliente(pedido.id_usuario)}</TableCell>
                <TableCell>{pedido.direccion_entrega || "––"}</TableCell>
                <TableCell>{pedido.notas || "––"}</TableCell> {/* Mostrar notas */}
                <TableCell>{pedido.zonaReparto || "No asignada"}</TableCell>
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
                <TableCell>{pedido.fecha_pedido?.toDate?.().toLocaleString() || "––"}</TableCell>
                <TableCell>
                  {pedido.id_repartidor
                    ? repartidores.find(r => r.id === pedido.id_repartidor)?.nombre || "Desconocido"
                    : "–"}
                </TableCell>
                <TableCell>
                  <IconButton
                    color="error"
                    onClick={() => eliminarPedido(pedido.id)}
                  >
                    <DeleteForeverRounded />
                  </IconButton>
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
                          {
                            repartidores.map(r => (
                              <MenuItem key={r.id} value={r.id}>
                                {r.nombre || r.email || r.id}
                              </MenuItem>
                            ))
                          }
                        </Select>
                      </FormControl>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => asignarRepartidor(pedido.id)}
                      >
                        Asignar
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {pedidosFiltrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center">
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