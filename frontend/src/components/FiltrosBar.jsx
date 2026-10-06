import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexto/AuthContext'
import { navegarPara } from '../rota/hashRouter'

export default function FiltrosBar({ filtros = {}, aoMudar }) {
  const { usuario, sair } = useAuth()
  const [menuAberto, setMenuAberto] = useState(null)
  const [precoMin, setPrecoMin] = useState(filtros.precoMin ?? '')
  const [precoMax, setPrecoMax] = useState(filtros.precoMax ?? '')
  const [distMin, setDistMin] = useState(filtros.distMin ?? '')
  const [distMax, setDistMax] = useState(filtros.distMax ?? '')

  const toggleMenu = (menu) => setMenuAberto(menuAberto === menu ? null : menu)

  const atualizarFiltros = (novosValores) => {
    if (aoMudar) {
      aoMudar({
        precoMin: novosValores.precoMin !== undefined ? novosValores.precoMin : precoMin,
        precoMax: novosValores.precoMax !== undefined ? novosValores.precoMax : precoMax,
        distMin: novosValores.distMin !== undefined ? novosValores.distMin : distMin,
        distMax: novosValores.distMax !== undefined ? novosValores.distMax : distMax
      })
    }
  }

  return (
    <div className="bg-pessegoHeader w-full shadow-sm relative z-50 py-3">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-azulMarinho">
        
        {/* Lado Esquerdo - Menus */}
        <div className="flex items-center gap-10">
          <a href="#/" className="hover:scale-105 transition-transform shrink-0">
            <img src="/img/logo.png" alt="SwipFood Logo" className="h-10 w-auto object-contain" />
          </a>
          
          {/* Preferências de preço */}
          <div className="relative">
            <button className="font-semibold text-lg hover:text-white transition-colors" onClick={() => toggleMenu('preco')}>
              Preferências de preço
            </button>
            {menuAberto === 'preco' && (
               <div className="absolute top-12 left-0 mt-2 bg-pessegoDropdown border border-pessegoHeader rounded-xl p-5 shadow-xl flex flex-col gap-3 min-w-[320px]">
                  <div className="flex items-center justify-between font-bold text-sm bg-begeInput px-5 py-3 rounded-full text-azulMarinho">
                    <div className="flex items-center gap-1">
                      <span>mín:</span>
                      <input 
                        type="number" 
                        placeholder="0"
                        className="w-16 bg-transparent outline-none text-center" 
                        value={precoMin} 
                        onChange={(e) => {
                          const val = e.target.value
                          setPrecoMin(val)
                          atualizarFiltros({ precoMin: val })
                        }} 
                      />
                      <span>R$</span>
                    </div>
                    <span>-</span>
                    <div className="flex items-center gap-1">
                      <span>máx:</span>
                      <input 
                        type="number" 
                        placeholder="500"
                        className="w-16 bg-transparent outline-none text-center" 
                        value={precoMax} 
                        onChange={(e) => {
                          const val = e.target.value
                          setPrecoMax(val)
                          atualizarFiltros({ precoMax: val })
                        }} 
                      />
                      <span>R$</span>
                    </div>
                  </div>
               </div>
            )}
          </div>
          
          {/* Distância */}
          <div className="relative">
            <button className="font-semibold text-lg hover:text-white transition-colors" onClick={() => toggleMenu('distancia')}>
              Distância
            </button>
            {menuAberto === 'distancia' && (
               <div className="absolute top-12 left-0 mt-2 bg-pessegoDropdown border border-pessegoHeader rounded-xl p-5 shadow-xl flex flex-col gap-3 min-w-[320px]">
                  <div className="flex items-center justify-between font-bold text-sm bg-begeInput px-5 py-3 rounded-full text-azulMarinho">
                    <div className="flex items-center gap-1">
                      <span>mín:</span>
                      <input 
                        type="number" 
                        placeholder="0"
                        className="w-16 bg-transparent outline-none text-center" 
                        value={distMin} 
                        onChange={(e) => {
                          const val = e.target.value
                          setDistMin(val)
                          atualizarFiltros({ distMin: val })
                        }} 
                      />
                      <span>km</span>
                    </div>
                    <span>-</span>
                    <div className="flex items-center gap-1">
                      <span>máx:</span>
                      <input 
                        type="number" 
                        placeholder="50"
                        className="w-16 bg-transparent outline-none text-center" 
                        value={distMax} 
                        onChange={(e) => {
                          const val = e.target.value
                          setDistMax(val)
                          atualizarFiltros({ distMax: val })
                        }} 
                      />
                      <span>km</span>
                    </div>
                  </div>
               </div>
            )}
          </div>
          
          {/* Ofertas */}
          <div className="relative">
            <button className="font-semibold text-lg hover:text-white transition-colors" onClick={() => toggleMenu('ofertas')}>
              ofertas
            </button>
            {menuAberto === 'ofertas' && (
               <div className="absolute top-12 left-0 mt-2 bg-pessegoDropdown border border-pessegoHeader rounded-xl p-4 shadow-xl flex flex-col gap-3 min-w-[320px]">
                  <button className="bg-begeInput font-bold py-3 px-5 text-sm rounded-full text-left w-full hover:bg-white transition-colors">Promoções em restaurantes</button>
                  <button className="bg-begeInput font-bold py-3 px-5 text-sm rounded-full text-left w-full hover:bg-white transition-colors">Promoções de aniversário</button>
                  <button className="bg-begeInput font-bold py-3 px-5 text-sm rounded-full text-left w-full hover:bg-white transition-colors">Promoções em rodízios</button>
                  <button className="bg-begeInput font-bold py-3 px-5 text-sm rounded-full text-left w-full hover:bg-white transition-colors">Promoções para feriados</button>
                  <button className="bg-begeInput font-bold py-3 px-5 text-sm rounded-full text-center w-full mt-2 hover:bg-white transition-colors">faça parte do premium para mais descontos</button>
               </div>
            )}
          </div>

          <button className="font-semibold text-lg hover:text-white transition-colors relative">
            novidades
          </button>
        </div>

        {/* Lado Direito - Notificação e Perfil */}
        <div className="flex items-center gap-4 relative">
          <button className="hover:scale-110 transition-transform text-2xl opacity-80" title="Notificações">
            🔔
          </button>
          
          <button onClick={() => toggleMenu('perfil')} className="bg-begeInput w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-sm hover:scale-105 transition-transform" title={usuario ? usuario.nome : 'Perfil'}>
            👤
          </button>
          
          {menuAberto === 'perfil' && (
             <div className="absolute top-14 right-0 mt-2 bg-pessegoDropdown border border-pessegoHeader rounded-xl p-4 shadow-xl flex flex-col gap-2 min-w-[220px]">
                {usuario && (
                  <div className="px-4 py-2 border-b border-azulMarinho/10 mb-1">
                    <p className="font-bold text-sm text-azulMarinho truncate">{usuario.nome}</p>
                    <p className="text-xs opacity-60 truncate">{usuario.identificador || 'Usuário logado'}</p>
                  </div>
                )}
                <button onClick={() => { setMenuAberto(null); navegarPara('/principal') }} className="bg-begeInput font-bold py-2.5 px-5 text-sm rounded-full text-left hover:bg-white transition-colors">Explorar</button>
                <button onClick={() => { setMenuAberto(null); navegarPara('/swipe') }} className="bg-begeInput font-bold py-2.5 px-5 text-sm rounded-full text-left hover:bg-white transition-colors">Swipe</button>
                <button onClick={() => { setMenuAberto(null); navegarPara('/ranking') }} className="bg-begeInput font-bold py-2.5 px-5 text-sm rounded-full text-left hover:bg-white transition-colors">Ranking</button>
                <button onClick={() => { setMenuAberto(null); sair().then(() => navegarPara('/')) }} className="bg-begeInput font-bold py-2.5 px-5 text-sm rounded-full text-right mt-2 hover:bg-red-50 text-red-600 transition-colors">
                  sair 🚪
                </button>
             </div>
          )}
        </div>

      </div>
    </div>
  )
}
