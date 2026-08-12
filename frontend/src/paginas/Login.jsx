import React, { useState } from 'react'
import { useAuth } from '../contexto/AuthContext'
import { ErroApi } from '../utilitarios/api'
import { navegarPara } from '../rota/hashRouter'

// Tela de login com e-mail/CPF/CNPJ + senha
export default function Login() {
  const { entrar } = useAuth()
  const [identificador, setIdentificador] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  const aoEnviar = async (evento) => {
    evento.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      await entrar(identificador, senha)
      navegarPara('/principal')
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : 'Não foi possível conectar ao servidor.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/30">
        <img src="/img/logo.png" alt="Logo SwipFood" className="w-20 h-20 object-cover rounded-2xl mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-escuro text-center mb-6">Entrar</h2>

        {erro && (
          <div className="bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 py-2 rounded-lg mb-4">
            {erro}
          </div>
        )}

        <form onSubmit={aoEnviar} className="space-y-4">
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
              placeholder="Sua senha"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/90 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
          <button
            type="submit"
            disabled={enviando}
            className="w-full bg-escuro hover:bg-gray-800 text-white font-bold py-3 rounded-full transition-colors disabled:opacity-50"
          >
            {enviando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5 text-gray-500 text-sm">
          <span className="flex-1 h-px bg-gray-300" />
          ou
          <span className="flex-1 h-px bg-gray-300" />
        </div>

        <a
          href="#/cadastro"
          className="block w-full text-center border-2 border-escuro text-escuro font-bold py-3 rounded-full hover:bg-escuro hover:text-white transition-colors"
        >
          Criar conta
        </a>

        <a href="#/" className="block mt-5 text-center text-escuro text-sm hover:underline">
          ← Voltar ao início
        </a>
      </div>
    </div>
  )
}
