import React, { useEffect, useState } from "react";
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
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

export default function Repartidores() {
  const [repartidores, setRepartidores] = useState([]);
  const [filtro, setFiltro] = useState({ nombre: "", estado: "Todos" });
  const navigate = useNavigate();
  const [zonasDisponibles, setZonasDisponibles] = useState([]);


  useEffect(() => {
    const q = query(collection(firestore, "usuario"), where("rol", "==", "repartidor"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRepartidores(lista);
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

  const repartidoresFiltrados = repartidores.filter(r =>
    r.nombre.toLowerCase().includes(filtro.nombre.toLowerCase()) &&
    (filtro.estado === "Todos" || r.estado === filtro.estado)
  );

  const verHistorial = (repartidorNombre) => {
    // Redirige a /historial con un parámetro de búsqueda
    navigate(`/historial?repartidor=${encodeURIComponent(repartidorNombre)}`);
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, "zonas_reparto"), (snapshot) => {
      const zonas = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id, // Por si necesitas usar el ID
          nombre: data.nombre || "Sin nombre"
        };
      });
      setZonasDisponibles(zonas);
    });
    return () => unsubscribe();
  }, []);



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

      {/* Tabla */}
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

              {/* Campo editable de zona */}
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


              {/* Botón para activar/inactivar */}
              <TableCell>
                <Button
                  onClick={() => toggleEstado(rep.id, rep.estado)}
                  size="small"
                >
                  {rep.estado === "Activo" ? "Inactivar" : "Activar"}
                </Button>
              </TableCell>

              {/* Acciones adicionales */}
              <TableCell sx={{ display: "flex", gap: 1 }}>
                <Button onClick={() => verHistorial(rep.nombre)} size="small">
                  Ver historial
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={async () => {
                    try {
                      const repartidorRef = doc(firestore, "usuario", rep.id);
                      await updateDoc(repartidorRef, { zona: rep.zona || "" });
                      alert("Zona actualizada correctamente");
                    } catch (error) {
                      alert("Error al actualizar zona: " + error.message);
                    }
                  }}
                >
                  Guardar zona
                </Button>
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
