var express = require("express");
var request = require("request-promise");

var app = express();

app.set("port", process.env.PORT || 5000);

const BASE_URL = "http://veiculos.fipe.org.br";

const tipoVeiculoEnum = {
  carros: 1,
  motos: 2,
};

const requestOptions = (url) => ({
  url: `${BASE_URL}/api/veiculos${url}`,
  headers: {
    Referer: BASE_URL,
  },
  json: true,
});

const referencias = async () => {
  const options = requestOptions("/ConsultarTabelaDeReferencia");

  return await request.post(options);
};

const referenciaAtual = async () => {
  const response = await referencias();

  return response.reduce((prev, current) =>
    prev.Codigo > current.Codigo ? prev : current,
  ).Codigo;
};

app.get("/referencias", async (req, res) => {
  const response = await referencias();

  res.json(response);
});

app.get("/:tipoVeiculo/marcas", async (req, res) => {
  const { tipoVeiculo } = req.params;
  const referencia = req.query.referencia
    ? req.query.referencia
    : await referenciaAtual();

  const options = requestOptions("/ConsultarMarcas");

  request.post(
    {
      ...options,
      form: {
        codigoTipoVeiculo: tipoVeiculoEnum[tipoVeiculo],
        codigoTabelaReferencia: referencia,
      },
    },
    (error, response, body) => {
      res.json(body);
    },
  );
});

app.get("/:tipoVeiculo/marcas/:marca/modelos", async (req, res) => {
  const { tipoVeiculo, marca } = req.params;
  const referencia = req.query.referencia
    ? req.query.referencia
    : await referenciaAtual();

  const options = requestOptions("/ConsultarModelos");

  request.post(
    {
      ...options,
      form: {
        codigoTipoVeiculo: tipoVeiculoEnum[tipoVeiculo],
        codigoTabelaReferencia: referencia,
        codigoMarca: marca,
      },
    },
    (error, response, body) => {
      res.json(body["Modelos"]);
    },
  );
});

app.get(
  "/:tipoVeiculo/marcas/:marca/modelos/:modelo/ano_modelos",
  async (req, res) => {
    const { tipoVeiculo, marca, modelo } = req.params;
    const referencia = req.query.referencia
      ? req.query.referencia
      : await referenciaAtual();

    const options = requestOptions("/ConsultarAnoModelo");

    request.post(
      {
        ...options,
        form: {
          codigoTipoVeiculo: tipoVeiculoEnum[tipoVeiculo],
          codigoTabelaReferencia: referencia,
          codigoMarca: marca,
          codigoModelo: modelo,
        },
      },
      (error, response, body) => {
        res.json(body);
      },
    );
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

    const options = requestOptions("/ConsultarValorComTodosParametros");

    request.post(
      {
        ...options,
        form: {
          codigoTipoVeiculo: tipoVeiculoEnum[tipoVeiculo],
          codigoTabelaReferencia: referencia,
          codigoMarca: marca,
          codigoModelo: modelo,
          anoModelo: ano,
          codigoTipoCombustivel: combustivel,
          tipoConsulta: "tradicional",
        },
      },
      (error, response, body) => {
        res.json(body);
      },
    );
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

    const options = requestOptions("/ConsultarValorComTodosParametros");

    request.post(
      {
        ...options,
        form: {
          codigoTipoVeiculo: tipoVeiculoEnum[tipoVeiculo],
          codigoTabelaReferencia: referencia,
          modeloCodigoExterno: codigoFipe,
          anoModelo: ano,
          codigoTipoCombustivel: combustivel,
          tipoConsulta: "codigo",
        },
      },
      (error, response, body) => {
        res.json(body);
      },
    );
  },
);

app.listen(app.get("port"), () => {
  console.log("Node app is running on port", app.get("port"));
});
