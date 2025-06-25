import React, { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button
} from "@mui/material";

import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    obtenerClientes();
  }, []);

  const obtenerClientes = async () => {
    const snapshot = await getDocs(collection(firestore, "usuarios")); // o "clientes"
    const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setClientes(lista);
  };

  const suspenderCliente = async (id) => {
    await updateDoc(doc(firestore, "usuarios", id), {
      estado: "Suspendido"
    });
    obtenerClientes();
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gestión de Clientes
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f0f0f0" }}>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Dirección</TableCell>
              <TableCell>Pedidos Realizados</TableCell>
              <TableCell>Contacto</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clientes.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell>{cliente.nombre}</TableCell>
                <TableCell>{cliente.direccion || "––"}</TableCell>
                <TableCell>{cliente.pedidosRealizados || 0}</TableCell>
                <TableCell>{cliente.contacto || "––"}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => alert("Ver historial aún no implementado")}
                  >
                    Ver Historial
                  </Button>
                  <Button
                    size="small"
                    color="warning"
                    onClick={() => suspenderCliente(cliente.id)}
                  >
                    Suspender
                  </Button>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => alert("Editar aún no implementado")}
                  >
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {clientes.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No hay clientes registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
