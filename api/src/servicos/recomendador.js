const banco = require('../config/conexaoBanco')

// ---------------------------------------------------------------------------
// Motor de recomendação por etiquetas do SwipFood
// ---------------------------------------------------------------------------
// Como funciona:
//   1. Cada "like" dado no swipe soma +1 ao peso de todas as etiquetas do card
//      arrastado; cada "dislike" subtrai 1 das mesmas etiquetas.
//   2. A soma dos pesos forma o "perfil de etiquetas" do usuário.
//   3. A fila de cards é embaralhada por sorteio ponderado: um card cujas
//      etiquetas somam mais likes recebe peso maior e, portanto, tem mais
//      chance de aparecer primeiro na fila.
//   4. O botão de match reaproveita exatamente o mesmo cálculo para escolher
//      uma recomendação e listar o top 5 dos demais estabelecimentos.

// Chance base de um card sem nenhuma etiqueta ligada às curtidas do usuário
const PESO_BASE = 0.4

// Menor peso possível: o card continua alcançável, mas é o menos provável
const PESO_MINIMO = 0.05

// Quanto a popularidade (likes totais) influencia na escolha da recomendação
const INFLUENCIA_POPULARIDADE = 0.25

// Normaliza a etiqueta para comparações: minúsculas, sem acentos e sem espaços duplos
function normalizarEtiqueta(etiqueta) {
  return String(etiqueta || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

// Índice de etiquetas por estabelecimento, guardando o texto original para exibição
function indexarEtiquetas(estabelecimentos) {
  const indice = new Map()
  for (const estabelecimento of estabelecimentos) {
    const etiquetas = (estabelecimento.tags || [])
      .map((original) => ({ original, chave: normalizarEtiqueta(original) }))
      .filter((etiqueta) => etiqueta.chave)
    indice.set(estabelecimento.id, etiquetas)
  }
  return indice
}

// Swipes já registrados pelo usuário (estabelecimento + ação)
function listarSwipes(usuarioId) {
  return banco
    .prepare('SELECT estabelecimento_id, acao FROM swipes WHERE usuario_id = ?')
    .all(usuarioId)
}

// Gera um número aleatório reproduzível (mulberry32) para que a fila não mude
// de ordem a cada recarga da tela de swipe
function criarSorteio(semente) {
  let estado = semente >>> 0
  return function sortear() {
    estado = (estado + 0x6d2b79f5) | 0
    let valor = Math.imul(estado ^ (estado >>> 15), 1 | estado)
    valor = (valor + Math.imul(valor ^ (valor >>> 7), 61 | valor)) ^ valor
    return ((valor ^ (valor >>> 14)) >>> 0) / 4294967296
  }
}

// Perfil de etiquetas do usuário: peso, número de curtidas e de rejeições de cada etiqueta
function montarPerfilEtiquetas(usuarioId, indiceEtiquetas) {
  const pesos = new Map()
  const rotulos = new Map()
  const curtidas = new Map()
  const rejeitadas = new Map()
  let likes = 0
  let dislikes = 0

  for (const swipe of listarSwipes(usuarioId)) {
    const incremento = swipe.acao === 'like' ? 1 : -1
    if (incremento > 0) likes += 1
    else dislikes += 1

    for (const etiqueta of indiceEtiquetas.get(swipe.estabelecimento_id) || []) {
      pesos.set(etiqueta.chave, (pesos.get(etiqueta.chave) || 0) + incremento)
      if (!rotulos.has(etiqueta.chave)) rotulos.set(etiqueta.chave, etiqueta.original)
      const contador = incremento > 0 ? curtidas : rejeitadas
      contador.set(etiqueta.chave, (contador.get(etiqueta.chave) || 0) + 1)
    }
  }

  return { pesos, rotulos, curtidas, rejeitadas, likes, dislikes }
}

// Resumo do perfil devolvido ao frontend: totais de swipes, as etiquetas mais
// curtidas e as mais rejeitadas (o que o usuário vê em "minhas preferências")
function resumirPerfil(perfil, total, limite = 6) {
  const todas = []
  for (const [chave, peso] of perfil.pesos.entries()) {
    todas.push({
      etiqueta: perfil.rotulos.get(chave) || chave,
      peso,
      curtidas: perfil.curtidas.get(chave) || 0,
      rejeitadas: perfil.rejeitadas.get(chave) || 0
    })
  }

  const ordenar = (a, b) =>
    b.peso - a.peso ||
    b.curtidas - a.curtidas ||
    a.etiqueta.localeCompare(b.etiqueta, 'pt-BR')

  return {
    likes: perfil.likes,
    dislikes: perfil.dislikes,
    avaliados: perfil.likes + perfil.dislikes,
    total,
    etiquetas: todas.filter((item) => item.peso > 0).sort(ordenar).slice(0, limite),
    rejeitadas: todas.filter((item) => item.peso < 0).sort(ordenar).slice(0, limite)
  }
}

// Afinidade do estabelecimento: média do peso das suas etiquetas. Usar a média
// (e não a soma) impede que um card seja favorecido apenas por ter mais etiquetas.
function calcularAfinidade(etiquetas, perfil) {
  if (etiquetas.length === 0) return { afinidade: 0, peso: PESO_BASE }

  let soma = 0
  for (const etiqueta of etiquetas) {
    soma += perfil.pesos.get(etiqueta.chave) || 0
  }

  const afinidade = soma / etiquetas.length
  return { afinidade, peso: Math.max(PESO_MINIMO, PESO_BASE + afinidade) }
}

// Etiquetas que ligam o estabelecimento às curtidas do usuário — é o
// "por que esse lugar?" exibido na tela de match
function etiquetasEmComum(etiquetas, perfil) {
  return etiquetas
    .map((etiqueta) => ({
      etiqueta: etiqueta.original,
      curtidas: perfil.curtidas.get(etiqueta.chave) || 0
    }))
    .filter((item) => item.curtidas > 0)
    .sort((a, b) => b.curtidas - a.curtidas)
    .slice(0, 4)
}

// Embaralhamento ponderado (Efraimidis-Spirakis): a chave de cada item é
// aleatório^(1/peso) e a lista é ordenada pela chave. Assim, um item de peso 4
// aparece antes de um de peso 2 aproximadamente duas vezes mais vezes.
function ordenarPorPeso(itens, sortear) {
  return itens
    .map((item) => ({
      item,
      chave: Math.pow(sortear(), 1 / Math.max(item.peso, PESO_MINIMO))
    }))
    .sort((a, b) => b.chave - a.chave)
    .map((entrada) => entrada.item)
}

// Desempate estável por sorteio: mantém o resultado igual entre requisições,
// mas evita que a ordem final dependa apenas do nome do estabelecimento
function desempatarPorSorteio(itens, sortear) {
  return itens
    .map((item, indice) => ({ item, chave: sortear(), indice }))
    .sort((a, b) => a.chave - b.chave || a.indice - b.indice)
    .map((entrada) => entrada.item)
}

// Card devolvido ao frontend: dados do estabelecimento + peso das etiquetas
function montarCard(estabelecimento, afinidade, peso, extras = {}) {
  return {
    ...estabelecimento,
    afinidade: Number(afinidade.toFixed(3)),
    peso: Number(peso.toFixed(3)),
    ...extras
  }
}

// Fila de cards do swipe: os estabelecimentos que o usuário ainda não arrastou,
// ordenados por sorteio ponderado a partir do peso de suas etiquetas.
function montarFilaSwipe(usuarioId, estabelecimentos) {
  const indiceEtiquetas = indexarEtiquetas(estabelecimentos)
  const perfil = montarPerfilEtiquetas(usuarioId, indiceEtiquetas)
  const jaArrastados = new Set(listarSwipes(usuarioId).map((swipe) => swipe.estabelecimento_id))

  const candidatos = estabelecimentos
    .filter((estabelecimento) => !jaArrastados.has(estabelecimento.id))
    .map((estabelecimento) => {
      const etiquetas = indiceEtiquetas.get(estabelecimento.id) || []
      const { afinidade, peso } = calcularAfinidade(etiquetas, perfil)
      return montarCard(estabelecimento, afinidade, peso)
    })

  // A semente muda a cada swipe: cards que ainda não apareceram ganham nova
  // ordenação conforme o perfil de etiquetas vai sendo descoberto.
  const sorteio = criarSorteio(usuarioId * 1000003 + jaArrastados.size)

  return {
    dados: ordenarPorPeso(candidatos, sorteio),
    perfil: resumirPerfil(perfil, estabelecimentos.length)
  }
}

// Recomendação do botão de match + top 5 pelo mesmo critério de etiquetas.
// O cálculo considera apenas os likes: as etiquetas rejeitadas não contam aqui.
function montarRecomendacao(usuarioId, estabelecimentos, opcoes = {}) {
  const tamanhoTop = opcoes.tamanhoTop || 5
  const indiceEtiquetas = indexarEtiquetas(estabelecimentos)
  const perfil = montarPerfilEtiquetas(usuarioId, indiceEtiquetas)

  const curtidos = new Set(
    banco
      .prepare("SELECT estabelecimento_id FROM swipes WHERE usuario_id = ? AND acao = 'like'")
      .all(usuarioId)
      .map((swipe) => swipe.estabelecimento_id)
  )

  // Prioriza sugestões que o usuário ainda não curtiu; quando não sobram
  // nenhuma, o próprio histórico de curtidas vira a fonte da recomendação.
  const candidatos = estabelecimentos.filter((item) => !curtidos.has(item.id))
  const base = candidatos.length > 0 ? candidatos : estabelecimentos

  if (base.length === 0) {
    return { perfil: resumirPerfil(perfil, 0), recomendacao: null, top: [] }
  }

  const maiorLikes = base.reduce((maior, item) => Math.max(maior, item.likes || 0), 0)

  const pontuados = base.map((estabelecimento) => {
    const etiquetas = indiceEtiquetas.get(estabelecimento.id) || []
    const { afinidade, peso } = calcularAfinidade(etiquetas, perfil)
    const popularidade = maiorLikes > 0 ? (estabelecimento.likes || 0) / maiorLikes : 0
    return montarCard(estabelecimento, afinidade, peso, {
      pontuacao: Number((afinidade + INFLUENCIA_POPULARIDADE * popularidade).toFixed(3)),
      etiquetas_em_comum: etiquetasEmComum(etiquetas, perfil)
    })
  })

  // Ordena por pontuação; o sorteio apenas desempata estabelecimentos com a mesma nota
  const ordenados = desempatarPorSorteio(pontuados, criarSorteio(usuarioId * 104729 + perfil.likes))
    .sort((a, b) => b.pontuacao - a.pontuacao)

  // A recomendação é o melhor da lista e o top 5 reúne os cinco seguintes,
  // de modo que a recomendação nunca aparece repetida no ranking
  const [recomendacao] = ordenados
  const top = ordenados
    .slice(1, tamanhoTop + 1)
    .map((item, indice) => ({ ...item, posicao: indice + 1 }))

  return {
    perfil: resumirPerfil(perfil, estabelecimentos.length),
    recomendacao: recomendacao || null,
    top
  }
}

module.exports = {
  normalizarEtiqueta,
  montarPerfilEtiquetas,
  resumirPerfil,
  montarFilaSwipe,
  montarRecomendacao
}
