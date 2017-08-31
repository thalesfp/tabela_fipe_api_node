var express = require('express')
var request = require('request')

var app = express()

app.set('port', (process.env.PORT || 5000))

const BASE_URL = 'http://veiculos.fipe.org.br'

const tipoVeiculoEnum = {
  carros: 1,
  motos: 2
}

const referenciaAtual = req => 216

const requestOptions = url => ({
  url: `${BASE_URL}/api/veiculos${url}`,
  headers: {
    Referer: BASE_URL
  },
  json: true
})

app.get('/referencias', (req, res) => {
  const options = requestOptions('/ConsultarTabelaDeReferencia')

  request.post(options, (error, response, body) => {
    res.json(body)
  })
})

app.get('/:tipoVeiculo/marcas', (req, res) => {
  const { tipoVeiculo } = req.params
  const { referencia } = req.query

  const options = requestOptions('/ConsultarMarcas')

  request.post(
    {
      ...options,
      form: {
        codigoTipoVeiculo: tipoVeiculoEnum[tipoVeiculo],
        codigoTabelaReferencia: referencia || referenciaAtual()
      }
    },
    (error, response, body) => {
      res.json(body)
    }
  )
})

app.get('/:tipoVeiculo/marcas/:marca/modelos', (req, res) => {
  const { tipoVeiculo, marca } = req.params
  const { referencia } = req.query

  const options = requestOptions('/ConsultarModelos')

  request.post(
    {
      ...options,
      form: {
        codigoTipoVeiculo: tipoVeiculoEnum[tipoVeiculo],
        codigoTabelaReferencia: referencia || referenciaAtual(),
        codigoMarca: marca
      }
    },
    (error, response, body) => {
      res.json(body['Modelos'])
    }
  )
})

app.get('/:tipoVeiculo/marcas/:marca/modelos/:modelo/ano_modelos', (req, res) => {
    const { tipoVeiculo, marca, modelo } = req.params
    const { referencia } = req.query

    const options = requestOptions('/ConsultarAnoModelo')

    request.post(
      {
        ...options,
        form: {
          codigoTipoVeiculo: tipoVeiculoEnum[tipoVeiculo],
          codigoTabelaReferencia: referencia || referenciaAtual(),
          codigoMarca: marca,
          codigoModelo: modelo
        }
      },
      (error, response, body) => {
        res.json(body)
      }
    )
  }
)

app.get('/:tipoVeiculo/marcas/:marca/modelos/:modelo/ano_modelos/:anoModelo', (req, res) => {
    const { tipoVeiculo, marca, modelo, anoModelo } = req.params
    const { referencia } = req.query
    const [ano, combustivel] = anoModelo.split('-')

    const options = requestOptions('/ConsultarValorComTodosParametros')

    request.post(
      {
        ...options,
        form: {
          codigoTipoVeiculo: tipoVeiculoEnum[tipoVeiculo],
          codigoTabelaReferencia: referencia || referenciaAtual(),
          codigoMarca: marca,
          codigoModelo: modelo,
          anoModelo: ano,
          codigoTipoCombustivel: combustivel,
          tipoConsulta: 'tradicional'
        }
      },
      (error, response, body) => {
        res.json(body)
      }
    )
  }
)

app.get('/:tipoVeiculo/codigo_fipe/:codigoFipe/ano_modelos/:anoModelo', (req, res) => {
    const { tipoVeiculo, codigoFipe, anoModelo } = req.params
    const { referencia } = req.query
    const [ano, combustivel] = anoModelo.split('-')

    const options = requestOptions('/ConsultarValorComTodosParametros')

    request.post(
      {
        ...options,
        form: {
          codigoTipoVeiculo: tipoVeiculoEnum[tipoVeiculo],
          codigoTabelaReferencia: referencia || referenciaAtual(),
          modeloCodigoExterno: codigoFipe,
          anoModelo: ano,
          codigoTipoCombustivel: combustivel,
          tipoConsulta: 'codigo'
        }
      },
      (error, response, body) => {
        res.json(body)
      }
    )
  }
)

app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'))
})
