import React from 'react'
import { AuthProvider } from './contexto/AuthContext'
import { ToastProvider } from './contexto/ToastContext'
import Roteador from './rota/hashRouter'
import Header from './components/Header'
import Footer from './components/Footer'

import Landing from './paginas/Landing'
import Login from './paginas/Login'
import Cadastro from './paginas/Cadastro'
import Principal from './paginas/Principal'
import Swipe from './paginas/Swipe'
import Match from './paginas/Match'
import Ranking from './paginas/Ranking'
import Informacoes from './paginas/Informacoes'

// Tabela de rotas do aplicativo (roteador por hash #/)
const rotas = {
  '/': { componente: Landing },
  '/login': { componente: Login },
  '/cadastro': { componente: Cadastro },
  '/principal': { componente: Principal, requerAutenticacao: true },
  '/swipe': { componente: Swipe, requerAutenticacao: true },
  '/match': { componente: Match, requerAutenticacao: true },
  '/ranking': { componente: Ranking, requerAutenticacao: true },
  '/estabelecimento': { componente: Informacoes }
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="min-h-screen flex flex-col bg-creme">
          <Header />
          <main className="flex-1">
            <Roteador rotas={rotas} />
          </main>
          <Footer />
        </div>
      </ToastProvider>
    </AuthProvider>
  )
}
