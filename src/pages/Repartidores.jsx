import React, { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, TableContainer, Paper, TextField, FormControl,
  InputLabel, Select, MenuItem, IconButton, Tooltip,
} from "@mui/material";
import {
  ToggleOn, ToggleOff, History, Save
} from "@mui/icons-material";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

export default function Repartidores() {
  const [repartidores, setRepartidores] = useState([]);
  const [filtro, setFiltro] = useState({ nombre: "", estado: "Todos" });
  const [zonasDisponibles, setZonasDisponibles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(firestore, "usuario"), where("rol", "==", "repartidor"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRepartidores(lista);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, "zonas_reparto"), (snapshot) => {
      const zonas = snapshot.docs.map(doc => ({
        id: doc.id,
        nombre: doc.data().nombre || "Sin nombre"
      }));
      setZonasDisponibles(zonas);
    });
    return () => unsubscribe();
  }, []);

  const toggleEstado = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === "Activo" ? "Inactivo" : "Activo";
    await updateDoc(doc(firestore, "usuario", id), { estado: nuevoEstado });
  };

  const handleFiltro = (e) => {
    setFiltro({ ...filtro, [e.target.name]: e.target.value });
  };

  const verHistorial = (nombre) => {
    navigate(`/historial?repartidor=${encodeURIComponent(nombre)}`);
  };

  const repartidoresFiltrados = repartidores.filter(r =>
    r.nombre.toLowerCase().includes(filtro.nombre.toLowerCase()) &&
    (filtro.estado === "Todos" || r.estado === filtro.estado)
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gestión de Repartidores
      </Typography>

      {/* Filtros */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          label="Buscar por nombre"
          name="nombre"
          variant="outlined"
          size="small"
          value={filtro.nombre}
          onChange={handleFiltro}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Estado</InputLabel>
          <Select
            name="estado"
            value={filtro.estado}
            label="Estado"
            onChange={handleFiltro}
          >
            <MenuItem value="Todos">Todos</MenuItem>
            <MenuItem value="Activo">Activo</MenuItem>
            <MenuItem value="Inactivo">Inactivo</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Zona</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {repartidoresFiltrados.map(rep => (
              <TableRow key={rep.id}>
                <TableCell>{rep.nombre}</TableCell>
                <TableCell>{rep.telefono || "––"}</TableCell>

                <TableCell>
                  <FormControl fullWidth size="small">
                    <Select
                      value={rep.zona || ""}
                      onChange={(e) => {
                        const nuevaZona = e.target.value;
                        setRepartidores(prev =>
                          prev.map(r =>
                            r.id === rep.id ? { ...r, zona: nuevaZona } : r
                          )
                        );
                      }}
                      displayEmpty
                    >
                      <MenuItem value="">-- Sin zona --</MenuItem>
                      {zonasDisponibles.map((zona) => (
                        <MenuItem key={zona.id} value={zona.nombre}>
                          {zona.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>

                <TableCell>
                  <Tooltip title={rep.estado === "Activo" ? "Inactivar" : "Activar"}>
                    <IconButton
                      onClick={() => toggleEstado(rep.id, rep.estado)}
                      color={rep.estado === "Activo" ? "success" : "default"}
                      size="small"
                    >
                      {rep.estado === "Activo" ? <ToggleOn /> : <ToggleOff />}
                    </IconButton>
                  </Tooltip>
                </TableCell>

                <TableCell>
                  <Tooltip title="Ver historial">
                    <IconButton onClick={() => verHistorial(rep.nombre)} size="small" color="info">
                      <History />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Guardar zona">
                    <IconButton
                      onClick={async () => {
                        try {
                          const repartidorRef = doc(firestore, "usuario", rep.id);
                          await updateDoc(repartidorRef, { zona: rep.zona || "" });
                          alert("Zona actualizada correctamente");
                        } catch (error) {
                          alert("Error al actualizar zona: " + error.message);
                        }
                      }}
                      size="small"
                      color="secondary"
                    >
                      <Save />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {repartidoresFiltrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No hay repartidores registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
