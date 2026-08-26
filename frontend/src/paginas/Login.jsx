import React, { useState } from 'react'
import { useAuth } from '../contexto/AuthContext'
import { ErroApi } from '../utilitarios/api'
import { navegarPara } from '../rota/hashRouter'

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
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        backgroundImage: "url('/img/login_bg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="bg-black/20 backdrop-blur-3xl rounded-[3rem] shadow-2xl p-10 md:p-14 w-full max-w-md border border-white/10 flex flex-col items-center">
        
        <div className="mb-10 text-center">
          <h2 className="text-xl font-bold bg-begeInput px-8 py-2 rounded-full text-azulMarinho inline-block shadow-sm">
            Sign In
          </h2>
        </div>

        {erro && (
          <div className="bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 py-3 rounded-xl mb-6 shadow-sm w-full text-center">
            {erro}
          </div>
        )}

        <form onSubmit={aoEnviar} className="space-y-6 w-full flex flex-col items-center">
          <div className="w-full">
            <input
              type="text"
              value={identificador}
              onChange={(e) => setIdentificador(e.target.value)}
              placeholder="CPF/CNPJ ou E-mail"
              required
              className="input-login text-center"
            />
          </div>
          <div className="w-full">
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Senha"
              required
              className="input-login text-center"
            />
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={enviando}
              className="btn-login w-36"
            >
              {enviando ? '...' : 'Entrar'}
            </button>
          </div>
        </form>

        <div className="flex items-center gap-4 my-8 w-full max-w-[200px] text-white/50 text-sm font-medium">
          <span className="flex-1 h-[1px] bg-white/20" />
          ou
          <span className="flex-1 h-[1px] bg-white/20" />
        </div>

        <a
          href="#/cadastro"
          className="btn-login w-40 text-center"
        >
          Criar conta
        </a>
      </div>
    </div>
  )
}
