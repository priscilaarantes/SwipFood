const { Router } = require('express')
const {
  listar,
  destaques,
  detalhe,
  criar
} = require('../controladores/estabelecimentoControlador')
const { exigirAutenticacao, autenticacaoOpcional } = require('../utilitarios/autenticacao')

const rotas = Router()

// Rotas de estabelecimentos
rotas.get('/destaques', destaques)
rotas.get('/', listar)
rotas.get('/:id', autenticacaoOpcional, detalhe)
rotas.post('/', exigirAutenticacao, criar)

module.exports = rotas