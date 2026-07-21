const express = require("express");
var cors = require('cors');
var app = express();

// Adds headers: Access-Control-Allow-Origin: *
app.use(cors());
const port = 3000;

const actividades = [
  {
    id: 1,
    inmueble: "Av. del Libertador 1200 - CABA",
    cliente: "Roberto Jiménez",
    monto: "$1,250.00",
    fecha: "05 Oct, 2023",
    estado: "ACTIVO",
    imagen:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=100&q=80",
  },
  {
    id: 2,
    inmueble: "Calle Corrientes 450 - Rosario",
    cliente: "Elena Martínez",
    monto: "$3,300.00",
    fecha: "04 Oct, 2023",
    estado: "PENDIENTE",
    imagen:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=100&q=80",
  },
  {
    id: 3,
    inmueble: "Bv. Chacabuco 800 - Córdoba",
    cliente: "Soluciones Globales S.A.",
    monto: "$12,000.00",
    fecha: "02 Oct, 2023",
    estado: "CERRADO",
    imagen:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=100&q=80",
  },
  {
    id: 4,
    inmueble: "Bv. Chacabuco 900 - Rosario",
    cliente: "Soluciones Globales S.A.",
    monto: "$50,000.00",
    fecha: "02 Oct, 2023",
    estado: "CERRADO",
    imagen:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=100&q=80",
  },
];

app.get("/inmuebles", (req, res) => {
  res.send({
    data: [
      {
        id: 1,
        inmueble: "Av. del Libertador 1200 - CABA",
        cliente: "Roberto Jiménez",
        monto: "$1,250.00",
        fecha: "05 Oct, 2023",
        estado: "ACTIVO",
        imagen:
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=100&q=80",
      },
      {
        id: 2,
        inmueble: "Calle Corrientes 450 - Rosario",
        cliente: "Elena Martínez",
        monto: "$3,300.00",
        fecha: "04 Oct, 2023",
        estado: "PENDIENTE",
        imagen:
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=100&q=80",
      },
      {
        id: 3,
        inmueble: "Bv. Chacabuco 800 - Córdoba",
        cliente: "Soluciones Globales S.A.",
        monto: "$12,000.00",
        fecha: "02 Oct, 2023",
        estado: "CERRADO",
        imagen:
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=100&q=80",
      },
      {
        id: 4,
        inmueble: "Bv. Chacabuco 900 - Rosario",
        cliente: "Soluciones Globales S.A.",
        monto: "$50,000.00",
        fecha: "02 Oct, 2023",
        estado: "CERRADO",
        imagen:
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=100&q=80",
      },
    ],
  });
});

app.get("/inmuebles/:id", (req, res) => {
  const inmuebleId = req.params.id;
  res.send(`Detalles del inmueble con ID: ${inmuebleId}`);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
