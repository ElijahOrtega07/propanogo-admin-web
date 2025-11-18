
import React from "react";
import { GoogleMap, Marker, useLoadScript, InfoWindow } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100%",
};

export default function MapaPedido({ pedido }) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyDZt61-QGTNqPsE5N742Ru3ZDUQKgTodU0", 
  });

  if (!isLoaded) return <p style={{ textAlign: "center", marginTop: "2rem" }}>Cargando mapa...</p>;

  // Extraer ubicación del pedido
  const ubicacion = pedido.ubicacion_cliente;
  if (!ubicacion || !ubicacion.latitude || !ubicacion.longitude) return <p>No hay ubicación disponible</p>;

  const center = { lat: ubicacion.latitude, lng: ubicacion.longitude };

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={16}>
      <Marker position={center} title={pedido.direccion_entrega}>
        <InfoWindow position={center}>
          <div>
            <strong>{pedido.direccion_entrega || "Pedido"}</strong>
            <br />
            Cliente: {pedido.id_usuario || "Desconocido"}
          </div>
        </InfoWindow>
      </Marker>
    </GoogleMap>
  );
}
