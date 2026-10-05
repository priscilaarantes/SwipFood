import React, { useState } from 'react'

export default function FiltrosBar({ filtros, aoMudar }) {
  const [menuAberto, setMenuAberto] = useState(null)
  const [precoMax, setPrecoMax] = useState(500)
  const [distanciaMax, setDistanciaMax] = useState(50)

  const toggleMenu = (menu) => setMenuAberto(menuAberto === menu ? null : menu)

  return (
    <div className="bg-pessegoHeader w-full shadow-sm relative z-50 py-3">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-azulMarinho">
        
        {/* Lado Esquerdo - Menus */}
        <div className="flex items-center gap-10">
          {/* Preferências de preço */}
          <div className="relative">
            <button className="font-semibold text-lg hover:text-white transition-colors" onClick={() => toggleMenu('preco')}>
              Preferências de preço
            </button>
            {menuAberto === 'preco' && (
               <div className="absolute top-12 left-0 mt-2 bg-pessegoDropdown border border-pessegoHeader rounded-xl p-5 shadow-xl flex flex-col gap-3 min-w-[320px]">
                  <div className="flex justify-between font-bold text-sm bg-begeInput px-5 py-3 rounded-full text-azulMarinho">
                    <span>mínimo: 15R$</span>
                    <span>-</span>
                    <span>máximo: {precoMax}R$</span>
                  </div>
                  <input 
                    type="range" 
                    min="15" 
                    max="1000" 
                    step="5"
                    value={precoMax}
                    onChange={(e) => setPrecoMax(e.target.value)}
                    className="w-full mt-4 accent-azulMarinho" 
                  />
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
                  <div className="flex justify-between font-bold text-sm bg-begeInput px-5 py-3 rounded-full text-azulMarinho">
                    <span>mínimo: 2km</span>
                    <span>-</span>
                    <span>máximo: {distanciaMax}km</span>
                  </div>
                  <input 
                    type="range" 
                    min="2" 
                    max="100"
                    step="1"
                    value={distanciaMax}
                    onChange={(e) => setDistanciaMax(e.target.value)}
                    className="w-full mt-4 accent-azulMarinho" 
                  />
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
          <button className="hover:scale-110 transition-transform text-2xl opacity-80">
            🔔
          </button>
          
          <button onClick={() => toggleMenu('perfil')} className="bg-begeInput w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-sm hover:scale-105 transition-transform">
            👤
          </button>
          
          {menuAberto === 'perfil' && (
             <div className="absolute top-14 right-0 mt-2 bg-pessegoDropdown border border-pessegoHeader rounded-xl p-4 shadow-xl flex flex-col gap-2 min-w-[200px]">
                <button className="bg-begeInput font-bold py-2.5 px-5 text-sm rounded-full text-left hover:bg-white transition-colors">ver perfil</button>
                <button className="bg-begeInput font-bold py-2.5 px-5 text-sm rounded-full text-left hover:bg-white transition-colors">configurações</button>
                <button className="bg-begeInput font-bold py-2.5 px-5 text-sm rounded-full text-left hover:bg-white transition-colors">conta</button>
                <button className="bg-begeInput font-bold py-2.5 px-5 text-sm rounded-full text-left hover:bg-white transition-colors">salvos</button>
                <button className="bg-begeInput font-bold py-2.5 px-5 text-sm rounded-full text-left hover:bg-white transition-colors">avaliações</button>
                <button className="bg-begeInput font-bold py-2.5 px-5 text-sm rounded-full text-right mt-2 hover:bg-white transition-colors">sair 🚪</button>
             </div>
          )}
        </div>

      </div>
    </div>
  )
}
