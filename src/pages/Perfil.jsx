import React, { useEffect, useState } from "react";
import { auth, firestore } from "../firebase/firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
} from "@mui/material";
import { Save, Edit, Cancel } from "@mui/icons-material";

const Perfil = () => {
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const obtenerDatosUsuario = async () => {
      if (user) {
        try {
          const docRef = doc(firestore, "usuario", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
        } catch (error) {
          console.error("Error al obtener datos del usuario:", error);
        }
      }
    };

    obtenerDatosUsuario();
  }, [user]);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleGuardar = async () => {
    if (!user) return;
    setLoading(true);
    setMensaje("");

    try {
      const docRef = doc(firestore, "usuario", user.uid);
      await updateDoc(docRef, {
        nombre: userData.nombre,
        telefono: userData.telefono,
        direccion: userData.direccion,
      });

      setEditMode(false);
      setMensaje("✅ Datos actualizados correctamente");
    } catch (error) {
      console.error("Error al actualizar datos:", error);
      setMensaje("❌ Error al actualizar los datos");
    }

    setLoading(false);
  };

  if (!userData) {
    return (
      <Box sx={{ mt: 10, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          Cargando datos del usuario...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
      <Card sx={{ maxWidth: 600, width: "100%", borderRadius: 3, boxShadow: 5 }}>
        <CardContent>
          <Typography variant="h4" sx={{ mb: 3, color: "#1976d2", fontWeight: "bold", textAlign: "center" }}>
            Perfil del Administrador
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Nombre"
                name="nombre"
                value={userData.nombre || ""}
                onChange={handleChange}
                fullWidth
                disabled={!editMode}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Correo"
                value={userData.correo || ""}
                fullWidth
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Teléfono"
                name="telefono"
                value={userData.telefono || ""}
                onChange={handleChange}
                fullWidth
                disabled={!editMode}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Dirección"
                name="direccion"
                value={userData.direccion || ""}
                onChange={handleChange}
                fullWidth
                disabled={!editMode}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Rol"
                value={userData.rol || ""}
                fullWidth
                disabled
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}>
            {!editMode ? (
              <Button
                variant="contained"
                color="primary"
                startIcon={<Edit />}
                onClick={() => setEditMode(true)}
              >
                Editar
              </Button>
            ) : (
              <>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<Save />}
                  onClick={handleGuardar}
                  disabled={loading}
                >
                  {loading ? "Guardando..." : "Guardar"}
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Cancel />}
                  onClick={() => setEditMode(false)}
                >
                  Cancelar
                </Button>
              </>
            )}
          </Box>

          {mensaje && (
            <Alert
              severity={mensaje.includes("✅") ? "success" : "error"}
              sx={{ mt: 3 }}
            >
              {mensaje}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Perfil;
