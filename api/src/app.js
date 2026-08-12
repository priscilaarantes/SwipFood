const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const path = require('path')
const fs = require('fs')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const rotasAuth = require('./rotas/authRotas')
const rotasEstabelecimentos = require('./rotas/estabelecimentoRotas')
const rotasAvaliacoes = require('./rotas/avaliacaoRotas')
const rotasSwipes = require('./rotas/swipeRotas')
const rotasRanking = require('./rotas/rankingRotas')

const app = express()

// Middlewares de segurança e parsing
// Limite maior para permitir envio de fotos (base64) nas avaliações
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false
}))
app.use(cors({ origin: process.env.ORIGEM_PERMITIDA || '*' }))
app.use(express.json({ limit: '4mb' }))

// Servir arquivos estáticos do frontend (React build em dist ou fallback)
const caminhoDist = path.resolve(__dirname, '../../frontend/dist')
const caminhoFrontend = path.resolve(__dirname, '../../frontend')
const pastaEstatica = fs.existsSync(caminhoDist) ? caminhoDist : caminhoFrontend

app.use(express.static(pastaEstatica))

// Rotas da API do SwipFood
app.use('/api/auth', rotasAuth)
// As avaliações ficam aninhadas em estabelecimentos (ex.: /api/estabelecimentos/1/avaliacoes)
app.use('/api/estabelecimentos', rotasEstabelecimentos)
app.use('/api/estabelecimentos', rotasAvaliacoes)
app.use('/api/swipes', rotasSwipes)
app.use('/api/ranking', rotasRanking)

// Rota de health check
app.get('/api/health', (_, res) => res.json({ sucesso: true, mensagem: 'API SwipFood funcionando!' }))

// Fallback para o SPA (index.html)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next()
  res.sendFile(path.join(pastaEstatica, 'index.html'))
})

module.exports = app