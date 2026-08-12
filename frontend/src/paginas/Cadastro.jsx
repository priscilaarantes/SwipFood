import React, { useState } from 'react'
import { useAuth } from '../contexto/AuthContext'
import { ErroApi } from '../utilitarios/api'
import { navegarPara } from '../rota/hashRouter'

// Tela de cadastro de novo usuário
export default function Cadastro() {
  const { cadastrar } = useAuth()
  const [nome, setNome] = useState('')
  const [identificador, setIdentificador] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  const aoEnviar = async (evento) => {
    evento.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      await cadastrar(nome, identificador, senha)
      navegarPara('/principal')
    } catch (e) {
      if (e instanceof ErroApi && e.erros && e.erros.length > 0) {
        setErro(e.erros.join(' '))
      } else {
        setErro(e instanceof ErroApi ? e.message : 'Não foi possível conectar ao servidor.')
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/30">
        <img src="/img/logo.png" alt="Logo SwipFood" className="w-20 h-20 object-cover rounded-2xl mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-escuro text-center mb-6">Criar conta</h2>

        {erro && (
          <div className="bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 py-2 rounded-lg mb-4">
            {erro}
          </div>
        )}

        <form onSubmit={aoEnviar} className="space-y-4">
          <div>
            <label className="block font-bold text-escuro mb-1">Nome completo</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/90 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
          <div>
            <label className="block font-bold text-escuro mb-1">E-mail ou CPF/CNPJ</label>
            <input
              type="text"
              value={identificador}
              onChange={(e) => setIdentificador(e.target.value)}
              placeholder="seuemail@exemplo.com ou CPF/CNPJ"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/90 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
          <div>
            <label className="block font-bold text-escuro mb-1">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Mínimo de 6 caracteres"
              minLength={6}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/90 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
          <button
            type="submit"
            disabled={enviando}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-full transition-colors disabled:opacity-50"
          >
            {enviando ? 'Criando conta…' : 'Cadastrar'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-600">
          Já tem conta?{' '}
          <a href="#/login" className="font-bold text-escuro hover:underline">
            Entrar
          </a>
        </p>

        <a href="#/" className="block mt-4 text-center text-escuro text-sm hover:underline">
          ← Voltar ao início
        </a>
      </div>
    </div>
  )
}
