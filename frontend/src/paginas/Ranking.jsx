import React, { useEffect, useState } from 'react'
import { api } from '../utilitarios/api'
import Estrelas from '../components/Estrelas'
import { navegarPara } from '../rota/hashRouter'

// Ranking personalizado do usuário com as médias das notas dos restaurantes curtidos
export default function Ranking() {
  const [itens, setItens] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    api
      .get('/ranking', true)
      .then((dados) => setItens(dados.dados))
      .catch(() => setErro('Não foi possível carregar seu ranking.'))
      .finally(() => setCarregando(false))
  }, [])

  if (carregando) {
    return <p className="text-center text-escuro font-semibold mt-20 animate-pulse">Calculando ranking…</p>
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="bg-white rounded-3xl shadow-2xl p-8">
        <h1 className="text-3xl font-black text-escuro text-center">Ranking do usuário</h1>
        <p className="text-center text-gray-500 text-sm mt-1">
          Seus restaurantes favoritos baseados nos matches e nas notas
        </p>

        {erro && <p className="text-red-600 font-semibold text-center mt-4">{erro}</p>}

        {!erro && itens.length === 0 && (
          <div className="text-center mt-10">
            <p className="text-5xl mb-3">😕</p>
            <p className="text-escuro font-bold">Você ainda não deu like em nenhum restaurante</p>
            <p className="text-gray-500 text-sm mt-1">
              Arraste para o lado direito para montar seu ranking!
            </p>
            <button
              onClick={() => navegarPara('/swipe')}
              className="mt-5 bg-red-600 text-white font-bold px-6 py-3 rounded-full hover:bg-red-700 transition-colors"
            >
              Começar a arrastar
            </button>
          </div>
        )}

        <div className="mt-8 space-y-4">
          {itens.map((item, indice) => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white flex items-center justify-center font-black text-xl shadow">
                {indice + 1}
              </div>
              <div className="flex-1 bg-cremeClaro rounded-full flex items-center justify-between px-5 h-16 hover:bg-creme transition-colors">
                <span className="font-bold text-escuro">{item.nome}</span>
                <div className="flex items-center gap-3">
                  {item.media_geral ? (
                    <Estrelas nota={item.media_geral} somenteLeitura tamanho="text-sm" />
                  ) : (
                    <span className="text-xs text-gray-500">Sem avaliações</span>
                  )}
                  <a
                    href={`#/estabelecimento/${item.id}`}
                    className="text-xs font-bold text-gray-500 bg-white/60 border border-black/5 rounded-full px-4 py-1.5 hover:bg-escuro hover:text-white transition-colors"
                  >
                    Sobre →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
