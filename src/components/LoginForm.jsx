import React, { useState } from "react";
import { TextField, Button, Paper, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, firestore } from "../firebase/firebaseConfig";
import { doc, onSnapshot } from "firebase/firestore";

import backgroundImg from "../assets/background.jpg";
import logoImg from "../assets/logo.png";

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

      const userRef = doc(firestore, "usuario", user.uid);
      const unsubscribe = onSnapshot(userRef, async (userSnap) => {
        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.rol === "administrador") {
            unsubscribe();
            navigate("/dashboard");
          } else {
            await signOut(auth);
            setError("Acceso denegado: No eres administrador.");
          }
        } else {
          await signOut(auth);
          setError("No se encontró información del usuario.");
        }
      });
    } catch (error) {
      setError("Correo o contraseña inválidos.");
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        overflow: "hidden",
      }}
    >
      {/* Imagen de fondo con blur */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `url(${backgroundImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(8px)",
          zIndex: 0,
          transform: "scale(1.1)",
        }}
      />

      {/* Formulario encima del fondo borroso */}
      <Paper
        sx={{
          p: 4,
          width: 320,
          textAlign: "center",
          zIndex: 1,
          position: "relative",
          backgroundColor: "rgba(255, 255, 255, 0.85)", // fondo semi-transparente para mejor lectura
          boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
          borderRadius: 2,
        }}
      >
       <Box
          component="img"
          src={logoImg}
          alt="Logo"
          sx={{
            width: 120,
            height: 120,              // Le das forma cuadrada para redondearlo bien
            mb: 3,
            mx: "auto",
            display: "block",
            objectFit: "cover",       // Para que no se deforme
            borderRadius: 4,          // Esquinas ligeramente redondeadas
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)" // Sombra sutil
          }}
          />

        <Typography variant="h5" mb={2}>
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
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            Entrar
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
