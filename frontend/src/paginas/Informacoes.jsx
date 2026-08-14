import React, { useCallback, useEffect, useState } from 'react'
import { api, ErroApi } from '../utilitarios/api'
import Estrelas from '../components/Estrelas'
import { useAuth } from '../contexto/AuthContext'
import { navegarPara } from '../rota/hashRouter'

// Notas obrigatórias (alta prioridade) e opcionais definidas pelo backend
const CAMPOS_OBRIGATORIOS = [
  { chave: 'limpeza_local', rotulo: 'Limpeza do local' },
  { chave: 'manuseio_alimentos', rotulo: 'Manuseio dos alimentos' },
  { chave: 'custo_beneficio', rotulo: 'Custo-benefício' },
  { chave: 'limpeza_geral', rotulo: 'Limpeza geral' },
  { chave: 'velocidade_atendimento', rotulo: 'Velocidade do atendimento' },
  { chave: 'cordialidade', rotulo: 'Cordialidade' }
]

const CAMPOS_OPCIONAIS = [
  { chave: 'odor_ambiente', rotulo: 'Odor do ambiente' },
  { chave: 'iluminacao', rotulo: 'Iluminação' },
  { chave: 'seguranca_entorno', rotulo: 'Segurança do entorno' }
]

const MEDIAS_LABEL = {
  media_limpeza: 'Limpeza',
  media_manuseio: 'Manuseio',
  media_custo: 'Custo-benefício',
  media_atendimento: 'Atendimento'
}

// Converte um arquivo selecionado para data-url (base64)
function arquivoParaBase64(arquivo) {
  return new Promise((resolver, rejeitar) => {
    const leitor = new FileReader()
    leitor.onload = () => resolver(leitor.result)
    leitor.onerror = () => rejeitar(new Error('Falha ao ler a imagem.'))
    leitor.readAsDataURL(arquivo)
  })
}

