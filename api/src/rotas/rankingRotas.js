const { Router } = require('express')
const { ranking } = require('../controladores/rankingControlador')
const { exigirAutenticacao } = require('../utilitarios/autenticacao')

const rotas = Router()

// Ranking personalizado do usuário (requer login)
rotas.get('/', exigirAutenticacao, ranking)

module.exports = rotas