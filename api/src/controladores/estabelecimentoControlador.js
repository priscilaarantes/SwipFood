const banco = require('../config/conexaoBanco')
const { validarEstabelecimento, normalizarFiltros } = require('../utilitarios/validadores')

// Expressão SQL que calcula as médias das avaliações de cada estabelecimento
const SQL_MEDIAS = `
  (SELECT COUNT(*) FROM avaliacoes av WHERE av.estabelecimento_id = e.id) AS total_avaliacoes,
  (SELECT ROUND(AVG(av.limpeza_local), 1) FROM avaliacoes av WHERE av.estabelecimento_id = e.id) AS media_limpeza,
  (SELECT ROUND(AVG(av.manuseio_alimentos), 1) FROM avaliacoes av WHERE av.estabelecimento_id = e.id) AS media_manuseio,
  (SELECT ROUND(AVG(av.custo_beneficio), 1) FROM avaliacoes av WHERE av.estabelecimento_id = e.id) AS media_custo,
  (SELECT ROUND(AVG(av.velocidade_atendimento), 1) FROM avaliacoes av WHERE av.estabelecimento_id = e.id) AS media_atendimento,
  (SELECT ROUND(AVG(
      (COALESCE(av.limpeza_local,0) + COALESCE(av.manuseio_alimentos,0) +
       COALESCE(av.odor_ambiente,0) + COALESCE(av.custo_beneficio,0) +
       COALESCE(av.limpeza_geral,0) + COALESCE(av.iluminacao,0) +
       COALESCE(av.velocidade_atendimento,0) + COALESCE(av.cordialidade,0) +
       COALESCE(av.seguranca_entorno,0)) / 9.0
    ), 2) FROM avaliacoes av WHERE av.estabelecimento_id = e.id) AS media_geral
`

// Converte os campos JSON do banco e organiza a resposta
function mapearEstabelecimento(linha) {
  if (!linha) return null
  const { tags, imagens, ...resto } = linha

  let tagsLista = []
  let imagensLista = []
  try { tagsLista = JSON.parse(tags || '[]') } catch { tagsLista = [] }
  try { imagensLista = JSON.parse(imagens || '[]') } catch { imagensLista = [] }

  return {
    ...resto,
    tags: tagsLista,
    imagens: imagensLista,
    media_geral: Number(resto.media_geral) || null,
    media_limpeza: resto.media_limpeza !== null ? Number(resto.media_limpeza) : null,
    media_manuseio: resto.media_manuseio !== null ? Number(resto.media_manuseio) : null,
    media_custo: resto.media_custo !== null ? Number(resto.media_custo) : null,
    media_atendimento: resto.media_atendimento !== null ? Number(resto.media_atendimento) : null
  }
}

