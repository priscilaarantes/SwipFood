import React, { useState } from 'react'
import FiltrosBar from '../components/FiltrosBar'
import { navegarPara } from '../rota/hashRouter'

export default function Principal() {
  const [filtros, setFiltros] = useState({})
  const [termoBusca, setTermoBusca] = useState('')

  const categorias = [
    { id: 'cafe', nome: 'Café', imagem: '/img/restaurantes/rest1.jpg' },
    { id: 'padaria', nome: 'Padaria', imagem: '/img/restaurantes/rest2.jpg' },
    { id: 'doceria', nome: 'Doceria', imagem: '/img/restaurantes/rest3.jpg' },
    { id: 'japonesa', nome: 'Japonesa', imagem: '/img/restaurantes/rest4.jpg' },
    { id: 'fastfood', nome: 'Fast-food', imagem: '/img/restaurantes/rest5.jpg' },
    { id: 'saudavel', nome: 'Saudável', imagem: '/img/restaurantes/rest6.jpg' },
    { id: 'italiana', nome: 'Italiana', imagem: '/img/restaurantes/rest7.jpg' },
    { id: 'churrascaria', nome: 'Churrascaria', imagem: '/img/restaurantes/rest8.jpg' },
    { id: 'pizzaria', nome: 'Pizzaria', imagem: '/img/restaurantes/rest9.jpg' },
  ]

  const realizarBusca = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (termoBusca.trim()) {
        navegarPara(`/categoria/busca?q=${encodeURIComponent(termoBusca.trim())}`)
      }
    }
  }

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
                <div key={cat.id} onClick={() => navegarPara(`/categoria/${cat.id}`)} className="flex flex-col items-center gap-2 cursor-pointer hover:scale-105 transition-transform group">
                  <div className="bg-amareloCategoria w-28 h-20 rounded-3xl flex items-center justify-center overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                    <img src={cat.imagem} alt={cat.nome} className="w-16 h-16 object-cover rounded-xl mix-blend-multiply group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-sm font-bold opacity-75 group-hover:opacity-100 group-hover:text-vermelho transition-colors">{cat.nome}</span>
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
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                onKeyDown={realizarBusca}
                className="w-full bg-begeInput px-6 py-4 rounded-full focus:outline-none focus:ring-2 focus:ring-pessegoHeader shadow-inner font-medium placeholder:text-gray-400 pr-12"
              />
              <button 
                onClick={realizarBusca} 
                className="absolute right-4 top-3.5 opacity-60 hover:opacity-100 text-lg transition-opacity p-1"
                title="Buscar"
              >
                🔍
              </button>
            </div>

            <h2 className="text-6xl font-black text-azulMarinho mb-16 self-center ml-20">Explorar</h2>

            {/* Stack de Polaroids */}
            <div className="relative w-[500px] h-[400px] cursor-pointer group" onClick={() => navegarPara('/swipe')} title="Ir para o Swipe!">
              <div className="absolute top-10 right-0 w-[300px] h-[400px] bg-begeInput rounded-xl p-3 shadow-2xl rotate-[15deg] group-hover:rotate-[20deg] transition-transform">
                <img src="/img/restaurantes/rest10.jpg" className="w-full h-4/5 object-cover rounded-lg" alt="Polaroid 1" />
                <p className="text-center font-bold text-azulMarinho mt-3 text-sm">Arraste para curtir ❤️</p>
              </div>
              <div className="absolute top-5 left-10 w-[320px] h-[420px] bg-begeInput rounded-xl p-3 shadow-2xl rotate-[-5deg] group-hover:rotate-[-8deg] transition-transform z-10">
                <img src="/img/restaurantes/rest11.jpg" className="w-full h-4/5 object-cover rounded-lg" alt="Polaroid 2" />
                <p className="text-center font-bold text-azulMarinho mt-3 text-sm">Descubra novos sabores ✨</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
