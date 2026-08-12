const { Router } = require('express')
const { cadastrar, entrar, sair, eu } = require('../controladores/usuarioControlador')
const { exigirAutenticacao } = require('../utilitarios/autenticacao')

const rotas = Router()

// Rotas de autenticação
rotas.post('/cadastro', cadastrar)
rotas.post('/login', entrar)
rotas.post('/logout', exigirAutenticacao, sair)
rotas.get('/me', exigirAutenticacao, eu)

module.exports = rotas