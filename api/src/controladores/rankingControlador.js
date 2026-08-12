const banco = require('../config/conexaoBanco')

// Gera o ranking personalizado do usuário baseado nos seus "likes" (swipes) e notas
function ranking(req, res) {
  const registros = banco
    .prepare(`
      SELECT
        e.id, e.nome, e.categoria, e.faixa_preco, e.imagens, e.tags,
        s.acao, s.criado_em AS swipe_criado_em,
        (SELECT ROUND(AVG(av.limpeza_local), 1) FROM avaliacoes av WHERE av.estabelecimento_id = e.id) AS media_limpeza,
        (SELECT ROUND(AVG(av.custo_beneficio), 1) FROM avaliacoes av WHERE av.estabelecimento_id = e.id) AS media_custo,
        (SELECT ROUND(AVG(
            (COALESCE(av.limpeza_local,0) + COALESCE(av.manuseio_alimentos,0) +
             COALESCE(av.odor_ambiente,0) + COALESCE(av.custo_beneficio,0) +
             COALESCE(av.limpeza_geral,0) + COALESCE(av.iluminacao,0) +
             COALESCE(av.velocidade_atendimento,0) + COALESCE(av.cordialidade,0) +
             COALESCE(av.seguranca_entorno,0)) / 9.0
          ), 2) FROM avaliacoes av WHERE av.estabelecimento_id = e.id) AS media_geral,
        (SELECT COUNT(*) FROM avaliacoes av WHERE av.estabelecimento_id = e.id) AS total_avaliacoes
      FROM swipes s
      JOIN estabelecimentos e ON e.id = s.estabelecimento_id
      WHERE s.usuario_id = ? AND s.acao = 'like'
      ORDER BY s.criado_em DESC
    `)
    .all(req.usuario.id)

  // Converte campos JSON e retorna ordenado da maior para a menor nota média
  const dados = registros.map((linha) => {
    let imagens = []
    let tags = []
    try { imagens = JSON.parse(linha.imagens || '[]') } catch { imagens = [] }
    try { tags = JSON.parse(linha.tags || '[]') } catch { tags = [] }
    return {
      id: linha.id,
      nome: linha.nome,
      categoria: linha.categoria,
      faixa_preco: linha.faixa_preco,
      imagens,
      tags,
      media_geral: Number(linha.media_geral) || null,
      media_limpeza: linha.media_limpeza !== null ? Number(linha.media_limpeza) : null,
      media_custo: linha.media_custo !== null ? Number(linha.media_custo) : null,
      total_avaliacoes: linha.total_avaliacoes,
      swipe_criado_em: linha.swipe_criado_em
    }
  }).sort((a, b) => {
    const notaA = a.media_geral ?? 0
    const notaB = b.media_geral ?? 0
    return notaB - notaA
  })

  res.json({ sucesso: true, dados })
}

module.exports = { ranking }