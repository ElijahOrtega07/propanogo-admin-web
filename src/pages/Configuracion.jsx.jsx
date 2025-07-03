import React, { useState } from "react";
import {
  Box, Typography, Paper, Button, Grid, Divider, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField
} from "@mui/material";

export default function Configuracion() {
  const [modal, setModal] = useState(null); // 'password' | 'planta' | 'zonas'
  const [formData, setFormData] = useState({
    nuevaClave: "",
    nombrePlanta: "",
    direccionPlanta: "",
    zonaReparto: ""
  });

  const abrirModal = (tipo) => setModal(tipo);
  const cerrarModal = () => {
    setModal(null);
    setFormData({ nuevaClave: "", nombrePlanta: "", direccionPlanta: "", zonaReparto: "" });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGuardar = () => {
    console.log("Datos enviados:", formData);
    cerrarModal();
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Configuración del Sistema
      </Typography>

      <Grid container spacing={2}>
        {/* Opciones de configuración */}
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

        {/* Gestión de usuarios */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Gestionar usuarios</Typography>
            <Divider sx={{ my: 2 }} />

            <Button fullWidth variant="contained" color="primary">
              + Crear nuevo usuario
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Diálogo común */}
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
            <TextField
              label="Zona de reparto"
              name="zonaReparto"
              fullWidth
              value={formData.zonaReparto}
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
    </Box>
  );
}
