import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registrarUsuarioAPI } from "../../services/auth.service";

function Registro() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [darkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        document.documentElement.classList.contains("dark") ||
        localStorage.getItem("theme") === "dark"
      );
    }
    return false;
  });

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    password: "",
    confirmPassword: "",
    dni: "",
    fechaNacimiento: "",
    genero: "",
    direccion: "",
    ciudad: "",
    provincia: "",
    observaciones: "",
    foto: "",
  });

  const [fotoPreview, setFotoPreview] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result);
        setFormData((prev) => ({ ...prev, foto: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Validaciones por paso
  const validateStep = () => {
    setError("");
    if (step === 1) {
      if (
        !formData.nombre ||
        !formData.apellido ||
        !formData.email ||
        !formData.password ||
        !formData.confirmPassword
      ) {
        setError("Por favor, complete todos los campos obligatorios.");
        return false;
      }
      if (!formData.email.includes("@")) {
        setError("Ingrese un correo electrónico válido.");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Las contraseñas no coinciden.");
        return false;
      }
      if (formData.password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres.");
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep()) {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setError("");
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Si no está en el último paso, avanzar de paso en lugar de registrar
    if (step < 3) {
      handleNextStep();
      return;
    }

    if (!validateStep()) return;

    setIsLoading(true);

    try {
      await registrarUsuarioAPI(formData);
      setIsLoading(false);
      // Pasamos un mensaje de éxito para mostrar en la pantalla de Login
      navigate("/login", { state: { successMessage: "¡Registro completado con éxito! Por favor, inicie sesión." } });
    } catch (err) {
      setError(err.message || "Ocurrió un error al registrar el usuario.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8F9FA] dark:bg-brand-bg transition-colors duration-300">
      {/* PANEL IZQUIERDO: Formulario de Registro */}
      <div className="w-full lg:w-2/3 flex flex-col justify-center items-center p-6 sm:p-8 md:p-10 bg-white dark:bg-brand-bg transition-colors duration-300">
        <div className="w-full max-w-2xl">
          {/* Cabecera: Título, Descripción y Logo Alineados en la misma fila */}
          <div className="flex justify-between items-center w-full mb-6">
            <div>
              <h2 className="text-3xl font-bold text-[#0A1128] dark:text-brand-text tracking-tight">
                Crear Nueva Cuenta
              </h2>
              <p className="mt-1 text-sm text-[#5A6B82] dark:text-brand-muted">
                Complete los detalles para comenzar su experiencia premium.
              </p>
            </div>

            <img
              src={
                darkMode
                  ? "/img/logo-la-finca.png"
                  : "/img/logo-la-finca-light.png"
              }
              alt="La Finca"
              className="h-36 w-auto object-contain dark:brightness-125"
            />
          </div>

          {/* Indicador de Pasos */}
          <div className="mb-6 relative flex items-center justify-between">
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 z-0" />
            <div
              className="absolute left-0 top-1/2 h-0.5 bg-[#826229] dark:bg-[#C69B56] -translate-y-1/2 z-0 transition-all duration-300"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />

            {[
              { num: 1, label: "Cuenta" },
              { num: 2, label: "Perfil" },
              { num: 3, label: "Adicional" },
            ].map((s) => (
              <div
                key={s.num}
                className="relative z-10 flex flex-col items-center"
              >
                <button
                  type="button"
                  onClick={() => s.num < step && setStep(s.num)}
                  disabled={s.num >= step}
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs transition-all duration-300 ${
                    step >= s.num
                      ? "bg-[#826229] dark:bg-[#C69B56] text-white shadow-md"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {s.num}
                </button>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider mt-2 transition-colors ${
                    step >= s.num
                      ? "text-[#826229] dark:text-[#C69B56]"
                      : "text-slate-400 dark:text-slate-600"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* Alerta de Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border-l-4 border-red-500 rounded-r-lg text-sm text-red-700 dark:text-red-300 flex items-center gap-2 animate-shake">
              <svg
                className="w-5 h-5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* PASO 1: CUENTA (Obligatorio) */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  Información de Cuenta (Obligatorio)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="nombre"
                      className="block text-[11px] font-bold uppercase tracking-wider text-[#5A6B82] dark:text-brand-muted mb-1.5"
                    >
                      Nombre
                    </label>
                    <input
                      id="nombre"
                      type="text"
                      placeholder="Ej: Javier"
                      value={formData.nombre}
                      onChange={handleChange}
                      className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#826229]/20 focus:border-[#826229] dark:focus:border-[#C69B56] transition-all bg-slate-50/30 dark:bg-slate-900/20 focus:bg-white dark:focus:bg-slate-950 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="apellido"
                      className="block text-[11px] font-bold uppercase tracking-wider text-[#5A6B82] dark:text-brand-muted mb-1.5"
                    >
                      Apellido
                    </label>
                    <input
                      id="apellido"
                      type="text"
                      placeholder="Ej: Garcia Ortiz"
                      value={formData.apellido}
                      onChange={handleChange}
                      className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#826229]/20 focus:border-[#826229] dark:focus:border-[#C69B56] transition-all bg-slate-50/30 dark:bg-slate-900/20 focus:bg-white dark:focus:bg-slate-950 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-[11px] font-bold uppercase tracking-wider text-[#5A6B82] dark:text-brand-muted mb-1.5"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="ejemplo@lafinca.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#826229]/20 focus:border-[#826229] dark:focus:border-[#C69B56] transition-all bg-slate-50/30 dark:bg-slate-900/20 focus:bg-white dark:focus:bg-slate-950 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="telefono"
                      className="block text-[11px] font-bold uppercase tracking-wider text-[#5A6B82] dark:text-brand-muted mb-1.5"
                    >
                      Teléfono
                    </label>
                    <input
                      id="telefono"
                      type="tel"
                      placeholder="Ej: +34 600 000 000"
                      value={formData.telefono}
                      onChange={handleChange}
                      className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#826229]/20 focus:border-[#826229] dark:focus:border-[#C69B56] transition-all bg-slate-50/30 dark:bg-slate-900/20 focus:bg-white dark:focus:bg-slate-950 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-[11px] font-bold uppercase tracking-wider text-[#5A6B82] dark:text-brand-muted mb-1.5"
                    >
                      Contraseña
                    </label>
                    <input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#826229]/20 focus:border-[#826229] dark:focus:border-[#C69B56] transition-all bg-slate-50/30 dark:bg-slate-900/20 focus:bg-white dark:focus:bg-slate-950 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-[11px] font-bold uppercase tracking-wider text-[#5A6B82] dark:text-brand-muted mb-1.5"
                    >
                      Confirmar Contraseña
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#826229]/20 focus:border-[#826229] dark:focus:border-[#C69B56] transition-all bg-slate-50/30 dark:bg-slate-900/20 focus:bg-white dark:focus:bg-slate-950 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PASO 2: UBICACIÓN Y PERFIL (Opcional) */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Información Personal & Ubicación (Opcional)
                  </h3>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="text-xs text-[#826229] dark:text-[#C69B56] hover:underline font-semibold"
                  >
                    Omitir este paso
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="dni"
                      className="block text-[11px] font-bold uppercase tracking-wider text-[#5A6B82] dark:text-brand-muted mb-1.5"
                    >
                      DNI / NIE
                    </label>
                    <input
                      id="dni"
                      type="text"
                      placeholder="Ej: 00000000X"
                      value={formData.dni}
                      onChange={handleChange}
                      className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#826229]/20 focus:border-[#826229] dark:focus:border-[#C69B56] transition-all bg-slate-50/30 dark:bg-slate-900/20 focus:bg-white dark:focus:bg-slate-950 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="fechaNacimiento"
                      className="block text-[11px] font-bold uppercase tracking-wider text-[#5A6B82] dark:text-brand-muted mb-1.5"
                    >
                      Fecha de Nacimiento
                    </label>
                    <input
                      id="fechaNacimiento"
                      type="date"
                      value={formData.fechaNacimiento}
                      onChange={handleChange}
                      className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#826229]/20 focus:border-[#826229] dark:focus:border-[#C69B56] transition-all bg-slate-50/30 dark:bg-slate-900/20 focus:bg-white dark:focus:bg-slate-950 text-sm cursor-pointer"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="genero"
                      className="block text-[11px] font-bold uppercase tracking-wider text-[#5A6B82] dark:text-brand-muted mb-1.5"
                    >
                      Género
                    </label>
                    <select
                      id="genero"
                      value={formData.genero}
                      onChange={handleChange}
                      className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#826229]/20 focus:border-[#826229] dark:focus:border-[#C69B56] transition-all bg-slate-50/30 dark:bg-slate-900/20 focus:bg-white dark:focus:bg-slate-950 text-sm cursor-pointer appearance-none"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Otro">Otro / Prefiero no decir</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="direccion"
                    className="block text-[11px] font-bold uppercase tracking-wider text-[#5A6B82] dark:text-brand-muted mb-1.5"
                  >
                    Dirección
                  </label>
                  <input
                    id="direccion"
                    type="text"
                    placeholder="Ej: Paseo de la Castellana, 10"
                    value={formData.direccion}
                    onChange={handleChange}
                    className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#826229]/20 focus:border-[#826229] dark:focus:border-[#C69B56] transition-all bg-slate-50/30 dark:bg-slate-900/20 focus:bg-white dark:focus:bg-slate-950 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="ciudad"
                      className="block text-[11px] font-bold uppercase tracking-wider text-[#5A6B82] dark:text-brand-muted mb-1.5"
                    >
                      Ciudad (Localidad)
                    </label>
                    <input
                      id="ciudad"
                      type="text"
                      placeholder="Ej: Madrid"
                      value={formData.ciudad}
                      onChange={handleChange}
                      className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#826229]/20 focus:border-[#826229] dark:focus:border-[#C69B56] transition-all bg-slate-50/30 dark:bg-slate-900/20 focus:bg-white dark:focus:bg-slate-950 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="provincia"
                      className="block text-[11px] font-bold uppercase tracking-wider text-[#5A6B82] dark:text-brand-muted mb-1.5"
                    >
                      Provincia
                    </label>
                    <input
                      id="provincia"
                      type="text"
                      placeholder="Ej: Madrid"
                      value={formData.provincia}
                      onChange={handleChange}
                      className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#826229]/20 focus:border-[#826229] dark:focus:border-[#C69B56] transition-all bg-slate-50/30 dark:bg-slate-900/20 focus:bg-white dark:focus:bg-slate-950 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PASO 3: FOTO Y DETALLES ADICIONALES (Opcional) */}
            {step === 3 && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Información Adicional (Opcional)
                  </h3>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="text-xs text-[#826229] dark:text-[#C69B56] hover:underline font-semibold"
                  >
                    Omitir y Finalizar
                  </button>
                </div>

                {/* Subir Foto de Perfil */}
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-[#5A6B82] dark:text-brand-muted mb-2">
                    Foto de Perfil
                  </span>
                  <div className="flex items-center gap-6 p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/30 dark:bg-slate-900/10">
                    <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                      {fotoPreview ? (
                        <img
                          src={fotoPreview}
                          alt="Vista previa"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg
                          className="w-8 h-8 text-slate-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <circle cx="12" cy="13" r="3" />
                        </svg>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="inline-block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#826229] dark:hover:border-[#C69B56] text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-sm text-slate-700 dark:text-slate-300">
                        Subir Archivo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFotoChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        JPG, PNG o WEBP. Máx 5MB.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Observaciones */}
                <div>
                  <label
                    htmlFor="observaciones"
                    className="block text-[11px] font-bold uppercase tracking-wider text-[#5A6B82] dark:text-brand-muted mb-1.5"
                  >
                    Observaciones
                  </label>
                  <textarea
                    id="observaciones"
                    rows="4"
                    placeholder="Indique cualquier detalle relevante para su perfil de gestión..."
                    value={formData.observaciones}
                    onChange={handleChange}
                    className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#826229]/20 focus:border-[#826229] dark:focus:border-[#C69B56] transition-all bg-slate-50/30 dark:bg-slate-900/20 focus:bg-white dark:focus:bg-slate-950 text-sm resize-none"
                  />
                </div>
              </div>
            )}

            {/* BOTONES DE ACCIÓN */}
            <div className="flex gap-4 pt-4">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="w-1/3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 py-2.5 rounded-lg font-semibold text-sm transition-colors cursor-pointer"
                >
                  Atrás
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className={`py-2.5 px-6 rounded-lg font-semibold text-sm text-white bg-[#826229] dark:bg-[#C69B56] hover:bg-[#6e5220] dark:hover:bg-[#b08443] transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] cursor-pointer ${
                    step === 1 ? "w-full" : "flex-1"
                  }`}
                >
                  <span>Continuar</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 py-2.5 px-6 rounded-lg font-semibold text-sm text-white bg-[#826229] dark:bg-[#C69B56] hover:bg-[#6e5220] dark:hover:bg-[#b08443] transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] disabled:opacity-70 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <circle
                          className="opacity-75"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeDasharray="30 150"
                        />
                      </svg>
                      <span>Creando cuenta...</span>
                    </>
                  ) : (
                    <>
                      <span>Finalizar Registro</span>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Enlace a Login */}
          <div className="mt-8 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            ¿Ya tiene una cuenta?{" "}
            <Link
              to="/login"
              className="text-[#826229] dark:text-brand-gold hover:underline font-semibold transition-colors"
            >
              Inicie sesión aquí
            </Link>
          </div>
        </div>
      </div>

      {/* PANEL DERECHO: Visual & Branding */}
      <div
        className="relative hidden lg:flex lg:w-1/3 flex-col justify-between p-12 text-white bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: "url('/img/inicio-la-finca.png')" }}
      >
        {/* Capa de superposición con gradiente premium azul marino */}
        <div className="absolute inset-0 bg-linear-to-b from-[#024384]/95 via-[#0a1e36]/90 to-[#05101e]/98 dark:from-[#0b1320]/95 dark:via-[#0c1a30]/90 dark:to-[#070d18]/98" />

        {/* Botón Volver al Dashboard encima del panel visual */}
        <div className="relative z-10 flex justify-end">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-white/80 hover:text-white transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Volver al Dashboard
          </Link>
        </div>

        {/* Gráfico decorativo de fondo */}
        <svg
          className="absolute inset-0 w-full h-full opacity-15 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="80%" cy="30%" r="150" fill="#826229" opacity="0.2" />
          <path
            d="M-50,200 Q200,150 400,280 T800,200"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
        </svg>

        {/* Icono de Geolocalización centrado en la cabecera del panel derecho */}
        <div className="relative z-10 flex flex-col items-center mt-12">
          <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        </div>

        {/* Textos inferiores */}
        <div className="relative z-10 mt-auto max-w-sm">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white mb-6 leading-tight font-sans">
            Únete a la Excelencia
          </h1>
          <p className="text-slate-200 text-sm lg:text-base leading-relaxed font-light">
            Forme parte de la comunidad de gestión inmobiliaria más exclusiva.
            Acceda a herramientas de alta precisión diseñadas para la
            administración de propiedades de lujo.
          </p>

          <div className="flex gap-2.5 mt-8 items-center">
            <span
              className={`w-8 h-1.5 rounded-full transition-all duration-300 ${step === 1 ? "bg-[#826229] dark:bg-[#C69B56]" : "bg-white/30"}`}
            />
            <span
              className={`w-8 h-1.5 rounded-full transition-all duration-300 ${step === 2 ? "bg-[#826229] dark:bg-[#C69B56]" : "bg-white/30"}`}
            />
            <span
              className={`w-8 h-1.5 rounded-full transition-all duration-300 ${step === 3 ? "bg-[#826229] dark:bg-[#C69B56]" : "bg-white/30"}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Registro;
