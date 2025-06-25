import React, { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button
} from "@mui/material";

import {
  collection, getDocs, updateDoc, doc
} from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";

export default function Inventario() {
  const [galones, setGalones] = useState([]);

  useEffect(() => {
    obtenerInventario();
  }, []);

  const obtenerInventario = async () => {
    const snapshot = await getDocs(collection(firestore, "Inventario"));
    const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setGalones(lista);
  };

  const actualizarCantidad = async (id, cantidadActual, cambio) => {
    const nuevaCantidad = cantidadActual + cambio;
    const estado = nuevaCantidad < 10 ? "Bajo inventario" : "Disponible";
    const fecha = new Date().toLocaleDateString("es-DO");

    await updateDoc(doc(firestore, "Inventario", id), {
      cantidad: nuevaCantidad,
      ultimaEntrada: fecha,
      estado
    });

    obtenerInventario(); // refresca
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gestión de Inventario de Galones
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f0f0f0" }}>
            <TableRow>
              <TableCell>Tipo de Galón</TableCell>
              <TableCell>Cantidad Disponible</TableCell>
              <TableCell>Última Entrada</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {galones.map((g) => (
              <TableRow key={g.id}>
                <TableCell>{g.tipo}</TableCell>
                <TableCell>{g.cantidad}</TableCell>
                <TableCell>{g.ultimaEntrada}</TableCell>
                <TableCell>
                  <span
                    style={{
                      backgroundColor: g.estado === "Bajo inventario" ? "#ffcc80" : "#c8e6c9",
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontWeight: "bold",
                      fontSize: "12px"
                    }}
                  >
                    {g.estado}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="success"
                    size="small"
                    onClick={() => actualizarCantidad(g.id, g.cantidad, 1)}
                  >
                    Agregar
                  </Button>{" "}
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => actualizarCantidad(g.id, g.cantidad, -1)}
                  >
                    Descontar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {galones.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No hay registros de galones disponibles
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
