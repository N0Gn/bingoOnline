import { Routes, Route, Navigate } from "react-router-dom";

import RequireAuth from "./components/RequireAuth.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Lobby from "./pages/Lobby.jsx";
import Room from "./pages/Room.jsx";

export default function App() {
  return (
    <Routes>
      {/* públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* privadas */}
      <Route element={<RequireAuth />}>
        <Route path="/" element={<Lobby />} />
        <Route path="/room/:code" element={<Room />} />
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
