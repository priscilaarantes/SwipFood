// Helpers de acesso à API RESTful do SwipFood.
// Em desenvolvimento o Vite redireciona /api para a porta 3000 (proxy).

const BASE = '/api'

// Token de sessão armazenado no localStorage do navegador
export function obterToken() {
  return localStorage.getItem('swipfood_token') || ''
}

export function guardarToken(token) {
  localStorage.setItem('swipfood_token', token)
}

export function limparToken() {
  localStorage.removeItem('swipfood_token')
}

// Executa uma requisição para a API e trata erros de rede/HTTP
async function requisicao(metodo, caminho, corpo, autenticado = true) {
  const cabecalhos = { 'Content-Type': 'application/json' }
  if (autenticado) {
    const token = obterToken()
    if (token) cabecalhos.Authorization = `Bearer ${token}`
  }

  const opcoes = { method: metodo, headers: cabecalhos }
  if (corpo !== undefined) opcoes.body = JSON.stringify(corpo)

  const resposta = await fetch(`${BASE}${caminho}`, opcoes)
  let dados = null
  try {
    dados = await resposta.json()
  } catch {
    dados = { sucesso: false, mensagem: 'Resposta inválida do servidor.' }
  }

  // Token inválido/expirado: encerra a sessão local
  if (resposta.status === 401 && autenticado) {
    limparToken()
  }

  if (!resposta.ok) {
    throw new ErroApi(dados.mensagem || 'Erro na requisição.', resposta.status, dados.erros)
  }

  return dados
}

// Erro de API com status e lista de erros de validação
export class ErroApi extends Error {
  constructor(mensagem, status, erros) {
    super(mensagem)
    this.status = status
    this.erros = erros || []
  }
}

export const api = {
  get: (caminho, autenticado = false) => requisicao('GET', caminho, undefined, autenticado),
  post: (caminho, corpo, autenticado = true) => requisicao('POST', caminho, corpo, autenticado),
  delete: (caminho, autenticado = true) => requisicao('DELETE', caminho, undefined, autenticado)
}
