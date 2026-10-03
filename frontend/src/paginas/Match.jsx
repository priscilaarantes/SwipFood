import React, { useCallback, useEffect, useState } from 'react'
import { api } from '../utilitarios/api'
import { navegarPara } from '../rota/hashRouter'

// Paleta baseada nas etiquetas da imagem "Etiquetas.png" (código legado)
const coresTags = ['#FFA5A5', '#B1F2F6', '#CDA6FF', '#FFA5FE', '#BCFF99']

function obterCorTag(tag) {
  return coresTags[(tag || '').length % coresTags.length]
}

// Cartão de um estabelecimento dentro do ranking top 5
function ItemRanking({ item, indice }) {
  const [aberto, setAberto] = useState(false)

  return (
    <div className="bg-begeClaro rounded-2xl border border-white/70 overflow-hidden">
      <button
        onClick={() => setAberto((valor) => !valor)}
        className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-white/60 transition-colors"
      >
        <span className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-vermelho to-vermelhoEscuro text-white flex items-center justify-center font-black text-lg shadow">
          {indice + 1}
        </span>
        <img
          src={item.imagens?.[0] || '/img/food1.jpg'}
          alt=""
          className="w-14 h-14 shrink-0 rounded-xl object-cover"
        />
        <span className="flex-1 min-w-0">
          <span className="block font-bold text-azulMarinho truncate">{item.nome}</span>
          <span className="block text-xs text-azulMarinho/60 uppercase tracking-wide truncate">
            {item.categoria} · R$ {item.faixa_preco}
          </span>
        </span>
        <span className="shrink-0 text-xs font-black text-vermelho bg-white px-2.5 py-1 rounded-full">
          {item.afinidade > 0 ? '+' : ''}
          {item.afinidade}
        </span>
      </button>

      {aberto && (
        <div className="px-4 pb-4 pt-1 border-t border-white/70">
          {item.descricao && (
            <p className="text-sm text-azulMarinho/75 mt-3">{item.descricao}</p>
          )}
          {item.etiquetas_em_comum?.length > 0 && (
            <p className="text-xs font-semibold text-azulMarinho/70 mt-3">
              Combina com você em{' '}
              {item.etiquetas_em_comum
                .map((e) => `#${e.etiqueta} (${e.curtidas}x)`)
                .join(', ')}
            </p>
          )}
          <a
            href={`#/estabelecimento/${item.id}`}
            className="inline-block mt-3 text-xs font-bold text-azulMarinho bg-white px-4 py-1.5 rounded-full border border-black/5 hover:bg-azulMarinho hover:text-white transition-colors"
          >
            Sobre →
          </a>
        </div>
      )}
    </div>
  )
}

