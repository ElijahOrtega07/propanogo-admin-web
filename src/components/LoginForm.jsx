import React, { useState } from "react";
import { TextField, Button, Paper, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, firestore } from "../firebase/firebaseConfig";
import { doc, onSnapshot } from "firebase/firestore";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;
      console.log("✅ Usuario autenticado:", user.uid);

      const userRef = doc(firestore, "usuario", user.uid);

      // 👂 Escuchar en tiempo real
      const unsubscribe = onSnapshot(userRef, async (userSnap) => {
        console.log("📥 Documento obtenido:", userSnap.exists());

        if (userSnap.exists()) {
          const userData = userSnap.data();
          console.log("🎯 Rol en tiempo real:", userData.rol);

          if (userData.rol === "administrador") {
            console.log("✅ Acceso concedido");
            unsubscribe();
            navigate("/dashboard");
          } else {
            console.warn("❌ Acceso denegado: No es administrador.");
            await signOut(auth);
            setError("Acceso denegado: No eres administrador.");
          }
        } else {
          console.warn("❌ Documento no encontrado");
          await signOut(auth);
          setError("No se encontró información del usuario.");
        }

        // ❗ Puedes cancelar la suscripción si solo quieres validar una vez
        // unsubscribe();
      });

    } catch (error) {
      console.error("❗ Error al iniciar sesión:", error);
      setError("Correo o contraseña inválidos.");
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f0f2f5"
      }}
    >
      <Paper sx={{ p: 4, width: 320 }}>
        <Typography variant="h5" mb={2} align="center">
          PropanoGO Admin
        </Typography>
        <form onSubmit={onSubmit}>
          <TextField
            label="Correo"
            type="email"
            autoComplete="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            fullWidth
            margin="normal"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />
          {error && (
            <Typography color="error" variant="body2" mt={1}>
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
          >
            Entrar
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
