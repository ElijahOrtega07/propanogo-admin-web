import React, { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, TableContainer, Paper, TextField, FormControl,
  InputLabel, Select, MenuItem, IconButton, Tooltip, Button,
  Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import {
  ToggleOn, ToggleOff, History, Save, Add
} from "@mui/icons-material";
import {
  collection, query, where, onSnapshot, doc, updateDoc, getDocs, addDoc
} from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

export default function Repartidores() {
  const [repartidores, setRepartidores] = useState([]);
  const [filtro, setFiltro] = useState({ nombre: "", estado: "Todos" });
  const [zonasDisponibles, setZonasDisponibles] = useState([]);
  const [cargaRepartidores, setCargaRepartidores] = useState({});
  const [productosMap, setProductosMap] = useState({});
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nuevoRepartidor, setNuevoRepartidor] = useState({
    nombre: "",
    correo: "",
    contraseña: "",
    telefono: "",
    direccion: ""
  });

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

  useEffect(() => {
    const cargarProductos = async () => {
      const productosSnap = await getDocs(collection(firestore, "producto"));
      const mapa = {};
      productosSnap.forEach(doc => {
        const data = doc.data();
        mapa[doc.id] = data.producto || "Sin nombre";
      });
      setProductosMap(mapa);
    };
    cargarProductos();
  }, []);

  useEffect(() => {
    const obtenerCargaManual = async () => {
      const carga = {};
      const cargaSnap = await getDocs(collection(firestore, "carga_repartidores"));
      cargaSnap.forEach(doc => {
        const data = doc.data();
        const idRep = data.id_repartidor;
        const idProd = data.id_producto;
        const cantidad = data.cantidad || 0;

        if (!idRep || !idProd) return;

        if (!carga[idRep]) carga[idRep] = {};
        if (!carga[idRep][idProd]) carga[idRep][idProd] = 0;

        carga[idRep][idProd] += cantidad;
      });
      setCargaRepartidores(carga);
    };

    obtenerCargaManual();
  }, [repartidores]);

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

  const abrirModal = () => {
    setNuevoRepartidor({
      nombre: "",
      correo: "",
      contraseña: "",
      telefono: "",
      direccion: ""
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
  };

  const guardarRepartidor = async () => {
    const { nombre, correo, contraseña, telefono, direccion } = nuevoRepartidor;

    if (!nombre.trim() || !correo.trim() || !contraseña.trim()) {
      return alert("Nombre, correo y contraseña son obligatorios");
    }

    try {
      await addDoc(collection(firestore, "usuario"), {
        nombre,
        correo,
        contraseña,
        telefono,
        direccion,
        estado: "Activo",
        rol: "repartidor",
        zona: ""
      });
      cerrarModal();
    } catch (error) {
      alert("Error al guardar repartidor: " + error.message);
    }
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

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box sx={{ display: "flex", gap: 2 }}>
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

        <Button
          variant="contained"
          startIcon={<Add />}
          color="primary"
          onClick={abrirModal}
        >
          Nuevo Repartidor
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Zona</TableCell>
              <TableCell><strong>Carga Actual</strong></TableCell>
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
                  {cargaRepartidores[rep.id]
                    ? Object.entries(cargaRepartidores[rep.id]).map(([producto, cantidad]) => (
                      <div key={producto}>
                        {cantidad} × {productosMap[producto] || producto}
                      </div>
                    ))
                    : "0 productos"}
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
                <TableCell colSpan={6} align="center">
                  No hay repartidores registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal para nuevo repartidor */}
      <Dialog open={modalAbierto} onClose={cerrarModal}>
        <DialogTitle>Nuevo Repartidor</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1, width: 400 }}>
          <TextField
            label="Nombre completo"
            value={nuevoRepartidor.nombre}
            onChange={(e) => setNuevoRepartidor({ ...nuevoRepartidor, nombre: e.target.value })}
            autoFocus
          />
          <TextField
            label="Correo electrónico"
            type="email"
            value={nuevoRepartidor.correo}
            onChange={(e) => setNuevoRepartidor({ ...nuevoRepartidor, correo: e.target.value })}
          />
          <TextField
            label="Contraseña"
            type="password"
            value={nuevoRepartidor.contraseña}
            onChange={(e) => setNuevoRepartidor({ ...nuevoRepartidor, contraseña: e.target.value })}
          />
          <TextField
            label="Teléfono"
            value={nuevoRepartidor.telefono}
            onChange={(e) => setNuevoRepartidor({ ...nuevoRepartidor, telefono: e.target.value })}
          />
          <TextField
            label="Dirección"
            value={nuevoRepartidor.direccion}
            onChange={(e) => setNuevoRepartidor({ ...nuevoRepartidor, direccion: e.target.value })}
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarModal}>Cancelar</Button>
          <Button onClick={guardarRepartidor} variant="contained" color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
