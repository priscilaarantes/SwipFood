import React, { useState, useEffect, useCallback } from 'react'
import FiltrosBar from '../components/FiltrosBar'
import { navegarPara } from '../rota/hashRouter'
import { api } from '../utilitarios/api'

const LISTA_CATEGORIAS = [
  { id: 'todos', nome: 'Todos' },
  { id: 'cafe', nome: 'Café' },
  { id: 'padaria', nome: 'Padaria' },
  { id: 'doceria', nome: 'Doceria' },
  { id: 'japonesa', nome: 'Japonesa' },
  { id: 'fastfood', nome: 'Fast-food' },
  { id: 'saudavel', nome: 'Saudável' },
  { id: 'italiana', nome: 'Italiana' },
  { id: 'churrascaria', nome: 'Churrascaria' },
  { id: 'pizzaria', nome: 'Pizzaria' }
]

const MAPA_NOMES = {
  todos: 'Todos os Estabelecimentos',
  cafe: 'Cafeterias & Cafés',
  padaria: 'Padarias & Pães Artesanais',
  doceria: 'Docerias & Açaís',
  japonesa: 'Culinária Japonesa & Sushis',
  fastfood: 'Fast-Food & Lanches',
  saudavel: 'Comida Saudável & Regional',
  italiana: 'Culinária Italiana & Massas',
  churrascaria: 'Churrascarias & Carnes Nobres',
  pizzaria: 'Pizzarias Artesanais'
}

