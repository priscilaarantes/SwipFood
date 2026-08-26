import React, { useState } from 'react'
import FiltrosBar from '../components/FiltrosBar'
import { navegarPara } from '../rota/hashRouter'

export default function Principal() {
  const [filtros, setFiltros] = useState({})

  const categorias = [
    { nome: 'Café', imagem: '/img/icone_cafe.jpg' },
    { nome: 'Padaria', imagem: '/img/food1.jpg' },
    { nome: 'Doceria', imagem: '/img/food2.jpg' },
    { nome: 'Japonesa', imagem: '/img/icone_sushi.jpg' },
    { nome: 'Fast-food', imagem: '/img/icone_hamburguer.jpg' },
    { nome: 'Saudável', imagem: '/img/food1.jpg' },
    { nome: 'Italiana', imagem: '/img/food2.jpg' },
    { nome: 'Churrascaria', imagem: '/img/food1.jpg' },
    { nome: 'Pizzaria', imagem: '/img/food2.jpg' },
  ]

  return (
    <div className="bg-begeGlobal min-h-screen">
      {/* Barra de Filtros Peach (Header) */}
      <FiltrosBar filtros={filtros} aoMudar={setFiltros} />

      <div className="max-w-7xl mx-auto px-6 py-6 text-azulMarinho">
        <div className="text-sm font-semibold opacity-70 mb-8 flex items-center gap-1">
          Barra do Garças, MT 📍
        </div>

        <div className="flex flex-col md:flex-row gap-12 justify-between">
          
          {/* Lado Esquerdo - Categorias */}
          <div className="w-full md:w-5/12">
            <h1 className="text-4xl font-black mb-8 leading-tight">
              Visite as melhores lojas e<br/>estabelecimentos<br/>na sua região com um deslize
            </h1>
            <h2 className="text-xl font-extrabold mb-6">Categorias:</h2>
            
            <div className="grid grid-cols-3 gap-6">
              {categorias.map(cat => (
                <div key={cat.nome} className="flex flex-col items-center gap-2 cursor-pointer hover:scale-105 transition-transform">
                  <div className="bg-amareloCategoria w-28 h-20 rounded-3xl flex items-center justify-center overflow-hidden shadow-sm">
                    <img src={cat.imagem} alt={cat.nome} className="w-16 h-16 object-cover rounded-xl mix-blend-multiply" />
                  </div>
                  <span className="text-sm font-semibold opacity-75">{cat.nome}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lado Direito - Explorar */}
          <div className="w-full md:w-6/12 flex flex-col items-center relative">
            <div className="w-full max-w-md relative mb-10">
              <input 
                type="text" 
                placeholder="procure por suas preferências" 
                className="w-full bg-begeInput px-6 py-4 rounded-full focus:outline-none focus:ring-2 focus:ring-pessegoHeader shadow-inner font-medium placeholder:text-gray-400"
              />
              <span className="absolute right-6 top-4 opacity-50">🔍</span>
            </div>

            <h2 className="text-6xl font-black text-azulMarinho mb-16 self-center ml-20">Explorar</h2>

            {/* Stack de Polaroids */}
            <div className="relative w-[500px] h-[400px] cursor-pointer group" onClick={() => navegarPara('/swipe')}>
              <div className="absolute top-10 right-0 w-[300px] h-[400px] bg-begeInput rounded-xl p-3 shadow-2xl rotate-[15deg] group-hover:rotate-[20deg] transition-transform">
                <img src="/img/food1.jpg" className="w-full h-4/5 object-cover rounded-lg" />
              </div>
              <div className="absolute top-5 left-10 w-[320px] h-[420px] bg-begeInput rounded-xl p-3 shadow-2xl rotate-[-5deg] group-hover:rotate-[-8deg] transition-transform z-10">
                <img src="/img/polaroid_food.jpg" className="w-full h-4/5 object-cover rounded-lg" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
