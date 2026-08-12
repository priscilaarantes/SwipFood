import React, { useEffect, useState } from 'react'
import { api } from '../utilitarios/api'
import { navegarPara } from '../rota/hashRouter'

// Tela "Deu Match!" exibida quando o usuário dá like em um restaurante
export default function Match({ parametros }) {
  const id = Number(parametros[0])
  const [estabelecimento, setEstabelecimento] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    api
      .get(`/estabelecimentos/${id}`)
      .then((dados) => setEstabelecimento(dados.dados))
      .catch(() => setEstabelecimento(null))
      .finally(() => setCarregando(false))
  }, [id])

  if (carregando) {
    return <p className="text-center text-escuro font-semibold mt-20 animate-pulse">Processando o match…</p>
  }

  if (!estabelecimento) {
    return (
      <div className="text-center mt-20">
        <p className="text-red-600 font-bold">Estabelecimento não encontrado.</p>
        <button
          onClick={() => navegarPara('/swipe')}
          className="mt-4 bg-escuro text-white font-bold px-6 py-3 rounded-full"
        >
          Voltar ao swipe
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10 text-center">
      <p className="text-7xl mb-4">💞</p>
      <h1 className="text-4xl font-black text-red-600">Deu Match!</h1>
      <p className="text-gray-600 mt-2">
        Você e <span className="font-bold text-escuro">{estabelecimento.nome}</span> deram match!
      </p>

      <div className="mt-8 bg-white rounded-3xl shadow-2xl overflow-hidden">
        <img
          src={estabelecimento.imagens?.[0] || '/img/food1.jpg'}
          alt={estabelecimento.nome}
          className="w-full h-56 object-cover"
        />
        <div className="p-6">
          <h2 className="text-2xl font-black text-escuro">{estabelecimento.nome}</h2>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            {estabelecimento.categoria} · R$ {estabelecimento.faixa_preco}
          </p>
          <p className="text-gray-600 mt-3">{estabelecimento.descricao}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
        <button
          onClick={() => navegarPara(`/estabelecimento/${estabelecimento.id}`)}
          className="bg-escuro text-white font-bold px-6 py-3 rounded-full hover:bg-gray-800 transition-colors"
        >
          Ver informações
        </button>
        <button
          onClick={() => navegarPara('/swipe')}
          className="bg-red-600 text-white font-bold px-6 py-3 rounded-full hover:bg-red-700 transition-colors"
        >
          Continuar arrastando
        </button>
        <button
          onClick={() => navegarPara('/ranking')}
          className="bg-cremeClaro text-escuro font-bold px-6 py-3 rounded-full hover:bg-white transition-colors"
        >
          Ver ranking
        </button>
      </div>
    </div>
  )
}
