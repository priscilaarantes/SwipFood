import React from 'react'

const CATEGORIAS = [
  'pizzaria', 'doceria', 'churrascaria', 'japonesa', 'italiana',
  'fastfood', 'cafe', 'saudavel', 'padaria'
]

const ESTACIONAMENTOS = [
  { valor: 'proprio', rotulo: 'Próprio' },
  { valor: 'convenio', rotulo: 'Convênio' },
  { valor: 'valet', rotulo: 'Valet' },
  { valor: 'nao_possui', rotulo: 'Não possui' }
]

const AREAS_KIDS = [
  { valor: 'sim', rotulo: 'Sim' },
  { valor: 'nao', rotulo: 'Não' },
  { valor: 'monitor', rotulo: 'Com monitor' }
]

const OPCOES_TAGS = [
  'Família', 'Moderno', 'Rústico', 'Romântico', 'Wifi gratuito',
  'Aceita Pix', 'Delivery', 'Bar', 'Rodízio', 'Climatizado'
]

// Barra de filtros combináveis (busca, categoria, preço, estacionamento,
// área kids, tags, distância e ordenação). Cada mudança dispara aoMudar.
export default function FiltrosBar({ filtros, aoMudar }) {
  const atualizar = (campo, valor) => aoMudar({ ...filtros, [campo]: valor })

  const alternarCategoria = (categoria) => {
    const categorias = filtros.categorias.includes(categoria)
      ? filtros.categorias.filter((c) => c !== categoria)
      : [...filtros.categorias, categoria]
    atualizar('categorias', categorias)
  }

  const alternarTag = (tag) => {
    const tags = filtros.tags.includes(tag)
      ? filtros.tags.filter((t) => t !== tag)
      : [...filtros.tags, tag]
    atualizar('tags', tags)
  }

  const chip = (ativo, texto, aoClicar) => (
    <button
      key={texto}
      onClick={aoClicar}
      className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
        ativo
          ? 'bg-red-600 text-white border-red-700'
          : 'bg-white text-escuro border-gray-300 hover:bg-cremeClaro'
      }`}
    >
      {texto}
    </button>
  )

  return (
    <div className="bg-cremeClaro rounded-2xl p-4 shadow-sm space-y-4">
      {/* Busca */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Buscar restaurante, prato ou endereço…"
          value={filtros.busca}
          onChange={(e) => atualizar('busca', e.target.value)}
          className="flex-1 min-w-[220px] px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-600"
        />
        <select
          value={filtros.ordenar_por}
          onChange={(e) => atualizar('ordenar_por', e.target.value)}
          className="px-3 py-2 rounded-full border border-gray-300 bg-white text-sm font-semibold"
        >
          <option value="likes">Mais curtidos</option>
          <option value="media">Melhor nota</option>
          <option value="nome">Nome (A–Z)</option>
        </select>
      </div>

      {/* Categorias */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-bold text-escuro w-24">Categorias</span>
        {CATEGORIAS.map((cat) =>
          chip(filtros.categorias.includes(cat), cat, () => alternarCategoria(cat))
        )}
      </div>

      {/* Faixa de preço */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-bold text-escuro w-24">Preço (R$)</span>
        <input
          type="number"
          min="0"
          placeholder="mín"
          value={filtros.preco_min}
          onChange={(e) => atualizar('preco_min', e.target.value)}
          className="w-20 px-3 py-2 rounded-full border border-gray-300 bg-white text-sm text-center"
        />
        <span className="font-bold">–</span>
        <input
          type="number"
          min="0"
          placeholder="máx"
          value={filtros.preco_max}
          onChange={(e) => atualizar('preco_max', e.target.value)}
          className="w-20 px-3 py-2 rounded-full border border-gray-300 bg-white text-sm text-center"
        />
      </div>

      {/* Estacionamento */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-bold text-escuro w-24">Estacionam.</span>
        {ESTACIONAMENTOS.map((opcao) =>
          chip(filtros.estacionamento === opcao.valor, opcao.rotulo, () =>
            atualizar('estacionamento', filtros.estacionamento === opcao.valor ? '' : opcao.valor)
          )
        )}
        {chip(Boolean(filtros.estacionamento_vigiado), 'Vigiado', () =>
          atualizar('estacionamento_vigiado', !filtros.estacionamento_vigiado)
        )}
      </div>

      {/* Área kids */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-bold text-escuro w-24">Área kids</span>
        {AREAS_KIDS.map((opcao) =>
          chip(filtros.area_kids === opcao.valor, opcao.rotulo, () =>
            atualizar('area_kids', filtros.area_kids === opcao.valor ? '' : opcao.valor)
          )
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-bold text-escuro w-24">Tags</span>
        {OPCOES_TAGS.map((tag) => chip(filtros.tags.includes(tag), tag, () => alternarTag(tag)))}
      </div>

      {/* Distância */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-bold text-escuro w-24">Distância (km)</span>
        <input
          type="number"
          min="1"
          placeholder="raio em km"
          value={filtros.raio_km}
          onChange={(e) => atualizar('raio_km', e.target.value)}
          className="w-28 px-3 py-2 rounded-full border border-gray-300 bg-white text-sm text-center"
        />
        <button
          onClick={() => atualizar('usar_localizacao', !filtros.usar_localizacao)}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
            filtros.usar_localizacao
              ? 'bg-green-600 text-white'
              : 'bg-white text-escuro border border-gray-300'
          }`}
        >
          {filtros.usar_localizacao ? 'Localização ativa' : 'Usar minha localização'}
        </button>
      </div>
    </div>
  )
}
