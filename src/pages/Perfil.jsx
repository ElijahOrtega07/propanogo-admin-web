import React, { useEffect, useState } from "react";
import { auth, firestore } from "../firebase/firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const Perfil = () => {
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const obtenerDatosUsuario = async () => {
      if (user) {
        try {
          const docRef = doc(firestore, "usuario", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            console.log("No se encontró el documento del usuario.");
          }
        } catch (error) {
          console.error("Error al obtener datos del usuario:", error);
        }
      }
    };

    obtenerDatosUsuario();
  }, [user]);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleGuardar = async () => {
    if (!user) return;
    setLoading(true);
    setMensaje("");

    try {
      const docRef = doc(firestore, "usuario", user.uid);
      await updateDoc(docRef, {
        nombre: userData.nombre,
        telefono: userData.telefono,
        direccion: userData.direccion,
      });

      setEditMode(false);
      setMensaje("✅ Datos actualizados correctamente");
    } catch (error) {
      console.error("Error al actualizar datos:", error);
      setMensaje("❌ Error al actualizar los datos");
    }

    setLoading(false);
  };

  if (!userData) {
    return <p>Cargando datos del usuario...</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Perfil del Administrador</h2>

      <div className="bg-white rounded-xl shadow-md p-4 max-w-md">
        <div className="mb-3">
          <label className="font-semibold block mb-1">Nombre:</label>
          <input
            type="text"
            name="nombre"
            value={userData.nombre || ""}
            onChange={handleChange}
            disabled={!editMode}
            className={`w-full p-2 border rounded ${
              editMode ? "border-blue-500" : "bg-gray-100"
            }`}
          />
        </div>

        <div className="mb-3">
          <label className="font-semibold block mb-1">Correo:</label>
          <input
            type="email"
            value={userData.correo || ""}
            disabled
            className="w-full p-2 border rounded bg-gray-100"
          />
        </div>

        <div className="mb-3">
          <label className="font-semibold block mb-1">Teléfono:</label>
          <input
            type="text"
            name="telefono"
            value={userData.telefono || ""}
            onChange={handleChange}
            disabled={!editMode}
            className={`w-full p-2 border rounded ${
              editMode ? "border-blue-500" : "bg-gray-100"
            }`}
          />
        </div>

        <div className="mb-3">
          <label className="font-semibold block mb-1">Dirección:</label>
          <input
            type="text"
            name="direccion"
            value={userData.direccion || ""}
            onChange={handleChange}
            disabled={!editMode}
            className={`w-full p-2 border rounded ${
              editMode ? "border-blue-500" : "bg-gray-100"
            }`}
          />
        </div>

        <div className="mb-3">
          <label className="font-semibold block mb-1">Rol:</label>
          <input
            type="text"
            value={userData.rol || ""}
            disabled
            className="w-full p-2 border rounded bg-gray-100"
          />
        </div>

        {/* Botones */}
        <div className="flex gap-3 mt-4">
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Editar
            </button>
          ) : (
            <>
              <button
                onClick={handleGuardar}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                {loading ? "Guardando..." : "Guardar cambios"}
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Cancelar
              </button>
            </>
          )}
        </div>

        {mensaje && (
          <p
            className={`mt-3 font-semibold ${
              mensaje.includes("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {mensaje}
          </p>
        )}
      </div>
    </div>
  );
};

export default Perfil;
