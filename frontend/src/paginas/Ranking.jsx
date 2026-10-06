import React, { useCallback, useEffect, useState } from 'react'
import { api } from '../utilitarios/api'
import Estrelas from '../components/Estrelas'
import { navegarPara } from '../rota/hashRouter'

// Ranking personalizado do usuário:Sugestões calculadas pelas etiquetas curtidas
// (mesmo motor do botão de match) e, abaixo, os restaurantes que ele curtiu.
export default function Ranking() {
  const [itens, setItens] = useState([])
  const [recomendacao, setRecomendacao] = useState(null)
  const [sugestoes, setSugestoes] = useState([])
  const [perfil, setPerfil] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [voltando, setVoltando] = useState(false)

  // "Voltar ao swipe": continua de onde parou e, se a fila acabou, reinicia
  const voltarAoSwipe = useCallback(async () => {
    if (voltando) return
    setVoltando(true)
    try {
      const fila = await api.get('/swipes/fila', true)
      if ((fila.restantes ?? 0) === 0) {
        await api.delete('/swipes', true)
      }
    } catch {
      // mesmo se a verificação falhar, o usuário volta para a tela de swipe
    } finally {
      setVoltando(false)
    }
    navegarPara('/swipe')
  }, [voltando])

  useEffect(() => {
    api
      .get('/ranking', true)
      .then((dados) => {
        setItens(Array.isArray(dados.dados) ? dados.dados : [])
        setRecomendacao(dados.recomendacao || null)
        setSugestoes(Array.isArray(dados.recomendacoes) ? dados.recomendacoes : [])
        setPerfil(dados.perfil || null)
      })
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
          Sugestões pelas etiquetas que você curtiu + os restaurantes que você curtiu
        </p>
        <div className="text-center mt-4">
          <button
            onClick={voltarAoSwipe}
            disabled={voltando}
            className="text-xs font-bold text-azulMarinho bg-begeClaro border border-black/5 rounded-full px-5 py-2 hover:bg-azulMarinho hover:text-white transition-colors disabled:opacity-60 disabled:cursor-wait"
          >
            {voltando ? 'Voltando…' : '↻ Voltar ao swipe'}
          </button>
        </div>

        {erro && <p className="text-red-600 font-semibold text-center mt-4">{erro}</p>}

        {/* Recomendação principal e top 5 — mesma lógica do botão de match */}
        {recomendacao && (
          <div className="mt-8">
            <h2 className="text-lg font-black text-azulMarinho">Recomendados para você</h2>

            <a
              href={`#/estabelecimento/${recomendacao.id}`}
              className="mt-3 flex items-center gap-4 bg-begeClaro rounded-2xl border border-white/70 p-4 hover:-translate-y-1 transition-transform"
            >
              <span className="w-10 h-10 shrink-0 rounded-full bg-vermelho text-white flex items-center justify-center text-lg shadow">
                ⭐
              </span>
              <img
                src={recomendacao.imagens?.[0] || '/img/food1.jpg'}
                alt=""
                className="w-16 h-16 shrink-0 rounded-xl object-cover"
              />
              <span className="flex-1 min-w-0">
                <span className="block font-black text-azulMarinho truncate">
                  {recomendacao.nome}
                </span>
                <span className="block text-xs text-azulMarinho/60 uppercase tracking-wide truncate">
                  {recomendacao.categoria} · R$ {recomendacao.faixa_preco}
                </span>
                {recomendacao.etiquetas_em_comum?.length > 0 && (
                  <span className="block text-xs font-semibold text-azulMarinho/70 mt-1 truncate">
                    {recomendacao.etiquetas_em_comum
                      .map((e) => `#${e.etiqueta}`)
                      .join(' ')}
                  </span>
                )}
              </span>
              <span className="shrink-0 text-xs font-black text-vermelho bg-white px-2.5 py-1 rounded-full">
                {recomendacao.afinidade}
              </span>
            </a>

            {sugestoes.length > 0 && (
              <div className="mt-4 space-y-3">
                {sugestoes.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-9 h-9 shrink-0 rounded-full bg-azulMarinho text-white flex items-center justify-center font-black shadow">
                      {item.posicao}
                    </div>
                    <div className="flex-1 min-w-0 bg-begeClaro rounded-full flex items-center justify-between gap-3 px-4 h-14 hover:bg-white transition-colors">
                      <span className="font-bold text-escuro truncate">{item.nome}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        {item.media_geral ? (
                          <Estrelas nota={item.media_geral} somenteLeitura tamanho="text-sm" />
                        ) : (
                          <span className="text-xs text-gray-500">Sem avaliações</span>
                        )}
                        <a
                          href={`#/estabelecimento/${item.id}`}
                          className="text-xs font-bold text-gray-600 bg-white/70 border border-black/5 rounded-full px-3 py-1.5 hover:bg-escuro hover:text-white transition-colors"
                        >
                          Sobre →
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Etiquetas aprendidas */}
        {perfil && (perfil.etiquetas.length > 0 || perfil.rejeitadas.length > 0) && (
          <div className="mt-8">
            <h2 className="text-lg font-black text-azulMarinho">Suas etiquetas</h2>
            <div className="mt-2 space-y-2">
              {perfil.etiquetas.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wide text-azulMarinho/50 w-16">
                    Curtiu
                  </span>
                  {perfil.etiquetas.map((item) => (
                    <span
                      key={item.etiqueta}
                      className="bg-tagVerde text-azulMarinho text-xs font-bold px-3 py-1 rounded-full"
                    >
                      #{item.etiqueta}
                    </span>
                  ))}
                </div>
              )}
              {perfil.rejeitadas.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wide text-azulMarinho/50 w-16">
                    Rejeitou
                  </span>
                  {perfil.rejeitadas.map((item) => (
                    <span
                      key={item.etiqueta}
                      className="bg-tagRosa text-azulMarinho text-xs font-bold px-3 py-1 rounded-full"
                    >
                      #{item.etiqueta}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <h2 className="text-lg font-black text-azulMarinho mt-8">Restaurantes que você curtiu</h2>

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

        <div className="mt-4 space-y-4">
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
