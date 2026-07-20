import Dashboard from "./componentes/Dashboard";
import Login from "./componentes/autenticacion/Login";
import Registro from "./componentes/autenticacion/Registro";
import RutaProtegida from "./componentes/autenticacion/RutaProtegida";
import AdminLayout from "./componentes/admin/AdminLayout";
import PanelControl from "./componentes/admin/PanelControl";

import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider"; // <-- Importa el proveedor

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
            <Route path="inmuebles" element={<div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 font-bold">Módulo de Gestión de Inmuebles</div>} />
            <Route path="clientes" element={<div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 font-bold">Módulo de Gestión de Clientes</div>} />
            <Route path="recibos" element={<div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 font-bold">Módulo de Facturación y Recibos</div>} />
            <Route path="movimientos" element={<div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 font-bold">Módulo de Movimientos Bancarios</div>} />
            <Route path="reportes" element={<div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 font-bold">Módulo de Reportes y Estadísticas Avanzadas</div>} />
            <Route path="configuracion" element={<div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 font-bold">Módulo de Configuración del Sistema</div>} />
            
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;

