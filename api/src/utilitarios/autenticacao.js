const crypto = require('crypto')
const banco = require('../config/conexaoBanco')

// Chave secreta usada na assinatura dos tokens (definida no .env)
const SEGREDO = process.env.SEGREDO_JWT || 'segredo-swipfood-desenvolvimento'

// Gera um token assinado (payload + assinatura HMAC-SHA256)
// Estrutura: base64(payload).assinatura
function assinarToken(payload) {
  const corpo = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const assinatura = crypto
    .createHmac('sha256', SEGREDO)
    .update(corpo)
    .digest('base64url')
  return `${corpo}.${assinatura}`
}

// Valida a assinatura de um token e retorna o payload (ou null se for inválido)
function verificarToken(token) {
  try {
    const [corpo, assinatura] = String(token).split('.')
    if (!corpo || !assinatura) return null
    const assinaturaEsperada = crypto
      .createHmac('sha256', SEGREDO)
      .update(corpo)
      .digest('base64url')
    if (assinatura !== assinaturaEsperada) return null
    return JSON.parse(Buffer.from(corpo, 'base64url').toString('utf8'))
  } catch {
    return null
  }
}

// Middleware que exige autenticação: valida o token e carrega o usuário
function exigirAutenticacao(req, res, next) {
  const cabecalhoAutorizacao = req.headers['authorization'] || ''
  const token = cabecalhoAutorizacao.replace(/^Bearer\s+/i, '')

  const payload = verificarToken(token)
  if (!payload || !payload.usuario_id) {
    return res.status(401).json({ sucesso: false, mensagem: 'Autenticação necessária.' })
  }

  // Verifica se a sessão ainda existe no banco (permite logout)
  const sessao = banco.prepare('SELECT id FROM sessoes WHERE token = ?').get(token)
  if (!sessao) {
    return res.status(401).json({ sucesso: false, mensagem: 'Sessão expirada. Faça login novamente.' })
  }

  const usuario = banco
    .prepare('SELECT id, nome, identificador, criado_em FROM usuarios WHERE id = ?')
    .get(payload.usuario_id)
  if (!usuario) {
    return res.status(401).json({ sucesso: false, mensagem: 'Usuário não encontrado.' })
  }

  req.usuario = usuario
  req.token = token
  next()
}

// Middleware de autenticação opcional: preenche req.usuario quando há token válido,
// mas não bloqueia a requisição (usado em rotas públicas como detalhe de restaurante)
function autenticacaoOpcional(req, res, next) {
  const cabecalhoAutorizacao = req.headers['authorization'] || ''
  const token = cabecalhoAutorizacao.replace(/^Bearer\s+/i, '')
  const payload = verificarToken(token)
  if (payload && payload.usuario_id) {
    const usuario = banco
      .prepare('SELECT id, nome, identificador FROM usuarios WHERE id = ?')
      .get(payload.usuario_id)
    if (usuario) req.usuario = usuario
  }
  next()
}

// Cria uma sessão no banco e retorna o token para o cliente
function criarSessao(usuarioId) {
  const payload = { usuario_id: usuarioId, criado_em: Date.now() }
  const token = assinarToken(payload)
  banco.prepare('INSERT INTO sessoes (token, usuario_id) VALUES (?, ?)').run(token, usuarioId)
  return token
}

module.exports = { assinarToken, verificarToken, criarSessao, exigirAutenticacao, autenticacaoOpcional }