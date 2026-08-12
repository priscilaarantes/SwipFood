const { Router } = require('express')
const { registrarSwipe } = require('../controladores/swipeControlador')
const { exigirAutenticacao } = require('../utilitarios/autenticacao')

const rotas = Router()

// Registra o like/dislike de um usuário sobre um estabelecimento
rotas.post('/:id', exigirAutenticacao, registrarSwipe)

module.exports = rotas