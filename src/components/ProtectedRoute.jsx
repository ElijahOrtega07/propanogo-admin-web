import React from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../firebase/firebaseConfig";

export default function ProtectedRoute({ children }) {
  return auth.currentUser ? children : <Navigate to="/" replace />;
}
