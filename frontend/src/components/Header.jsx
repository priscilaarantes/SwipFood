import React from 'react'
import { useAuth } from '../contexto/AuthContext'
import { navegarPara } from '../rota/hashRouter'

// Cabeçalho fixo com a marca SwipFood, menu de navegação e ações de sessão
export default function Header() {
  const { usuario, sair } = useAuth()
  const [rotaAtual, setRotaAtual] = React.useState(window.location.hash)

  React.useEffect(() => {
    const atualizarRota = () => setRotaAtual(window.location.hash)
    window.addEventListener('hashchange', atualizarRota)
    return () => window.removeEventListener('hashchange', atualizarRota)
  }, [])

  if (rotaAtual === '#/principal') return null

  const links = [
    { rotulo: 'Home', destino: '/' },
    { rotulo: 'Swipe', destino: '/swipe' },
    { rotulo: 'Ranking', destino: '/ranking' }
  ]

  return (
    <header className="bg-cremeClaro/80 backdrop-blur-xl text-azulMarinho shadow-sm sticky top-0 z-40 border-b border-white/40">
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
        <a href="#/" className="flex items-center gap-2">
          <span className="text-3xl font-extrabold text-vermelho tracking-tighter" style={{ fontFamily: 'Poppins, sans-serif' }}>Swip<span className="text-azulMarinho">Food</span></span>
        </a>

        <nav className="flex items-center gap-6 flex-wrap">
          {links.map((link) => (
            <a
              key={link.rotulo}
              href={`#${link.destino}`}
              className="font-medium text-azulMarinho/70 hover:text-vermelho transition-colors text-sm"
            >
              {link.rotulo}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {usuario ? (
            <>
              <span className="text-sm font-semibold hidden sm:inline text-azulMarinho">Olá, {usuario.nome.split(' ')[0]}</span>
              <button
                onClick={() => sair().then(() => navegarPara('/'))}
                className="bg-white hover:bg-red-50 text-red-500 text-sm font-bold px-5 py-2 rounded-full transition-colors shadow-sm"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <a href="#/login" className="text-azulMarinho font-semibold text-sm px-3 hover:text-vermelho transition-colors">
                Login
              </a>
              <a href="#/cadastro" className="btn-primary py-2 px-5 text-sm shadow-sm hover:shadow">
                Criar conta
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
