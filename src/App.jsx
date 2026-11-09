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

import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider"; // <-- Importa el proveedor

import Inmuebles from "./componentes/admin/Inmuebles";

function App() {
  return (
    <AuthProvider> {/* <-- Envuelve todo en el AuthProvider */}
      <Routes>
        {/* --- Rutas Públicas (Cualquiera puede entrar, INVITADO) --- */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* --- Rutas Protegidas de Administración (Solo SECRETARIO) --- */}
        <Route element={<RutaProtegida rolesPermitidos={["SECRETARIO"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            
            {/* Ruta index (/admin) renderiza el Panel de Control principal */}
            <Route index element={<PanelControl />} />
            
            {/* Subrutas secundarias (dummy por ahora para que no den error al hacer clic en el Sidebar) */}
            <Route path="inmuebles" element={<Inmuebles />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="recibos" element={<Recibos />} />
            <Route path="movimientos" element={<Movimientos />} />
            <Route path="reportes" element={<Reportes />} />
            <Route path="configuracion" element={<Configuracion />} />
            
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;

