import React from 'react'
import { useAuth } from '../contexto/AuthContext'
import { navegarPara } from '../rota/hashRouter'

// Cabeçalho fixo com a marca SwipFood, menu de navegação e ações de sessão
export default function Header() {
  const { usuario, sair } = useAuth()

  const links = [
    { rotulo: 'Home', destino: '/' },
    { rotulo: 'Restaurantes', destino: '/principal' },
    { rotulo: 'Swipe', destino: '/swipe' },
    { rotulo: 'Ranking', destino: '/ranking' }
  ]

  return (
    <header className="bg-escuro text-creme shadow-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <a href="#/" className="flex items-center gap-3">
          <img src="/img/logo.png" alt="Logo SwipFood" className="w-10 h-10 object-cover rounded-xl" />
          <span className="text-xl font-bold text-white">SwipFood</span>
        </a>

        <nav className="flex items-center gap-5 flex-wrap">
          {links.map((link) => (
            <a
              key={link.rotulo}
              href={`#${link.destino}`}
              className="font-semibold text-sm hover:text-white transition-colors"
            >
              {link.rotulo}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {usuario ? (
            <>
              <span className="text-sm font-semibold hidden sm:inline">Olá, {usuario.nome.split(' ')[0]}</span>
              <button
                onClick={() => sair().then(() => navegarPara('/'))}
                className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-4 py-1.5 rounded-full transition-colors"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <a href="#/login" className="bg-creme hover:bg-white text-escuro text-sm font-bold px-4 py-1.5 rounded-full transition-colors">
                Login
              </a>
              <a href="#/cadastro" className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-4 py-1.5 rounded-full transition-colors">
                Criar conta
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
