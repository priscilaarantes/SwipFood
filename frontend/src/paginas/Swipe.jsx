import React, { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../utilitarios/api'
import { navegarPara } from '../rota/hashRouter'
import { useToast } from '../contexto/ToastContext'

// Paleta baseada nas etiquetas da imagem "Etiquetas.png" (código legado)
const coresTags = ['#FFA5A5', '#B1F2F6', '#CDA6FF', '#FFA5FE', '#BCFF99']

// Distância mínima (px) para o arraste contar como like ou dislike
const LIMIATE_ARRASTE = 120

// Duração da animação de saída do card (ms)
const DURACAO_SAIDA = 300

// Deslocamento horizontal usado quando o card voa para fora da tela
const VOO_CARD = 700

function obterCorTag(tag) {
  return coresTags[(tag || '').length % coresTags.length]
}

// Tela de swipe: cards empilháveis com like/dislike (arraste, botões e setas do teclado).
// A fila é montada pelo servidor a partir das etiquetas: quanto mais likes o usuário
// deu em uma etiqueta, maior a chance de receber um card que a possui.
export default function Swipe() {
  const { exibirToast } = useToast()

  const [fila, setFila] = useState([])
  const [perfil, setPerfil] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [registrando, setRegistrando] = useState(false)
  const [reiniciando, setReiniciando] = useState(false)

  // Arraste do card do topo
  const [deslocamento, setDeslocamento] = useState({ x: 0, y: 0 })
  const [arrastando, setArrastando] = useState(false)
  const [saindo, setSaindo] = useState(null)

  // Bloqueia um novo swipe enquanto o card atual sai da tela
  const bloqueadoRef = useRef(false)
  const inicioRef = useRef(null)
  const temporizadorRef = useRef(null)

  const cardAtual = fila[0] || null
  const likes = perfil?.likes ?? 0
  const avaliados = perfil?.avaliados ?? 0
  const totalCards = perfil?.total ?? 0
  const progresso = totalCards > 0 ? Math.min(100, Math.round((avaliados / totalCards) * 100)) : 0

  // Carrega a fila de cards e o perfil de etiquetas já aprendido
  const carregarFila = useCallback(async () => {
    try {
      const dados = await api.get('/swipes/fila', true)
      setFila(Array.isArray(dados.dados) ? dados.dados : [])
      setPerfil(dados.perfil || null)
      setErro('')
    } catch {
      setErro('Não foi possível carregar os restaurantes.')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregarFila()
  }, [carregarFila])

  // Evita deixar o timer de saída rodando se a tela for desmontada
  useEffect(() => () => window.clearTimeout(temporizadorRef.current), [])

  // Abre a recomendação personalizada (botão de match)
  const abrirMatch = useCallback(() => {
    if (bloqueadoRef.current) return
    if (likes === 0) {
      exibirToast('Dê pelo menos um like para receber uma recomendação personalizada.', 'erro')
      return
    }
    navegarPara('/match')
  }, [likes, exibirToast])

  // "Voltar ao swipe": quando os restaurantes acabaram, o swipe reinicia do zero.
  // Apaga o histórico de swipes do usuário para todos os cards voltarem à fila.
  const reiniciarSwipe = useCallback(async () => {
    if (reiniciando) return
    setReiniciando(true)
    try {
      await api.delete('/swipes', true)
      setSaindo(null)
      setDeslocamento({ x: 0, y: 0 })
      bloqueadoRef.current = false
      setCarregando(true)
      await carregarFila()
      exibirToast('Swipe reiniciado! Todos os restaurantes voltaram para a fila.')
    } catch {
      setErro('Não foi possível reiniciar o swipe. Tente novamente.')
    } finally {
      setReiniciando(false)
    }
  }, [reiniciando, carregarFila, exibirToast])

  // Registra o like/dislike e devolve o card para o fim da fila de espera
  const aplicarSwipe = useCallback(
    async (acao) => {
      if (!cardAtual || bloqueadoRef.current) return
      bloqueadoRef.current = true
      setRegistrando(true)
      setArrastando(false)
      setDeslocamento({ x: 0, y: 0 })
      setSaindo({ id: cardAtual.id, direcao: acao === 'like' ? 1 : -1 })

      try {
        await api.post(`/swipes/${cardAtual.id}`, { acao }, true)
        setErro('')
      } catch {
        setSaindo(null)
        bloqueadoRef.current = false
        setRegistrando(false)
        setErro('Não foi possível registrar o swipe. Tente novamente.')
        return
      }

      // Atualiza as etiquetas aprendidas e a barra de progresso
      api
        .get('/swipes/perfil', true)
        .then((dados) => setPerfil(dados.perfil))
        .catch(() => {})

      temporizadorRef.current = window.setTimeout(() => {
        setFila((atual) => atual.filter((item) => item.id !== cardAtual.id))
        setSaindo(null)
        bloqueadoRef.current = false
        setRegistrando(false)
      }, DURACAO_SAIDA)
    },
    [cardAtual]
  )

  // Teclado: esquerda = dislike, direita = like, enter = match
  useEffect(() => {
    const aoTeclar = (evento) => {
      if (evento.key === 'ArrowLeft') {
        evento.preventDefault()
        aplicarSwipe('dislike')
      } else if (evento.key === 'ArrowRight') {
        evento.preventDefault()
        aplicarSwipe('like')
      } else if (evento.key === 'Enter' && cardAtual) {
        evento.preventDefault()
        abrirMatch()
      }
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [aplicarSwipe, abrirMatch, cardAtual])

  // Início do arraste
  const iniciarArraste = (evento) => {
    if (!cardAtual || bloqueadoRef.current) return
    if (evento.currentTarget.setPointerCapture) {
      evento.currentTarget.setPointerCapture(evento.pointerId)
    }
    inicioRef.current = { x: evento.clientX, y: evento.clientY }
    setArrastando(true)
  }

  // Durante o arraste
  const moverArraste = (evento) => {
    if (!inicioRef.current) return
    setDeslocamento({
      x: evento.clientX - inicioRef.current.x,
      y: evento.clientY - inicioRef.current.y
    })
  }

  // Fim do arraste: decide like/dislike pela distância percorrida
  const finalizarArraste = () => {
    if (!inicioRef.current) return
    inicioRef.current = null
    setArrastando(false)
    const { x } = deslocamento
    if (x > LIMIATE_ARRASTE) aplicarSwipe('like')
    else if (x < -LIMIATE_ARRASTE) aplicarSwipe('dislike')
    else setDeslocamento({ x: 0, y: 0 })
  }

  if (carregando) {
    return (
      <div className="bg-begeGlobal min-h-screen flex items-center justify-center">
        <p className="text-escuro font-semibold animate-pulse">Carregando restaurantes…</p>
      </div>
    )
  }

  if (erro && !cardAtual) {
    return (
      <div className="bg-begeGlobal min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-red-600 font-semibold">{erro}</p>
        <button
          onClick={() => {
            setCarregando(true)
            setErro('')
            carregarFila()
          }}
          className="btn-primary px-8 py-3"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  // Fim da fila: o swipe continua só quando ainda houver cards
  if (!cardAtual) {
    return (
      <div className="bg-begeGlobal min-h-screen">
        <div className="max-w-xl mx-auto px-4 py-16 text-center bg-white/70 backdrop-blur-xl rounded-[2.5rem] mt-10 shadow-soft border border-white/60">
          <p className="text-6xl mb-4">🎉</p>
          <h2 className="text-3xl font-black text-azulMarinho">
            {avaliados > 0 ? 'Você arrastou por todos os restaurantes!' : 'Nenhum card disponível'}
          </h2>
          <p className="text-azulMarinho/70 mt-3 font-medium">
            {likes > 0
              ? 'Toque em Match para receber a sua recomendação personalizada ou volte ao swipe para recomeçar.'
              : 'Volte ao swipe para começar a arrastar os restaurantes.'}
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {likes > 0 && (
              <button onClick={abrirMatch} className="btn-primary px-8 py-3">
                ⭐ Ver meu Match
              </button>
            )}
            <button
              onClick={reiniciarSwipe}
              disabled={reiniciando}
              className="bg-white text-escuro font-bold px-8 py-3 rounded-full hover:bg-begeInput transition-colors shadow-sm disabled:opacity-60 disabled:cursor-wait"
            >
              {reiniciando ? 'Reiniciando…' : '↻ Voltar ao swipe'}
            </button>
            <button
              onClick={() => navegarPara('/ranking')}
              className="bg-azulMarinho text-white font-bold px-8 py-3 rounded-full hover:bg-escuro transition-colors shadow-md"
            >
              Ver ranking
            </button>
            <button
              onClick={() => navegarPara('/principal')}
              className="bg-white/60 text-escuro font-bold px-8 py-3 rounded-full hover:bg-white transition-colors"
            >
              Explorar restaurantes
            </button>
          </div>
        </div>
      </div>
    )
  }

  const emVoo = saindo && saindo.id === cardAtual.id
  const direcao = emVoo ? saindo.direcao : 0
  const rotacao = deslocamento.x / 20
  const sombraArraste = arrastando
    ? deslocamento.x > 0
      ? '0 0 40px rgba(66,184,131,.6)'
      : '0 0 40px rgba(255,87,87,.6)'
    : '0 18px 40px -18px rgba(10,17,40,0.45)'

  const estiloCard = emVoo
    ? {
        transform: `translate(${direcao * VOO_CARD}px, 60px) rotate(${direcao * 30}deg)`,
        transition: `transform ${DURACAO_SAIDA}ms ease-in, opacity ${DURACAO_SAIDA}ms ease-in`,
        opacity: 0,
        zIndex: 30
      }
    : {
        transform: `translate(${deslocamento.x}px, ${deslocamento.y}px) rotate(${rotacao}deg)`,
        transition: arrastando ? 'none' : 'transform 0.3s ease',
        boxShadow: sombraArraste,
        opacity: registrando && !emVoo ? 0.6 : 1,
        zIndex: 30
      }

  return (
    <div className="bg-begeGlobal min-h-screen pb-6">
      <div className="w-full max-w-md mx-auto px-4 pt-6">
        {/* Progresso e etiquetas aprendidas */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 shadow-soft px-5 py-4">
          <div className="flex items-center justify-between text-xs font-bold text-azulMarinho/70">
            <span>
              {avaliados} de {totalCards} cards avaliados
            </span>
            <span>{likes} ♥ / {perfil?.dislikes ?? 0} ✕</span>
          </div>
          <div className="h-2 mt-2 rounded-full bg-begeInput overflow-hidden">
            <div
              className="h-full rounded-full bg-vermelho transition-all duration-500"
              style={{ width: `${progresso}%` }}
            />
          </div>

          {perfil && (perfil.etiquetas.length > 0 || perfil.rejeitadas.length > 0) && (
            <div className="mt-3 space-y-1.5">
              {perfil.etiquetas.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wide text-azulMarinho/50">
                    Curtiu
                  </span>
                  {perfil.etiquetas.map((item) => (
                    <span
                      key={item.etiqueta}
                      title={`${item.curtidas} like(s) nesta etiqueta`}
                      className="bg-tagVerde text-azulMarinho text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                    >
                      #{item.etiqueta}
                    </span>
                  ))}
                </div>
              )}
              {perfil.rejeitadas.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wide text-azulMarinho/50">
                    Rejeitou
                  </span>
                  {perfil.rejeitadas.map((item) => (
                    <span
                      key={item.etiqueta}
                      title={`${item.rejeitadas} dislike(s) nesta etiqueta`}
                      className="bg-tagRosa text-azulMarinho text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                    >
                      #{item.etiqueta}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-sm font-semibold text-azulMarinho/60 mt-4 mb-3">
          Arraste para os lados ou use as setas ← →
        </p>

        {erro && (
          <p className="text-center text-red-600 text-sm font-semibold mb-3">{erro}</p>
        )}

        {/* Pilha de cards */}
        <div className="relative h-[520px]">
          {/* Cards de trás — exibem imagem e nome do restaurante */}
          {fila.slice(1, 4).map((item, indice) => {
            const profundidade = indice + 1
            return (
              <div
                key={item.id}
                className="absolute inset-0 rounded-3xl overflow-hidden bg-white border-2 border-white/60 shadow-lg"
                style={{
                  transform: `translateY(${profundidade * 14}px) scale(${1 - profundidade * 0.05})`,
                  transformOrigin: 'top center',
                  zIndex: 10 - profundidade,
                  opacity: 1 - profundidade * 0.18,
                  transition: 'transform 0.3s ease'
                }}
                aria-hidden="true"
              >
                <img
                  src={item.imagens?.[0] || '/img/food1.jpg'}
                  alt=""
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <p className="text-lg font-black text-azulMarinho truncate">{item.nome}</p>
                  <p className="text-xs font-bold uppercase tracking-wide text-azulMarinho/50 truncate">
                    {item.categoria} · R$ {item.faixa_preco}
                  </p>
                </div>
              </div>
            )
          })}

          {/* Card do topo */}
          <div
            className="absolute inset-0 card-soft bg-white border-2 border-white/50 overflow-hidden select-none"
            style={{ ...estiloCard, cursor: arrastando ? 'grabbing' : 'grab', touchAction: 'none' }}
            onPointerDown={iniciarArraste}
            onPointerMove={moverArraste}
            onPointerUp={finalizarArraste}
            onPointerCancel={finalizarArraste}
          >
            <img
              src={cardAtual.imagens?.[0] || '/img/food1.jpg'}
              alt={cardAtual.nome}
              className="w-full h-56 object-cover pointer-events-none"
            />
            <div className="p-5">
              <h2 className="text-3xl font-black text-azulMarinho leading-tight">
                {cardAtual.nome}
              </h2>
              <p className="text-sm font-bold text-azulMarinho/50 uppercase tracking-wide mt-1">
                {cardAtual.categoria} · R$ {cardAtual.faixa_preco}
              </p>
              <p className="text-azulMarinho/80 mt-3 line-clamp-2">{cardAtual.descricao}</p>
              <div className="flex flex-wrap gap-2 mt-5">
                {cardAtual.tags?.map((tag) => (
                  <span
                    key={tag}
                    style={{ backgroundColor: obterCorTag(tag) }}
                    className="text-azulMarinho text-xs font-bold px-3 py-1 rounded-full shadow-sm pointer-events-none"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm font-bold text-azulMarinho">❤ {cardAtual.likes ?? 0} curtidas</p>
            </div>

            {/* Selos de like/dislike durante o arraste */}
            {deslocamento.x > 40 && (
              <span className="absolute top-5 left-5 border-4 border-green-500 text-green-600 font-black text-3xl px-4 py-1 rounded-xl rotate-[-12deg] bg-white/70">
                LIKE
              </span>
            )}
            {deslocamento.x < -40 && (
              <span className="absolute top-5 right-5 border-4 border-red-500 text-red-600 font-black text-3xl px-4 py-1 rounded-xl rotate-[12deg] bg-white/70">
                DISLIKE
              </span>
            )}
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex items-center justify-center gap-5 mt-6">
          <button
            onClick={() => aplicarSwipe('dislike')}
            disabled={registrando}
            aria-label="Rejeitar restaurante"
            className="w-16 h-16 rounded-full bg-white border-4 border-red-600 text-red-600 text-2xl font-black shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
          >
            ✕
          </button>

          <button
            onClick={abrirMatch}
            className="btn-primary px-6 py-4 flex flex-col items-center leading-tight"
          >
            <span className="text-lg">⭐ Match</span>
            <span className="text-[10px] font-semibold opacity-80">enter</span>
          </button>

          <button
            onClick={() => aplicarSwipe('like')}
            disabled={registrando}
            aria-label="Curtir restaurante"
            className="w-16 h-16 rounded-full bg-white border-4 border-green-500 text-green-600 text-2xl font-black shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
          >
            ✓
          </button>
        </div>

        <p className="text-center text-xs font-semibold text-azulMarinho/50 mt-4">
          {fila.length} card(s) restante(s) · continue arrastando até apertar Match
        </p>
      </div>
    </div>
  )
}