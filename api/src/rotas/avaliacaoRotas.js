const { Router } = require('express')
const {
  criarAvaliacao,
  listarAvaliacoes
} = require('../controladores/avaliacaoControlador')
const { exigirAutenticacao } = require('../utilitarios/autenticacao')

const rotas = Router()

// Rotas de avaliações
rotas.post('/:id/avaliacoes', exigirAutenticacao, criarAvaliacao)
rotas.get('/:id/avaliacoes', listarAvaliacoes)

module.exports = rotas