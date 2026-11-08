// ============================================================================
// SERVICIO DE MOVIMIENTOS BANCARIOS (movimientos.service.js)
// Centraliza las peticiones para cuentas, ingresos, gastos y balances.
// ============================================================================

import clienteApi from "../api/axios";

// 1. Obtener listado de cuentas bancarias y sus saldos
export const getCuentasBancarias = async () => {
  try {
    const response = await clienteApi.get("/movimientos/cuentas");
    return response.data;
  } catch (error) {
    console.error("Error al obtener cuentas bancarias:", error);
    return [];
  }
};

// 2. Registrar nueva cuenta bancaria
export const crearCuentaBancaria = async (cuentaData) => {
  try {
    const response = await clienteApi.post(
      "/movimientos/cuentas",
      cuentaData
    );
    return response.data;
  } catch (error) {
    console.error("Error al crear cuenta bancaria:", error);
    throw new Error(
      error.response?.data?.message || "Error al crear la cuenta bancaria",
      { cause: error }
    );
  }
};

// 3. Obtener movimientos bancarios (admite filtros como { tipo: 'INGRESO', id_cuenta: 1, fecha_desde, fecha_hasta })
export const getMovimientos = async (filtros = {}) => {
  try {
    const response = await clienteApi.get("/movimientos", {
      params: filtros,
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener movimientos:", error);
    return [];
  }
};

// 4. Registrar un movimiento (CU-05 Ingreso / CU-06 Gasto / CU-07 Asociar)
export const registrarMovimiento = async (movimientoData) => {
  try {
    const response = await clienteApi.post("/movimientos", movimientoData);
    return response.data;
  } catch (error) {
    console.error("Error al registrar movimiento:", error);
    throw new Error(
      error.response?.data?.message || "Error al registrar el movimiento",
      { cause: error }
    );
  }
};

// 5. Obtener resumen financiero (ingresos vs gastos para balances e informes)
export const getResumenFinanciero = async (anio) => {
  try {
    const response = await clienteApi.get("/movimientos/resumen", {
      params: { anio },
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener balance financiero:", error);
    return { anio, ingresos: 0, gastos: 0, balanceNeto: 0 };
  }
};

// 6. Eliminar movimiento (revierte el saldo)
export const eliminarMovimiento = async (id) => {
  try {
    const response = await clienteApi.delete(`/movimientos/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar movimiento:", error);
    throw new Error(
      error.response?.data?.message || "Error al eliminar el movimiento",
      { cause: error }
    );
  }
};
