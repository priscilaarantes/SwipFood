import React from 'react'

// Estrelas de avaliação: usadas para exibir uma nota (somenteLeitura)
// ou para capturar a nota do usuário (clicável).
// A nota vai de 0 (sem estrela) até 5.
export default function Estrelas({ nota, aoMudar, somenteLeitura = false, tamanho = 'text-xl' }) {
  const estrelas = [1, 2, 3, 4, 5]

  const clicar = (valor) => {
    if (!somenteLeitura && aoMudar) {
      aoMudar(valor === nota ? valor - 1 : valor)
    }
  }

  return (
    <div className="flex items-center gap-0.5">
      {estrelas.map((valor) => (
        <button
          key={valor}
          type="button"
          onClick={() => clicar(valor)}
          className={`${tamanho} leading-none transition-transform ${!somenteLeitura ? 'hover:scale-125 cursor-pointer' : 'cursor-default'} ${valor <= nota ? 'text-yellow-400' : 'text-gray-300'}`}
          aria-label={`Nota ${valor}`}
          disabled={somenteLeitura}
        >
          ★
        </button>
      ))}
      {nota > 0 && <span className="ml-2 text-sm font-bold text-escuro">{Number(nota).toFixed(1)}</span>}
    </div>
  )
}
