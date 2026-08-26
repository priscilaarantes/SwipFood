const validator = require('validator')

// Remove espaços extras e escapa caracteres especiais (proteção XSS)
function sanitizar(texto) {
  return validator.trim(validator.escape(texto || ''))
}

// Funções auxiliares
function apenasDigitos(texto) {
  return String(texto || '').replace(/\D/g, '')
}

function areaKidsValida(valor) {
  return ['sim', 'nao', 'monitor'].includes(valor)
}

function estacionamentoValido(valor) {
  return ['proprio', 'convenio', 'valet', 'nao_possui'].includes(valor)
}

function tipoAssentoValido(valor) {
  return ['cadeira', 'sofa', 'banquetas', 'misto'].includes(valor)
}

// Valida nota numérica entre 0 e 5 (aceita decimais, ex.: 4.5)
function notaValida(valor) {
  const nota = Number(valor)
  return !Number.isNaN(nota) && nota >= 0 && nota <= 5
}

// Converte a nota para número ou null quando vazia/ausente
function normalizarNota(valor) {
  const nota = Number(valor)
  return nota >= 0 && nota <= 5 ? nota : null
}

// Valida uma imagem enviada em base64 (formato data-url) para as avaliações
function validarFotoBase64(campo) {
  const dataUrl = String(campo || '')
  const prefixoRegex = /^data:image\/(jpeg|png|webp|jpg);base64,/
  const casamento = dataUrl.match(prefixoRegex)
  if (!casamento) return { valido: false, mensagem: 'Foto inválida. Use JPEG, PNG ou WEBP.' }
  
  const base64Data = dataUrl.slice(casamento[0].length)
  const tamanhoBytes = Buffer.from(base64Data, 'base64').length
  const limiteBytes = 500 * 1024 // 500 KB
  if (tamanhoBytes > limiteBytes) {
    return { valido: false, mensagem: 'Foto muito grande. O limite é de 500 KB.' }
  }
  return { valido: true, dataUrl }
}

// Valida os dados de cadastro de um novo usuário
function validarCadastro(dados) {
  const erros = []
  const nome = sanitizar(dados.nome)
  const identificador = sanitizar(dados.identificador)
  const senha = String(dados.senha || '')

  if (nome.length < 2 || nome.length > 120) {
    erros.push('Nome deve ter entre 2 e 120 caracteres.')
  }

  // Permite e-mail válido OU CPF/CNPJ (somente dígitos)
  const digitos = apenasDigitos(identificador)
  const ehEmail = validator.isEmail(identificador)
  const ehDocumento = digitos.length === 11 || digitos.length === 14

  if (!ehEmail && !ehDocumento) {
    erros.push('Informe um e-mail válido ou um CPF (11 dígitos) / CNPJ (14 dígitos).')
  }
  if (identificador.length > 190) {
    erros.push('Identificador muito longo.')
  }

  if (senha.length < 6 || senha.length > 72) {
    erros.push('Senha deve ter entre 6 e 72 caracteres.')
  }

  return {
    valido: erros.length === 0,
    erros,
    dados: {
      nome,
      identificador: ehDocumento ? digitos : identificador.toLowerCase(),
      senha
    }
  }
}

// Valida os dados de login
function validarLogin(dados) {
  const erros = []
  const identificador = sanitizar(dados.identificador)
  const senha = String(dados.senha || '')

  const digitos = apenasDigitos(identificador)
  const ehEmail = validator.isEmail(identificador)
  const ehDocumento = digitos.length === 11 || digitos.length === 14

  if ((!ehEmail && !ehDocumento) || !identificador) {
    erros.push('Informe um e-mail ou CPF/CNPJ válido.')
  }
  if (!senha) {
    erros.push('Informe a senha.')
  }

  return {
    valido: erros.length === 0,
    erros,
    dados: {
      identificador: ehDocumento ? digitos : identificador.toLowerCase(),
      senha
    }
  }
}

