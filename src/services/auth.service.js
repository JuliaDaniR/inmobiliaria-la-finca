const API_URL = "http://localhost:4000/api/usuarios";

export const registrarUsuarioAPI = async (userData) => {
  const payload = { ...userData };
  delete payload.confirmPassword;

  const response = await fetch(`${API_URL}/registro`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Error al registrar el usuario");
  }
  return data;
};

export const loginUsuarioAPI = async (email, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Credenciales inválidas");
  }
  return data;
};
