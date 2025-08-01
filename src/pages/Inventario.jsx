import React, { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Tooltip, IconButton,
  FormControl, Select, InputLabel, MenuItem
} from "@mui/material";
import {
  collection, getDocs, updateDoc, doc, addDoc
} from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";
import { v4 as uuidv4 } from 'uuid';
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Block";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

export default function Inventario() {
  const [productos, setProductos] = useState([]);
  const [filtro, setFiltro] = useState("todos");
  const [openModal, setOpenModal] = useState(false);
  const [productoAReactivar, setProductoAReactivar] = useState(null);
  const [reactivarDatos, setReactivarDatos] = useState({ cantidad: "", precio: "" });
  const [productoEditar, setProductoEditar] = useState(null);
  const [datosEditar, setDatosEditar] = useState({ producto: "", precio: "" });
  const [nuevoProducto, setNuevoProducto] = useState({
    producto: "",
    descripcion: "",
    id_producto: "",
    precio: 0,
    cantidad: 0,
    tipo: "producto",
  });

  // Estado para modal de compras
  const [openCompra, setOpenCompra] = useState(false);
  const [compraDatos, setCompraDatos] = useState({
    idProducto: "",
    cantidad: 0,
    costo: 0
  });

  // Estado para historial de compras
  const [compras, setCompras] = useState([]);

  useEffect(() => {
    obtenerInventario();
    obtenerCompras();
  }, []);

  const obtenerInventario = async () => {
    try {
      const snapshot = await getDocs(collection(firestore, "producto"));
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProductos(lista);
    } catch (error) {
      console.error("Error al obtener inventario:", error);
    }
  };

  const obtenerCompras = async () => {
    try {
      const snapshot = await getDocs(collection(firestore, "compras"));
      const listaCompras = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCompras(listaCompras);
    } catch (error) {
      console.error("Error al obtener compras:", error);
    }
  };

  const actualizarCantidad = async (id, cantidadActual, cambio) => {
    try {
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
    } catch (error) {
      console.error("Error al actualizar cantidad:", error);
    }
  };

  const reactivarProducto = async () => {
    try {
      if (!productoAReactivar) return;
      const { id, cantidad: actualCantidad } = productoAReactivar;
      const cantidad = reactivarDatos.cantidad !== "" ? Number(reactivarDatos.cantidad) : actualCantidad;
      const precio = reactivarDatos.precio !== "" ? Number(reactivarDatos.precio) : productoAReactivar.precio;
      let estado = "Disponible";
      if (cantidad === 0) estado = "Agotado";
      else if (cantidad < 10) estado = "Bajo inventario";
      const ultimaEntrada = new Date().toLocaleDateString("es-DO");
      await updateDoc(doc(firestore, "producto", id), {
        cantidad,
        precio,
        estado,
        activo: true,
        ultimaEntrada
      });
      setProductoAReactivar(null);
      setReactivarDatos({ cantidad: "", precio: "" });
      obtenerInventario();
    } catch (error) {
      console.error("Error al reactivar producto:", error);
    }
  };

  const desactivarProducto = async (id) => {
    try {
      await updateDoc(doc(firestore, "producto", id), { activo: false });
      obtenerInventario();
    } catch (error) {
      console.error("Error al desactivar producto:", error);
    }
  };

  const agregarProductoNuevo = async () => {
    try {
      const { producto, descripcion, precio, cantidad, tipo } = nuevoProducto;
      if (!producto || !descripcion || precio <= 0 || cantidad < 0) {
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
        tipo,
        estado,
        activo,
        ultimaEntrada
      });
      setNuevoProducto({ producto: "", descripcion: "", precio: 0, cantidad: 0, tipo: "producto" });
      setOpenModal(false);
      obtenerInventario();
    } catch (error) {
      console.error("Error al agregar producto nuevo:", error);
    }
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
    try {
      if (!productoEditar) return;
      await updateDoc(doc(firestore, "producto", productoEditar.id), {
        producto: datosEditar.producto,
        precio: Number(datosEditar.precio)
      });
      setProductoEditar(null);
      setDatosEditar({ producto: "", precio: "" });
      obtenerInventario();
    } catch (error) {
      console.error("Error al editar producto:", error);
    }
  };

  const registrarCompra = async () => {
    try {
      const { idProducto, cantidad, costo } = compraDatos;
      if (!idProducto || cantidad <= 0 || costo <= 0) {
        alert("Completa todos los campos de la compra.");
        return;
      }

      const productoRef = doc(firestore, "producto", idProducto);
      const producto = productos.find(p => p.id === idProducto);
      const nuevaCantidad = (producto.cantidad || 0) + cantidad;
      let estado = "Disponible";
      if (nuevaCantidad === 0) estado = "Agotado";
      else if (nuevaCantidad < 10) estado = "Bajo inventario";

      const ultimaEntrada = new Date().toLocaleDateString("es-DO");

      await updateDoc(productoRef, {
        cantidad: nuevaCantidad,
        ultimaEntrada,
        estado,
        activo: true
      });

      // Guardar historial en colección compras
      await addDoc(collection(firestore, "compras"), {
        id_producto: idProducto,
        producto: producto.producto,
        cantidad,
        costo,
        fecha: ultimaEntrada
      });

      setOpenCompra(false);
      setCompraDatos({ idProducto: "", cantidad: 0, costo: 0 });
      obtenerInventario();
      obtenerCompras();
    } catch (error) {
      console.error("Error al registrar compra:", error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gestión de Inventario
      </Typography>

      <Box mb={2} sx={{ display: "flex", gap: 2 }}>
        <Button variant="contained" color="primary" onClick={() => setOpenModal(true)}>
          Agregar nuevo producto
        </Button>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<ShoppingCartIcon />}
          onClick={() => setOpenCompra(true)}
        >
          Registrar en Inventario
        </Button>
      </Box>

      {/* Modal de nuevo producto */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>Agregar Nuevo Producto</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Nombre del producto"
            value={nuevoProducto.producto}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, producto: e.target.value })}
          />
          <TextField
            label="Descripción"
            value={nuevoProducto.descripcion}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, descripcion: e.target.value })}
          />
          <TextField
            select
            label="Tipo"
            value={nuevoProducto.tipo}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, tipo: e.target.value })}
            SelectProps={{ native: true }}
          >
            <option value="producto">Producto</option>
            <option value="servicio">Servicio</option>
          </TextField>
          <TextField
            label="Precio"
            type="number"
            value={nuevoProducto.precio}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio: Number(e.target.value) })}
          />
          {nuevoProducto.tipo === "producto" && (
            <TextField
              label="Cantidad"
              type="number"
              value={nuevoProducto.cantidad}
              onChange={(e) => setNuevoProducto({ ...nuevoProducto, cantidad: Number(e.target.value) })}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancelar</Button>
          <Button onClick={agregarProductoNuevo} variant="contained" color="primary">Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal para Reactivar producto */}
      <Dialog open={!!productoAReactivar} onClose={() => setProductoAReactivar(null)}>
        <DialogTitle>Reactivar Producto</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Cantidad"
            type="number"
            value={reactivarDatos.cantidad}
            onChange={(e) => setReactivarDatos({ ...reactivarDatos, cantidad: e.target.value })}
            placeholder={productoAReactivar?.cantidad?.toString() || ""}
          />
          <TextField
            label="Precio"
            type="number"
            value={reactivarDatos.precio}
            onChange={(e) => setReactivarDatos({ ...reactivarDatos, precio: e.target.value })}
            placeholder={productoAReactivar?.precio?.toString() || ""}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductoAReactivar(null)}>Cancelar</Button>
          <Button onClick={reactivarProducto} variant="contained" color="primary">
            Reactivar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para Editar producto */}
      <Dialog open={!!productoEditar} onClose={() => setProductoEditar(null)}>
        <DialogTitle>Editar Producto</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Nombre del producto"
            value={datosEditar.producto}
            onChange={(e) => setDatosEditar({ ...datosEditar, producto: e.target.value })}
          />
          <TextField
            label="Precio"
            type="number"
            value={datosEditar.precio}
            onChange={(e) => setDatosEditar({ ...datosEditar, precio: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductoEditar(null)}>Cancelar</Button>
          <Button onClick={editarProducto} variant="contained" color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de compra */}
      <Dialog open={openCompra} onClose={() => setOpenCompra(false)}>
        <DialogTitle>Agregar a Inventario</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Producto</InputLabel>
            <Select
              value={compraDatos.idProducto}
              label="Producto"
              onChange={(e) => setCompraDatos({ ...compraDatos, idProducto: e.target.value })}
            >
              {productos.map((prod) => (
                <MenuItem key={prod.id} value={prod.id}>
                  {prod.producto}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Cantidad"
            type="number"
            value={compraDatos.cantidad}
            onChange={(e) => setCompraDatos({ ...compraDatos, cantidad: Number(e.target.value) })}
          />
          <TextField
            label="Costo total"
            type="number"
            value={compraDatos.costo}
            onChange={(e) => setCompraDatos({ ...compraDatos, costo: Number(e.target.value) })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCompra(false)}>Cancelar</Button>
          <Button variant="contained" color="secondary" onClick={registrarCompra}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Filtro */}
      <Box mb={2}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filtrar por</InputLabel>
          <Select
            value={filtro}
            label="Filtrar por"
            onChange={(e) => setFiltro(e.target.value)}
          >
            <MenuItem value="todos">Todos</MenuItem>
            <MenuItem value="disponible">Disponibles</MenuItem>
            <MenuItem value="bajo">Bajo Inventario</MenuItem>
            <MenuItem value="activos">Activos</MenuItem>
            <MenuItem value="desactivos">Desactivos</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Tabla de Inventario */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f0f0f0" }}>
            <TableRow>
              <TableCell>Producto</TableCell>
              <TableCell>Cantidad</TableCell>
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
                      <Tooltip title="Agregar cantidad">
                        <IconButton color="success" onClick={() => actualizarCantidad(g.id, g.cantidad, 1)}>
                          <AddIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Descontar cantidad">
                        <IconButton color="error" onClick={() => actualizarCantidad(g.id, g.cantidad, -1)}>
                          <RemoveIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Desactivar producto">
                        <IconButton color="warning" onClick={() => desactivarProducto(g.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar producto">
                        <IconButton color="info" onClick={() => {
                          setProductoEditar(g);
                          setDatosEditar({ producto: g.producto, precio: g.precio });
                        }}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  ) : (
                    <Tooltip title="Reactivar producto">
                      <IconButton onClick={() => setProductoAReactivar(g)}>
                        <RestartAltIcon />
                      </IconButton>
                    </Tooltip>
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

      {/* Tabla de Historial de Compras */}
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Historial de Compras
        </Typography>
        <Button variant="outlined" onClick={obtenerCompras} sx={{ mb: 2 }}>
          Actualizar historial de compras
        </Button>
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: "#f0f0f0" }}>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell>Cantidad</TableCell>
                <TableCell>Costo</TableCell>
                <TableCell>Fecha</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {compras.length > 0 ? (
                compras.map((compra) => (
                  <TableRow key={compra.id}>
                    <TableCell>{compra.producto}</TableCell>
                    <TableCell>{compra.cantidad}</TableCell>
                    <TableCell>${compra.costo}</TableCell>
                    <TableCell>{compra.fecha}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No hay compras registradas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}
