import { Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthProvider";

import Dashboard from "./componentes/Dashboard";
import Login from "./componentes/autenticacion/Login";
import Registro from "./componentes/autenticacion/Registro";
import RutaProtegida from "./componentes/autenticacion/RutaProtegida";
import AdminLayout from "./componentes/admin/AdminLayout";
import PanelControl from "./componentes/admin/PanelControl";
import Recibos from "./componentes/admin/Recibos";
import Movimientos from "./componentes/admin/Movimientos";
import Reportes from "./componentes/admin/Reportes";
import Configuracion from "./componentes/admin/Configuracion";
import Clientes from "./componentes/admin/Clientes";
import Inmuebles from "./componentes/admin/Inmuebles";
import PortalCliente from "./componentes/cliente/PortalCliente";

/**
 * Ruta raíz (/):
 * - Si el usuario está autenticado, va directo a su panel correspondiente (cliente al portal, secretario a admin).
 * - Si no está autenticado (invitado), ve el sitio público (landing page).
 */
function RutaInicio() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] dark:bg-brand-bg">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#826229]"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to={user.rol === "SECRETARIO" ? "/admin" : "/portal"} replace />;
  }

  return <Dashboard />;
}

/**
 * Ruta de acceso público exclusivo (Login / Registro):
 * Si el usuario ya inició sesión, lo redirige directamente a su portal/admin.
 */
function RutaSoloInvitados({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] dark:bg-brand-bg">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#826229]"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to={user.rol === "SECRETARIO" ? "/admin" : "/portal"} replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* --- Ruta Raíz Condicional --- */}
        <Route path="/" element={<RutaInicio />} />

        {/* --- Autenticación (Solo invitados sin sesión) --- */}
        <Route
          path="/login"
          element={
            <RutaSoloInvitados>
              <Login />
            </RutaSoloInvitados>
          }
        />
        <Route
          path="/registro"
          element={
            <RutaSoloInvitados>
              <Registro />
            </RutaSoloInvitados>
          }
        />

        {/* --- Rutas Protegidas del Cliente (Solo CLIENTE) --- */}
        <Route element={<RutaProtegida rolesPermitidos={["CLIENTE"]} />}>
          <Route path="/portal" element={<PortalCliente />} />
        </Route>

        {/* --- Rutas Protegidas de Administración (Solo SECRETARIO) --- */}
        <Route element={<RutaProtegida rolesPermitidos={["SECRETARIO"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<PanelControl />} />
            <Route path="inmuebles" element={<Inmuebles />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="recibos" element={<Recibos />} />
            <Route path="movimientos" element={<Movimientos />} />
            <Route path="reportes" element={<Reportes />} />
            <Route path="configuracion" element={<Configuracion />} />
          </Route>
        </Route>

        {/* --- Ruta comodín: cualquier ruta desconocida redirige al inicio --- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;

