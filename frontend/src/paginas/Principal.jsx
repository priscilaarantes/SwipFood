import React, { useEffect, useMemo, useState } from 'react'
import { api } from '../utilitarios/api'
import FiltrosBar from '../components/FiltrosBar'
import CardEstabelecimento from '../components/CardEstabelecimento'
import { navegarPara } from '../rota/hashRouter'

const FILTROS_INICIAIS = {
  busca: '',
  categorias: [],
  preco_min: '',
  preco_max: '',
  estacionamento: '',
  estacionamento_vigiado: false,
  area_kids: '',
  tags: [],
  raio_km: '',
  ordenar_por: 'likes',
  usar_localizacao: false
}

// Página principal pós-login: busca, filtros combináveis e grade de restaurantes
export default function Principal() {
  const [filtros, setFiltros] = useState(FILTROS_INICIAIS)
  const [estabelecimentos, setEstabelecimentos] = useState([])
  const [coordenadas, setCoordenadas] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  // Quando o usuário ativa a localização, captura as coordenadas do navegador
  useEffect(() => {
    if (filtros.usar_localizacao && !coordenadas && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (posicao) => setCoordenadas({ latitude: posicao.coords.latitude, longitude: posicao.coords.longitude }),
        () => setErro('Não foi possível obter sua localização.')
      )
    }
    if (!filtros.usar_localizacao) setCoordenadas(null)
  }, [filtros.usar_localizacao])

  // Monta a query string com os filtros combináveis
  const montarParametros = useMemo(() => {
    const parametros = new URLSearchParams()
    if (filtros.busca) parametros.set('q', filtros.busca)
    if (filtros.categorias.length > 0) parametros.set('categorias', filtros.categorias.join(','))
    if (filtros.preco_min !== '') parametros.set('preco_min', filtros.preco_min)
    if (filtros.preco_max !== '') parametros.set('preco_max', filtros.preco_max)
    if (filtros.estacionamento) parametros.set('estacionamento', filtros.estacionamento)
    if (filtros.estacionamento_vigiado) parametros.set('estacionamento_vigiado', '1')
    if (filtros.area_kids) parametros.set('area_kids', filtros.area_kids)
    if (filtros.tags.length > 0) parametros.set('tags', filtros.tags.join(','))
    if (filtros.raio_km !== '' && coordenadas) {
      parametros.set('raio_km', filtros.raio_km)
      parametros.set('latitude', coordenadas.latitude)
      parametros.set('longitude', coordenadas.longitude)
    }
    parametros.set('ordenar_por', filtros.ordenar_por)
    return parametros.toString()
  }, [filtros, coordenadas])

  // Busca os estabelecimentos sempre que os filtros mudam
  useEffect(() => {
    const buscar = async () => {
      setCarregando(true)
      setErro('')
      try {
        const dados = await api.get(`/estabelecimentos?${montarParametros}`)
        setEstabelecimentos(dados.dados)
      } catch {
        setErro('Não foi possível carregar os estabelecimentos.')
      } finally {
        setCarregando(false)
      }
    }
    buscar()
  }, [montarParametros])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Chamada + botão de match */}
      <section className="bg-escuro rounded-3xl p-8 text-white text-center mb-8">
        <h2 className="text-3xl font-black">Encontre o restaurante perfeito</h2>
        <p className="opacity-90 mt-2">
          Filtre por preço, categoria, estacionamento e muito mais — depois descubra
          qual lugar combina com você.
        </p>
        <button
          onClick={() => navegarPara('/swipe')}
          className="mt-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-lg px-10 py-4 rounded-full shadow-lg animate-pulse"
        >
          ⭐ Começar o Match
          <span className="block text-xs font-normal opacity-80 mt-1">arraste e descubra lugares novos</span>
        </button>
      </section>

      {/* Barra de filtros */}
      <FiltrosBar filtros={filtros} aoMudar={setFiltros} />

      {/* Grade de estabelecimentos */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-2xl font-bold text-escuro">Restaurantes encontrados</h3>
          <span className="text-sm font-semibold text-gray-600">{estabelecimentos.length} resultado(s)</span>
        </div>

        {erro && <p className="text-red-600 font-semibold mb-4">{erro}</p>}

        {carregando ? (
          <p className="text-escuro font-semibold animate-pulse">Carregando estabelecimentos…</p>
        ) : estabelecimentos.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow">
            <p className="text-2xl">🍽️</p>
            <p className="text-escuro font-bold mt-2">Nenhum restaurante encontrado</p>
            <p className="text-gray-500 text-sm mt-1">Tente ajustar ou remover alguns filtros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {estabelecimentos.map((estabelecimento) => (
              <CardEstabelecimento key={estabelecimento.id} estabelecimento={estabelecimento} mostrarMedia />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
