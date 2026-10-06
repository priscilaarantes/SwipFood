const banco = require('../config/conexaoBanco')
const { mapearEstabelecimento, SQL_MEDIAS } = require('./estabelecimentoControlador')
const recomendador = require('../servicos/recomendador')

// Carrega todo o catálogo de estabelecimentos já com as médias das avaliações.
// É a base tanto da fila de swipe quanto da recomendação do botão de match.
function carregarCatalogo() {
  return banco
    .prepare(`SELECT e.*, ${SQL_MEDIAS} FROM estabelecimentos e ORDER BY e.likes DESC, e.nome ASC`)
    .all()
    .map(mapearEstabelecimento)
}

// GET /api/swipes/fila
// Fila de cards do usuário: tudo o que ele ainda não arrastou, ordenado de
// forma que os restaurantes cujas etiquetas foram mais curtidas apareçam antes.
function fila(req, res) {
  const catalogo = carregarCatalogo()
  const resultado = recomendador.montarFilaSwipe(req.usuario.id, catalogo)

  res.json({
    sucesso: true,
    dados: resultado.dados,
    perfil: resultado.perfil,
    total: resultado.perfil.total,
    restantes: resultado.dados.length
  })
}

// GET /api/swipes/perfil
// Apenas o resumo das etiquetas aprendidas — usado para atualizar os chips de
// preferências e a barra de progresso depois de cada swipe.
function perfil(req, res) {
  const catalogo = carregarCatalogo()
  const resultado = recomendador.montarFilaSwipe(req.usuario.id, catalogo)

  res.json({ sucesso: true, perfil: resultado.perfil })
}

// GET /api/swipes/recomendacao
// Resultado do botão de match: uma recomendação baseada nas etiquetas dos
// restaurantes curtidos e o top 5 dos demais estabelecimentos pelo mesmo critério.
function recomendacao(req, res) {
  const catalogo = carregarCatalogo()
  const resultado = recomendador.montarRecomendacao(req.usuario.id, catalogo, { tamanhoTop: 5 })

  res.json({ sucesso: true, ...resultado })
}

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

  const usuarioId = req.usuario.id

  // Grava o swipe e ajusta a contagem de likes na mesma transação
  const salvar = banco.transaction(() => {
    // Upsert: se o usuário já deu swipe, apenas atualiza a ação
    const anterior = banco
      .prepare('SELECT id, acao FROM swipes WHERE usuario_id = ? AND estabelecimento_id = ?')
      .get(usuarioId, estabelecimentoId)

    if (anterior && anterior.acao === acao) {
      return { mensagem: 'Swipe já registrado.', repetido: true }
    }

    if (anterior) {
      // Corrige a contagem de likes quando a ação muda de like para dislike
      if (anterior.acao === 'like' && acao === 'dislike') {
        banco
          .prepare('UPDATE estabelecimentos SET likes = MAX(0, likes - 1) WHERE id = ?')
          .run(estabelecimentoId)
      } else if (anterior.acao === 'dislike' && acao === 'like') {
        banco
          .prepare('UPDATE estabelecimentos SET likes = likes + 1 WHERE id = ?')
          .run(estabelecimentoId)
      }
      banco.prepare('UPDATE swipes SET acao = ? WHERE id = ?').run(acao, anterior.id)
    } else {
      banco
        .prepare('INSERT INTO swipes (usuario_id, estabelecimento_id, acao) VALUES (?, ?, ?)')
        .run(usuarioId, estabelecimentoId, acao)

      if (acao === 'like') {
        banco
          .prepare('UPDATE estabelecimentos SET likes = likes + 1 WHERE id = ?')
          .run(estabelecimentoId)
      }
    }

    return { mensagem: acao === 'like' ? 'Você deu like!' : 'Você deu dislike.', repetido: false }
  })

  const resultado = salvar()

  res.json({ sucesso: true, mensagem: resultado.mensagem, repetido: resultado.repetido, acao })
}

// DELETE /api/swipes
// Reinicia o swipe do usuário: apaga o histórico de cards arrastados e devolve os
// estabelecimentos à fila inicial. É o que permite "voltar ao swipe" depois que os
// restaurantes acabaram — os likes dados antes são desfeitos para o contador de
// popularidade não ficar inflado.
function reiniciar(req, res) {
  const usuarioId = req.usuario.id

  const limpar = banco.transaction(() => {
    // Antes de apagar, guarda quantos swipes e quantos likes este usuário deu em cada estabelecimento
    const likesDesteUsuario = banco
      .prepare(
        `SELECT estabelecimento_id, COUNT(*) AS total
         FROM swipes
         WHERE usuario_id = ? AND acao = 'like'
         GROUP BY estabelecimento_id`
      )
      .all(usuarioId)

    const swipesRemovidos = banco
      .prepare('SELECT COUNT(*) AS total FROM swipes WHERE usuario_id = ?')
      .get(usuarioId).total

    banco.prepare('DELETE FROM swipes WHERE usuario_id = ?').run(usuarioId)

    // Desfaz o contador denormalizado de likes dos estabelecimentos afetados
    const removerLike = banco.prepare(
      'UPDATE estabelecimentos SET likes = MAX(0, likes - ?) WHERE id = ?'
    )
    let likesRemovidos = 0
    for (const linha of likesDesteUsuario) {
      removerLike.run(linha.total, linha.estabelecimento_id)
      likesRemovidos += linha.total
    }

    return { swipesRemovidos, likesRemovidos }
  })

  const resultado = limpar()
  const catalogo = carregarCatalogo()
  const fila = recomendador.montarFilaSwipe(usuarioId, catalogo)

  res.json({
    sucesso: true,
    mensagem: 'Swipe reiniciado! Todos os restaurantes voltaram para a fila.',
    ...resultado,
    dados: fila.dados,
    perfil: fila.perfil,
    total: fila.perfil.total,
    restantes: fila.dados.length
  })
}

module.exports = { registrarSwipe, fila, perfil, recomendacao, reiniciar }