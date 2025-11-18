import React, { useEffect, useState } from "react";
import {
  Drawer, List, ListItem, ListItemIcon, ListItemText,
  Toolbar, AppBar, Typography, Box, Collapse, Avatar, IconButton
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ListIcon from "@mui/icons-material/List";
import PersonIcon from "@mui/icons-material/Person";
import GroupIcon from "@mui/icons-material/Group";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";
import InventoryIcon from "@mui/icons-material/Inventory";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

import logo from "../assets/logo-transparente-white.png";

const drawerWidth = 240;

export default function AdminLayout() {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState(null);
  const [openReportes, setOpenReportes] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setCheckingAuth(false);
      } else {
        setUser(null);
        setCheckingAuth(false);
        setTimeout(() => navigate("/login", { replace: true }), 0);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login", { replace: true });
    } catch (error) {
      alert("Ocurrió un error al cerrar sesión.");
      console.error(error);
    }
  };

  if (checkingAuth) {
    return (
      <Box sx={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Typography variant="h6">Verificando sesión...</Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Typography variant="h6">Redirigiendo...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          ml: `${drawerWidth}px`,
          width: `calc(100% - ${drawerWidth}px)`,
          bgcolor: "#1565c0",
          display: "flex",
          justifyContent: "space-between",
          px: 2,
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
          <Typography variant="h6" noWrap>
            PropanoGO Admin
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* 👤 Icono de usuario con acceso al perfil */}
            <IconButton
              color="inherit"
              onClick={() => navigate("/perfil")}
              sx={{ p: 0 }}
            >
              <Avatar sx={{ bgcolor: "#fff", color: "#1565c0" }}>
                <AccountCircleIcon />
              </Avatar>
            </IconButton>

            {/* 🔴 Botón cerrar sesión */}
            <Typography
              sx={{
                cursor: "pointer",
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: "red",
                  color: "white",
                  borderRadius: "5px",
                  padding: "5px",
                  transition: "all 0.3s ease-in-out",
                },
              }}
              onClick={handleLogout}
            >
              Cerrar sesión
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* 📋 Menú lateral */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            bgcolor: "#1565c0",
            color: "white",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <img src={logo} alt="Logo" style={{ width: "120px" }} />
        </Box>

        <List>
          <ListItem button component={Link} to="/dashboard" sx={{ color: "white" }}>
            <ListItemIcon sx={{ color: "white" }}><DashboardIcon /></ListItemIcon>
            <ListItemText primary="Inicio" />
          </ListItem>

          <ListItem button component={Link} to="/pedidos" sx={{ color: "white" }}>
            <ListItemIcon sx={{ color: "white" }}><ListIcon /></ListItemIcon>
            <ListItemText primary="Pedidos" />
          </ListItem>

          <ListItem button component={Link} to="/repartidores" sx={{ color: "white" }}>
            <ListItemIcon sx={{ color: "white" }}><PersonIcon /></ListItemIcon>
            <ListItemText primary="Repartidores" />
          </ListItem>

          <ListItem button component={Link} to="/clientes" sx={{ color: "white" }}>
            <ListItemIcon sx={{ color: "white" }}><GroupIcon /></ListItemIcon>
            <ListItemText primary="Clientes" />
          </ListItem>

          <ListItem button component={Link} to="/inventario" sx={{ color: "white" }}>
            <ListItemIcon sx={{ color: "white" }}><InventoryIcon /></ListItemIcon>
            <ListItemText primary="Inventario" />
          </ListItem>

          {/* 🔽 Submenú Reportes */}
          <ListItem button onClick={() => setOpenReportes(!openReportes)} sx={{ color: "white" }}>
            <ListItemIcon sx={{ color: "white" }}><AssessmentIcon /></ListItemIcon>
            <ListItemText primary="Reportes" />
            {openReportes ? <ExpandLess /> : <ExpandMore />}
          </ListItem>

          <Collapse in={openReportes} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem button component={Link} to="/reportes" sx={{ pl: 4, color: "white" }}>
                <ListItemText primary="Ventas y estadísticas" />
              </ListItem>
              <ListItem button component={Link} to="/reportes/cilindros-alquilados" sx={{ pl: 4, color: "white" }}>
                <ListItemText primary="Cilindros alquilados" />
              </ListItem>
              <ListItem button component={Link} to="/reportes/intercambio-cilindros" sx={{ pl: 4, color: "white" }}>
                <ListItemText primary="Intercambio de cilindros" />
              </ListItem>
            </List>
          </Collapse>

          <ListItem button component={Link} to="/historial" sx={{ color: "white" }}>
            <ListItemIcon sx={{ color: "white" }}><ReceiptLongIcon /></ListItemIcon>
            <ListItemText primary="Historial" />
          </ListItem>

          <ListItem button component={Link} to="/configuracion" sx={{ color: "white" }}>
            <ListItemIcon sx={{ color: "white" }}><SettingsIcon /></ListItemIcon>
            <ListItemText primary="Configuración" />
          </ListItem>
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
