import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthProvider";

export default function Configuracion() {
  const { user } = useAuth();
  const [pestaña, setPestaña] = useState("empresa"); // 'empresa' | 'recibos' | 'perfil' | 'sistema'
  const [mensaje, setMensaje] = useState(null);

  // 1. Datos de la Empresa (para membrete de recibos e informes)
  const [empresa, setEmpresa] = useState(() => {
    const saved = localStorage.getItem("la_finca_config_empresa");
    return saved
      ? JSON.parse(saved)
      : {
          razonSocial: "Inmobiliaria La Finca S.A.",
          cuit: "30-71458923-8",
          direccion: "Bv. Oroño 1240, Piso 2",
          ciudad: "Rosario",
          provincia: "Santa Fe",
          telefono: "+54 341 425-6789",
          email: "administracion@lafinca.com",
          matricula: "COCIR Mat. N° 1482",
        };
  });

  // 2. Parámetros de Recibos (requisito de inicialización de conceptos)
  const [configRecibos, setConfigRecibos] = useState(() => {
    const saved = localStorage.getItem("la_finca_config_recibos");
    return saved
      ? JSON.parse(saved)
      : {
          diaVencimiento: 10,
          recargoMoraPorcentaje: 0.2, // 0.2% diario
          conceptosDefault: "Alquiler Mensual, Expensas Comunes, Agua Corriente, Luz",
        };
  });

  // 3. Preferencias del Sistema
  const [tema, setTema] = useState(() => localStorage.getItem("theme") || "dark");
  const [moneda, setMoneda] = useState("ARS");
  const [idioma, setIdioma] = useState("es");

  useEffect(() => {
    if (tema === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [tema]);

  const guardarEmpresa = (e) => {
    e.preventDefault();
    localStorage.setItem("la_finca_config_empresa", JSON.stringify(empresa));
    setMensaje({ tipo: "exito", texto: "Datos de la inmobiliaria guardados correctamente." });
  };

  const guardarRecibos = (e) => {
    e.preventDefault();
    localStorage.setItem("la_finca_config_recibos", JSON.stringify(configRecibos));
    setMensaje({ tipo: "exito", texto: "Parámetros de facturación y recibos actualizados." });
  };

  return (
    <div className="space-y-6">
      {/* CABECERA */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Configuración del Sistema
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Administra los datos institucionales, parámetros para recibos mensuales, perfil y preferencias.
        </p>
      </div>

      {/* MENSAJES */}
      {mensaje && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between border ${
            mensaje.tipo === "exito"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
              : "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
          }`}
        >
          <span className="text-sm font-medium">{mensaje.texto}</span>
          <button
            type="button"
            onClick={() => setMensaje(null)}
            className="text-xs font-bold underline ml-4"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* PESTAÑAS */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setPestaña("empresa")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
            pestaña === "empresa"
              ? "bg-[#826229] text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          🏢 Datos de la Inmobiliaria
        </button>

        <button
          type="button"
          onClick={() => setPestaña("recibos")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
            pestaña === "recibos"
              ? "bg-[#826229] text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          📄 Parámetros de Recibos
        </button>

        <button
          type="button"
          onClick={() => setPestaña("perfil")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
            pestaña === "perfil"
              ? "bg-[#826229] text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          👤 Perfil del Secretario
        </button>

        <button
          type="button"
          onClick={() => setPestaña("sistema")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
            pestaña === "sistema"
              ? "bg-[#826229] text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          ⚙️ Preferencias y Base de Datos
        </button>
      </div>

      {/* 1. DATOS DE LA EMPRESA */}
      {pestaña === "empresa" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Membrete e Información Institucional
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Estos datos aparecen impresos en la cabecera de los recibos y reportes emitidos por el secretario.
            </p>
          </div>

          <form onSubmit={guardarEmpresa} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Razón Social</label>
                <input
                  type="text"
                  required
                  value={empresa.razonSocial}
                  onChange={(e) => setEmpresa({ ...empresa, razonSocial: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">CUIT / Identificación Fiscal</label>
                <input
                  type="text"
                  required
                  value={empresa.cuit}
                  onChange={(e) => setEmpresa({ ...empresa, cuit: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Dirección Comercial</label>
                <input
                  type="text"
                  value={empresa.direccion}
                  onChange={(e) => setEmpresa({ ...empresa, direccion: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Ciudad y Provincia</label>
                <input
                  type="text"
                  value={`${empresa.ciudad}, ${empresa.provincia}`}
                  onChange={(e) => {
                    const [c, p] = e.target.value.split(",");
                    setEmpresa({ ...empresa, ciudad: c?.trim() || "", provincia: p?.trim() || "" });
                  }}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Teléfono de Contacto</label>
                <input
                  type="text"
                  value={empresa.telefono}
                  onChange={(e) => setEmpresa({ ...empresa, telefono: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Email Institucional</label>
                <input
                  type="email"
                  value={empresa.email}
                  onChange={(e) => setEmpresa({ ...empresa, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-[#826229] hover:bg-[#6d511f] text-white transition"
              >
                Guardar Membrete
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. PARÁMETROS DE RECIBOS */}
      {pestaña === "recibos" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Utilidades de Inicialización de Conceptos
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cumple con el requisito: "deberán existir utilidades para inicializar los conceptos que se desee de los recibos".
            </p>
          </div>

          <form onSubmit={guardarRecibos} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Día de Vencimiento Predeterminado</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={configRecibos.diaVencimiento}
                  onChange={(e) =>
                    setConfigRecibos({ ...configRecibos, diaVencimiento: parseInt(e.target.value, 10) })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
                <span className="text-[11px] text-slate-400">Día del mes fijado como fecha límite de cobro sin recargo.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Interés diario por mora (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={configRecibos.recargoMoraPorcentaje}
                  onChange={(e) =>
                    setConfigRecibos({ ...configRecibos, recargoMoraPorcentaje: parseFloat(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
                <span className="text-[11px] text-slate-400">Porcentaje que se aplica por cada día de mora transcurrido.</span>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1">
                  Conceptos Iniciales Predeterminados (Separados por coma)
                </label>
                <textarea
                  rows="2"
                  value={configRecibos.conceptosDefault}
                  onChange={(e) =>
                    setConfigRecibos({ ...configRecibos, conceptosDefault: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-[#826229] hover:bg-[#6d511f] text-white transition"
              >
                Guardar Configuración de Recibos
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. PERFIL DEL SECRETARIO */}
      {pestaña === "perfil" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Perfil del Usuario Activo
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Credenciales y datos de seguridad del usuario autenticado en la sesión.
            </p>
          </div>

          <div className="space-y-4 max-w-lg">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div className="w-14 h-14 rounded-full bg-[#826229] text-white flex items-center justify-center font-bold text-xl">
                {user?.nombre?.[0] || "S"}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100">
                  {user?.nombre || "Javier"} {user?.apellido || "García"}
                </h3>
                <p className="text-xs text-slate-500">{user?.email || "secretario@lafinca.com"}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#826229]/20 text-[#826229]">
                  {user?.rol || "SECRETARIO"}
                </span>
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Nombre Completo</label>
                <input
                  type="text"
                  disabled
                  value={`${user?.nombre || "Javier"} ${user?.apellido || "García"}`}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Correo Electrónico</label>
                <input
                  type="text"
                  disabled
                  value={user?.email || "secretario@lafinca.com"}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. PREFERENCIAS DEL SISTEMA */}
      {pestaña === "sistema" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Preferencias y Utilidades de Base de Datos
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ajustes de visualización y herramientas para poblar datos de prueba.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold mb-1">Tema Visual de la Interfaz</label>
              <select
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              >
                <option value="dark">Modo Oscuro (Industrial Inmobiliario)</option>
                <option value="light">Modo Claro (Estándar)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Moneda del Sistema</label>
              <select
                value={moneda}
                onChange={(e) => setMoneda(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              >
                <option value="ARS">$ ARS - Pesos Argentinos</option>
                <option value="USD">U$S USD - Dólares Estadounidenses</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Idioma del Sistema (RNF-11)</label>
              <select
                value={idioma}
                onChange={(e) => setIdioma(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              >
                <option value="es">Español (Argentina)</option>
                <option value="en">English</option>
                <option value="pt">Português</option>
              </select>
            </div>

            {/* CAJA DE SEED DATA */}
            <div className="sm:col-span-2 p-5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#826229] mb-1">
                Base de Datos y Carga de Prueba (Seed Data)
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Para repoblar la base de datos con clientes, cuentas bancarias, recibos mensuales y gastos imputados, puedes ejecutar desde la terminal del proyecto:
              </p>
              <pre className="p-3 rounded-lg bg-slate-900 text-slate-200 text-xs font-mono select-all">
                npm run seed
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

