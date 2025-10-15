import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, InfoWindow, useLoadScript } from "@react-google-maps/api";
import { collection, onSnapshot, getDocs } from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

const center = {
  lat: 19.222,
  lng: -70.529,
};

export default function MapaRepartidores() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyDZt61-QGTNqPsE5N742Ru3ZDUQKgTodU0",
  });

  const [repartidores, setRepartidores] = useState([]);
  const [pedidosPendientes, setPedidosPendientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [selected, setSelected] = useState(null);

  // Cargar usuarios para obtener nombres
  useEffect(() => {
    async function cargarUsuarios() {
      const snapshot = await getDocs(collection(firestore, "usuario"));
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsuarios(lista);
    }
    cargarUsuarios();
  }, []);

  // Repartidores
  useEffect(() => {
    const unsub = onSnapshot(collection(firestore, "ubicaciones_repartidores"), snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRepartidores(data);
    });
    return () => unsub();
  }, []);

  // Pedidos pendientes
  useEffect(() => {
    const unsub = onSnapshot(collection(firestore, "pedidos"), snapshot => {
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(p => p.estado === "Pendiente" && (!p.id_repartidor || p.id_repartidor === ""));
      setPedidosPendientes(data);

      // Debug: verificar si hay pedidos sin ubicación
      data.forEach(p => {
        if (!p.ubicacion_cliente?.latitude || !p.ubicacion_cliente?.longitude) {
          console.warn("Pedido pendiente sin ubicación:", p.id, p.direccion_entrega);
        }
      });
    });
    return () => unsub();
  }, []);

  if (!isLoaded) return <p style={{ textAlign: "center", marginTop: "2rem" }}>Cargando mapa...</p>;

  // Obtener nombre del cliente
  const nombreCliente = (id_usuario) => {
    const u = usuarios.find(user => user.id === id_usuario);
    return u?.nombre || "Cliente desconocido";
  };

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={13}>
      {/* Marcadores de repartidores */}
      {repartidores.map(rep => {
        const ubicacion = rep.ubicacion_repartidor;
        if (!ubicacion?.latitude || !ubicacion?.longitude) return null;

        return (
          <Marker
            key={rep.id}
            position={{ lat: ubicacion.latitude, lng: ubicacion.longitude }}
            onClick={() => setSelected({ tipo: "repartidor", data: rep })}
            icon={{
              url: "https://cdn-icons-png.flaticon.com/512/854/854878.png",
              scaledSize: new window.google.maps.Size(45, 45),
            }}
          />
        );
      })}

      {/* Marcadores de pedidos pendientes */}
      {pedidosPendientes.map(p => {
        const ubicacion = p.ubicacion_cliente;
        if (!ubicacion?.latitude || !ubicacion?.longitude) return null;

        return (
          <Marker
            key={p.id}
            position={{ lat: ubicacion.latitude, lng: ubicacion.longitude }}
            onClick={() => setSelected({ tipo: "pedido", data: p })}
            icon={{
              url: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
              scaledSize: new window.google.maps.Size(40, 40),
            }}
          />
        );
      })}

      {/* InfoWindow */}
      {selected && (
        <InfoWindow
          position={
            selected.tipo === "repartidor"
              ? {
                  lat: selected.data.ubicacion_repartidor.latitude,
                  lng: selected.data.ubicacion_repartidor.longitude,
                }
              : {
                  lat: selected.data.ubicacion_cliente.latitude,
                  lng: selected.data.ubicacion_cliente.longitude,
                }
          }
          onCloseClick={() => setSelected(null)}
        >
          <div>
            {selected.tipo === "repartidor" ? (
              <>
                <strong>{selected.data.nombre_repartidor || "Repartidor"}</strong><br />
                ID: {selected.data.id_repartidor || "––"}
              </>
            ) : (
              <>
                <strong>Pedido pendiente</strong><br />
                Cliente: {nombreCliente(selected.data.id_usuario)}<br />
                Dirección: {selected.data.direccion_entrega || "––"}<br />
                Servicio: {selected.data.tipo_servicio || "––"}
              </>
            )}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