// Página de detalhes de um estabelecimento: galeria, tags, médias e avaliação
export default function Informacoes({ parametros }) {
  const id = Number(parametros[0])
  const { usuario } = useAuth()

  const [estabelecimento, setEstabelecimento] = useState(null)
  const [avaliacoes, setAvaliacoes] = useState([])
  const [minhaAvaliacao, setMinhaAvaliacao] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [notas, setNotas] = useState({})
  const [comentario, setComentario] = useState('')
  const [fotos, setFotos] = useState([])
  const [mensagem, setMensagem] = useState('')
  const [enviando, setEnviando] = useState(false)

  const carregar = useCallback(async () => {
    try {
      const [detalhe, lista] = await Promise.all([
        api.get(`/estabelecimentos/${id}`, true),
        api.get(`/estabelecimentos/${id}/avaliacoes`)
      ])
      setEstabelecimento(detalhe.dados)
      setMinhaAvaliacao(detalhe.minha_avaliacao)
      setAvaliacoes(lista.dados)
      if (detalhe.minha_avaliacao) {
        setNotas({
          limpeza_local: detalhe.minha_avaliacao.limpeza_local,
          manuseio_alimentos: detalhe.minha_avaliacao.manuseio_alimentos,
          odor_ambiente: detalhe.minha_avaliacao.odor_ambiente,
          custo_beneficio: detalhe.minha_avaliacao.custo_beneficio,
          limpeza_geral: detalhe.minha_avaliacao.limpeza_geral,
          iluminacao: detalhe.minha_avaliacao.iluminacao,
          velocidade_atendimento: detalhe.minha_avaliacao.velocidade_atendimento,
          cordialidade: detalhe.minha_avaliacao.cordialidade,
          seguranca_entorno: detalhe.minha_avaliacao.seguranca_entorno
        })
        setComentario(detalhe.minha_avaliacao.comentario || '')
      }
    } catch {
      setErro('Não foi possível carregar as informações.')
    } finally {
      setCarregando(false)
    }
  }, [id])

  useEffect(() => {
    carregar()
  }, [carregar])

  // Adiciona fotos selecionadas (valida tipo e tamanho de até 500 KB por foto)
  const adicionarFotos = async (evento) => {
    const arquivos = Array.from(evento.target.files || [])
    const novas = []
    for (const arquivo of arquivos) {
      if (!/image\/(jpeg|png|webp)/.test(arquivo.type)) {
        setMensagem('Apenas imagens JPEG, PNG ou WEBP são permitidas.')
        continue
      }
      if (arquivo.size > 500 * 1024) {
        setMensagem('Cada foto deve ter no máximo 500 KB.')
        continue
      }
      const base64 = await arquivoParaBase64(arquivo)
      novas.push(base64)
    }
    setFotos((atual) => [...atual, ...novas].slice(0, 4))
  }

  const definirNota = (chave, valor) => setNotas((atual) => ({ ...atual, [chave]: valor }))

  const enviarAvaliacao = async (evento) => {
    evento.preventDefault()
    setMensagem('')

    if (!usuario) {
      navegarPara('/login')
      return
    }

    // Garante que as notas obrigatórias foram preenchidas (RNF máx 8 obrigatórios)
    for (const campo of CAMPOS_OBRIGATORIOS) {
      if (notas[campo.chave] === undefined || notas[campo.chave] === null) {
        setMensagem(`Informe a nota de "${campo.rotulo}".`)
        return
      }
    }

    const corpo = { comentario, fotos }
    for (const campo of [...CAMPOS_OBRIGATORIOS, ...CAMPOS_OPCIONAIS]) {
      if (notas[campo.chave] !== undefined && notas[campo.chave] !== null) corpo[campo.chave] = notas[campo.chave]
    }

    setEnviando(true)
    try {
      await api.post(`/estabelecimentos/${id}/avaliacoes`, corpo, true)
      setMensagem('')
      await carregar()
    } catch (e) {
      if (e instanceof ErroApi && e.erros && e.erros.length > 0) {
        setMensagem(e.erros[0])
      } else if (e instanceof ErroApi) {
        setMensagem(e.message)
      } else {
        setMensagem('Erro ao enviar a avaliação.')
      }
    } finally {
      setEnviando(false)
    }
  }

  if (carregando) {
    return <p className="text-center text-escuro font-semibold mt-20 animate-pulse">Carregando…</p>
  }

  if (erro || !estabelecimento) {
    return <p className="text-center text-red-600 font-semibold mt-20">{erro || 'Não encontrado.'}</p>
  }

  const infos = [
    { rotulo: 'Faixa de preço', valor: estabelecimento.faixa_preco ? `R$ ${estabelecimento.faixa_preco}` : null },
    { rotulo: 'Capacidade', valor: estabelecimento.capacidade_pessoas ? `${estabelecimento.capacidade_pessoas} pessoas` : null },
    { rotulo: 'Tipo de assento', valor: estabelecimento.tipo_assento },
    { rotulo: 'Estacionamento', valor: estabelecimento.estacionamento?.replace('_', ' ') },
    { rotulo: 'Estacionamento vigiado', valor: estabelecimento.estacionamento_vigiado ? 'Sim' : 'Não' },
    { rotulo: 'Área kids', valor: estabelecimento.area_kids }
  ].filter((info) => info.valor)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button onClick={() => navegarPara('/principal')} className="text-sm font-bold text-escuro hover:underline">
        ← Voltar
      </button>

      {/* Cabeçalho */}
      <div className="mt-4 bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <div>
            <h1 className="text-3xl font-black text-escuro">{estabelecimento.nome}</h1>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mt-1">
              {estabelecimento.categoria}
            </p>
            <p className="text-gray-600 mt-3">{estabelecimento.descricao}</p>

            {estabelecimento.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {estabelecimento.tags.map((tag) => (
                  <span key={tag} className="bg-cremeClaro text-escuro text-xs font-bold px-3 py-1 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Médias das avaliações */}
            {estabelecimento.total_avaliacoes > 0 && (
              <div className="mt-5 bg-creme/40 rounded-2xl p-4">
                <p className="font-bold text-escuro text-sm">
                  Média geral: {estabelecimento.media_geral} ({estabelecimento.total_avaliacoes} avaliações)
                </p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {Object.entries(MEDIAS_LABEL).map(([chave, rotulo]) =>
                    estabelecimento[chave] != null ? (
                      <p key={chave} className="text-xs text-gray-700">
                        <span className="font-semibold">{rotulo}:</span> {estabelecimento[chave]}
                      </p>
                    ) : null
                  )}
                </div>
              </div>
            )}

            {/* Informações de infraestrutura */}
            <div className="flex flex-wrap gap-3 mt-5">
              {infos.map((info) => (
                <span key={info.rotulo} className="bg-white border border-gray-200 text-escuro text-xs font-bold px-3 py-1.5 rounded-full">
                  {info.rotulo}: {String(info.valor).replace(/_/g, ' ')}
                </span>
              ))}
            </div>

            {/* Botões externos */}
            <div className="flex flex-wrap gap-3 mt-5">
              {estabelecimento.link_ifood && (
                <a href={estabelecimento.link_ifood} target="_blank" rel="noreferrer" className="bg-escuro text-white text-xs font-bold px-4 py-2 rounded-full">
                  Veja no iFood
                </a>
              )}
              {estabelecimento.whatsapp && (
                <a href={estabelecimento.whatsapp} target="_blank" rel="noreferrer" className="bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-full">
                  WhatsApp
                </a>
              )}
              {estabelecimento.link_maps && (
                <a href={estabelecimento.link_maps} target="_blank" rel="noreferrer" className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-full">
                  Veja no Google Maps
                </a>
              )}
            </div>
          </div>

          {/* Galeria */}
          <div>
            <img
              src={estabelecimento.imagens?.[0] || '/img/food1.jpg'}
              alt={estabelecimento.nome}
              className="w-full h-56 object-cover rounded-2xl shadow"
            />
            {estabelecimento.imagens?.length > 1 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {estabelecimento.imagens.slice(1, 4).map((imagem, indice) => (
                  <img
                    key={`${imagem}-${indice}`}
                    src={imagem}
                    alt={`${estabelecimento.nome} ${indice + 2}`}
                    className="w-full h-20 object-cover rounded-xl shadow"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Formulário de avaliação */}
      <div className="mt-8 bg-white rounded-3xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-escuro mb-1">Avalie este restaurante</h2>
        <p className="text-sm text-gray-500">
          {minhaAvaliacao
            ? 'Você já avaliou este estabelecimento. Sua nota abaixo.'
            : 'Suas notas ajudam outros usuários (e o ranking) a encontrar os melhores lugares!'}
        </p>

        {!usuario ? (
          <p className="mt-4 bg-creme/40 rounded-xl p-4 text-center text-sm font-semibold text-escuro">
            Você precisa estar logado para avaliar.{' '}
            <a href="#/login" className="text-red-600 underline">Entrar</a>
          </p>
        ) : (
          <form onSubmit={enviarAvaliacao} className="mt-5 space-y-4">
            {mensagem && (
              <p className="bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 py-2 rounded-lg">
                {mensagem}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...CAMPOS_OBRIGATORIOS, ...CAMPOS_OPCIONAIS].map((campo) => (
                <div key={campo.chave} className="flex items-center justify-between bg-cremeClaro rounded-xl px-4 py-3">
                  <span className="text-sm font-semibold text-escuro">
                    {campo.rotulo}
                    {CAMPOS_OBRIGATORIOS.includes(campo) && <span className="text-red-600"> *</span>}
                  </span>
                  <Estrelas nota={notas[campo.chave] || 0} aoMudar={(v) => definirNota(campo.chave, v)} somenteLeitura={Boolean(minhaAvaliacao)} />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-semibold text-escuro mb-1">Comentário (opcional)</label>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows="3"
                maxLength="1000"
                placeholder="Conte sua experiência…"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-escuro mb-1">
                Fotos (até 4, máx 500 KB cada)
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={adicionarFotos}
                className="block w-full text-sm text-gray-600 file:mr-4 file:px-4 file:py-2 file:rounded-full file:border-0 file:bg-escuro file:text-white"
              />
              {fotos.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {fotos.map((foto, indice) => (
                    <div key={indice} className="relative">
                      <img src={foto} alt={`Foto ${indice + 1}`} className="w-16 h-16 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => setFotos((atual) => atual.filter((_, i) => i !== indice))}
                        className="absolute -top-2 -right-2 bg-red-600 text-white w-5 h-5 rounded-full text-xs font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={enviando || Boolean(minhaAvaliacao)}
              className={`w-full sm:w-auto px-8 py-3 rounded-full font-bold transition-colors ${
                minhaAvaliacao
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {enviando ? 'Enviando…' : minhaAvaliacao ? 'Avaliação já enviada' : 'Enviar avaliação'}
            </button>
          </form>
        )}
      </div>

      {/* Lista de avaliações */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-escuro mb-4">Avaliações de outros usuários</h2>
        {avaliacoes.length === 0 ? (
          <p className="text-gray-500">Nenhuma avaliação ainda. Seja a primeira pessoa a avaliar!</p>
        ) : (
          <div className="space-y-4">
            {avaliacoes.map((avaliacao) => (
              <div key={avaliacao.id} className="bg-white rounded-2xl shadow p-5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-escuro">{avaliacao.nome_usuario}</span>
                  <span className="text-xs text-gray-500">{avaliacao.criado_em}</span>
                </div>
                <Estrelas nota={avaliacao.limpeza_local || 0} somenteLeitura tamanho="text-sm" />
                {avaliacao.comentario && <p className="text-gray-600 text-sm mt-2">{avaliacao.comentario}</p>}
                {avaliacao.fotos?.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {avaliacao.fotos.map((foto, indice) => (
                      <img key={indice} src={foto} alt="Avaliação" className="w-14 h-14 object-cover rounded-lg" />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
