import React, { createContext, useContext, useEffect, useState } from 'react'
import { api, obterToken, guardarToken, limparToken } from '../utilitarios/api'

const AuthContext = createContext(null)

// Contexto que gerencia a sessão do usuário (token + dados) em toda a aplicação
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)

  // Ao iniciar, tenta validar o token salvo no localStorage
  useEffect(() => {
    const validarSessao = async () => {
      if (!obterToken()) {
        setCarregando(false)
        return
      }
      try {
        const dados = await api.get('/auth/me', true)
        setUsuario(dados.usuario)
      } catch {
        limparToken()
        setUsuario(null)
      } finally {
        setCarregando(false)
      }
    }
    validarSessao()
  }, [])

  const entrar = async (identificador, senha) => {
    const dados = await api.post('/auth/login', { identificador, senha }, false)
    guardarToken(dados.token)
    setUsuario(dados.usuario)
    return dados
  }

  const cadastrar = async (nome, identificador, senha) => {
    const dados = await api.post('/auth/cadastro', { nome, identificador, senha }, false)
    guardarToken(dados.token)
    setUsuario(dados.usuario)
    return dados
  }

  const sair = async () => {
    try {
      await api.post('/auth/logout', {}, true)
    } catch {
      // mesmo com erro o token local é limpo
    }
    limparToken()
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, entrar, cadastrar, sair }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook para consumir o contexto de autenticação
export function useAuth() {
  return useContext(AuthContext)
}
