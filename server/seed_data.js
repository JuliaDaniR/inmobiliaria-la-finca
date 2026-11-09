/* global process */
import bcrypt from "bcryptjs";
import pool from "./src/db.js";

async function seedData() {
  console.log("Iniciando carga de datos de prueba para Inmobiliaria La Finca...");
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. CLIENTES DE PRUEBA
    console.log("Cargando clientes...");
    const salt = await bcrypt.genSalt(10);
    const passHash = await bcrypt.hash("123456", salt);

    const clientesMock = [
      {
        nombre: "Carlos",
        apellido: "Benítez",
        email: "carlos.benitez@gmail.com",
        telefono: "+54 341 512-3456",
        dni: "30125488",
        fechaNacimiento: "1983-04-15",
        genero: "Masculino",
        direccion: "Bv. Oroño 1120, Piso 4",
        ciudad: "Rosario",
        provincia: "Santa Fe",
        observaciones: "Inquilino con aval bancario de Banco Macro y recibo de sueldo.",
        foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
      },
      {
        nombre: "Mariana",
        apellido: "Gómez",
        email: "mariana.gomez@gmail.com",
        telefono: "+54 341 698-7654",
        dni: "32458912",
        fechaNacimiento: "1987-08-22",
        genero: "Femenino",
        direccion: "Calle Alvear 450",
        ciudad: "Rosario",
        provincia: "Santa Fe",
        observaciones: "Contrato laboral por tiempo indeterminado. Garantes propietarios.",
        foto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80",
      },
      {
        nombre: "Roberto",
        apellido: "Rossi",
        email: "roberto.rossi@gmail.com",
        telefono: "+54 341 456-7890",
        dni: "28912345",
        fechaNacimiento: "1981-12-05",
        genero: "Masculino",
        direccion: "Av. Fuerza Aérea 2300",
        ciudad: "Funes",
        provincia: "Santa Fe",
        observaciones: "Profesional independiente. Contrato de locación comercial de 3 años.",
        foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
      },
      {
        nombre: "Sofía",
        apellido: "Martínez",
        email: "sofia.martinez@gmail.com",
        telefono: "+54 341 555-8899",
        dni: "35123987",
        fechaNacimiento: "1991-03-30",
        genero: "Femenino",
        direccion: "Paraguay 890",
        ciudad: "Rosario",
        provincia: "Santa Fe",
        observaciones: "Cuenta con seguro de caución Finaer.",
        foto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
      },
      {
        nombre: "Andrés",
        apellido: "Fernández",
        email: "andres.fernandez@gmail.com",
        telefono: "+54 341 711-2233",
        dni: "31874521",
        fechaNacimiento: "1985-09-18",
        genero: "Masculino",
        direccion: "Urquiza 2100",
        ciudad: "Roldán",
        provincia: "Santa Fe",
        observaciones: "Propietario interesado en vender duplex.",
        foto: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80",
      },
    ];

    const clientesIds = [];

    for (const cli of clientesMock) {
      const [existe] = await connection.query(
        "SELECT id FROM usuarios WHERE email = ?",
        [cli.email]
      );

      if (existe.length === 0) {
        const [res] = await connection.query(
          `INSERT INTO usuarios 
            (nombre, apellido, email, telefono, password, dni, fechaNacimiento, genero, direccion, ciudad, provincia, observaciones, rol, foto)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CLIENTE', ?)`,
          [
            cli.nombre,
            cli.apellido,
            cli.email,
            cli.telefono,
            passHash,
            cli.dni,
            cli.fechaNacimiento,
            cli.genero,
            cli.direccion,
            cli.ciudad,
            cli.provincia,
            cli.observaciones,
            cli.foto,
          ]
        );
        clientesIds.push(res.insertId);
      } else {
        clientesIds.push(existe[0].id);
      }
    }

    // 2. CUENTAS BANCARIAS
    console.log("Cargando cuentas bancarias...");
    const [cuentasExisten] = await connection.query("SELECT * FROM cuentas_bancarias");
    let idCuentaSantander = cuentasExisten.find((c) => c.banco.includes("Santander"))?.id;
    let idCuentaGalicia = cuentasExisten.find((c) => c.banco.includes("Galicia"))?.id;

    if (!idCuentaSantander) {
      const [resSantander] = await connection.query(
        `INSERT INTO cuentas_bancarias 
          (banco, numero_cuenta, cbu_alias, titular, tipo_cuenta, saldo)
         VALUES ('Banco Santander', 'CC-45892-01', 'LAFINCA.PROPIEDADES', 'Inmobiliaria La Finca S.A.', 'Cuenta Corriente', 500000.00)`
      );
      idCuentaSantander = resSantander.insertId;
    }

    if (!idCuentaGalicia) {
      const [resGalicia] = await connection.query(
        `INSERT INTO cuentas_bancarias 
          (banco, numero_cuenta, cbu_alias, titular, tipo_cuenta, saldo)
         VALUES ('Banco Galicia', 'CA-88912-03', 'LAFINCA.GALICIA', 'Inmobiliaria La Finca S.A.', 'Caja de Ahorro', 250000.00)`
      );
      idCuentaGalicia = resGalicia.insertId;
    }

    // 3. RECIBOS Y CONCEPTOS
    console.log("Cargando recibos y conceptos mensuales...");
    const [inmueblesRows] = await connection.query("SELECT id FROM inmuebles LIMIT 4");
    const inm1 = inmueblesRows[0]?.id || 1;
    const inm2 = inmueblesRows[1]?.id || 2;
    const inm3 = inmueblesRows[2]?.id || 3;
    const inm4 = inmueblesRows[3]?.id || 4;

    const recibosData = [
      {
        numero_recibo: "REC-2026-001",
        id_inmueble: inm1,
        id_cliente: clientesIds[0],
        fecha_emision: "2026-10-01",
        periodo: "Octubre 2026",
        total: 155000.0,
        estado: "COBRADO",
        fecha_cobro: "2026-10-05",
        observaciones: "Cobro abonado por transferencia bancaria.",
        conceptos: [
          { concepto: "Alquiler Mensual", monto: 125000.0, es_obligatorio: 1 },
          { concepto: "Expensas Comunes", monto: 20000.0, es_obligatorio: 1 },
          { concepto: "Agua Corriente", monto: 5000.0, es_obligatorio: 0 },
          { concepto: "Energía Eléctrica (Luz)", monto: 5000.0, es_obligatorio: 0 },
        ],
      },
      {
        numero_recibo: "REC-2026-002",
        id_inmueble: inm2,
        id_cliente: clientesIds[1],
        fecha_emision: "2026-10-01",
        periodo: "Octubre 2026",
        total: 105000.0,
        estado: "COBRADO",
        fecha_cobro: "2026-10-08",
        observaciones: "Pago en término.",
        conceptos: [
          { concepto: "Alquiler Mensual", monto: 85000.0, es_obligatorio: 1 },
          { concepto: "Expensas Comunes", monto: 15000.0, es_obligatorio: 1 },
          { concepto: "Agua Corriente", monto: 3000.0, es_obligatorio: 0 },
          { concepto: "Gas Natural", monto: 2000.0, es_obligatorio: 0 },
        ],
      },
      {
        numero_recibo: "REC-2026-003",
        id_inmueble: inm1,
        id_cliente: clientesIds[0],
        fecha_emision: "2026-11-01",
        periodo: "Noviembre 2026",
        total: 158000.0,
        estado: "COBRADO",
        fecha_cobro: "2026-11-04",
        observaciones: "Abonado con Santander Débito.",
        conceptos: [
          { concepto: "Alquiler Mensual", monto: 125000.0, es_obligatorio: 1 },
          { concepto: "Expensas Comunes", monto: 22000.0, es_obligatorio: 1 },
          { concepto: "Agua Corriente", monto: 5500.0, es_obligatorio: 0 },
          { concepto: "Energía Eléctrica (Luz)", monto: 5500.0, es_obligatorio: 0 },
        ],
      },
      {
        numero_recibo: "REC-2026-004",
        id_inmueble: inm2,
        id_cliente: clientesIds[1],
        fecha_emision: "2026-11-01",
        periodo: "Noviembre 2026",
        total: 105000.0,
        estado: "PENDIENTE",
        fecha_cobro: null,
        observaciones: "Vencimiento el 10/11.",
        conceptos: [
          { concepto: "Alquiler Mensual", monto: 85000.0, es_obligatorio: 1 },
          { concepto: "Expensas Comunes", monto: 15000.0, es_obligatorio: 1 },
          { concepto: "Agua Corriente", monto: 3000.0, es_obligatorio: 0 },
          { concepto: "Gas Natural", monto: 2000.0, es_obligatorio: 0 },
        ],
      },
      {
        numero_recibo: "REC-2026-005",
        id_inmueble: inm3,
        id_cliente: clientesIds[2],
        fecha_emision: "2026-11-01",
        periodo: "Noviembre 2026",
        total: 245000.0,
        estado: "PENDIENTE",
        fecha_cobro: null,
        observaciones: "Locación comercial.",
        conceptos: [
          { concepto: "Alquiler Comercial", monto: 210000.0, es_obligatorio: 1 },
          { concepto: "Expensas Edificio", monto: 25000.0, es_obligatorio: 1 },
          { concepto: "Impuestos Municipales", monto: 10000.0, es_obligatorio: 0 },
        ],
      },
      {
        numero_recibo: "REC-2026-006",
        id_inmueble: inm4,
        id_cliente: clientesIds[3],
        fecha_emision: "2026-11-01",
        periodo: "Noviembre 2026",
        total: 360000.0,
        estado: "PENDIENTE",
        fecha_cobro: null,
        observaciones: "Aguardando confirmación de transferencia.",
        conceptos: [
          { concepto: "Alquiler Chalet", monto: 320000.0, es_obligatorio: 1 },
          { concepto: "Mantenimiento Parque", monto: 25000.0, es_obligatorio: 0 },
          { concepto: "Agua Corriente", monto: 15000.0, es_obligatorio: 0 },
        ],
      },
    ];

    for (const r of recibosData) {
      const [existeR] = await connection.query(
        "SELECT id FROM recibos WHERE numero_recibo = ?",
        [r.numero_recibo]
      );

      let idRec;
      if (existeR.length === 0) {
        const [resR] = await connection.query(
          `INSERT INTO recibos 
            (numero_recibo, id_inmueble, id_cliente, fecha_emision, periodo, total, estado, fecha_cobro, observaciones)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            r.numero_recibo,
            r.id_inmueble,
            r.id_cliente,
            r.fecha_emision,
            r.periodo,
            r.total,
            r.estado,
            r.fecha_cobro,
            r.observaciones,
          ]
        );
        idRec = resR.insertId;

        for (const c of r.conceptos) {
          await connection.query(
            `INSERT INTO conceptos_recibo (id_recibo, concepto, monto, es_obligatorio)
             VALUES (?, ?, ?, ?)`,
            [idRec, c.concepto, c.monto, c.es_obligatorio]
          );
        }
      }
    }

    // 4. MOVIMIENTOS BANCARIOS (CU-05, CU-06, CU-07)
    console.log("Cargando movimientos bancarios e ingresos/gastos...");
    const movimientosData = [
      {
        id_cuenta: idCuentaSantander,
        id_inmueble: inm1,
        tipo: "INGRESO",
        categoria: "Cobro de Alquiler",
        monto: 155000.0,
        fecha: "2026-10-05",
        descripcion: "Cobro Recibo REC-2026-001 (Carlos Benítez)",
      },
      {
        id_cuenta: idCuentaSantander,
        id_inmueble: inm2,
        tipo: "INGRESO",
        categoria: "Cobro de Alquiler",
        monto: 105000.0,
        fecha: "2026-10-08",
        descripcion: "Cobro Recibo REC-2026-002 (Mariana Gómez)",
      },
      {
        id_cuenta: idCuentaSantander,
        id_inmueble: inm2,
        tipo: "GASTO",
        categoria: "Reparación de ascensor",
        monto: 45000.0,
        fecha: "2026-10-12",
        descripcion: "Mantenimiento preventivo y reemplazo de contactores en ascensor.",
      },
      {
        id_cuenta: idCuentaSantander,
        id_inmueble: inm3,
        tipo: "GASTO",
        categoria: "Sueldo señora de limpieza",
        monto: 80000.0,
        fecha: "2026-10-30",
        descripcion: "Honorarios mensuales de maestranza en oficinas.",
      },
      {
        id_cuenta: idCuentaSantander,
        id_inmueble: inm1,
        tipo: "INGRESO",
        categoria: "Cobro de Alquiler",
        monto: 158000.0,
        fecha: "2026-11-04",
        descripcion: "Cobro Recibo REC-2026-003 (Carlos Benítez)",
      },
      {
        id_cuenta: idCuentaSantander,
        id_inmueble: inm2,
        tipo: "GASTO",
        categoria: "Mantenimiento y plomería",
        monto: 35000.0,
        fecha: "2026-11-02",
        descripcion: "Reparación de bomba elevadora de agua y tablero.",
      },
      {
        id_cuenta: idCuentaGalicia,
        id_inmueble: inm4,
        tipo: "GASTO",
        categoria: "Mantenimiento y plomería",
        monto: 22000.0,
        fecha: "2026-11-05",
        descripcion: "Desobstrucción y service de cañerías en cocina.",
      },
    ];

    for (const m of movimientosData) {
      const [existeM] = await connection.query(
        "SELECT id FROM movimientos_bancarios WHERE descripcion = ? AND fecha = ?",
        [m.descripcion, m.fecha]
      );

      if (existeM.length === 0) {
        await connection.query(
          `INSERT INTO movimientos_bancarios 
            (id_cuenta, id_inmueble, tipo, categoria, monto, fecha, descripcion)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            m.id_cuenta,
            m.id_inmueble,
            m.tipo,
            m.categoria,
            m.monto,
            m.fecha,
            m.descripcion,
          ]
        );
      }
    }

    await connection.commit();
    console.log("¡Carga de datos de prueba completada exitosamente!");
    process.exit(0);
  } catch (error) {
    await connection.rollback();
    console.error("Error al cargar datos:", error);
    process.exit(1);
  } finally {
    connection.release();
  }
}

seedData();

