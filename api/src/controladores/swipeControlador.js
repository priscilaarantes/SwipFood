const banco = require('../config/conexaoBanco')

// Registra um "like" ou "dislike" do usuário sobre um estabelecimento (tela de swipe)
function registrarSwipe(req, res) {
  const estabelecimentoId = Number(req.params.id)
  const acao = String(req.body.acao || '')

  // Ação permitida: apenas like ou dislike
  if (!['like', 'dislike'].includes(acao)) {
    return res.status(422).json({ sucesso: false, mensagem: 'Ação inválida. Use "like" ou "dislike".' })
  }

  const existe = banco
    .prepare('SELECT id FROM estabelecimentos WHERE id = ?')
    .get(estabelecimentoId)
  if (!existe) {
    return res.status(404).json({ sucesso: false, mensagem: 'Estabelecimento não encontrado.' })
  }

  // Upsert: se o usuário já deu swipe, apenas atualiza a ação
  const anterior = banco
    .prepare('SELECT id, acao FROM swipes WHERE usuario_id = ? AND estabelecimento_id = ?')
    .get(req.usuario.id, estabelecimentoId)

  if (anterior && anterior.acao === acao) {
    return res.json({ sucesso: true, mensagem: 'Swipe já registrado.', acao })
  }

  if (anterior) {
    // Corrige a contagem de likes quando a ação muda de like para dislike
    if (anterior.acao === 'like' && acao === 'dislike') {
      banco
        .prepare('UPDATE estabelecimentos SET likes = MAX(0, likes - 1) WHERE id = ?')
        .run(estabelecimentoId)
    }
    banco
      .prepare('UPDATE swipes SET acao = ? WHERE id = ?')
      .run(acao, anterior.id)
  } else {
    banco
      .prepare('INSERT INTO swipes (usuario_id, estabelecimento_id, acao) VALUES (?, ?, ?)')
      .run(req.usuario.id, estabelecimentoId, acao)

    if (acao === 'like') {
      banco
        .prepare('UPDATE estabelecimentos SET likes = likes + 1 WHERE id = ?')
        .run(estabelecimentoId)
    }
  }

  res.json({ sucesso: true, mensagem: acao === 'like' ? 'Você deu like!' : 'Você deu dislike.', acao })
}

module.exports = { registrarSwipe }