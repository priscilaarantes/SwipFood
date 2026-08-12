import React from 'react'

// Card de estabelecimento usado na página principal e na landing (destaques)
export default function CardEstabelecimento({ estabelecimento, mostrarMedia = false }) {
  const imagem = estabelecimento.imagens && estabelecimento.imagens.length > 0
    ? estabelecimento.imagens[0]
    : '/img/food1.jpg'

  const categoriaRotulo = (categoria) =>
    categoria ? categoria.charAt(0).toUpperCase() + categoria.slice(1) : 'Restaurante'

  return (
    <a
      href={`#/estabelecimento/${estabelecimento.id}`}
      className="block bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all"
    >
      <div className="h-40 bg-escuro overflow-hidden relative">
        <img src={imagem} alt={estabelecimento.nome} className="w-full h-full object-cover" />
        <span className="absolute top-2 left-2 bg-escuro/70 text-white text-xs font-bold px-3 py-1 rounded-full">
          {categoriaRotulo(estabelecimento.categoria)}
        </span>
        <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
          ❤ {estabelecimento.likes ?? 0}
        </span>
      </div>

      <div className="p-4">
        <h4 className="font-bold text-escuro text-lg">{estabelecimento.nome}</h4>
        <p className="text-gray-600 text-sm line-clamp-2 mt-1">{estabelecimento.descricao}</p>

        <div className="flex items-center justify-between mt-3">
          {estabelecimento.faixa_preco && (
            <span className="text-sm font-semibold text-green-700">R$ {estabelecimento.faixa_preco}</span>
          )}
          {mostrarMedia && estabelecimento.media_geral && (
            <span className="text-sm font-bold text-escuro">★ {estabelecimento.media_geral}</span>
          )}
          {mostrarMedia && estabelecimento.total_avaliacoes > 0 && (
            <span className="text-xs text-gray-500">({estabelecimento.total_avaliacoes})</span>
          )}
        </div>

        {estabelecimento.tags && estabelecimento.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {estabelecimento.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="bg-cremeClaro text-escuro text-xs font-semibold px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </a>
  )
}
