var express = require("express");
const axios = require("axios");
const querystring = require("querystring");

var app = express();

app.set("port", process.env.PORT || 8080);

const BASE_URL = "https://veiculos.fipe.org.br";

const tipoVeiculoEnum = {
  carros: 1,
  motos: 2,
};

const requestOptions = (url, data = {}) => ({
  url: `${BASE_URL}/api/veiculos${url}`,
  headers: {
    Referer: BASE_URL,
    "content-type": "application/x-www-form-urlencoded",
  },
  method: "post",
  data: querystring.stringify(data),
});

const referencias = async () =>
  axios.request(requestOptions("/ConsultarTabelaDeReferencia"));

const referenciaAtual = async () => {
  const { data: response } = await referencias();

  return response.reduce((prev, current) =>
    prev.Codigo > current.Codigo ? prev : current,
  ).Codigo;
};

app.get("/referencias", async (req, res) => {
  const response = await referencias();

  res.json(response.data);
});

app.get("/:tipoVeiculo/marcas", async (req, res) => {
  const { tipoVeiculo } = req.params;
  const referencia = req.query.referencia
    ? req.query.referencia
    : await referenciaAtual();

  const response = await axios.request(
    requestOptions("/ConsultarMarcas", {
      codigoTipoVeiculo: tipoVeiculoEnum[tipoVeiculo],
      codigoTabelaReferencia: referencia,
    }),
  );

  res.json(response.data);
});

app.get("/:tipoVeiculo/marcas/:marca/modelos", async (req, res) => {
  const { tipoVeiculo, marca } = req.params;
  const referencia = req.query.referencia
    ? req.query.referencia
    : await referenciaAtual();

  const response = await axios.request(
    requestOptions("/ConsultarModelos", {
      codigoTipoVeiculo: tipoVeiculoEnum[tipoVeiculo],
      codigoTabelaReferencia: referencia,
      codigoMarca: marca,
    }),
  );

  res.json(response.data);
});

app.get(
  "/:tipoVeiculo/marcas/:marca/modelos/:modelo/ano_modelos",
  async (req, res) => {
    const { tipoVeiculo, marca, modelo } = req.params;
    const referencia = req.query.referencia
      ? req.query.referencia
      : await referenciaAtual();

    const response = await axios.request(
      requestOptions("/ConsultarAnoModelo", {
        codigoTipoVeiculo: tipoVeiculoEnum[tipoVeiculo],
        codigoTabelaReferencia: referencia,
        codigoMarca: marca,
        codigoModelo: modelo,
      }),
    );

    res.json(response.data);
  },
);

app.get(
  "/:tipoVeiculo/marcas/:marca/modelos/:modelo/ano_modelos/:anoModelo",
  async (req, res) => {
    const { tipoVeiculo, marca, modelo, anoModelo } = req.params;
    const [ano, combustivel] = anoModelo.split("-");
    const referencia = req.query.referencia
      ? req.query.referencia
      : await referenciaAtual();

    const response = await axios.request(
      requestOptions("/ConsultarValorComTodosParametros", {
        codigoTipoVeiculo: tipoVeiculoEnum[tipoVeiculo],
        codigoTabelaReferencia: referencia,
        codigoMarca: marca,
        codigoModelo: modelo,
        anoModelo: ano,
        codigoTipoCombustivel: combustivel,
        tipoConsulta: "tradicional",
      }),
    );

    res.json(response.data);
  },
);

app.get(
  "/:tipoVeiculo/codigo_fipe/:codigoFipe/ano_modelos/:anoModelo",
  async (req, res) => {
    const { tipoVeiculo, codigoFipe, anoModelo } = req.params;
    const [ano, combustivel] = anoModelo.split("-");
    const referencia = req.query.referencia
      ? req.query.referencia
      : await referenciaAtual();

    const response = await axios.request(
      requestOptions("/ConsultarValorComTodosParametros", {
        codigoTipoVeiculo: tipoVeiculoEnum[tipoVeiculo],
        codigoTabelaReferencia: referencia,
        modeloCodigoExterno: codigoFipe,
        anoModelo: ano,
        codigoTipoCombustivel: combustivel,
        tipoConsulta: "codigo",
      }),
    );

    res.json(response.data);
  },
);

app.listen(app.get("port"), () => {
  console.log("Node app is running on port", app.get("port"));
});