// Valida e sanitiza o cadastro de um estabelecimento
function validarEstabelecimento(dados) {
  const erros = []
  const campos = {
    nome: sanitizar(dados.nome),
    categoria: sanitizar(dados.categoria),
    descricao: sanitizar(dados.descricao || ''),
    endereco: sanitizar(dados.endereco || ''),
    telefone: sanitizar(dados.telefone || ''),
    link_ifood: sanitizar(dados.link_ifood || ''),
    whatsapp: sanitizar(dados.whatsapp || ''),
    link_maps: sanitizar(dados.link_maps || ''),
    faixa_preco: sanitizar(dados.faixa_preco || ''),
    tipo_assento: dados.tipo_assento || '',
    estacionamento: dados.estacionamento || '',
    area_kids: dados.area_kids || '',
    tags: Array.isArray(dados.tags) ? dados.tags.map(tag => sanitizar(tag)).slice(0, 10) : [],
    imagens: Array.isArray(dados.imagens) ? dados.imagens.map(img => sanitizar(img)).slice(0, 10) : []
  }

  if (campos.nome.length < 2 || campos.nome.length > 120) {
    erros.push('Nome do estabelecimento deve ter entre 2 e 120 caracteres.')
  }
  if (!campos.categoria) {
    erros.push('Informe a categoria do estabelecimento.')
  }
  if (campos.tipo_assento && !tipoAssentoValido(campos.tipo_assento)) {
    erros.push('Tipo de assento inválido (use: cadeira, sofa, banquetas ou misto).')
  }
  if (campos.estacionamento && !estacionamentoValido(campos.estacionamento)) {
    erros.push('Estacionamento inválido (use: proprio, convenio, valet ou nao_possui).')
  }
  if (campos.area_kids && !areaKidsValida(campos.area_kids)) {
    erros.push('Área kids inválida (use: sim, nao ou monitor).')
  }

  const latitude = dados.latitude === undefined ? null : Number(dados.latitude)
  const longitude = dados.longitude === undefined ? null : Number(dados.longitude)
  const precoMin = dados.preco_min === undefined ? null : Number(dados.preco_min)
  const precoMax = dados.preco_max === undefined ? null : Number(dados.preco_max)
  const capacidade = dados.capacidade_pessoas === undefined ? null : Number(dados.capacidade_pessoas)

  if (latitude !== null && Number.isNaN(latitude)) erros.push('Latitude inválida.')
  if (longitude !== null && Number.isNaN(longitude)) erros.push('Longitude inválida.')
  if (precoMin !== null && Number.isNaN(precoMin)) erros.push('Preço mínimo inválido.')
  if (precoMax !== null && Number.isNaN(precoMax)) erros.push('Preço máximo inválido.')

  return {
    valido: erros.length === 0,
    erros,
    dados: {
      ...campos,
      latitude,
      longitude,
      preco_min: precoMin,
      preco_max: precoMax,
      capacidade_pessoas: capacidade,
      estacionamento_vigiado: dados.estacionamento_vigiado ? 1 : 0
    }
  }
}

// Valida uma avaliação: notas 0 a 5, comentário opcional e fotos base64
// RNF usabilidade: o formulário tem no máximo 8 campos obrigatórios.
// Para garantir isso sem bloquear avaliações completas, exigimos apenas as notas
// de ALTA prioridade (6 campos) e deixamos os demais atributos opcionais.
function validarAvaliacao(dados) {
  const erros = []
  const camposDeNota = [
    'limpeza_local',
    'manuseio_alimentos',
    'odor_ambiente',
    'custo_beneficio',
    'limpeza_geral',
    'iluminacao',
    'velocidade_atendimento',
    'cordialidade',
    'seguranca_entorno'
  ]

  // Atributos essenciais (alta prioridade nos requisitos) — devem ser informados
  const camposObrigatorios = [
    'limpeza_local',
    'manuseio_alimentos',
    'custo_beneficio',
    'limpeza_geral',
    'velocidade_atendimento',
    'cordialidade'
  ]

  const notas = {}

  for (const campo of camposDeNota) {
    const valor = dados[campo]
    const preenchido = valor !== undefined && valor !== null && valor !== ''
    if (preenchido) {
      if (!notaValida(valor)) {
        erros.push(`A nota de "${campo}" deve estar entre 0 e 5.`)
      } else {
        notas[campo] = normalizarNota(valor)
      }
    } else {
      notas[campo] = null
    }
  }

  // Verifica se as notas essenciais foram informadas
  for (const campo of camposObrigatorios) {
    if (notas[campo] === null) {
      erros.push(`A nota de "${campo}" é obrigatória.`)
    }
  }

  const comentario = sanitizar(dados.comentario || '')
  if (comentario.length > 1000) {
    erros.push('Comentário deve ter no máximo 1000 caracteres.')
  }

  const fotos = []
  if (Array.isArray(dados.fotos)) {
    for (const foto of dados.fotos.slice(0, 4)) {
      const resultado = validarFotoBase64(foto)
      if (!resultado.valido) {
        erros.push(resultado.mensagem)
      } else {
        fotos.push(resultado.dataUrl)
      }
    }
  }

  return {
    valido: erros.length === 0,
    erros,
    dados: { ...notas, comentario, fotos }
  }
}

// Normaliza os filtros recebidos via query string (combináveis entre si)
function normalizarFiltros(query) {
  const categorias = String(query.categorias || '')
    .split(',')
    .map(item => sanitizar(item))
    .filter(Boolean)

  const estacionamentos = String(query.estacionamento || '')
    .split(',')
    .map(item => sanitizar(item))
    .filter(estacionamentoValido)

  const tags = String(query.tags || '')
    .split(',')
    .map(item => sanitizar(item).toLowerCase())
    .filter(Boolean)

  return {
    busca: sanitizar(query.q || ''),
    categorias,
    estacionamentos,
    tags,
    area_kids: areaKidsValida(query.area_kids) ? query.area_kids : null,
    estacionamento_vigiado: query.estacionamento_vigiado === '1' ? 1 : null,
    preco_min: Number(query.preco_min) >= 0 ? Number(query.preco_min) : null,
    preco_max: Number(query.preco_max) > 0 ? Number(query.preco_max) : null,
    latitude: Number(query.latitude),
    longitude: Number(query.longitude),
    raio_km: Number(query.raio_km) > 0 ? Number(query.raio_km) : null,
    ordenar_por: sanitizar(query.ordenar_por || 'likes')
  }
}

module.exports = {
  sanitizar,
  validarCadastro,
  validarLogin,
  validarEstabelecimento,
  validarAvaliacao,
  normalizarFiltros,
  notaValida,
  normalizarNota
}