import React, { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Button, Grid, Divider, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField
} from "@mui/material";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, addDoc, collection, getDocs } from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";

export default function Configuracion() {
  const [modal, setModal] = useState(null);
  const [formData, setFormData] = useState({
    nuevaClave: "",
    nombrePlanta: "",
    direccionPlanta: "",
    zonaReparto: ""
  });

  const [crearUsuarioAbierto, setCrearUsuarioAbierto] = useState(false);
  const [zonasReparto, setZonasReparto] = useState([]);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: "",
    correo: "",
    contrasena: "",
    rol: "cliente",
    telefono: "",
    direccion: ""
  });

  useEffect(() => {
    cargarZonas();
  }, []);

  const cargarZonas = async () => {
    try {
      const snapshot = await getDocs(collection(firestore, "zonas_reparto"));
      const zonas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setZonasReparto(zonas);
    } catch (error) {
      console.error("Error al cargar zonas:", error);
    }
  };

  const abrirCrearUsuario = () => setCrearUsuarioAbierto(true);
  const cerrarCrearUsuario = () => {
    setCrearUsuarioAbierto(false);
    setNuevoUsuario({ nombre: "", correo: "", contrasena: "", rol: "cliente", telefono: "", direccion: "" });
  };

  const handleChangeUsuario = (e) => {
    setNuevoUsuario({ ...nuevoUsuario, [e.target.name]: e.target.value });
  };

  const handleCrearUsuario = async () => {
    const { nombre, correo, contrasena, rol, telefono, direccion } = nuevoUsuario;
    const auth = getAuth();

    if (!correo || !contrasena || !nombre || !telefono || !direccion) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, correo, contrasena);
      const uid = userCredential.user.uid;

      const fecha = new Date();
      const fecha_registro = `${fecha.getFullYear()}-${(fecha.getMonth() + 1)
        .toString().padStart(2, '0')}-${fecha.getDate()
        .toString().padStart(2, '0')} ${fecha.toLocaleTimeString()}`;

      await setDoc(doc(firestore, "usuario", uid), {
        uid,
        nombre,
        correo,
        rol,
        telefono,
        direccion,
        activo: true,
        estado: "Activo",
        fecha_registro,
      });

      alert("Usuario creado exitosamente.");
      cerrarCrearUsuario();
    } catch (error) {
      console.error("Error al crear usuario:", error);
      alert("Error: " + error.message);
    }
  };

  const abrirModal = (tipo) => setModal(tipo);
  const cerrarModal = () => {
    setModal(null);
    setFormData({ nuevaClave: "", nombrePlanta: "", direccionPlanta: "", zonaReparto: "" });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGuardar = async () => {
    if (modal === "zonas") {
      if (!formData.zonaReparto.trim()) {
        alert("La zona de reparto no puede estar vacía.");
        return;
      }

      try {
        await addDoc(collection(firestore, "zonas_reparto"), {
          nombre: formData.zonaReparto,
          activo: true,
          creada_en: new Date()
        });
        alert("Zona de reparto guardada correctamente.");
        await cargarZonas();
      } catch (error) {
        console.error("Error al guardar la zona:", error);
        alert("Error al guardar la zona.");
      }
    } else if (modal === "planta") {
      if (!formData.nombrePlanta.trim() || !formData.direccionPlanta.trim()) {
        alert("Todos los campos son obligatorios.");
        return;
      }

      try {
        await setDoc(doc(firestore, "empresa", "datos"), {
          nombrePlanta: formData.nombrePlanta,
          direccionPlanta: formData.direccionPlanta,
          actualizada_en: new Date()
        });

        alert("Datos de la planta guardados correctamente.");
      } catch (error) {
        console.error("Error al guardar datos de la empresa:", error);
        alert("Error al guardar los datos.");
      }
    }


    cerrarModal();
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Configuración del Sistema
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Opciones de configuración</Typography>
            <Divider sx={{ my: 2 }} />
            <Button fullWidth variant="outlined" sx={{ mb: 2 }} onClick={() => abrirModal("password")}>
              Cambiar contraseña
            </Button>
            <Button fullWidth variant="outlined" sx={{ mb: 2 }} onClick={() => abrirModal("planta")}>
              Editar datos de la planta
            </Button>
            <Button fullWidth variant="outlined" onClick={() => abrirModal("zonas")}>
              Establecer zonas de reparto
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Gestionar usuarios</Typography>
            <Divider sx={{ my: 2 }} />
            <Button fullWidth variant="contained" color="primary" onClick={abrirCrearUsuario}>
              + Crear nuevo usuario
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={!!modal} onClose={cerrarModal}>
        <DialogTitle>
          {modal === "password" && "Cambiar Contraseña"}
          {modal === "planta" && "Editar Datos de la Planta"}
          {modal === "zonas" && "Establecer Zona de Reparto"}
        </DialogTitle>
        <DialogContent>
          {modal === "password" && (
            <TextField
              label="Nueva contraseña"
              type="password"
              name="nuevaClave"
              fullWidth
              value={formData.nuevaClave}
              onChange={handleChange}
              sx={{ mt: 2 }}
            />
          )}
          {modal === "planta" && (
            <>
              <TextField
                label="Nombre de la planta"
                name="nombrePlanta"
                fullWidth
                value={formData.nombrePlanta}
                onChange={handleChange}
                sx={{ mt: 2 }}
              />
              <TextField
                label="Dirección"
                name="direccionPlanta"
                fullWidth
                value={formData.direccionPlanta}
                onChange={handleChange}
                sx={{ mt: 2 }}
              />
            </>
          )}
          {modal === "zonas" && (
            <>
              <TextField
                label="Zona de reparto"
                name="zonaReparto"
                fullWidth
                value={formData.zonaReparto}
                onChange={handleChange}
                sx={{ mt: 2, mb: 2 }}
              />
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Zonas registradas:</Typography>
              {zonasReparto.length === 0 ? (
                <Typography color="text.secondary">No hay zonas registradas aún.</Typography>
              ) : (
                <ul style={{ paddingLeft: "1.2em" }}>
                  {zonasReparto.map((zona) => (
                    <li key={zona.id}>{zona.nombre}</li>
                  ))}
                </ul>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarModal}>Cancelar</Button>
          <Button variant="contained" onClick={handleGuardar}>Guardar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={crearUsuarioAbierto} onClose={cerrarCrearUsuario}>
        <DialogTitle>Crear Nuevo Usuario</DialogTitle>
        <DialogContent>
          <TextField
            label="Nombre completo"
            name="nombre"
            fullWidth
            value={nuevoUsuario.nombre}
            onChange={handleChangeUsuario}
            sx={{ mt: 2 }}
          />
          <TextField
            label="Correo electrónico"
            name="correo"
            fullWidth
            value={nuevoUsuario.correo}
            onChange={handleChangeUsuario}
            sx={{ mt: 2 }}
          />
          <TextField
            label="Contraseña"
            name="contrasena"
            type="password"
            fullWidth
            value={nuevoUsuario.contrasena}
            onChange={handleChangeUsuario}
            sx={{ mt: 2 }}
          />
          <TextField
            label="Teléfono"
            name="telefono"
            fullWidth
            value={nuevoUsuario.telefono}
            onChange={handleChangeUsuario}
            sx={{ mt: 2 }}
          />
          <TextField
            label="Dirección"
            name="direccion"
            fullWidth
            value={nuevoUsuario.direccion}
            onChange={handleChangeUsuario}
            sx={{ mt: 2 }}
          />
          <TextField
            label="Rol"
            name="rol"
            select
            SelectProps={{ native: true }}
            fullWidth
            value={nuevoUsuario.rol}
            onChange={handleChangeUsuario}
            sx={{ mt: 2 }}
          >
            <option value="cliente">Cliente</option>
            <option value="repartidor">Repartidor</option>
            <option value="admin">Administrador</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarCrearUsuario}>Cancelar</Button>
          <Button variant="contained" onClick={handleCrearUsuario}>Crear</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
