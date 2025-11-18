import React, { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, MenuItem, IconButton, Tooltip, Button,
} from "@mui/material";
import {
  ToggleOn, ToggleOff, Edit, History
} from "@mui/icons-material";
import {
  collection, getDocs, doc, updateDoc, query, where
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { firestore } from "../firebase/firebaseConfig";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [editando, setEditando] = useState(null);
  const [formEdit, setFormEdit] = useState({
    nombre: "",
    direccion: "",
    contacto: "",
    rol: "cliente"
  });

  const [filtro, setFiltro] = useState({
    nombre: "",
    estado: ""
  });

  const navigate = useNavigate();

  useEffect(() => {
    obtenerClientes();
  }, []);

  const obtenerClientes = async () => {
    const q = query(collection(firestore, "usuario"), where("rol", "==", "cliente"));
    const snapshot = await getDocs(q);
    const pedidosSnap = await getDocs(collection(firestore, "pedidos"));

    const pedidosPorUsuario = {};
    pedidosSnap.forEach(p => {
      const idUsuario = p.data().id_usuario;
      if (idUsuario) {
        pedidosPorUsuario[idUsuario] = (pedidosPorUsuario[idUsuario] || 0) + 1;
      }
    });

    const lista = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      const id = docSnap.id;

      return {
        id,
        nombre: data.nombre || "Sin nombre",
        direccion: data.direccion || "––",
        pedidosRealizados: pedidosPorUsuario[id] || 0,
        contacto: data.telefono || data.contacto || "––",
        estado: data.estado || "Activo",
        rol: data.rol || "cliente"
      };
    });

    setClientes(lista);
  };

  const toggleEstado = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === "Activo" ? "Inactivo" : "Activo";
    await updateDoc(doc(firestore, "usuario", id), { estado: nuevoEstado });
    obtenerClientes();
  };

  const abrirEdicion = (cliente) => {
    setEditando(cliente);
    setFormEdit({
      nombre: cliente.nombre,
      direccion: cliente.direccion,
      contacto: cliente.contacto,
      rol: cliente.rol || "cliente"
    });
  };

  const guardarCambios = async () => {
    if (editando) {
      await updateDoc(doc(firestore, "usuario", editando.id), {
        nombre: formEdit.nombre,
        direccion: formEdit.direccion,
        telefono: formEdit.contacto,
        rol: formEdit.rol
      });
      cerrarModal();
      obtenerClientes();
    }
  };

  const cerrarModal = () => {
    setEditando(null);
    setFormEdit({ nombre: "", direccion: "", contacto: "", rol: "cliente" });
  };

  const handleChange = (e) => {
    setFormEdit({ ...formEdit, [e.target.name]: e.target.value });
  };

  const handleFiltroChange = (e) => {
    setFiltro({ ...filtro, [e.target.name]: e.target.value });
  };

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nombre.toLowerCase().includes(filtro.nombre.toLowerCase()) &&
    cliente.estado.toLowerCase().includes(filtro.estado.toLowerCase())
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gestión de Clientes
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Buscar por nombre"
            name="nombre"
            fullWidth
            variant="outlined"
            value={filtro.nombre}
            onChange={handleFiltroChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            label="Estado"
            name="estado"
            fullWidth
            variant="outlined"
            value={filtro.estado}
            onChange={handleFiltroChange}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="Activo">Activo</MenuItem>
            <MenuItem value="Inactivo">Inactivo</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f0f0f0" }}>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Dirección</TableCell>
              <TableCell>Pedidos Realizados</TableCell>
              <TableCell>Contacto</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clientesFiltrados.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell>{cliente.nombre}</TableCell>
                <TableCell>{cliente.direccion}</TableCell>
                <TableCell>{cliente.pedidosRealizados}</TableCell>
                <TableCell>{cliente.contacto}</TableCell>
                <TableCell>
                  <Tooltip title={cliente.estado === "Activo" ? "Inactivar cliente" : "Activar cliente"}>
                    <IconButton
                      onClick={() => toggleEstado(cliente.id, cliente.estado)}
                      color={cliente.estado === "Activo" ? "success" : "default"}
                      size="small"
                    >
                      {cliente.estado === "Activo" ? <ToggleOn /> : <ToggleOff />}
                    </IconButton>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="Ver historial">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => navigate(`/historial?cliente=${cliente.nombre}`)}
                      >
                        <History />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar cliente">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => abrirEdicion(cliente)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {clientesFiltrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No hay clientes registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!editando} onClose={cerrarModal}>
        <DialogTitle>Editar Cliente</DialogTitle>
        <DialogContent>
          <TextField
            label="Nombre"
            name="nombre"
            value={formEdit.nombre}
            onChange={handleChange}
            fullWidth
            sx={{ mt: 1 }}
          />
          <TextField
            label="Dirección"
            name="direccion"
            value={formEdit.direccion}
            onChange={handleChange}
            fullWidth
            sx={{ mt: 2 }}
          />
          <TextField
            label="Contacto"
            name="contacto"
            value={formEdit.contacto}
            onChange={handleChange}
            fullWidth
            sx={{ mt: 2 }}
          />
          <TextField
            select
            label="Rol"
            name="rol"
            value={formEdit.rol}
            onChange={handleChange}
            fullWidth
            sx={{ mt: 2 }}
          >
            <MenuItem value="cliente">Cliente</MenuItem>
            <MenuItem value="repartidor">Repartidor</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarModal}>Cancelar</Button>
          <Button onClick={guardarCambios} variant="contained" color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}