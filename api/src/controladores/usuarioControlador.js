const banco = require('../config/conexaoBanco')
const { gerarHash, verificarSenha } = require('../utilitarios/senha')
const { criarSessao } = require('../utilitarios/autenticacao')
const { validarCadastro, validarLogin, sanitizar } = require('../utilitarios/validadores')

// Cadastra um novo usuário e já cria a sessão logada
function cadastrar(req, res) {
  const { valido, erros, dados } = validarCadastro(req.body)
  if (!valido) return res.status(422).json({ sucesso: false, mensagem: 'Dados inválidos.', erros })

  // Impede cadastro duplicado (e-mail ou CPF/CNPJ já cadastrado)
  const existente = banco
    .prepare('SELECT id FROM usuarios WHERE identificador = ?')
    .get(dados.identificador)
  if (existente) {
    return res.status(409).json({ sucesso: false, mensagem: 'Este e-mail ou CPF/CNPJ já está cadastrado.' })
  }

  const senhaHash = gerarHash(dados.senha)
  const resultado = banco
    .prepare('INSERT INTO usuarios (nome, identificador, senha_hash) VALUES (?, ?, ?)')
    .run(dados.nome, dados.identificador, senhaHash)

  const token = criarSessao(resultado.lastInsertRowid)

  res.status(201).json({
    sucesso: true,
    mensagem: 'Cadastro realizado com sucesso!',
    token,
    usuario: {
      id: resultado.lastInsertRowid,
      nome: dados.nome,
      identificador: dados.identificador
    }
  })
}

// Realiza o login e retorna o token de sessão
function entrar(req, res) {
  const { valido, erros, dados } = validarLogin(req.body)
  if (!valido) return res.status(422).json({ sucesso: false, mensagem: 'Dados inválidos.', erros })

  const usuario = banco
    .prepare('SELECT * FROM usuarios WHERE identificador = ?')
    .get(dados.identificador)

  // Mensagem genérica para não revelar se o identificador existe
  if (!usuario || !verificarSenha(dados.senha, usuario.senha_hash)) {
    return res.status(401).json({ sucesso: false, mensagem: 'Identificador ou senha incorretos.' })
  }

  const token = criarSessao(usuario.id)

  res.json({
    sucesso: true,
    mensagem: 'Login realizado com sucesso!',
    token,
    usuario: { id: usuario.id, nome: usuario.nome, identificador: usuario.identificador }
  })
}

// Encerra a sessão do usuário (remove o token do banco)
function sair(req, res) {
  banco.prepare('DELETE FROM sessoes WHERE token = ?').run(req.token)
  res.json({ sucesso: true, mensagem: 'Sessão encerrada.' })
}

// Retorna os dados do usuário autenticado
function eu(req, res) {
  res.json({ sucesso: true, usuario: req.usuario })
}

module.exports = { cadastrar, entrar, sair, eu }