export default function Categoria({ parametros }) {
  const [filtros, setFiltros] = useState({})
  const [restaurantes, setRestaurantes] = useState([])
  const [carregando, setCarregando] = useState(true)

  // Extrai o parâmetro da rota (ex: 'doceria' ou 'busca?q=...')
  const parametroBruto = parametros && parametros[0] ? decodeURIComponent(parametros[0]) : 'todos'
  
  let categoriaAtual = parametroBruto
  let termoBusca = ''

  if (parametroBruto.startsWith('busca')) {
    categoriaAtual = 'busca'
    const matchBusca = parametroBruto.match(/q=([^&]*)/)
    if (matchBusca) {
      termoBusca = decodeURIComponent(matchBusca[1])
    }
  }

  const carregarRestaurantes = useCallback(async () => {
    setCarregando(true)
    try {
      const params = new URLSearchParams()
      
      if (categoriaAtual !== 'todos' && categoriaAtual !== 'busca') {
        params.append('categorias', categoriaAtual)
      }

      if (termoBusca) {
        params.append('q', termoBusca)
      }

      if (filtros.precoMin) params.append('preco_min', filtros.precoMin)
      if (filtros.precoMax) params.append('preco_max', filtros.precoMax)
      if (filtros.distMax) params.append('raio_km', filtros.distMax)

      const url = `/estabelecimentos?${params.toString()}`
      const resposta = await api.get(url, false)
      setRestaurantes(resposta.dados || [])
    } catch (err) {
      console.error('Erro ao carregar restaurantes:', err)
      setRestaurantes([])
    } finally {
      setCarregando(false)
    }
  }, [categoriaAtual, termoBusca, filtros])

  useEffect(() => {
    carregarRestaurantes()
  }, [carregarRestaurantes])

  const tituloExibicao = categoriaAtual === 'busca'
    ? `Resultados para "${termoBusca}"`
    : (MAPA_NOMES[categoriaAtual] || categoriaAtual)

  return (
    <div className="bg-begeGlobal min-h-screen pb-16">
      {/* Barra de Filtros no topo */}
      <FiltrosBar filtros={filtros} aoMudar={setFiltros} />

      <div className="max-w-7xl mx-auto px-6 py-8 text-azulMarinho">
        {/* Navegação de volta */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <button 
            onClick={() => navegarPara('/principal')} 
            className="font-bold text-base hover:text-vermelho transition-colors flex items-center gap-2 bg-white/70 backdrop-blur px-4 py-2 rounded-full shadow-sm"
          >
            ← Voltar ao Explorar
          </button>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => navegarPara('/swipe')}
              className="bg-pessegoHeader hover:bg-opacity-80 text-azulMarinho font-bold px-5 py-2 rounded-full shadow-sm text-sm transition-all"
            >
              Arraste no Swipe ⚡
            </button>
            <button 
              onClick={() => navegarPara('/ranking')}
              className="bg-white/80 hover:bg-white text-azulMarinho font-bold px-5 py-2 rounded-full shadow-sm text-sm transition-all"
            >
              Ver Ranking 🏆
            </button>
          </div>
        </div>

        {/* Abas Rápidas de Categorias */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {LISTA_CATEGORIAS.map((cat) => {
            const ativo = categoriaAtual === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => navegarPara(`/categoria/${cat.id}`)}
                className={`px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all shadow-sm ${
                  ativo
                    ? 'bg-azulMarinho text-white shadow-md scale-105'
                    : 'bg-white/80 text-azulMarinho hover:bg-white hover:scale-102'
                }`}
              >
                {cat.nome}
              </button>
            )
          })}
        </div>

        {/* Cabeçalho da Categoria */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black mb-2 text-azulMarinho capitalize">
            {tituloExibicao}
          </h1>
          <p className="text-base md:text-lg opacity-80 font-medium">
            Encontramos <span className="font-bold text-vermelho">{restaurantes.length}</span> restaurante(s) disponível(is) na sua região.
          </p>
        </div>

        {/* Lista de Restaurantes */}
        {carregando ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-pessegoHeader border-t-azulMarinho rounded-full animate-spin"></div>
            <p className="font-bold text-azulMarinho/70">Buscando restaurantes...</p>
          </div>
        ) : restaurantes.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-md rounded-3xl p-12 text-center max-w-xl mx-auto border border-white shadow-sm mt-8">
            <p className="text-5xl mb-4">🍽️</p>
            <h3 className="text-2xl font-bold text-azulMarinho mb-2">Nenhum restaurante encontrado</h3>
            <p className="text-azulMarinho/70 mb-6 font-medium">
              Não encontramos estabelecimentos para esta seleção com os filtros atuais.
            </p>
            <button 
              onClick={() => navegarPara('/categoria/todos')}
              className="btn-primary px-6 py-3 text-sm"
            >
              Ver todos os restaurantes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {restaurantes.map(rest => (
              <div 
                key={rest.id} 
                onClick={() => navegarPara(`/estabelecimento/${rest.id}`)}
                className="bg-white rounded-3xl shadow-sm overflow-hidden hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer border border-transparent hover:border-pessegoHeader flex flex-col group"
              >
                {/* Imagem do Estabelecimento */}
                <div className="h-48 overflow-hidden relative bg-begeInput">
                  <img 
                    src={rest.imagens?.[0] || '/img/food1.jpg'} 
                    alt={rest.nome} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  
                  {/* Badge de Nota */}
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-xs font-black text-azulMarinho shadow-md flex items-center gap-1">
                    ⭐ {rest.media_geral ? rest.media_geral.toFixed(1) : 'Novo'}
                  </div>

                  {/* Badge de Categoria */}
                  <div className="absolute bottom-3 left-3 bg-azulMarinho/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-white shadow-md uppercase tracking-wider">
                    {rest.categoria}
                  </div>
                </div>

                {/* Conteúdo do Card */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-black mb-1 text-azulMarinho group-hover:text-vermelho transition-colors line-clamp-1">
                      {rest.nome}
                    </h3>
                    
                    <p className="text-xs text-azulMarinho/70 mb-3 line-clamp-2">
                      {rest.descricao || 'Excelente opção gastronômica para você aproveitar.'}
                    </p>

                    <div className="flex items-center justify-between text-xs font-bold text-azulMarinho/80 mb-3 bg-begeGlobal/60 p-2.5 rounded-xl">
                      <span className="truncate max-w-[130px]" title={rest.endereco}>
                        📍 {rest.endereco ? rest.endereco.split('–')[0].split(',')[0] : 'Barra do Garças'}
                      </span>
                      <span>💵 R$ {rest.faixa_preco || '15-50'}</span>
                    </div>
                  </div>

                  <div>
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {rest.tags && rest.tags.length > 0 ? (
                        rest.tags.slice(0, 2).map((tag, idx) => (
                          <span key={idx} className="bg-begeInput px-2.5 py-0.5 rounded-full text-[11px] font-bold text-azulMarinho">
                            #{tag}
                          </span>
                        ))
                      ) : (
                        <span className="bg-begeInput px-2.5 py-0.5 rounded-full text-[11px] font-bold text-azulMarinho opacity-60">
                          #Destaque
                        </span>
                      )}
                    </div>

                    {/* Rodapé do Card */}
                    <div className="flex items-center justify-between pt-3 border-t border-begeInput text-xs font-bold">
                      <span className="text-vermelho flex items-center gap-1">
                        ❤️ {rest.likes ?? 0} curtidas
                      </span>
                      <span className="text-azulMarinho group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                        Ver detalhes →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
