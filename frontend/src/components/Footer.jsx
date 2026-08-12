import React from 'react'

// Rodapé institucional do SwipFood
export default function Footer() {
  return (
    <footer className="bg-escuro text-creme mt-12">
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <p className="font-semibold">© 2026 SwipFood — Todos os direitos reservados</p>
        <p className="text-sm mt-2 opacity-80">
          O Tinder dos Restaurantes — Transformando a indecisão em diversão!
        </p>
        <p className="text-xs mt-3 opacity-60">
          Projeto acadêmico — IFMT Campus Barra do Garças · Programação Web
        </p>
      </div>
    </footer>
  )
}
