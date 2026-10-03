const { Router } = require('express')
const {
  registrarSwipe,
  fila,
  perfil,
  recomendacao,
  reiniciar
} = require('../controladores/swipeControlador')
const { exigirAutenticacao } = require('../utilitarios/autenticacao')

const rotas = Router()

// Fila de cards ordenada pelo peso das etiquetas que o usuário curtiu
rotas.get('/fila', exigirAutenticacao, fila)

// Resumo das etiquetas aprendidas (atualizado a cada swipe)
rotas.get('/perfil', exigirAutenticacao, perfil)

// Resultado do botão de match: recomendação + top 5 pelo mesmo critério
rotas.get('/recomendacao', exigirAutenticacao, recomendacao)

// Registra o like/dislike de um usuário sobre um estabelecimento
rotas.post('/:id', exigirAutenticacao, registrarSwipe)

// Reinicia o swipe: limpa o histórico do usuário e devolve a fila completa
rotas.delete('/', exigirAutenticacao, reiniciar)

module.exports = rotas