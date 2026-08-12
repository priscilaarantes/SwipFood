import React, { useEffect, useRef, useState } from 'react'
import { api } from '../utilitarios/api'
import { navegarPara } from '../rota/hashRouter'

const chaveSwipeados = 'swipfood_swipeados'

// Retorna a lista de estabelecimentos já arrastados nesta sessão
function obterSwipeados() {
  try {
    return JSON.parse(localStorage.getItem(chaveSwipeados) || '[]')
  } catch {
    return []
  }
}

function marcarSwipeado(id) {
  const swipeados = obterSwipeados()
  if (!swipeados.includes(id)) {
    localStorage.setItem(chaveSwipeados, JSON.stringify([...swipeados, id]))
  }
}

// Tela de swipe: cards empilháveis com like/dislike (arraste, botões e setas do teclado)
export default function Swipe() {
  const [fila, setFila] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [registrando, setRegistrando] = useState(false)

  // Estado do arraste do card no topo
  const [deslocamento, setDeslocamento] = useState({ x: 0, y: 0 })
  const arrastandoRef = useRef(null)

  // Carrega estabelecimentos ainda não arrastados
  useEffect(() => {
    const swipeados = obterSwipeados()
    api
      .get('/estabelecimentos')
      .then((dados) => {
        const disponiveis = dados.dados.filter((item) => !swipeados.includes(item.id))
        setFila(disponiveis)
      })
      .catch(() => setErro('Não foi possível carregar os restaurantes.'))
      .finally(() => setCarregando(false))
  }, [])

  const cardAtual = fila[0]

  // Registra o swipe e, em caso de "like", navega para a tela de match
  const aplicarSwipe = async (acao) => {
    if (!cardAtual || registrando) return
    setRegistrando(true)
    setDeslocamento({ x: 0, y: 0 })
    try {
      await api.post(`/swipes/${cardAtual.id}`, { acao })
      marcarSwipeado(cardAtual.id)
      setFila((atual) => atual.filter((item) => item.id !== cardAtual.id))
      if (acao === 'like') {
        navegarPara(`/match/${cardAtual.id}`)
      }
    } catch {
      setErro('Não foi possível registrar o swipe.')
    } finally {
      setRegistrando(false)
    }
  }

  // Setas do teclado: esquerda = dislike, direita = like
  useEffect(() => {
    const aoTeclar = (evento) => {
      if (evento.key === 'ArrowLeft') aplicarSwipe('dislike')
      if (evento.key === 'ArrowRight') aplicarSwipe('like')
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  })

  // Início do arraste
  const iniciarArraste = (evento) => {
    if (!cardAtual || registrando) return
    const ponto = evento.touches ? evento.touches[0] : evento
    arrastandoRef.current = { x: ponto.clientX, y: ponto.clientY }
  }

  // Durante o arraste
  const moverArraste = (evento) => {
    if (!arrastandoRef.current) return
    const ponto = evento.touches ? evento.touches[0] : evento
    setDeslocamento({
      x: ponto.clientX - arrastandoRef.current.x,
      y: ponto.clientY - arrastandoRef.current.y
    })
  }

  // Fim do arraste: decide like/dislike pela distância percorrida
  const finalizarArraste = () => {
    if (!arrastandoRef.current) return
    const { x } = deslocamento
    arrastandoRef.current = null
    if (x > 120) aplicarSwipe('like')
    else if (x < -120) aplicarSwipe('dislike')
    else setDeslocamento({ x: 0, y: 0 })
  }

  if (carregando) {
    return <p className="text-center text-escuro font-semibold mt-20 animate-pulse">Carregando restaurantes…</p>
  }

  if (erro) {
    return <p className="text-center text-red-600 font-semibold mt-20">{erro}</p>
  }

  if (!cardAtual) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-6xl mb-4">🎉</p>
        <h2 className="text-2xl font-bold text-escuro">Você arrastou por todos os restaurantes!</h2>
        <p className="text-gray-600 mt-2">Confira seu ranking ou explore as opções novamente.</p>
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => navegarPara('/principal')}
            className="bg-escuro text-white font-bold px-6 py-3 rounded-full"
          >
            Explorar restaurantes
          </button>
          <button
            onClick={() => navegarPara('/ranking')}
            className="bg-red-600 text-white font-bold px-6 py-3 rounded-full"
          >
            Ver ranking
          </button>
        </div>
      </div>
    )
  }

  const restantes = fila.length - 1
  const rotacao = deslocamento.x / 20

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <p className="text-center text-sm font-semibold text-gray-600 mb-4">
        Arraste para os lados ou use as setas ← →
      </p>

      <div className="relative h-[480px]">
        {/* Cards de trás (pilha) */}
        {fila.slice(1, 4).reverse().map((item, indice) => (
          <div
            key={item.id}
            className="absolute inset-0 bg-white rounded-3xl shadow-lg border border-gray-200"
            style={{
              transform: `translateY(${-(indice + 1) * 8}px) scale(${1 - (indice + 1) * 0.03})`,
              zIndex: indice
            }}
          />
        ))}

        {/* Card do topo */}
        <div
          className={`absolute inset-0 rounded-3xl shadow-2xl overflow-hidden bg-white ${registrando ? 'opacity-60' : ''}`}
          style={{
            transform: `translate(${deslocamento.x}px, ${deslocamento.y}px) rotate(${rotacao}deg)`,
            transition: arrastandoRef.current ? 'none' : 'transform 0.3s ease',
            zIndex: 10,
            cursor: 'grab',
            touchAction: 'none'
          }}
          onPointerDown={iniciarArraste}
          onPointerMove={moverArraste}
          onPointerUp={finalizarArraste}
          onPointerLeave={finalizarArraste}
        >
          <img
            src={cardAtual.imagens?.[0] || '/img/food1.jpg'}
            alt={cardAtual.nome}
            className="w-full h-64 object-cover"
          />
          <div className="p-5">
            <h2 className="text-2xl font-black text-escuro">{cardAtual.nome}</h2>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">
              {cardAtual.categoria} · R$ {cardAtual.faixa_preco}
            </p>
            <p className="text-gray-600 mt-2">{cardAtual.descricao}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {cardAtual.tags?.map((tag) => (
                <span key={tag} className="bg-cremeClaro text-escuro text-xs font-bold px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm font-bold text-escuro">❤ {cardAtual.likes ?? 0} curtidas</p>
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
      <div className="flex items-center justify-center gap-8 mt-8">
        <button
          onClick={() => aplicarSwipe('dislike')}
          disabled={registrando}
          className="w-16 h-16 rounded-full bg-white border-4 border-red-600 text-red-600 text-2xl font-black shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
        >
          ✕
        </button>
        <button
          onClick={() => navegarPara('/principal')}
          className="px-5 py-2 rounded-full bg-cremeClaro text-escuro text-sm font-bold hover:bg-white transition-colors"
        >
          {restantes} restante(s)
        </button>
        <button
          onClick={() => aplicarSwipe('like')}
          disabled={registrando}
          className="w-16 h-16 rounded-full bg-white border-4 border-green-500 text-green-600 text-2xl font-black shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
        >
          ✓
        </button>
      </div>
    </div>
  )
}
