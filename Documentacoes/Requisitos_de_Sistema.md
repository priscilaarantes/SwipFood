-> Legenda:
  - F: (Requisito) Funcional
  - NF: (Requisito) Não Funcional

01) Para encontrar boa comida:
  - Permitir avaliação com nota de 0 a 5 para "Limpeza do local" e "Manuseio dos alimentos" - **Alta Prioridade | F** 
  - Sistema de avaliação numérica (de 0 a 5) + campo opcional para texto descritivo - **Alta Prioridade | F** 
  - Exibir faixa de preço (ex.: R$ 10–30, R$ 30–60, +60) e permitir filtro por essa faixa - **Alta Prioridade | F**
  - Incluir no checklist de avaliação um atributo "Odor do ambiente/comida" (0 a 5) - **Baixa Prioridade | F**
  - Permitir upload de fotos dos pratos (com validação de formato e tamanho) - **Média Prioridade | F**
  - Adicionar campo "Relação custo-benefício" (nota de 0 a 5) na avaliação. - **Alta Prioridade | F**

02) Para encontrar locais agradáveis:
  - Cadastrar "Capacidade de pessoas" e "Tipo de assento" (cadeira, sofá, banquetas) - **Média Prioridade | F**
  - Adicionar opção binária (Sim/Não) no cadastro do restaurante - **Baixa Prioridade | NF**
  - Nota específica de 0 a 5 para "Limpeza geral" nas avaliações - **Alta Prioridade | F**
  - Checklist de avaliação com nota para "Iluminação" (de 0 a 5) - **Baixa Prioridade | F**
  - Campo de tags (ex.: "Rústico", "Moderno", "Família", "Romântico") para filtro - **Baixa Prioridade | F**
  - Nota de 0 a 5 para "Velocidade" e "Cordialidade" (ou uma nota única de atendimento) - **Alta Prioridade | F**
  - Integração com API de mapas (Google/OpenStreetMap) para exibir distância e endereço - **Alta Prioridade | F**
  - Cadastrar opções: "Próprio", "Convênio", "Valet", "Não possui" - **Alta Prioridade | F**
  - Cadastrar: "Sim", "Não" ou "Área kids com monitor" - **Alta Prioridade | F**
  - Adicionar nota de 0 a 5 para "Segurança do entorno" + opção de "Estacionamento vigiado". - **Média Prioridade | F**

-> Os demais atributos (odor, iluminação, cozinha transparente, etc.) podem vir como campos extras, mas sem obrigatoriedade. - **Baixa Prioridade | F**

Requisitos de Sistema Diversos:
  - Usabilidade: O formulário de avaliação deve ter no máximo 8 campos obrigatórios (para não cansar o usuário) - **Média Prioridade | NF**
  - Disponibilidade: O sistema deve ficar no ar na maior parte do tempo, ainda mais em horário de almoço/jantar (11h–15h e 19h–23h) - **Alta Prioridade | NF**
  - Segurança: As avaliações só podem ser feitas por usuários autenticados (para evitar reviews falsas) - **Alta Prioridade | NF**
  - Banco de dados: Armazenar histórico de avaliações para calcular médias das "notas" - **Alta Prioridade | NF**
  - Filtros: Todos os filtros (preço, estacionamento, espaço infantil) devem ser combináveis entre si. - **Alta Prioridade | NF**
