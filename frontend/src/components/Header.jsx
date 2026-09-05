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

  const naPaginaSwipe = rotaAtual === '#/swipe'
  const naLanding = rotaAtual === '' || rotaAtual === '#/'
  const paginaSemSwipe = naPaginaSwipe || rotaAtual === '#/login' || rotaAtual === '#/cadastro'
  const paginaDeFundo = rotaAtual === '#/login' || rotaAtual === '#/cadastro'

  const links = naPaginaSwipe
    ? [{ rotulo: 'Home', destino: '/principal' }]
    : paginaSemSwipe
      ? [{ rotulo: 'Home', destino: '/' }]
      : [
          { rotulo: 'Home', destino: '/' },
          { rotulo: 'Swipe', destino: '/swipe' }
        ]

  const mostrarLinks = rotaAtual !== '' && rotaAtual !== '#/'

  return (
    <header className={`${
      naLanding
        ? 'bg-white/80 backdrop-blur-xl border-b border-white/40'
        : paginaDeFundo
          ? 'bg-white/30 backdrop-blur-sm'
          : 'bg-cremeClaro/80 backdrop-blur-xl border-b border-white/40'
    } text-azulMarinho shadow-sm sticky top-0 z-40`}>
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3 relative">
        <a href="#/" className="flex items-center gap-2">
          <img src="/img/logo.png" alt="SwipFood" className="h-22 w-20" />
        </a>

        {mostrarLinks && (
        <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-6 flex-wrap">
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
        )}

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
