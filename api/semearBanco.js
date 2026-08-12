const banco = require('./src/config/conexaoBanco')

// Coordenadas base do centro de Barra do Garças - MT (projeto regional)
const BASE_LAT = -15.8904
const BASE_LON = -52.259

// Lista de restaurantes de exemplo migrados do protótipo (codigolegado)
const estabelecimentos = [
  {
    nome: 'Ponto do Açaí', categoria: 'doceria', descricao: 'Açaí com apenas um clique!',
    endereco: 'Av. das Palmeiras, 120 – Barra do Garças/MT',
    latitude: BASE_LAT + 0.0012, longitude: BASE_LON - 0.0008,
    faixa_preco: '15-25', preco_min: 15, preco_max: 25,
    capacidade_pessoas: 40, tipo_assento: 'cadeira',
    estacionamento: 'proprio', estacionamento_vigiado: 1, area_kids: 'sim',
    tags: ['Aceita Pix', 'Todas as idades', 'Família'], likes: 230,
    imagens: ['/img/acaiadd.jpg', '/img/acaicopo.jpg', '/img/barcaacai.jpg', '/img/tacaacai.jpg', '/img/acaifruta.jpg', '/img/acaibanmgran.jpg'],
    telefone: '(66) 99255-9886', whatsapp: 'https://wa.me/5566992559886',
    link_ifood: 'https://www.ifood.com.br', link_maps: 'https://maps.google.com/?q=Barra+do+Gar%C3%A7as'
  },
  {
    nome: 'Kanoa Bar & Grill', categoria: 'churrascaria', descricao: 'Os melhores cortes e o melhor churrasco da cidade!',
    endereco: 'Av. Cristóvão Colombo, 890 – Barra do Garças/MT',
    latitude: BASE_LAT - 0.0021, longitude: BASE_LON + 0.0015,
    faixa_preco: '150-250', preco_min: 150, preco_max: 250,
    capacidade_pessoas: 120, tipo_assento: 'misto',
    estacionamento: 'valet', estacionamento_vigiado: 1, area_kids: 'monitor',
    tags: ['Wifi gratuito', 'Aceita Pix', 'Bar'], likes: 250,
    imagens: ['/img/kanoabar.jpg'],
    telefone: '(66) 3412-5656', whatsapp: 'https://wa.me/556634125656',
    link_ifood: 'https://www.ifood.com.br', link_maps: 'https://maps.google.com/?q=Barra+do+Gar%C3%A7as'
  },
  {
    nome: 'Lótus Sushi', categoria: 'japonesa', descricao: 'Peixes frescos e sabor incrível.',
    endereco: 'Rua Marechal Rondon, 45 – Barra do Garças/MT',
    latitude: BASE_LAT + 0.0004, longitude: BASE_LON - 0.0011,
    faixa_preco: '100-200', preco_min: 100, preco_max: 200,
    capacidade_pessoas: 60, tipo_assento: 'banquetas',
    estacionamento: 'convenio', estacionamento_vigiado: 0, area_kids: 'nao',
    tags: ['Wifi gratuito', 'Aberto Agora', 'Moderno'], likes: 310,
    imagens: ['/img/lotus.webp'],
    telefone: '(66) 3411-2020', whatsapp: 'https://wa.me/556634112020',
    link_ifood: 'https://www.ifood.com.br', link_maps: 'https://maps.google.com/?q=Barra+do+Gar%C3%A7as'
  },
  {
    nome: 'Italian Pizzaria', categoria: 'pizzaria', descricao: 'Sabores especiais todos os dias.',
    endereco: 'Av. Minas Gerais, 300 – Barra do Garças/MT',
    latitude: BASE_LAT - 0.0015, longitude: BASE_LON - 0.0002,
    faixa_preco: '50-80', preco_min: 50, preco_max: 80,
    capacidade_pessoas: 80, tipo_assento: 'cadeira',
    estacionamento: 'proprio', estacionamento_vigiado: 0, area_kids: 'monitor',
    tags: ['Aceita Pix', 'Espaçoso', 'Família'], likes: 198,
    imagens: ['/img/italian.jpg'],
    telefone: '(66) 3414-3030', whatsapp: 'https://wa.me/556634143030',
    link_ifood: 'https://www.ifood.com.br', link_maps: 'https://maps.google.com/?q=Barra+do+Gar%C3%A7as'
  },
  {
    nome: 'Di Matteo', categoria: 'doceria', descricao: 'Açaí gourmet com um sabor especial.',
    endereco: 'Rua Rui Barbosa, 77 – Barra do Garças/MT',
    latitude: BASE_LAT + 0.0032, longitude: BASE_LON + 0.0018,
    faixa_preco: '15-25', preco_min: 15, preco_max: 25,
    capacidade_pessoas: 35, tipo_assento: 'sofa',
    estacionamento: 'nao_possui', estacionamento_vigiado: 0, area_kids: 'sim',
    tags: ['Climatizado', 'Aceita cartão', 'Romântico'], likes: 195,
    imagens: ['/img/dimatteo.jpg'],
    telefone: '(66) 3416-4040', whatsapp: 'https://wa.me/556634164040',
    link_ifood: 'https://www.ifood.com.br', link_maps: 'https://maps.google.com/?q=Barra+do+Gar%C3%A7as'
  },
  {
    nome: 'La Cabana', categoria: 'pizzaria', descricao: 'Buffet à vontade todos os dias.',
    endereco: 'Av. São Sebastião, 500 – Barra do Garças/MT',
    latitude: BASE_LAT - 0.0038, longitude: BASE_LON + 0.0009,
    faixa_preco: '100-200', preco_min: 100, preco_max: 200,
    capacidade_pessoas: 150, tipo_assento: 'misto',
    estacionamento: 'proprio', estacionamento_vigiado: 1, area_kids: 'sim',
    tags: ['Wifi gratuito', 'Aberto Agora', 'Família'], likes: 328,
    imagens: ['/img/la-cabana.webp'],
    telefone: '(66) 3410-1010', whatsapp: 'https://wa.me/556634101010',
    link_ifood: 'https://www.ifood.com.br', link_maps: 'https://maps.google.com/?q=Barra+do+Gar%C3%A7as'
  },
  {
    nome: 'Itália no Box', categoria: 'italiana', descricao: 'Massa fresca e saborosa.',
    endereco: 'Rua 13 de Maio, 210 – Barra do Garças/MT',
    latitude: BASE_LAT + 0.0017, longitude: BASE_LON + 0.0021,
    faixa_preco: '30-60', preco_min: 30, preco_max: 60,
    capacidade_pessoas: 55, tipo_assento: 'banquetas',
    estacionamento: 'convenio', estacionamento_vigiado: 0, area_kids: 'nao',
    tags: ['Todas as idades', 'Espaçoso', 'Rústico'], likes: 156,
    imagens: ['/img/italianobox.webp'],
    telefone: '(66) 3413-6060', whatsapp: 'https://wa.me/556634136060',
    link_ifood: 'https://www.ifood.com.br', link_maps: 'https://maps.google.com/?q=Barra+do+Gar%C3%A7as'
  },
  {
    nome: 'Sushi House', categoria: 'japonesa', descricao: 'Rodízio com desconto nos dias de semana.',
    endereco: 'Av. Argentina, 15 – Barra do Garças/MT',
    latitude: BASE_LAT + 0.0025, longitude: BASE_LON - 0.0017,
    faixa_preco: '60-120', preco_min: 60, preco_max: 120,
    capacidade_pessoas: 70, tipo_assento: 'cadeira',
    estacionamento: 'proprio', estacionamento_vigiado: 1, area_kids: 'nao',
    tags: ['Rodízio', 'Aceita Pix', 'Japonesa'], likes: 180,
    imagens: ['/img/sushi.jpg'],
    telefone: '(66) 3417-7070', whatsapp: 'https://wa.me/556634177070',
    link_ifood: 'https://www.ifood.com.br', link_maps: 'https://maps.google.com/?q=Barra+do+Gar%C3%A7as'
  },
  {
    nome: 'Bar do João', categoria: 'fastfood', descricao: 'Show ao vivo hoje — venha curtir!',
    endereco: 'Praça da República, 8 – Barra do Garças/MT',
    latitude: BASE_LAT - 0.0006, longitude: BASE_LON + 0.0024,
    faixa_preco: '10-30', preco_min: 10, preco_max: 30,
    capacidade_pessoas: 90, tipo_assento: 'banquetas',
    estacionamento: 'nao_possui', estacionamento_vigiado: 0, area_kids: 'sim',
    tags: ['Show ao vivo', 'Bar', 'Animado'], likes: 210,
    imagens: ['/img/bar.jpg'],
    telefone: '(66) 3418-8080', whatsapp: 'https://wa.me/556634188080',
    link_ifood: 'https://www.ifood.com.br', link_maps: 'https://maps.google.com/?q=Barra+do+Gar%C3%A7as'
  },
  {
    nome: 'Café Central', categoria: 'cafe', descricao: 'Ambiente aconchegante para todas as horas.',
    endereco: 'Rua Coronel, Jr. 112 – Barra do Garças/MT',
    latitude: BASE_LAT + 0.0009, longitude: BASE_LON - 0.0005,
    faixa_preco: '10-30', preco_min: 10, preco_max: 30,
    capacidade_pessoas: 30, tipo_assento: 'sofa',
    estacionamento: 'nao_possui', estacionamento_vigiado: 0, area_kids: 'nao',
    tags: ['Tranquilo', 'Wifi gratuito', 'Rústico'], likes: 240,
    imagens: ['/img/cafe.jpg'],
    telefone: '(66) 3419-9090', whatsapp: 'https://wa.me/556634199090',
    link_ifood: 'https://www.ifood.com.br', link_maps: 'https://maps.google.com/?q=Barra+do+Gar%C3%A7as'
  },
  {
    nome: 'Trattoria Bella', categoria: 'italiana', descricao: 'Massa artesanal feita na casa.',
    endereco: 'Rua Bolívar, 65 – Barra do Garças/MT',
    latitude: BASE_LAT - 0.0012, longitude: BASE_LON - 0.0013,
    faixa_preco: '40-90', preco_min: 40, preco_max: 90,
    capacidade_pessoas: 50, tipo_assento: 'cadeira',
    estacionamento: 'convenio', estacionamento_vigiado: 0, area_kids: 'sim',
    tags: ['Massa artesanal', 'Romântico', 'Italiana'], likes: 220,
    imagens: ['/img/pasta.jpg'],
    telefone: '(66) 3420-1010', whatsapp: 'https://wa.me/556634201010',
    link_ifood: 'https://www.ifood.com.br', link_maps: 'https://maps.google.com/?q=Barra+do+Gar%C3%A7as'
  },
  {
    nome: 'Pizzaria Napoli', categoria: 'pizzaria', descricao: 'Rodízio de pizzas com 40 sabores.',
    endereco: 'Av. São Paulo, 700 – Barra do Garças/MT',
    latitude: BASE_LAT + 0.0029, longitude: BASE_LON + 0.0011,
    faixa_preco: '30-70', preco_min: 30, preco_max: 70,
    capacidade_pessoas: 100, tipo_assento: 'misto',
    estacionamento: 'proprio', estacionamento_vigiado: 1, area_kids: 'monitor',
    tags: ['Rodízio', 'Família', 'Pizza'], likes: 175,
    imagens: ['/img/pizza.jpg'],
    telefone: '(66) 3421-2020', whatsapp: 'https://wa.me/556634212020',
    link_ifood: 'https://www.ifood.com.br', link_maps: 'https://maps.google.com/?q=Barra+do+Gar%C3%A7as'
  },
  {
    nome: 'The Best Açaí', categoria: 'doceria', descricao: 'Açaí self-service com mais de 40 acompanhamentos.',
    endereco: 'Rua Marechal Deodoro, 33 – Barra do Garças/MT',
    latitude: BASE_LAT + 0.0041, longitude: BASE_LON - 0.0022,
    faixa_preco: '10-25', preco_min: 10, preco_max: 25,
    capacidade_pessoas: 45, tipo_assento: 'cadeira',
    estacionamento: 'proprio', estacionamento_vigiado: 0, area_kids: 'sim',
    tags: ['Self-service', 'Aceita Pix', 'Família'], likes: 260,
    imagens: ['/img/acaifruta.jpg', '/img/acaimorango.jpg'],
    telefone: '(66) 3422-3030', whatsapp: 'https://wa.me/556634223030',
    link_ifood: 'https://www.ifood.com.br', link_maps: 'https://maps.google.com/?q=Barra+do+Gar%C3%A7as'
  },
  {
    nome: 'Açaí Fly Quiosque', categoria: 'doceria', descricao: 'Ótimo ambiente aberto. Aceita Pix e cartões.',
    endereco: 'Orla do Rio Araguaia – Barra do Garças/MT',
    latitude: BASE_LAT - 0.0045, longitude: BASE_LON + 0.0028,
    faixa_preco: '10-20', preco_min: 10, preco_max: 20,
    capacidade_pessoas: 25, tipo_assento: 'banquetas',
    estacionamento: 'nao_possui', estacionamento_vigiado: 0, area_kids: 'sim',
    tags: ['Ambiente aberto', 'Aceita Pix', 'Verão'], likes: 190,
    imagens: ['/img/acaicopo.jpg'],
    telefone: '(66) 3423-4040', whatsapp: 'https://wa.me/556634234040',
    link_ifood: 'https://www.ifood.com.br', link_maps: 'https://maps.google.com/?q=Barra+do+Gar%C3%A7as'
  },
  {
    nome: 'Rei do Açaí', categoria: 'doceria', descricao: 'Famoso pela barca de 1 litro!',
    endereco: 'Av. Getúlio Vargas, 410 – Barra do Garças/MT',
    latitude: BASE_LAT + 0.0014, longitude: BASE_LON + 0.0032,
    faixa_preco: '15-35', preco_min: 15, preco_max: 35,
    capacidade_pessoas: 60, tipo_assento: 'misto',
    estacionamento: 'convenio', estacionamento_vigiado: 0, area_kids: 'sim',
    tags: ['Barca 1L', 'Delivery', 'Família'], likes: 205,
    imagens: ['/img/barcaacai.jpg'],
    telefone: '(66) 3424-5050', whatsapp: 'https://wa.me/556634245050',
    link_ifood: 'https://www.ifood.com.br', link_maps: 'https://maps.google.com/?q=Barra+do+Gar%C3%A7as'
  },
  {
    nome: 'Creme Mania', categoria: 'doceria', descricao: 'Especialidade: Creme de Ninho e Cupuaçu.',
    endereco: 'Rua das Flores, 99 – Barra do Garças/MT',
    latitude: BASE_LAT + 0.0036, longitude: BASE_LON - 0.0019,
    faixa_preco: '15-25', preco_min: 15, preco_max: 25,
    capacidade_pessoas: 30, tipo_assento: 'sofa',
    estacionamento: 'nao_possui', estacionamento_vigiado: 0, area_kids: 'sim',
    tags: ['Creme de Ninho', 'Cupuaçu', 'Doce'], likes: 165,
    imagens: ['/img/acaininho.jpg', '/img/acainutella.jpg'],
    telefone: '(66) 3425-6060', whatsapp: 'https://wa.me/556634256060',
    link_ifood: 'https://www.ifood.com.br', link_maps: 'https://maps.google.com/?q=Barra+do+Gar%C3%A7as'
  },
  {
    nome: 'Açaí Concept', categoria: 'doceria', descricao: 'Franquia reconhecida. Opções zero açúcar.',
    endereco: 'Av. Catarinense, 250 – Barra do Garças/MT',
    latitude: BASE_LAT - 0.0026, longitude: BASE_LON - 0.0029,
    faixa_preco: '20-40', preco_min: 20, preco_max: 40,
    capacidade_pessoas: 50, tipo_assento: 'cadeira',
    estacionamento: 'proprio', estacionamento_vigiado: 1, area_kids: 'nao',
    tags: ['Zero açúcar', 'Moderno', 'Delivery'], likes: 145,
    imagens: ['/img/acaibanmgran.jpg'],
    telefone: '(66) 3426-7070', whatsapp: 'https://wa.me/556634267070',
    link_ifood: 'https://www.ifood.com.br', link_maps: 'https://maps.google.com/?q=Barra+do+Gar%C3%A7as'
  },
  {
    nome: 'Casa Original — Comida regional', categoria: 'saudavel', descricao: 'Comida mineira e regional todos os dias.',
    endereco: 'Rua Boa Vista, 180 – Barra do Garças/MT',
    latitude: BASE_LAT + 0.0019, longitude: BASE_LON - 0.0009,
    faixa_preco: '20-50', preco_min: 20, preco_max: 50,
    capacidade_pessoas: 65, tipo_assento: 'misto',
    estacionamento: 'proprio', estacionamento_vigiado: 0, area_kids: 'sim',
    tags: ['Comida regional', 'Família', 'Rústico'], likes: 200,
    imagens: ['/img/food1.jpg'],
    telefone: '(66) 3427-8080', whatsapp: 'https://wa.me/556634278080',
    link_ifood: 'https://www.ifood.com.br', link_maps: 'https://maps.google.com/?q=Barra+do+Gar%C3%A7as'
  },
  {
    nome: 'Padaria Bom Pão', categoria: 'padaria', descricao: 'Pães artesanais e café da manhã completo.',
    endereco: 'Av. Tocantins, 95 – Barra do Garças/MT',
    latitude: BASE_LAT - 0.0018, longitude: BASE_LON + 0.0012,
    faixa_preco: '5-25', preco_min: 5, preco_max: 25,
    capacidade_pessoas: 20, tipo_assento: 'cadeira',
    estacionamento: 'nao_possui', estacionamento_vigiado: 0, area_kids: 'sim',
    tags: ['Pães artesanais', 'Café da manhã', 'Família'], likes: 130,
    imagens: ['/img/food1.jpg'],
    telefone: '(66) 3428-9090', whatsapp: 'https://wa.me/556634289090',
    link_ifood: 'https://www.ifood.com.br', link_maps: 'https://maps.google.com/?q=Barra+do+Gar%C3%A7as'
  },
  {
    nome: 'Burguer do Zé', categoria: 'fastfood', descricao: 'Hambúrguer artesanal com batata rústica.',
    endereco: 'Rua 24 de Outubro, 55 – Barra do Garças/MT',
    latitude: BASE_LAT + 0.0022, longitude: BASE_LON + 0.0006,
    faixa_preco: '15-40', preco_min: 15, preco_max: 40,
    capacidade_pessoas: 40, tipo_assento: 'banquetas',
    estacionamento: 'nao_possui', estacionamento_vigiado: 0, area_kids: 'sim',
    tags: ['Hambúrguer', 'Aceita Pix', 'Jovem'], likes: 188,
    imagens: ['/img/food1.jpg'],
    telefone: '(66) 3429-1111', whatsapp: 'https://wa.me/556634291111',
    link_ifood: 'https://www.ifood.com.br', link_maps: 'https://maps.google.com/?q=Barra+do+Gar%C3%A7as'
  }
]

