
import { useEffect, useState } from "react";
import "./Clientes.css";

import {
  getClientes,
  crearCliente,
  editarCliente,
  eliminarCliente,
} from "../../services/clientes.service";

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);

  const [formulario, setFormulario] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    password: "",
  });

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    const datos = await getClientes();
    setClientes(datos);
  };

  const guardarCliente = async (e) => {
    e.preventDefault();

    try {
      if (clienteEditando) {
        await editarCliente(clienteEditando.id, formulario);
        alert("Cliente editado correctamente");
      } else {
        await crearCliente(formulario);
        alert("Cliente creado correctamente");
      }

      setFormulario({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        password: "",
      });

      setClienteEditando(null);
      setMostrarFormulario(false);

      cargarClientes();
    } catch (error) {
      alert(error.message);
    }
  };

  const cancelarFormulario = () => {
    setFormulario({
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      password: "",
    });

    setClienteEditando(null);
    setMostrarFormulario(false);
  };

  return (
    <div>
      <h1>Gestión de Clientes</h1>

      <button
        type="button"
        className="btn-nuevo-cliente"
        onClick={() => setMostrarFormulario(!mostrarFormulario)}
      >
        + Nuevo cliente
      </button>

      {mostrarFormulario && (
        <div className="formulario-cliente">
          <h2>
            {clienteEditando ? "Editar cliente" : "Nuevo cliente"}
          </h2>

          <form onSubmit={guardarCliente}>
            <div className="campo-cliente">
              <label>Nombre</label>

              <input
                type="text"
                value={formulario.nombre}
                placeholder="Ej. Luis"
                required
                onInvalid={(e) => e.target.setCustomValidity("Rellenar este campo")}
                onInput={(e) => e.target.setCustomValidity("")}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    nombre: e.target.value,
                  })
                }
              />
            </div>

            <div className="campo-cliente">
              <label>Apellido</label>

              <input
                type="text"
                value={formulario.apellido}
                placeholder="Ej. González"
                required
                onInvalid={(e) => e.target.setCustomValidity("Rellenar este campo")}
                onInput={(e) => e.target.setCustomValidity("")}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    apellido: e.target.value,
                  })
                }
              />
            </div>

            <div className="campo-cliente">
              <label>Email</label>

              <input
                type="email"
                value={formulario.email}
                placeholder="Ej. luis@gmail.com"
                required
                onInvalid={(e) => e.target.setCustomValidity("Rellenar este campo")}
                onInput={(e) => e.target.setCustomValidity("")}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    email: e.target.value,
                  })
                }
              />
            </div>

            <div className="campo-cliente">
              <label>Teléfono</label>

              <input
                type="text"
                value={formulario.telefono}
                placeholder="Ej. 341-5555555"
                required
                onInvalid={(e) => e.target.setCustomValidity("Rellenar este campo")}
                onInput={(e) => e.target.setCustomValidity("")}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    telefono: e.target.value,
                  })
                }
              />
            </div>

            <button
              type="submit"
              className="btn-guardar-cliente"
            >
              Guardar cliente
            </button>

            <button
              type="button"
              className="btn-cancelar-cliente"
              onClick={cancelarFormulario}
            >
              Cancelar
            </button>
          </form>
        </div>
      )}

      {!mostrarFormulario && (
        <div>
          {clientes.length === 0 ? (
            <p>No hay clientes registrados.</p>
          ) : (
            clientes.map((cliente) => (
              <div
                key={cliente.id}
                className="tarjeta-cliente"
              >
                <p>
                  <strong>
                    {cliente.nombre} {cliente.apellido}
                  </strong>
                </p>

                <p>Email: {cliente.email}</p>

                <p>Teléfono: {cliente.telefono}</p>

                <button
                  type="button"
                  onClick={() => {
                    setClienteEditando(cliente);

                    setFormulario({
                      nombre: cliente.nombre || "",
                      apellido: cliente.apellido || "",
                      email: cliente.email || "",
                      telefono: cliente.telefono || "",
                      password: "",
                    });

                    setMostrarFormulario(true);
                  }}
                >
                  Editar
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const confirmar = window.confirm(
                      `¿Seguro que querés eliminar a ${cliente.nombre} ${cliente.apellido}?`
                    );

                    if (!confirmar) {
                      return;
                    }

                    try {
                      await eliminarCliente(cliente.id);

                      alert("Cliente eliminado correctamente");

                      cargarClientes();
                    } catch (error) {
                      alert(error.message);
                    }
                  }}
                >
                  Eliminar
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Clientes;