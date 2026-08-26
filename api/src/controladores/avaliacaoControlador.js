const banco = require('../config/conexaoBanco')
const { validarAvaliacao } = require('../utilitarios/validadores')
const { mapearAvaliacao } = require('./estabelecimentoControlador')

// Converte uma nota em string do banco para número (mantém null)
function notaParaNumero(valor) {
  return valor === null || valor === undefined ? null : Number(valor)
}

// Adiciona uma avaliação a um estabelecimento (somente usuário autenticado — RNF segurança)
function criarAvaliacao(req, res) {
  const estabelecimentoId = Number(req.params.id)

  const existe = banco
    .prepare('SELECT id FROM estabelecimentos WHERE id = ?')
    .get(estabelecimentoId)
  if (!existe) {
    return res.status(404).json({ sucesso: false, mensagem: 'Estabelecimento não encontrado.' })
  }

  // Cada usuário só pode avaliar o mesmo restaurante uma vez
  const jaAvaliou = banco
    .prepare('SELECT id FROM avaliacoes WHERE estabelecimento_id = ? AND usuario_id = ?')
    .get(estabelecimentoId, req.usuario.id)
  if (jaAvaliou) {
    return res
      .status(409)
      .json({ sucesso: false, mensagem: 'Você já avaliou este estabelecimento.' })
  }

  const { valido, erros, dados } = validarAvaliacao(req.body)
  if (!valido) return res.status(422).json({ sucesso: false, mensagem: 'Dados inválidos.', erros })

  const inserir = banco.prepare(`
    INSERT INTO avaliacoes (
      usuario_id, estabelecimento_id,
      limpeza_local, manuseio_alimentos, odor_ambiente, custo_beneficio,
      limpeza_geral, iluminacao, velocidade_atendimento, cordialidade,
      seguranca_entorno, comentario, fotos
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  inserir.run(
    req.usuario.id, estabelecimentoId,
    notaParaNumero(dados.limpeza_local), notaParaNumero(dados.manuseio_alimentos),
    notaParaNumero(dados.odor_ambiente), notaParaNumero(dados.custo_beneficio),
    notaParaNumero(dados.limpeza_geral), notaParaNumero(dados.iluminacao),
    notaParaNumero(dados.velocidade_atendimento), notaParaNumero(dados.cordialidade),
    notaParaNumero(dados.seguranca_entorno),
    dados.comentario, JSON.stringify(dados.fotos)
  )

  res.status(201).json({ sucesso: true, mensagem: 'Avaliação registrada com sucesso!' })
}

// Lista as avaliações de um estabelecimento com os nomes dos usuários
function listarAvaliacoes(req, res) {
  const estabelecimentoId = Number(req.params.id)

  const avaliacoes = banco
    .prepare(`
      SELECT av.*, u.nome AS nome_usuario
      FROM avaliacoes av
      JOIN usuarios u ON u.id = av.usuario_id
      WHERE av.estabelecimento_id = ?
      ORDER BY av.criado_em DESC
    `)
    .all(estabelecimentoId)

  const dados = avaliacoes.map(linha => {
    const aval = mapearAvaliacao(linha)
    delete aval.usuario_id
    return aval
  })
  res.json({ sucesso: true, dados })
}

module.exports = { criarAvaliacao, listarAvaliacoes }