import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Button
} from "@mui/material";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";

export default function Repartidores() {
  const [repartidores, setRepartidores] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, "repartidores"), (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRepartidores(lista);
    });
    return () => unsubscribe();
  }, []);

  const toggleEstado = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === "Activo" ? "Inactivo" : "Activo";
    await updateDoc(doc(firestore, "repartidores", id), { estado: nuevoEstado });
  };

  const verHistorial = (nombre) => {
    console.log(`Ver historial de ${nombre}`);
    // Aquí puedes mostrar un modal en el futuro
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gestión de Repartidores
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Zona</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {repartidores.map(rep => (
              <TableRow key={rep.id}>
                <TableCell>{rep.nombre}</TableCell>
                <TableCell>{rep.telefono}</TableCell>
                <TableCell>{rep.zona}</TableCell>
                <TableCell>
                  <Button
                    onClick={() => toggleEstado(rep.id, rep.estado)}
                    size="small"
                  >
                    {rep.estado === "Activo" ? "Inactivar" : "Activar"}
                  </Button>
                </TableCell>
                <TableCell>
                  <Button onClick={() => verHistorial(rep.nombre)} size="small">
                    Ver historial
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
