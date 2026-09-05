import React, { useEffect, useRef } from 'react'

// Landing page institucional do SwipFood — "O Tinder dos Restaurantes"
const cards = [
  {
    imagem: '/img/1.jpg',
    titulo: 'Quantas vezes você já ficou horas discutindo com a família sobre onde comer?',
    texto:
      'Cada um sugere uma coisa, ninguém se decide e no fim acabam indo no mesmo lugar de sempre por pura preguiça de pesquisar. Isso te lembra alguma situação?'
  },
  {
    imagem: '/img/2.jpg',
    titulo: 'O Problema',
    texto:
      'As pessoas têm dificuldade de escolher o que comer, seja por preço, por distância ou simplesmente por uma "indecisão crônica". Existem ótimos restaurantes na nossa região, mas nenhuma ferramenta ajuda a decidir de forma rápida e divertida.'
  },
  {
    imagem: '/img/3.jpg',
    titulo: 'A Solução',
    texto:
      'O SwipFood funciona como um "Tinder dos restaurantes": você vê as opções locais e vai arrastando para a direita o que interessa e para a esquerda o que não serve. De forma rápida e intuitiva, o sistema entrega a melhor opção ou um ranking personalizado para você!'
  },
  {
    imagem: '/img/4.jpg',
    titulo: 'Público-Alvo',
    texto:
      'Casais indecisos, famílias com gostos diferentes, turmas de amigos que querem agradar todo mundo — qualquer pessoa que queira transformar a escolha da refeição em algo rápido, leve e divertido.'
  },
  {
    imagem: '/img/5.jpg',
    titulo: 'Diferencial e Mercado',
    texto:
      'A gamificação da escolha. Não somos só mais um site com lista de restaurantes: entregamos uma experiência interativa que resolve a indecisão — e ainda fortalece o comércio local da nossa região.'
  }
]

export default function Landing() {
  // Refs dos cards institucionais (usados pela animação de revelação)
  const refsCards = useRef([])

  // Animação de revelação dos cards ao rolar a página — replicada do código legado
  useEffect(() => {
    const revelarCards = () => {
      const alturaJanela = window.innerHeight
      refsCards.current.forEach((card) => {
        if (!card) return
        if (card.getBoundingClientRect().top < alturaJanela - 100) {
          card.classList.add('reveal')
        }
      })
    }

    revelarCards()
    window.addEventListener('scroll', revelarCards)
    window.addEventListener('resize', revelarCards)
    return () => {
      window.removeEventListener('scroll', revelarCards)
      window.removeEventListener('resize', revelarCards)
    }
  }, [])

  return (
    <div className="flex-1 bg-[#dbcbb8]">
      {/* HERO */}
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-10 flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1">
          <h1 className="text-4xl md:text-6xl font-black text-escuro leading-tight">
            SwipFood
            <span className="block mt-2">O Tinder dos<br />Restaurantes</span>
          </h1>
          <p className="mt-6 text-lg text-gray-700">
            Descubra novos lugares de forma rápida e divertida!
          </p>
          <a
            href="#/cadastro"
            className="inline-block mt-6 bg-escuro hover:bg-gray-800 text-white font-bold px-8 py-3 rounded-full transition-all"
          >
            Começar agora →
          </a>
        </div>
        <div className="flex-1">
          <img
            src="/img/food1.jpg"
            alt="Comida"
            className="w-full max-w-lg rounded-3xl shadow-xl object-cover"
          />
        </div>
      </section>

      {/* CARDS INSTITUCIONAIS */}
      <section className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {cards.map((card, indice) => (
          <div
            key={card.titulo}
            ref={(el) => (refsCards.current[indice] = el)}
            className={`card-reveal bg-white rounded-3xl shadow-lg p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center ${
              indice % 2 === 1 ? 'md:flex-row-reverse' : ''
            }`}
          >
            <img
              src={card.imagem}
              alt={card.titulo}
              className="w-full md:w-1/3 aspect-square object-cover rounded-2xl shadow"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-escuro border-l-4 border-red-600 pl-4 mb-4">
                {card.titulo}
              </h2>
              <p className="text-gray-700 leading-relaxed">{card.texto}</p>
            </div>
          </div>
        ))}
      </section>

      {/* CTA FINAL */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-3xl p-10 text-center text-white">
          <h2 className="text-3xl font-bold">Pronto para acabar com a indecisão?</h2>
          <p className="mt-3 opacity-90">
            Junte-se ao SwipFood e transforme a escolha do seu próximo restaurante em uma
            experiência rápida, divertida e personalizada!
          </p>
          <a
            href="#/cadastro"
            className="inline-block mt-6 bg-escuro hover:bg-gray-800 text-white font-bold px-8 py-3 rounded-full transition-all"
          >
            Criar conta grátis →
          </a>
        </div>
      </section>
    </div>
  )
}