// Distância aproximada entre duas coordenadas (fórmula de Haversine em km)
function calcularDistanciaKm(lat1, lon1, lat2, lon2) {
  const raioTerra = 6371
  const paraRadiano = (graus) => (graus * Math.PI) / 180
  const dLat = paraRadiano(lat2 - lat1)
  const dLon = paraRadiano(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(paraRadiano(lat1)) * Math.cos(paraRadiano(lat2)) * Math.sin(dLon / 2) ** 2
  return raioTerra * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Lista estabelecimentos com filtros combináveis (categoria, preço, estacionamento, área kids, tags, busca e distância)
function listar(req, res) {
  const filtros = normalizarFiltros(req.query)
  const condicoes = []
  const parametros = []

  if (filtros.busca) {
    condicoes.push('(e.nome LIKE ? OR e.descricao LIKE ? OR e.endereco LIKE ?)')
    const termo = `%${filtros.busca}%`
    parametros.push(termo, termo, termo)
  }
  if (filtros.categorias.length > 0) {
    const marcadores = filtros.categorias.map(() => '?').join(',')
    condicoes.push(`e.categoria IN (${marcadores})`)
    parametros.push(...filtros.categorias)
  }
  if (filtros.preco_min !== null) {
    condicoes.push('(e.preco_max IS NULL OR e.preco_max >= ?)')
    parametros.push(filtros.preco_min)
  }
  if (filtros.preco_max !== null) {
    condicoes.push('(e.preco_min IS NULL OR e.preco_min <= ?)')
    parametros.push(filtros.preco_max)
  }
  if (filtros.estacionamentos.length > 0) {
    const marcadores = filtros.estacionamentos.map(() => '?').join(',')
    condicoes.push(`e.estacionamento IN (${marcadores})`)
    parametros.push(...filtros.estacionamentos)
  }
  if (filtros.estacionamento_vigiado === 1) {
    condicoes.push('e.estacionamento_vigiado = 1')
  }
  if (filtros.area_kids) {
    condicoes.push('e.area_kids = ?')
    parametros.push(filtros.area_kids)
  }
  if (filtros.tags.length > 0) {
    // Filtra por tags armazenadas em JSON (procura o termo no texto do campo)
    filtros.tags.forEach((tag) => {
      condicoes.push('LOWER(e.tags) LIKE ?')
      parametros.push(`%${tag.toLowerCase()}%`)
    })
  }

  const onde = condicoes.length > 0 ? ` WHERE ${condicoes.join(' AND ')}` : ''

  let ordenacao = 'e.likes DESC, e.nome ASC'
  if (filtros.ordenar_por === 'nome') ordenacao = 'e.nome ASC'
  // SQLite não suporta "NULLS LAST"; sem avaliações a média é NULL e fica no fim
  if (filtros.ordenar_por === 'media') ordenacao = 'media_geral IS NULL ASC, media_geral DESC, e.nome ASC'

  const registros = banco
    .prepare(`SELECT e.*, ${SQL_MEDIAS} FROM estabelecimentos e${onde} ORDER BY ${ordenacao}`)
    .all(...parametros)

  // Filtro por distância (Haversine) aplicado em memória após a consulta
  const temCoordenadas = filtros.latitude && filtros.longitude
  let estabelecimentos = registros.map(mapearEstabelecimento)

  if (temCoordenadas && filtros.raio_km) {
    estabelecimentos = estabelecimentos.filter((item) => {
      if (item.latitude == null || item.longitude == null) return false
      return (
        calcularDistanciaKm(filtros.latitude, filtros.longitude, item.latitude, item.longitude) <=
        filtros.raio_km
      )
    })
  }

  res.json({ sucesso: true, dados: estabelecimentos, total: estabelecimentos.length })
}

// Retorna os estabelecimentos em destaque (mais curtidos)
function destaques(req, res) {
  const registros = banco
    .prepare(`SELECT e.*, ${SQL_MEDIAS} FROM estabelecimentos e ORDER BY e.likes DESC LIMIT 8`)
    .all()
  res.json({ sucesso: true, dados: registros.map(mapearEstabelecimento) })
}

// Retorna o detalhe de um estabelecimento com as médias das avaliações
function detalhe(req, res) {
  const id = Number(req.params.id)
  const registro = banco
    .prepare(`SELECT e.*, ${SQL_MEDIAS} FROM estabelecimentos e WHERE e.id = ?`)
    .get(id)

  if (!registro) {
    return res.status(404).json({ sucesso: false, mensagem: 'Estabelecimento não encontrado.' })
  }

  const estabelecimento = mapearEstabelecimento(registro)

  // Busca a avaliação do próprio usuário (se autenticado) para preencher o formulário
  let minhaAvaliacao = null
  if (req.usuario) {
    minhaAvaliacao = banco
      .prepare('SELECT * FROM avaliacoes WHERE estabelecimento_id = ? AND usuario_id = ?')
      .get(id, req.usuario.id)
    if (minhaAvaliacao) minhaAvaliacao = mapearAvaliacao(minhaAvaliacao)
  }

  res.json({ sucesso: true, dados: estabelecimento, minha_avaliacao: minhaAvaliacao })
}

// Cadastra um novo estabelecimento (exige autenticação)
function criar(req, res) {
  const { valido, erros, dados } = validarEstabelecimento(req.body)
  if (!valido) return res.status(422).json({ sucesso: false, mensagem: 'Dados inválidos.', erros })

  const inserir = banco.prepare(`
    INSERT INTO estabelecimentos (
      nome, categoria, descricao, endereco, latitude, longitude,
      faixa_preco, preco_min, preco_max, capacidade_pessoas, tipo_assento,
      estacionamento, estacionamento_vigiado, area_kids, tags, imagens,
      telefone, link_ifood, whatsapp, link_maps
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const resultado = inserir.run(
    dados.nome, dados.categoria, dados.descricao, dados.endereco, dados.latitude, dados.longitude,
    dados.faixa_preco, dados.preco_min, dados.preco_max, dados.capacidade_pessoas, dados.tipo_assento,
    dados.estacionamento, dados.estacionamento_vigiado, dados.area_kids,
    JSON.stringify(dados.tags), JSON.stringify(dados.imagens),
    dados.telefone, dados.link_ifood, dados.whatsapp, dados.link_maps
  )

  res.status(201).json({ sucesso: true, mensagem: 'Estabelecimento cadastrado!', id: resultado.lastInsertRowid })
}

// Converte uma avaliação do banco (campos JSON) para resposta
function mapearAvaliacao(linha) {
  if (!linha) return null
  let fotos = []
  try { fotos = JSON.parse(linha.fotos || '[]') } catch { fotos = [] }
  return { ...linha, fotos }
}

module.exports = { listar, destaques, detalhe, criar, mapearAvaliacao, calcularDistanciaKm }