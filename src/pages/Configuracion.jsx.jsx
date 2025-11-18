// Archivo: src/pages/Configuracion.jsx
import React, { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Button, Grid, Divider, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField
} from "@mui/material";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, addDoc, collection, getDocs, getDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";

export default function Configuracion() {
  const [modal, setModal] = useState(null);
  const [formData, setFormData] = useState({
    nuevaClave: "",
    nombrePlanta: "",
    direccionPlanta: "",
    zonaReparto: "",
    depositoCilindro: "" // NUEVO CAMPO
  });

  const [crearUsuarioAbierto, setCrearUsuarioAbierto] = useState(false);
  const [zonasReparto, setZonasReparto] = useState([]);
  const [sectoresZona, setSectoresZona] = useState([]);
  const [nuevoSector, setNuevoSector] = useState("");
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
    cargarDeposito(); // Cargar monto del depósito al iniciar
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

  const cargarDeposito = async () => {
    try {
      const docRef = doc(firestore, "empresa", "datos");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setFormData(prev => ({
          ...prev,
          depositoCilindro: docSnap.data().depositoCilindro || ""
        }));
      }
    } catch (error) {
      console.error("Error al cargar depósito:", error);
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
    setFormData({ ...formData, nuevaClave: "", nombrePlanta: "", direccionPlanta: "" });
    setSectoresZona([]);
    setNuevoSector("");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGuardar = async () => {
    try {
      if (modal === "zonas") {
        if (!formData.zonaReparto.trim()) {
          alert("La zona de reparto no puede estar vacía.");
          return;
        }
        await addDoc(collection(firestore, "zonas_reparto"), {
          nombre: formData.zonaReparto,
          sectores: sectoresZona,
          activo: true,
          creada_en: new Date()
        });
        alert("Zona de reparto guardada correctamente.");
        await cargarZonas();
        setSectoresZona([]);
        setFormData({ ...formData, zonaReparto: "" });
      } else if (modal === "planta") {
        if (!formData.nombrePlanta.trim() || !formData.direccionPlanta.trim()) {
          alert("Todos los campos son obligatorios.");
          return;
        }
        await setDoc(doc(firestore, "empresa", "datos"), {
          nombrePlanta: formData.nombrePlanta,
          direccionPlanta: formData.direccionPlanta,
          actualizada_en: new Date()
        });
        alert("Datos de la planta guardados correctamente.");
      } else if (modal === "deposito") {
        if (!formData.depositoCilindro || isNaN(formData.depositoCilindro)) {
          alert("Ingresa un monto válido para el depósito.");
          return;
        }
        await setDoc(doc(firestore, "empresa", "datos"), {
          depositoCilindro: Number(formData.depositoCilindro),
          actualizada_en: new Date()
        }, { merge: true });
        alert("Monto de depósito guardado correctamente.");
      }
    } catch (error) {
      console.error("Error al guardar datos:", error);
      alert("Ocurrió un error al guardar.");
    }
    cerrarModal();
  };

  // === FUNCION BACKUP COMPLETO ===
  const hacerBackupCompleto = async () => {
    try {
      const colecciones = ["usuario","zonas_reparto","empresa","producto","carga_repartidores"];
      const backupData = {};
      for (const nombreCol of colecciones) {
        const snapshot = await getDocs(collection(firestore, nombreCol));
        backupData[nombreCol] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
      const dataStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const fecha = new Date().toISOString().slice(0, 10);
      link.download = `backup_completo_sistema_${fecha}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert("Error al hacer backup completo: " + error.message);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Configuración del Sistema</Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Opciones de configuración</Typography>
            <Divider sx={{ my: 2 }} />
            <Button fullWidth variant="outlined" sx={{ mb: 2 }} onClick={() => abrirModal("password")}>Cambiar contraseña</Button>
            <Button fullWidth variant="outlined" sx={{ mb: 2 }} onClick={() => abrirModal("planta")}>Editar datos de la planta</Button>
            <Button fullWidth variant="outlined" sx={{ mb: 2 }} onClick={() => abrirModal("zonas")}>Establecer zonas de reparto</Button>
            {/* NUEVO BOTÓN DE DEPÓSITO */}
            <Button fullWidth variant="outlined" color="secondary" onClick={() => abrirModal("deposito")}>
              Configurar depósito de cilindro
            </Button>

            <Paper elevation={2} sx={{ p: 2, mt: 3 }}>
              <Typography variant="h6" gutterBottom>Respaldo</Typography>
              <Button fullWidth variant="outlined" color="error" onClick={hacerBackupCompleto}>
                Backup Completo del Sistema
              </Button>
            </Paper>
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

      {/* MODAL DE DEPÓSITO, PLANTA, ZONAS, PASSWORD */}
      <Dialog open={!!modal} onClose={cerrarModal}>
        <DialogTitle>
          {modal === "password" && "Cambiar Contraseña"}
          {modal === "planta" && "Editar Datos de la Planta"}
          {modal === "zonas" && "Establecer Zona de Reparto"}
          {modal === "deposito" && "Configurar Depósito de Cilindro"}
        </DialogTitle>
        <DialogContent>
          {modal === "password" && <TextField label="Nueva contraseña" type="password" name="nuevaClave" fullWidth value={formData.nuevaClave} onChange={handleChange} sx={{ mt: 2 }} />}
          {modal === "planta" && <>
            <TextField label="Nombre de la planta" name="nombrePlanta" fullWidth value={formData.nombrePlanta} onChange={handleChange} sx={{ mt: 2 }} />
            <TextField label="Dirección" name="direccionPlanta" fullWidth value={formData.direccionPlanta} onChange={handleChange} sx={{ mt: 2 }} />
          </>}
          {modal === "zonas" && <>
            <TextField label="Zona de reparto" name="zonaReparto" fullWidth value={formData.zonaReparto} onChange={handleChange} sx={{ mt: 2, mb: 2 }} />
            <TextField label="Agregar sector" value={nuevoSector} fullWidth onChange={(e) => setNuevoSector(e.target.value)} sx={{ mb: 1 }} />
            <Button variant="outlined" onClick={() => { if (nuevoSector.trim()) { setSectoresZona([...sectoresZona, nuevoSector.trim()]); setNuevoSector(""); } }} sx={{ mb: 2 }}>+ Agregar sector</Button>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Sectores agregados:</Typography>
            {sectoresZona.length === 0 ? <Typography color="text.secondary">Aún no hay sectores.</Typography> : <ul>{sectoresZona.map((sector, index) => (<li key={index}>{sector}</li>))}</ul>}
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Zonas registradas:</Typography>
            {zonasReparto.length === 0 ? <Typography color="text.secondary">No hay zonas registradas aún.</Typography> : <ul style={{ paddingLeft: "1.2em" }}>{zonasReparto.map((zona) => (<li key={zona.id}><strong>{zona.nombre}</strong>{zona.sectores && zona.sectores.length > 0 && (<ul>{zona.sectores.map((s, i) => (<li key={i}>{s}</li>))}</ul>)}</li>))}</ul>}
          </>}
          {modal === "deposito" && (
            <TextField
              label="Monto del depósito"
              name="depositoCilindro"
              type="number"
              fullWidth
              value={formData.depositoCilindro}
              onChange={handleChange}
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarModal}>Cancelar</Button>
          <Button variant="contained" onClick={handleGuardar}>Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal Crear Usuario */}
      <Dialog open={crearUsuarioAbierto} onClose={cerrarCrearUsuario}>
        <DialogTitle>Crear Nuevo Usuario</DialogTitle>
        <DialogContent>
          <TextField label="Nombre completo" name="nombre" fullWidth value={nuevoUsuario.nombre} onChange={handleChangeUsuario} sx={{ mt: 2 }} />
          <TextField label="Correo electrónico" name="correo" fullWidth value={nuevoUsuario.correo} onChange={handleChangeUsuario} sx={{ mt: 2 }} />
          <TextField label="Contraseña" name="contrasena" type="password" fullWidth value={nuevoUsuario.contrasena} onChange={handleChangeUsuario} sx={{ mt: 2 }} />
          <TextField label="Teléfono" name="telefono" fullWidth value={nuevoUsuario.telefono} onChange={handleChangeUsuario} sx={{ mt: 2 }} />
          <TextField label="Dirección" name="direccion" fullWidth value={nuevoUsuario.direccion} onChange={handleChangeUsuario} sx={{ mt: 2 }} />
          <TextField label="Rol" name="rol" select SelectProps={{ native: true }} fullWidth value={nuevoUsuario.rol} onChange={handleChangeUsuario} sx={{ mt: 2 }}>
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