// Tela "Deu Match!": mostra a recomendação calculada a partir das etiquetas dos
// restaurantes curtidos e o ranking com os 5 melhores-establishments restantes.
export default function Match() {
  const [dados, setDados] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [voltando, setVoltando] = useState(false)

  useEffect(() => {
    api
      .get('/swipes/recomendacao', true)
      .then((resposta) => {
        setDados(resposta)
        setErro('')
      })
      .catch(() => setErro('Não foi possível calcular a sua recomendação.'))
      .finally(() => setCarregando(false))
  }, [])

  // "Voltar ao swipe": devolve o usuário à seleção de restaurantes. Se ele já
  // arrastou todos os cards, o swipe reinicia para a fila voltar do começo.
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

  if (carregando) {
    return (
      <div className="bg-begeGlobal min-h-screen flex items-center justify-center">
        <p className="text-escuro font-semibold animate-pulse">Processando o match…</p>
      </div>
    )
  }

  if (erro || !dados?.recomendacao) {
    return (
      <div className="bg-begeGlobal min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
<p className="text-red-600 font-bold">{erro || 'Nenhuma recomendação disponível.'}</p>
        <button onClick={voltarAoSwipe} disabled={voltando} className="btn-primary px-6 py-3">
          {voltando ? 'Voltando…' : '↻ Voltar ao swipe'}
        </button>
      </div>
    )
  }

  const { recomendacao, top, perfil } = dados
  const semLikes = (perfil?.likes ?? 0) === 0
  const motivo = recomendacao.etiquetas_em_comum || []

  return (
    <div className="bg-begeGlobal min-h-screen pb-10">
      <div className="max-w-lg mx-auto px-4 py-8 text-center">
        <p className="text-6xl mb-2">💞</p>
        <h1 className="text-4xl font-black text-vermelho">Deu Match!</h1>
        <p className="text-azulMarinho/70 mt-2 font-medium">
          {semLikes
            ? 'Ainda não há curtidas suficientes. Arraste alguns cards para a sua recomendação ficar personalizada.'
            : 'Escolhemos este lugar para você com base nas etiquetas que você curtiu.'}
        </p>

        {/* Etiquetas que motivaram a recomendação */}
        {motivo.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {motivo.map((item) => (
              <span
                key={item.etiqueta}
                style={{ backgroundColor: obterCorTag(item.etiqueta) }}
                className="text-azulMarinho text-xs font-bold px-3 py-1 rounded-full shadow-sm"
              >
                #{item.etiqueta} · {item.curtidas} curtida(s)
              </span>
            ))}
          </div>
        )}

        {/* Card da recomendação */}
        <div className="mt-6 bg-white rounded-3xl shadow-soft overflow-hidden text-left">
          <img
            src={recomendacao.imagens?.[0] || '/img/food1.jpg'}
            alt={recomendacao.nome}
            className="w-full h-56 object-cover"
          />
          <div className="p-6">
            <span className="text-[11px] font-black uppercase tracking-widest text-vermelho">
              Sua recomendação
            </span>
            <h2 className="text-2xl font-black text-escuro mt-1">{recomendacao.nome}</h2>
            <p className="text-sm font-semibold text-azulMarinho/50 uppercase tracking-wide">
              {recomendacao.categoria} · R$ {recomendacao.faixa_preco}
            </p>
            <p className="text-azulMarinho/75 mt-3">{recomendacao.descricao}</p>

            {recomendacao.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {recomendacao.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{ backgroundColor: obterCorTag(tag) }}
                    className="text-azulMarinho text-xs font-bold px-3 py-1 rounded-full shadow-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Nível de afinidade com as suas preferências */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs font-bold text-azulMarinho/60">
                <span>Afinidade com suas preferências</span>
                <span>{recomendacao.afinidade}</span>
              </div>
              <div className="h-2 mt-1.5 rounded-full bg-begeInput overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-vermelho to-vermelhoEscuro"
                  style={{
                    width: `${Math.min(100, Math.max(6, recomendacao.afinidade * 60))}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Ações */}
<div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
          <button
            onClick={() => navegarPara(`/estabelecimento/${recomendacao.id}`)}
            className="bg-escuro text-white font-bold px-6 py-3 rounded-full hover:bg-azulMarinho transition-colors"
          >
            Ver informações
          </button>
          <button
            onClick={voltarAoSwipe}
            disabled={voltando}
            className="bg-vermelho text-white font-bold px-6 py-3 rounded-full hover:bg-vermelhoEscuro transition-colors disabled:opacity-60 disabled:cursor-wait"
          >
            {voltando ? 'Voltando…' : '↻ Voltar ao swipe'}
          </button>
          <button
            onClick={() => navegarPara('/ranking')}
            className="bg-white text-escuro font-bold px-6 py-3 rounded-full hover:bg-begeInput transition-colors shadow-sm"
          >
            Ver ranking
          </button>
        </div>

        <p className="text-center text-xs text-azulMarinho/50 mt-3">
          Ao voltar, o swipe continua de onde parou — se você já arrastou todos os
          restaurantes, ele reinicia com a fila completa.
        </p>

        {/* Top 5 calculado com a mesma lógica de etiquetas */}
        {top.length > 0 && (
          <div className="mt-10 text-left">
            <h3 className="text-xl font-black text-azulMarinho text-center">
              Top 5 para o seu perfil
            </h3>
            <p className="text-center text-azulMarinho/60 text-sm mt-1 mb-4">
              Mesmo cálculo do botão de match, com os próximos melhores lugares
            </p>
            <div className="space-y-3">
              {top.map((item) => (
                <ItemRanking key={item.id} item={item} indice={item.posicao - 1} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
