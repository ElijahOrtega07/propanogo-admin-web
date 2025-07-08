import React, { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField
} from "@mui/material";
import {
  collection, getDocs, updateDoc, doc, addDoc
} from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";
import { v4 as uuidv4 } from 'uuid';

export default function Inventario() {
  const [productos, setProductos] = useState([]);
  const [filtro, setFiltro] = useState("todos");
  const [openModal, setOpenModal] = useState(false);
  const [productoAReactivar, setProductoAReactivar] = useState(null);
  const [reactivarDatos, setReactivarDatos] = useState({ cantidad: "", precio: "", galones: "" });
  const [productoEditar, setProductoEditar] = useState(null);
  const [datosEditar, setDatosEditar] = useState({ producto: "", precio: "", galones: "" });
  const [nuevoProducto, setNuevoProducto] = useState({
    producto: "",
    descripcion: "",
    id_producto: "",
    precio: 0,
    cantidad: 0,
    galones: 0
  });

  useEffect(() => {
    obtenerInventario();
  }, []);

  const obtenerInventario = async () => {
    const snapshot = await getDocs(collection(firestore, "producto"));
    const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProductos(lista);
  };

  const actualizarCantidad = async (id, cantidadActual, cambio) => {
    const nuevaCantidad = cantidadActual + cambio;
    if (nuevaCantidad < 0) {
      alert("No puedes reducir más. La cantidad no puede ser menor a 0.");
      return;
    }
    let estado = "Disponible";
    if (nuevaCantidad === 0) estado = "Agotado";
    else if (nuevaCantidad < 10) estado = "Bajo inventario";
    const activo = nuevaCantidad > 0;
    const fecha = new Date().toLocaleDateString("es-DO");
    await updateDoc(doc(firestore, "producto", id), {
      cantidad: nuevaCantidad,
      ultimaEntrada: fecha,
      estado,
      activo
    });
    obtenerInventario();
  };

  const reactivarProducto = async () => {
    const { id, cantidad: actualCantidad } = productoAReactivar;
    const cantidad = reactivarDatos.cantidad !== "" ? Number(reactivarDatos.cantidad) : actualCantidad;
    const precio = reactivarDatos.precio !== "" ? Number(reactivarDatos.precio) : productoAReactivar.precio;
    const galones = reactivarDatos.galones !== "" ? Number(reactivarDatos.galones) : productoAReactivar.galones;
    let estado = "Disponible";
    if (cantidad === 0) estado = "Agotado";
    else if (cantidad < 10) estado = "Bajo inventario";
    const ultimaEntrada = new Date().toLocaleDateString("es-DO");
    await updateDoc(doc(firestore, "producto", id), {
      cantidad,
      precio,
      galones,
      estado,
      activo: true,
      ultimaEntrada
    });
    setProductoAReactivar(null);
    setReactivarDatos({ cantidad: "", precio: "", galones: "" });
    obtenerInventario();
  };

  const desactivarProducto = async (id) => {
    await updateDoc(doc(firestore, "producto", id), { activo: false });
    obtenerInventario();
  };

  const agregarProductoNuevo = async () => {
    const { producto, descripcion, precio, cantidad, galones } = nuevoProducto;
    if (!producto || !descripcion || precio <= 0 || cantidad < 0 || galones < 0) {
      alert("Completa todos los campos correctamente.");
      return;
    }
    const id_producto = uuidv4().substring(0, 8);
    let estado = "Disponible";
    if (cantidad === 0) estado = "Agotado";
    else if (cantidad < 10) estado = "Bajo inventario";
    const activo = cantidad > 0;
    const ultimaEntrada = new Date().toLocaleDateString("es-DO");
    await addDoc(collection(firestore, "producto"), {
      producto,
      descripcion,
      id_producto,
      precio,
      cantidad,
      galones,
      estado,
      activo,
      ultimaEntrada
    });
    setNuevoProducto({ producto: "", descripcion: "", precio: 0, cantidad: 0, galones: 0 });
    setOpenModal(false);
    obtenerInventario();
  };

  const aplicarFiltro = (producto) => {
    switch (filtro) {
      case "disponible": return producto.estado === "Disponible";
      case "bajo": return producto.estado === "Bajo inventario";
      case "activos": return producto.activo === true;
      case "desactivos": return producto.activo === false;
      default: return true;
    }
  };

  const editarProducto = async () => {
    await updateDoc(doc(firestore, "producto", productoEditar.id), {
      producto: datosEditar.producto,
      precio: Number(datosEditar.precio),
      galones: Number(datosEditar.galones)
    });
    setProductoEditar(null);
    setDatosEditar({ producto: "", precio: "", galones: "" });
    obtenerInventario();
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gestión de Inventario de Galones
      </Typography>

      <Box mb={2}>
        <Button variant="contained" color="primary" onClick={() => setOpenModal(true)}>
          Agregar nuevo producto
        </Button>
      </Box>

      {/* Modal de nuevo producto */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>Agregar Nuevo Producto</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField label="Nombre del producto" value={nuevoProducto.producto} onChange={(e) => setNuevoProducto({ ...nuevoProducto, producto: e.target.value })} />
          <TextField label="Descripción" value={nuevoProducto.descripcion} onChange={(e) => setNuevoProducto({ ...nuevoProducto, descripcion: e.target.value })} />
          <TextField label="Precio" type="number" value={nuevoProducto.precio} onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio: Number(e.target.value) })} />
          <TextField label="Cantidad" type="number" value={nuevoProducto.cantidad} onChange={(e) => setNuevoProducto({ ...nuevoProducto, cantidad: Number(e.target.value) })} />
          <TextField label="Galones" type="number" value={nuevoProducto.galones} onChange={(e) => setNuevoProducto({ ...nuevoProducto, galones: Number(e.target.value) })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancelar</Button>
          <Button onClick={agregarProductoNuevo} variant="contained" color="primary">Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal de reactivación */}
      <Dialog open={!!productoAReactivar} onClose={() => setProductoAReactivar(null)}>
        <DialogTitle>Reactivar Producto</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="body2">Producto: {productoAReactivar?.producto}</Typography>
          <TextField label="Nueva cantidad" type="number" value={reactivarDatos.cantidad} onChange={(e) => setReactivarDatos({ ...reactivarDatos, cantidad: e.target.value })} />
          <TextField label="Nuevo precio" type="number" value={reactivarDatos.precio} onChange={(e) => setReactivarDatos({ ...reactivarDatos, precio: e.target.value })} />
          <TextField label="Galones disponibles" type="number" value={reactivarDatos.galones} onChange={(e) => setReactivarDatos({ ...reactivarDatos, galones: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductoAReactivar(null)}>Cancelar</Button>
          <Button variant="contained" color="primary" onClick={reactivarProducto}>Guardar cambios</Button>
        </DialogActions>
      </Dialog>

      {/* Modal de edición */}
      <Dialog open={!!productoEditar} onClose={() => setProductoEditar(null)}>
        <DialogTitle>Editar Producto</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField label="Nuevo nombre" value={datosEditar.producto} onChange={(e) => setDatosEditar({ ...datosEditar, producto: e.target.value })} />
          <TextField label="Nuevo precio" type="number" value={datosEditar.precio} onChange={(e) => setDatosEditar({ ...datosEditar, precio: e.target.value })} />
          <TextField label="Galones" type="number" value={datosEditar.galones} onChange={(e) => setDatosEditar({ ...datosEditar, galones: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductoEditar(null)}>Cancelar</Button>
          <Button variant="contained" onClick={editarProducto}>Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* Filtro */}
      <Box mb={2}>
        <Typography variant="subtitle1">Filtrar por:</Typography>
        <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          <option value="todos">Todos</option>
          <option value="disponible">Disponibles</option>
          <option value="bajo">Bajo Inventario</option>
          <option value="activos">Activos</option>
          <option value="desactivos">Desactivos</option>
        </select>
      </Box>

      {/* Tabla */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f0f0f0" }}>
            <TableRow>
              <TableCell>Producto</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Galones</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell>Última Entrada</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {productos.filter(aplicarFiltro).map((g) => (
              <TableRow key={g.id}>
                <TableCell>{g.producto}</TableCell>
                <TableCell>{g.cantidad}</TableCell>
                <TableCell>{g.galones ?? 0}</TableCell>
                <TableCell>${g.precio}</TableCell>
                <TableCell>{g.ultimaEntrada}</TableCell>
                <TableCell>
                  <span style={{
                    backgroundColor: g.estado === "Agotado" ? "#ef9a9a" : g.estado === "Bajo inventario" ? "#ffcc80" : "#c8e6c9",
                    padding: "4px 10px", borderRadius: "12px", fontWeight: "bold", fontSize: "12px"
                  }}>{g.estado}</span>
                </TableCell>
                <TableCell>
                  {g.activo ? (
                    <>
                      <Button variant="outlined" size="small" color="success" onClick={() => actualizarCantidad(g.id, g.cantidad, 1)}>Agregar</Button>{" "}
                      <Button variant="outlined" size="small" color="error" onClick={() => actualizarCantidad(g.id, g.cantidad, -1)}>Descontar</Button>{" "}
                      <Button variant="outlined" size="small" color="warning" onClick={() => desactivarProducto(g.id)}>Desactivar</Button>{" "}
                      <Button variant="outlined" size="small" color="info" onClick={() => {
                        setProductoEditar(g);
                        setDatosEditar({ producto: g.producto, precio: g.precio, galones: g.galones });
                      }}>Editar</Button>
                    </>
                  ) : (
                    <Button variant="outlined" size="small" onClick={() => setProductoAReactivar(g)}>
                      Reactivar producto
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {productos.filter(aplicarFiltro).length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No hay registros que coincidan con el filtro seleccionado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
