import React from 'react'

// Card de estabelecimento usado na página principal e na landing (destaques)
export default function CardEstabelecimento({ estabelecimento, mostrarMedia = false }) {
  const imagem = estabelecimento.imagens && estabelecimento.imagens.length > 0
    ? estabelecimento.imagens[0]
    : '/img/food1.jpg'

  const categoriaRotulo = (categoria) =>
    categoria ? categoria.charAt(0).toUpperCase() + categoria.slice(1) : 'Restaurante'

  const obterCorTag = (tag) => {
    const cores = ['bg-tagRosa', 'bg-tagVerde', 'bg-tagAzul', 'bg-tagLaranja', 'bg-tagAmarelo', 'bg-tagRoxo']
    const index = tag.length % cores.length
    return cores[index]
  }

  return (
    <a
      href={`#/estabelecimento/${estabelecimento.id}`}
      className="block card-soft hover:-translate-y-2 hover:shadow-2xl group"
    >
      <div className="h-44 bg-creme overflow-hidden relative">
        <img src={imagem} alt={estabelecimento.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <span className="absolute top-3 left-3 bg-white/80 backdrop-blur text-azulMarinho text-xs font-bold px-3 py-1 rounded-full shadow-sm">
          {categoriaRotulo(estabelecimento.categoria)}
        </span>
        <span className="absolute top-3 right-3 bg-vermelho text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
          ❤ {estabelecimento.likes ?? 0}
        </span>
      </div>

      <div className="p-5">
        <h4 className="font-bold text-azulMarinho text-xl">{estabelecimento.nome}</h4>
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
          <div className="flex flex-wrap gap-2 mt-4">
            {estabelecimento.tags.slice(0, 3).map((tag) => (
              <span key={tag} className={`${obterCorTag(tag)} text-azulMarinho text-xs font-bold px-3 py-1 rounded-full shadow-sm`}>
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </a>
  )
}
