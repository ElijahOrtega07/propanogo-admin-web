// Archivo: src/pages/Configuracion.jsx
import React from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Divider
} from "@mui/material";

export default function Configuracion() {
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

            <Button fullWidth variant="outlined" sx={{ mb: 2 }}>
              Cambiar contraseña
            </Button>
            <Button fullWidth variant="outlined" sx={{ mb: 2 }}>
              Editar datos de la planta
            </Button>
            <Button fullWidth variant="outlined">
              Establecer zonas de reparto
            </Button>
          </Paper>
        </Grid>

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
    </Box>
  );
}
