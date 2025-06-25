import React from "react";
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, AppBar, Typography, Box } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ListIcon      from "@mui/icons-material/List";
import PersonIcon    from "@mui/icons-material/Person";
import { Link, Outlet } from "react-router-dom";
import GroupIcon from "@mui/icons-material/Group";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";
import InventoryIcon from "@mui/icons-material/Inventory";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";




const drawerWidth = 240;

export default function AdminLayout() {
  return (
    <Box sx={{ display: "flex" }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, ml: `${drawerWidth}px`, width: `calc(100% - ${drawerWidth}px)` }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap>
            PropanoGO Admin
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" }
        }}
      >
        <Toolbar />
        <List>
          <ListItem button component={Link} to="/dashboard">
            <ListItemIcon><DashboardIcon /></ListItemIcon>
            <ListItemText primary="Inicio" />
          </ListItem>
          <ListItem button component={Link} to="/pedidos">
            <ListItemIcon><ListIcon /></ListItemIcon>
            <ListItemText primary="Pedidos" />
          </ListItem>
          <ListItem button component={Link} to="/repartidores">
            <ListItemIcon><PersonIcon /></ListItemIcon>
            <ListItemText primary="Repartidores" />
          </ListItem>
          <ListItem button component={Link} to="/clientes">
   <ListItemIcon><GroupIcon /></ListItemIcon>
  <ListItemText primary="Clientes" />
</ListItem>

<ListItem button component={Link} to="/inventario">
  <ListItemIcon><InventoryIcon /></ListItemIcon>
  <ListItemText primary="Inventario" />
</ListItem>


<ListItem button component={Link} to="/reportes">
  <ListItemIcon><AssessmentIcon /></ListItemIcon>
  <ListItemText primary="Reportes" />
</ListItem>

<ListItem button component={Link} to="/historial">
  <ListItemIcon><ReceiptLongIcon /></ListItemIcon>
  <ListItemText primary="Historial" />
</ListItem>

<ListItem button component={Link} to="/configuracion">
  <ListItemIcon><SettingsIcon /></ListItemIcon>
  <ListItemText primary="Configuración" />
</ListItem>

        </List>
      </Drawer>

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