// Semeadura idempotente: só insere se a tabela estiver vazia
function semear() {
  const quantidade = banco.prepare('SELECT COUNT(*) AS total FROM estabelecimentos').get().total
  if (quantidade > 0) {
    console.log(`Seed ignorado: já existem ${quantidade} estabelecimentos.`)
    return
  }

  const inserir = banco.prepare(`
    INSERT INTO estabelecimentos (
      nome, categoria, descricao, endereco, latitude, longitude,
      faixa_preco, preco_min, preco_max, capacidade_pessoas, tipo_assento,
      estacionamento, estacionamento_vigiado, area_kids, tags, imagens,
      telefone, link_ifood, whatsapp, link_maps, likes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const transacao = banco.transaction(() => {
    for (const estabelecimento of estabelecimentos) {
      inserir.run(
        estabelecimento.nome, estabelecimento.categoria, estabelecimento.descricao,
        estabelecimento.endereco, estabelecimento.latitude, estabelecimento.longitude,
        estabelecimento.faixa_preco, estabelecimento.preco_min, estabelecimento.preco_max,
        estabelecimento.capacidade_pessoas, estabelecimento.tipo_assento,
        estabelecimento.estacionamento, estabelecimento.estacionamento_vigiado,
        estabelecimento.area_kids,
        JSON.stringify(estabelecimento.tags), JSON.stringify(estabelecimento.imagens),
        estabelecimento.telefone, estabelecimento.link_ifood, estabelecimento.whatsapp,
        estabelecimento.link_maps, estabelecimento.likes
      )
    }
  })

  transacao()
  console.log(`Seed concluído: ${estabelecimentos.length} estabelecimentos inseridos.`)
}

module.exports = semear