import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexto/AuthContext'

// Roteador simples baseado em hash (#/rota) — sem dependências externas.
// O hook retorna a rota atual e uma função para navegar.

export function obterHash() {
  const hash = window.location.hash.replace(/^#/, '') || '/'
  return hash.split('?')[0]
}

export function navegarPara(caminho) {
  window.location.hash = caminho
}

export function useRota() {
  const [rota, setRota] = useState(obterHash())

  useEffect(() => {
    const aoMudar = () => setRota(obterHash())
    window.addEventListener('hashchange', aoMudar)
    return () => window.removeEventListener('hashchange', aoMudar)
  }, [])

  return rota
}

// Converte "estabelecimento/5" em { nome: 'estabelecimento', parametros: ['5'] }
export function parsearRota(rota) {
  const partes = rota.split('/').filter(Boolean)
  return {
    nome: partes[0] || '/',
    parametros: partes.slice(1)
  }
}

// Renderiza a página conforme a rota atual.
// Rotas autenticadas redirecionam para o login quando o usuário não está logado.
export default function Roteador({ rotas }) {
  const rotaAtual = useRota()
  const { usuario, carregando } = useAuth()
  const { nome, parametros } = parsearRota(rotaAtual)

  const pagina = rotas[nome]
  if (!pagina) {
    return <RotasPublicas rotas={rotas} />
  }

  if (pagina.requerAutenticacao && carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-creme">
        <p className="text-escuro font-bold animate-pulse">Carregando…</p>
      </div>
    )
  }

  if (pagina.requerAutenticacao && !usuario) {
    navegarPara('/login')
    return null
  }

  const Componente = pagina.componente
  return <Componente parametros={parametros} />
}

// Página não encontrada: tenta renderizar a landing como fallback
function RotasPublicas({ rotas }) {
  const landing = rotas['/']
  if (!landing) return <p>Página não encontrada.</p>
  const Componente = landing.componente
  return <Componente parametros={[]} />
}
