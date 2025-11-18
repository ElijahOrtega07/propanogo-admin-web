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

  useEffect(() => {
    async function cargarUsuarios() {
      const snapshot = await getDocs(collection(firestore, "usuario"));
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsuarios(lista);
    }
    cargarUsuarios();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(firestore, "ubicaciones_repartidores"), snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRepartidores(data);
    });
    return () => unsub();
  }, []);

  // 🔥 OPCIÓN B: Solo mostrar pedidos donde estado === "Pendiente"
  useEffect(() => {
    const unsub = onSnapshot(collection(firestore, "pedidos"), snapshot => {
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(p => p.estado === "Pendiente");

      setPedidosPendientes(data);
    });
    return () => unsub();
  }, []);

  if (!isLoaded)
    return <p style={{ textAlign: "center", marginTop: "2rem" }}>Cargando mapa...</p>;

  const nombreCliente = (id_usuario) => {
    const u = usuarios.find(user => user.id === id_usuario);
    return u?.nombre || "Cliente desconocido";
  };

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={13}>
      {repartidores.map(rep => {
        const ubicacion = rep.ubicacion_repartidor;
        if (!ubicacion?.latitude || !ubicacion?.longitude) return null;

        return (
          <Marker
            key={rep.id}
            position={{ lat: ubicacion.latitude, lng: ubicacion.longitude }}
            onClick={() => setSelected({ tipo: "repartidor", data: rep })}
            icon={{
              url: "https://png.pngtree.com/png-clipart/20190516/original/pngtree-vector-truck-icon-png-image_3782904.jpg",
              scaledSize: new window.google.maps.Size(50, 50),
            }}
          />
        );
      })}

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
