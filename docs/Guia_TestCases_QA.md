# Guia de Test Cases QA

> **Versão:** 1.0 (alinhado ao prompt v11)  
> **Público:** Testers, QA Analysts e Automatizadores  
> **Documentos relacionados:** *Manual de Processo QA* (fluxo operacional e script); *Guia de Instalação Python* (setup do ambiente)

---

## Sumário

1. [Objetivo dos Test Cases](#1-objetivo-dos-test-cases)
2. [Ciclo de Testes por Sprint](#2-ciclo-de-testes-por-sprint)
3. [Registro dos Testes Manuais](#3-registro-dos-testes-manuais)
4. [Reuso de Steps — `reuse_id`](#4-reuso-de-steps--reuse_id)
5. [Estratégia de Automação 80/20](#5-estratégia-de-automação-8020)
6. [Checklist de Insights (Pré-TC)](#6-checklist-de-insights-pré-tc)
7. [Como o Claude Gera os TCs — Referência Completa](#7-como-o-claude-gera-os-tcs--referência-completa)
8. [Estratégia de Regressão por Camadas](#8-estratégia-de-regressão-por-camadas)

---

## 1. Objetivo dos Test Cases

Os Test Cases (TCs) têm como objetivo guiar os **Testers/QA** na execução de testes funcionais em aplicações **mobile e web** desenvolvidas em **React** e **.NET Core**. Cada TC documenta cenários de teste estruturados em steps sequenciais, cobrindo desde o caminho feliz até edge cases, validações de campo e permissões por perfil de acesso.

Além do teste manual, os TCs também definem a **estratégia de automação**, servindo como base para que o **Automatizador Cypress** construa a suíte de testes regressivos.

---

## 2. Ciclo de Testes por Sprint

O processo de testes segue um ciclo contínuo entre sprints:

```
Sprint N          →    Sprint N+1        →    Sprint N+2
─────────────────      ───────────────────    ──────────────────
Testes manuais         Automatiza Sprint N    Regressivo Sprint N
das entregas N    +    Testes manuais    +    Automatiza Sprint N+1
                       das entregas N+1  +    Testes manuais
                                              das entregas N+2 ...
```

Em cada sprint, o time executa **três atividades em paralelo**:

1. **Testes manuais funcionais** das funcionalidades entregues na sprint corrente
2. **Criação dos testes automatizados** (Cypress) das funcionalidades entregues na sprint anterior, seguindo a estratégia documentada nos TCs
3. **Execução regressiva** de toda a suíte já automatizada, garantindo que entregas anteriores não tenham sido quebradas

---

## 3. Registro dos Testes Manuais

Durante a execução dos testes manuais, os Testers registram os resultados em uma **coluna de data** (última coluna do controle em Excel):

| Situação | O que é registrado |
|---|---|
| TC criado, ainda não executado | Coluna vazia |
| Step executado com sucesso | Data da execução (ex: `15/04/2025`) |
| Step executado com falha | Número do ticket de acompanhamento (ex: `BUG-1234`), substituindo o X |

Essa abordagem permite rastrear tanto a cobertura de testes quanto os defeitos encontrados, mantendo o histórico vinculado ao TC correspondente.

---

## 4. Reuso de Steps — `reuse_id`

### O que é o Reuso

O campo **`Reuse *`** (coluna G na planilha, campo `reuse_id` no JSON) é um mecanismo de marcação e referência que evita reescrever os mesmos steps em múltiplos cenários. Ele funciona em dois papéis complementares dentro do mesmo campo.

---

### Como funciona na prática

#### Papel 1 — Marcar um bloco reutilizável

Quando um conjunto de steps pode ser executado por outros cenários, cada step do bloco recebe o mesmo marcador (ex: `*1`). O marcador é definido na primeira vez que aparece, e o `scenario_title` do TC de origem documenta o que ele representa.

**Exemplo — TC_CLT_001, steps 1 e 2 marcados como `*1`:**

| ID | TC Name | ... | Reuse \* | Scenario (what will be validated) |
|---|---|---|---|---|
| 1 | TC_CLT_001 | ... | | Lista de Clientes — Estado inicial ... `[*1] steps 1–2: login + navegar até Clientes` |
| | | | `*1` | Acesse o sistema com o usuário LiV (liv_user1). |
| | | | `*1` | No menu principal, clique em 'Clientes'. A tela deve ser exibida. |
| | | | | Verifique que o grid é exibido com os clientes cadastrados... |

Os dois primeiros steps foram marcados com `*1`. Qualquer outro TC que precise fazer login e navegar até Clientes pode referenciar esse bloco em vez de reescrever os steps.

---

#### Papel 2 — Referenciar um bloco marcado

Quando um cenário precisa executar um bloco já marcado em outro TC, escreve **um único step** apontando para o bloco. Não reescreve os steps — apenas os referencia.

**Exemplo — TC_CLT_002 referenciando o bloco `*1` do TC_CLT_001:**

| ID | TC Name | ... | Reuse \* | Scenario (what will be validated) |
|---|---|---|---|---|
| 2 | TC_CLT_002 | ... | | Busca Rápida — Por Nome / Razão Social |
| | | | `*1` | Execute os passos indicados com [\*1] do TC_CLT_001 para acessar a tela de Consulta de Clientes. |
| | | | | Verifique que o campo 'Buscar' está vazio e com o placeholder visível. |
| | | | | Digite 'Cypress 1' no campo... |

O Tester que executar TC_CLT_002 vai ao TC_CLT_001, executa os steps marcados com `*1` (login + navegar até Clientes), e depois volta para continuar o TC_CLT_002.

---

### Regras de uso

**Use `reuse_id` quando:**
- O mesmo bloco de 2 ou mais steps se repetiria em múltiplos cenários
- O fluxo é de outro TC (ex: login, navegação padrão, abertura de um registro específico)

**Não use `reuse_id` quando:**
- É um step único e simples — reuso de um step só adiciona complexidade sem ganho
- O step é pontual e não se repete em outros TCs

**Importante:** o `reuse_id` é exclusivamente para reuso de **fluxo de execução de steps**. Referências a dados fixos (registros pré-criados, usuários de teste) ficam no campo **Estratégia de Automatização** e nos **Pré-Requisitos** — não no `reuse_id`.

---

### Exemplo com três blocos reutilizáveis

No conjunto de TCs de Clientes, foram definidos três blocos:

| Marcador | TC de origem | Steps marcados | O que representa |
|---|---|---|---|
| `*1` | TC_CLT_001 | 1 e 2 | Login com `liv_user1` + navegar até Consulta de Clientes |
| `*2` | TC_CLT_015 | 1 e 2 | Executar `*1` + clicar em 'Novo cliente' (abre criação) |
| `*3` | TC_CLT_026 | 1 e 2 | Executar `*1` + clicar em 'Cliente Cypress 1 Ltda' (abre edição) |

Dessa forma, um TC de edição que precise abrir 'Cliente Cypress 1 Ltda' simplesmente escreve:

> *"Execute os passos indicados com [\*3] do TC_CLT_026 para abrir 'Cliente Cypress 1 Ltda' em modo edição."*

E o Tester sabe exatamente o que fazer sem precisar que os steps sejam repetidos.


---

## 5. Estratégia de Automação 80/20

A estratégia de automação segue o princípio 80/20: automatizar os cenários de **maior impacto e maior frequência de regressão** — principalmente buscas e gravações — sem tentar cobrir 100% dos cenários manualmente.

### Decisão de automação por step

O **Tester/QA** é responsável por decidir quais steps serão automatizados, marcando um `X` nas colunas de ambiente correspondentes (`dev_qa` e/ou `hom_prod`) diretamente no TC. Essa decisão é tomada considerando viabilidade técnica e custo-benefício.

**Automatizamos:**
- Login com usuários fixos de teste
- Navegação entre telas
- Buscas e pesquisas com dados pré-criados e resultados determinísticos
- Edição e gravação de registros pré-existentes
- Validações de campo (obrigatórios, formatos inválidos, duplicidade)
- Verificação de dados carregados corretamente
- Verificação de resultados em grids e formulários

**Não automatizamos:**
- Criação de conta pelo próprio usuário (signup) — gera dados desnecessários na base
- Upload de imagem ou captura por webcam — sem suporte prático no Cypress
- Troca de idioma/cultura (ES-ES, EN-US) — custo alto de automação para o retorno
- Steps puramente visuais (cor, layout, ícones) — fora do escopo do Cypress
- Fluxos de convite e ativação de usuários — setup manual referenciado via `reuse_id`

### Estratégia de dados para automação

A automação é construída sobre **registros pré-criados** diretamente pelo Tester/QA através da interface do sistema, e não por inserção direta no banco. Isso garante que os dados estejam no estado correto e que o fluxo de cadastro também seja exercitado.

O Automatizador então:
1. **Pesquisa** os registros pré-criados (validando o fluxo de busca)
2. **Edita e salva** esses registros (validando o fluxo de gravação)

Essa abordagem cobre o 80/20 de forma limpa: busca + gravação em dados controlados e conhecidos.

O **campo `strategy`** de cada step documentado é o briefing para o Automatizador. Ele descreve:
- O dado exato a ser informado na tela
- O registro pré-criado alvo (nome, CPF, e-mail, etc.)
- O resultado esperado após a ação

**Exemplo de strategy bem preenchida:**
> `"Informar: PacienteCypress2@teste.com, deve carregar somente 'Paciente Cypress 2'"`

Para cenários que exigem dados únicos por execução (ex: criação de novo registro), usa-se **timestamp** como parte do dado:
> `"Criar nome usando data e hora atual: '20022025111115', email '20022025111115@teste.com'"`

**Inserção direta de registros** é uma exceção usada apenas em situações críticas onde não é possível pré-criar o dado via interface. É evitada sempre que possível pois polui a base de testes com dados gerados a cada execução.

---

## 6. Checklist de Insights (Pré-TC)

Antes de começar a escrever os TCs de uma feature, o QA percorre um **checklist de insights** — uma lista de pontos que servem como guia mental para garantir que nenhuma dimensão relevante de teste seja esquecida.

O checklist **não faz parte do TC** e não aparece na saída JSON. Ele é usado apenas na fase de planejamento, como uma ferramenta de reflexão do QA antes da escrita. Cobre dimensões como:

- Layout e prototipagem
- Limites de entrada e tipos de dados aceitos
- Campos obrigatórios (em bloco e gradativamente)
- Formatos de data por cultura (PT-BR, ES-ES, EN-US)
- Mensagens de sucesso e erro
- Regras de duplicidade
- Estado da tela ao entrar e sair
- Permissões por perfil de acesso
- Traduções (PT, EN, ES)
- Responsividade (mobile e web em diferentes resoluções)
- Campos com cascata de dependência
- Botões de ação contextuais
- Filtros de abrangência/escopo
- E outros itens específicos identificados por feature

---


## 7. Como o Claude Gera os TCs — Referência Completa

Esta seção documenta as regras, perguntas de esclarecimento, boas práticas e checklists que o Claude segue ao gerar os TCs. É a referência técnica para o QA entender o que o prompt produz e por quê.

---

### Recebimento de Especificações Funcionais

#### Spec única vs. múltiplas specs

O QA pode enviar **uma ou mais especificações funcionais** em formato `.md`. Quando mais de uma for enviada:

1. **Leia todas antes de fazer qualquer pergunta** — analise o conjunto completo para identificar relações e dependências
2. **Mapeie as integrações**: identifique quais features compartilham telas ou dados, e quais TCs de uma feature dependem de outra para configurar seu estado inicial
3. **Relate o que encontrou nas perguntas de esclarecimento**: informe ao QA as dependências cruzadas identificadas e confirme se estão corretas antes de gerar

#### Regra de rastreabilidade — campo `feature`

O campo `feature` deve sempre conter o **título exato da especificação funcional** que originou o TC — copiado literalmente do cabeçalho do `.md` recebido. Isso garante rastreabilidade direta entre o TC e a spec de origem, sem necessidade de de-para manual.

> **Regra absoluta:** `feature` = título da spec. Nunca renomeie, abrevie ou adapte.

| Situação | Como preencher `feature` |
|---|---|
| Spec recebida se chama `"Consulta de Clientes"` | `"Consulta de Clientes"` — exatamente como está no título |
| Spec recebida se chama `"Cadastro e Edição de Clientes"` | `"Cadastro e Edição de Clientes"` — sem simplificar para "Manter Clientes" |
| Duas specs distintas para a mesma área | Cada TC usa o título da spec que o gerou |
| TC de setup que pertence a uma spec | Usa o título da spec que contém aquele fluxo |

**Na pergunta de esclarecimento sobre Feature e Módulo**, não proponha nomes alternativos — apenas confirme com o QA o título exato de cada spec recebida, o nome do módulo e o código de 3 letras do módulo.

#### Regra sobre dados de protótipos

Specs e protótipos frequentemente contêm dados demonstrativos (nomes, CNPJs, e-mails, telefones parcialmente mascarados). Esses dados **nunca devem ser usados como resposta** nas perguntas de esclarecimento — servem apenas como referência visual de layout e campos existentes.

> **Regra:** ao identificar registros em imagens ou protótipos, mencione **apenas que a tela sugere a existência de registros com determinados campos** e peça ao QA os valores reais do ambiente. Nunca pré-preencha a pergunta com dados extraídos do protótipo como se fossem os dados de teste confirmados.

#### Dependência cruzada entre features

Quando um TC de uma feature depende de outra feature para funcionar (ex: testar "Agendamento" requer um "Paciente" cadastrado):

- Indique no `scenario_title` as features envolvidas: `"[Feature A + Feature B]"`
- Mencione a dependência nos pré-requisitos ou em um step de contexto explícito
- Use `reuse_id` para referenciar o TC da feature dependente quando o fluxo de setup já estiver documentado

---

#### Definição de Módulo

**Módulo** é uma área funcional ampla e autônoma do sistema, com propósito de negócio coeso, que agrupa múltiplas features relacionadas. Geralmente corresponde a uma entrada no menu principal ou a um domínio de negócio independente.

**Critérios para pertencer ao mesmo módulo:**
- Compartilha o mesmo domínio de dados central (ex: todas as features operam sobre "Clientes")
- As features se complementam para cobrir um ciclo funcional completo (consultar, criar, editar, filtrar)
- Tem um ponto de entrada único no sistema (item de menu, rota base)

**Critérios para quebrar em módulos separados:**
- O domínio de dados muda completamente (Clientes ≠ Usuários ≠ Agendamentos)
- O ciclo de negócio é distinto, mesmo que haja integração entre os módulos
- Features acessam menus ou rotas distintas no sistema

**Código do módulo (`module_code`):** cada módulo recebe um código de 3 letras maiúsculas, definido pelo QA nas respostas de esclarecimento. Exemplos: `CLT` = Clientes, `USR` = Usuários, `AGD` = Agendamentos. O código é fixo e único no sistema — usado na composição do `tc_name`.

---

### TC Registry — Controle do Sequencial Global

O `id` e o `tc_name` dos TCs são **sequenciais globais** — continuam de onde a última geração parou, independentemente do módulo ou da sessão. Para manter essa sequência, o processo usa um **TC Registry**: um arquivo de mapeamento que lista todos os TCs já gerados no sistema.

#### Como funciona

**Ao gerar TCs:** junto com o JSON de TCs, o modelo gera um `TCRegistry_{MODULE_CODE}.json` contendo somente os TCs desta geração. O QA cola essas entradas no `TCRegistry_Global.json` manualmente.

**Na próxima geração:** o QA fornece o `TCRegistry_Global.json` (ou apenas o campo `last_global_id`) junto com as specs. O modelo lê o `last_global_id` e inicia a numeração a partir de `last_global_id + 1`.

#### Regras obrigatórias

- **Sempre pergunte** no Passo 1: "Qual é o `last_global_id` atual? Você tem o TCRegistry_Global.json para compartilhar?"
- Se o QA não fornecer: assuma `last_global_id: 0` e gere a partir de `id: 1` — e avise que o QA deve verificar antes de usar em produção
- O `TCRegistry_{MODULE_CODE}.json` é gerado **sempre**, mesmo que sejam poucos TCs

#### Estrutura do TCRegistry

```json
{
  "last_global_id": 33,
  "last_tc_name": "TC_CLT_033",
  "entries": [
    {
      "id": 1,
      "tc_name": "TC_CLT_001",
      "module": "Clientes",
      "module_code": "CLT",
      "feature": "Consulta de Clientes",
      "flow": "Lista de Clientes",
      "scenario_title": "Lista de Clientes — Estado inicial e exibição do grid"
    }
  ]
}
```

> O campo `scenario_title` no registry deve ser a **primeira linha** do título (sem as linhas de usuário de acesso), para facilitar leitura na lista global.

---

### Modo de Operação — Geração Inicial vs. Atualização de Módulo

Antes de iniciar qualquer fluxo, identifique em qual modo você está operando:

| Sinal recebido | Modo |
|---|---|
| Apenas spec(s) `.md` + Registry global | **Modo A — Geração Inicial** |
| Spec `.md` atualizada + JSON existente do módulo + Registry global | **Modo B — Atualização de Módulo** |

> Se o QA enviar um JSON de TCs existentes do módulo junto com a spec, você está **obrigatoriamente** no Modo B. Não trate a spec como se fosse uma geração do zero.

#### Modo B — Atualização de Módulo Existente

No Modo B, o processo preserva IDs e `tc_name` existentes. Antes de qualquer pergunta, o modelo indexa o JSON existente e classifica cada TC em uma de três categorias:

| Categoria | Critério | O que fazer |
|---|---|---|
| **Preservado sem mudança** | O cenário ainda existe na nova spec e o comportamento não mudou | Mantém todos os campos intactos; `"status": "ativo"` permanece |
| **Atualizado** | O cenário existe mas o comportamento mudou | Mantém `id` e `tc_name`; atualiza steps e `feature` para o título da nova spec |
| **Obsoleto** | O cenário não existe mais na nova spec | Mantém `id` e `tc_name`; altera `"status"` para `"obsoleto"`; prefixa `scenario_title` com `[OBSOLETO - {motivo}]` |

Cenários novos recebem IDs a partir de `last_global_id + 1`.

**Regras absolutas no Modo B:**
- **Nunca renumere um TC existente.** `id` e `tc_name` atribuídos são permanentes — mesmo obsoletos.
- **Nunca delete um TC do JSON.** TCs obsoletos permanecem com `status: "obsoleto"`. A remoção quebra rastreabilidade e referências de `reuse_id`.
- **`status` é sempre explícito.** Todo TC carrega `"status": "ativo"` ou `"status": "obsoleto"`. Nunca omita o campo.
- **O `feature` de um TC atualizado usa o título da nova spec.** TCs preservados sem mudança não têm `feature` alterado.

**Saídas do Modo B:**
1. **`TestCases_{MODULE_CODE}_v{N}.json`** — JSON completo do módulo (preservados + atualizados + obsoletos + novos)
2. **`TCRegistry_{MODULE_CODE}_delta.json`** — apenas os TCs novos desta atualização, para mesclar no Registry global
3. **Relatório de atualização** com as quatro categorias: preservados, atualizados, obsoletos e novos

---

Ao receber uma ou mais especificações funcionais em `.md`, siga **sempre** este fluxo em 3 passos:

#### Passo 1 — Leitura e Perguntas de Esclarecimento

Leia todos os `.md` recebidos e, **antes de gerar qualquer test case**, faça ao QA as perguntas abaixo. Adapte e adicione perguntas conforme o que as specs deixarem em aberto.

1. **Feature, Módulo e Código do Módulo** — Confirme: (a) o título exato de cada spec recebida para uso no campo `feature`; (b) o nome do módulo (`module`); (c) o código de 3 letras do módulo (`module_code`) para compor o `tc_name`. Ex: Clientes → `CLT`.
2. **Flows** — Quais agrupamentos de cenários (flows) você identifica? Há flows não explícitos, como fluxos de acesso por perfil?
3. **Integrações identificadas** — Relate as dependências cruzadas que você encontrou entre as specs. Estão corretas? Há outras não mencionadas?
4. **Perfis de acesso** — Quais perfis serão testados? Cada perfil tem comportamento diferente na tela?
5. **Registros pré-criados (âncoras de dados)** — Quais registros fixos já existem no ambiente de testes? Para cada registro, forneça os valores concretos de todos os campos relevantes — **não use os dados do protótipo como resposta**, pois são dados demonstrativos. Forneça os valores reais do ambiente.
   > **Atenção — discriminação de dados:** verifique se os valores dos campos usados em buscas parciais (LIKE) são **mutuamente exclusivos entre os registros**. Um valor do Registro A não deve ser substring do valor do Registro B — caso contrário, uma busca parcial retornará ambos quando o esperado é retornar apenas um. Se identificar esse problema, sinalize antes de gerar os TCs e sugira valores alternativos mutuamente exclusivos.
   > **Atenção — CPF e CNPJ nos registros pré-criados:** se algum registro exigir CPF ou CNPJ, forneça os números já validados — não serão gerados automaticamente. O sistema aplica validação de dígito verificador e um número inválido quebra o ambiente de testes silenciosamente.

5a. **Sublistas ou seções com estado em memória** — A spec descreve alguma seção da tela onde o usuário pode adicionar, editar ou remover itens de uma lista *antes* de clicar em "Salvar" na tela principal? Se sim, confirme: as operações nessa sublista são mantidas em memória até o Salvar principal, ou cada item é salvo individualmente? Essa informação define quais TCs de comportamento em memória precisam ser gerados.

6. **Usuários fixos de teste** — Quais usuários estão disponíveis por ambiente? (ex: `owner1`, `profissional3`)
7. **Pré-requisitos** — Há condições necessárias antes de iniciar os testes? (licença, configurações de conta, etc.)
8. **Regras de negócio implícitas** — Há regras não explícitas na spec que impactam os cenários?
9. **Reuso externo** — Há fluxos de outros TCs referenciados via `reuse_id`? Qual é o TC de origem e qual o marcador (`*1`, `*2`, etc.)?
10. **Ambientes** — Confirme que os ambientes de automação são `dev_qa` e `hom_prod`. Há exceções para esta feature?
11. **Sequencial global (TC Registry)** — Qual é o `last_global_id` atual? Você tem o `TCRegistry_Global.json` para compartilhar? Se não tiver, confirme se devo iniciar do zero (id: 1).

12. **Estratégia de regressão por camadas** *(sem perguntas ao QA — decisões tomadas automaticamente na geração)*

O modelo elege e documenta nos próprios TCs:
- **TC Smoke por flow:** eleito pelo critério de maior impacto em caso de falha. Para flows de Cadastro/Criação, o candidato natural é o TC de tentativa de gravação bloqueada por validação (ex: salvar com campos obrigatórios vazios), pois prova abertura da tela + resposta do sistema sem persistência em `hom_prod`.
- **TC de Restauração de Âncora (guardião de escrita do módulo em `hom_prod`):** eleito automaticamente seguindo esta ordem de prioridade de campo a reverter: ✅ campo de texto livre obrigatório (ex: Nome, Descrição) → ❌ evitar campos únicos (CNPJ, CPF) → ❌ evitar campos com cascata (Status, Tipo) → ❌ evitar campos de data.
- Se o módulo for somente leitura (sem criação nem edição), o TC de Restauração de Âncora não é necessário.

**Perguntas condicionais — faça apenas se a spec incluir as funcionalidades correspondentes:**

13. **Busca e filtros** *(se a spec descrever campos de busca ou painel de filtros)*
    - Ao carregar a tela, o grid exibe registros automaticamente ou permanece vazio aguardando uma busca? Se exibe automaticamente, há filtro pré-aplicado por padrão (ex: status = Ativo)?
    - Campos de texto livre substituem espaços por `%` antes de executar o LIKE?
    - O filtro usa lógica **AND** ou **OR** entre campos quando mais de um está preenchido?
    - Os filtros são **persistidos** ao navegar para outra tela e retornar, ou são **resetados**?
    - Qual é o texto exato da mensagem exibida quando nenhum registro é encontrado?

14. **Dados únicos** *(se a spec descrever criação ou edição de registros)*
    - Quais campos são únicos no sistema? Para cada campo único: a validação ocorre só na criação, ou também na edição?

15. **Campos não editáveis após o primeiro salvamento** *(se a spec descrever edição de registros)*
    - Existem campos que, após gravados, não podem mais ser alterados? Para cada um, confirme como é exibido no modo edição: **(a)** label / texto simples — o campo não existe como input; **(b)** input desabilitado — o campo existe como input mas está bloqueado (visual cinza).

**Aguarde as respostas antes de prosseguir.**

---

#### Passo 2 — Geração dos Test Cases em JSON

Com base nas respostas, gere dois arquivos:

1. **`TestCases_{MODULE_CODE}.json`** — o JSON completo dos TCs seguindo todas as regras deste prompt
2. **`TCRegistry_{MODULE_CODE}.json`** — o arquivo de registro desta geração, no formato definido na seção "TC Registry", para o QA mesclar no registro global

---

#### Passo 3 — Sugestões de Melhoria do Checklist

Ao final, fora do JSON, liste sugestões de novos itens para o checklist de insights, no formato:

```
### Sugestões de Melhoria do Checklist

- [Novo item sugerido]
  Motivo: [situação específica da spec que não está coberta pelo checklist atual]
```

Só sugira itens genuinamente novos — não cobertos pelo checklist vigente.

---

#### Passo 4 — Sugestões de Ajustes na Especificação

Ao final, após o Passo 3, liste gaps, ambiguidades ou inconsistências identificados na especificação funcional durante a geração dos TCs. O objetivo é devolver ao time de produto e desenvolvimento informações que podem melhorar a qualidade da spec antes da implementação ou da próxima sprint.

Formato:

```
### Sugestões de Ajustes na Especificação

- **[Título curto do ponto]**
  Contexto: [qual parte da spec originou a observação]
  Observação: [o que está ausente, ambíguo ou inconsistente]
  Sugestão: [como poderia ser resolvido ou documentado]
```

| Tipo | Exemplos |
|---|---|
| **Comportamento não especificado** | A spec não define o que acontece quando X ocorre |
| **Regra implícita não documentada** | O TC precisou de uma regra que não está na spec |
| **Inconsistência entre seções** | Duas partes da spec descrevem o mesmo comportamento de forma diferente |
| **Campo ou fluxo sem especificação completa** | A spec menciona um campo mas não define obrigatoriedade, formato ou comportamento de edição |
| **Critério de aceitação ausente** | Um fluxo foi descrito mas sem critério verificável de sucesso ou falha |
| **Ambiguidade que exigiu suposição** | O modelo precisou assumir algo não documentado — a suposição deve ser explicitada para validação |

> Inclua apenas observações genuínas identificadas durante a geração. Se a spec estiver completa e sem ambiguidades, escreva: "Nenhuma observação identificada."

---

### Checklist de Insights (Uso Interno)

Use este checklist como **guia de cobertura** durante a geração dos TCs. Garanta que cada item aplicável à feature esteja representado em pelo menos um step de algum TC. **Não inclua o checklist na saída JSON.**

```json
[
  {
    "order": 1,
    "text": "Verificar layout de acordo com os protótipos — não precisa ser 100% igual, mas elementos principais, hierarquia visual e posicionamento devem estar corretos"
  },
  {
    "order": 2,
    "text": "Verificar limite máximo de entrada: testar o campo com o número máximo de caracteres permitido pelo banco (ex: nome com 255 chars). O sistema deve aceitar e salvar corretamente. Testar também um caractere acima do limite — o campo deve truncar ou bloquear a entrada"
  },
  {
    "order": 3,
    "text": "Verificar tipo de dado aceito como entrada: campos de número não devem aceitar letras, campos com máscara devem aplicá-la em tempo real, campos de texto livre não devem aceitar apenas espaços em branco"
  },
  {
    "order": 4,
    "text": "Verificar formato de data conforme a cultura do usuário logado: PT-BR e ES-ES usam DD/MM/AAAA; EN-US usa MM/DD/YYYY. Testar em cada cultura disponível no sistema"
  },
  {
    "order": 5,
    "text": "Verificar campos obrigatórios em bloco: tentar salvar/buscar com todos os campos vazios. O sistema deve bloquear e exibir mensagem indicando todos os campos obrigatórios pendentes"
  },
  {
    "order": 6,
    "text": "Verificar campos obrigatórios gradativamente: preencher um campo por vez e tentar salvar a cada preenchimento. A mensagem de erro deve indicar apenas os campos ainda não preenchidos, diminuindo a cada iteração"
  },
  {
    "order": 7,
    "text": "Verificar loading e bloqueio de operações simultâneas: ao salvar, buscar ou carregar dados com dependências, o sistema deve exibir indicador de progresso e bloquear ações adicionais até a conclusão"
  },
  {
    "order": 8,
    "text": "Verificar mensagem de sucesso: toda operação bem-sucedida (salvar, atualizar, excluir) deve exibir feedback visual claro ao usuário"
  },
  {
    "order": 9,
    "text": "Verificar mensagem de erro: toda operação com falha (campo inválido, dado duplicado, erro de servidor) deve exibir mensagem de erro específica e compreensível"
  },
  {
    "order": 10,
    "text": "Verificar dados críticos não editáveis na edição: campos que não podem ser alterados devem ser exibidos como label (somente leitura), não como input editável"
  },
  {
    "order": 11,
    "text": "Verificar regras de duplicidade: tentar inserir um registro com os mesmos dados únicos de um já existente. Validar também na edição: alterar um registro para que seus dados únicos colidam com outro existente"
  },
  {
    "order": 12,
    "text": "Verificar estado da tela ao entrar e sair: ao sair e retornar à tela, dados de uma operação anterior não devem persistir. Campos devem estar limpos ou com valores padrão"
  },
  {
    "order": 13,
    "text": "Verificar botão Voltar/Cancelar: ao clicar em Voltar ou Cancelar durante preenchimento de formulário, o sistema deve direcionar para a tela anterior correta sem salvar os dados. Se houver alterações não salvas, idealmente deve perguntar ao usuário antes de descartar"
  },
  {
    "order": 14,
    "text": "Verificar permissões por perfil de acesso: para cada perfil relevante, validar quais menus estão disponíveis, se a tela abre em modo leitura ou edição, e quais elementos (botões, campos, abas) estão visíveis ou ocultos"
  },
  {
    "order": 15,
    "text": "Verificar bloqueios por regras de negócio: validar restrições de acesso baseadas na situação da conta (licença, plano, status do usuário) ou em regras específicas do domínio (ex: Discente só vê pacientes autorizados)"
  },
  {
    "order": 16,
    "text": "Validar tradução em EN: todos os textos visíveis na tela (labels, placeholders, botões, mensagens de erro e sucesso) devem estar corretamente traduzidos"
  },
  {
    "order": 17,
    "text": "Validar tradução em ES: idem ao item 16 para o idioma espanhol"
  },
  {
    "order": 18,
    "text": "Validar tradução em PT: idem ao item 16 para o idioma português"
  },
  {
    "order": 19,
    "text": "Validar responsividade mobile: a tela deve ser utilizável em dispositivos móveis, respeitando configurações comuns de acessibilidade (tamanho de fonte, espaçamento entre elementos tocáveis)"
  },
  {
    "order": 20,
    "text": "Validar responsividade web — baixa resolução (até 767px): tablets, iPads e PCs com resolução baixa"
  },
  {
    "order": 21,
    "text": "Validar responsividade web — média resolução (até 1024px): tablets e iPads em modo retrato ou PCs"
  },
  {
    "order": 22,
    "text": "Validar responsividade web — desktop (1280px ou mais): telas maiores"
  },
  {
    "order": 23,
    "text": "Verificar campos com busca automática ou auto-complete (ex: CEP preenchendo endereço, selects com busca): ao informar o dado de entrada, o sistema deve sugerir/preencher os campos dependentes corretamente. Testar também com dado inválido ou inexistente"
  },
  {
    "order": 24,
    "text": "Verificar campos com cascata de dependência (ex: País → Estado → Cidade): ao alterar o campo pai, os campos filhos devem ser limpos e recarregados. Ao limpar o campo pai, todos os filhos devem ser desabilitados e esvaziados"
  },
  {
    "order": 25,
    "text": "Verificar botões de ação contextuais (ex: ações no grid, menus de três pontos): cada ação disponível deve redirecionar ou executar a operação correta. Validar também quais ações aparecem ou se ocultam conforme o perfil do usuário logado"
  },
  {
    "order": 26,
    "text": "Verificar filtro de abrangência/escopo (ex: 'Meus registros' vs 'Todos'): cada opção deve retornar apenas os registros correspondentes ao escopo selecionado. Validar com usuários que possuem registros próprios e com usuários sem registros"
  },
  {
    "order": 27,
    "text": "Verificar paginação ou scroll infinito (quando houver): ao navegar para a próxima página ou rolar a lista, os dados devem carregar corretamente sem duplicações ou perdas de registros"
  },
  {
    "order": 28,
    "text": "Verificar ordenação de colunas do grid (quando disponível): clicar no cabeçalho de uma coluna deve ordenar os dados corretamente em ordem crescente e decrescente alternadamente"
  },
  {
    "order": 29,
    "text": "Verificar bloqueio de acesso por URL direta (validação backend): usuários sem permissão não devem conseguir acessar telas restritas informando a URL manualmente no navegador. O backend deve retornar erro 403 ou redirecionar para tela de acesso negado — independentemente do que o frontend exiba ou oculte no menu"
  },
  {
    "order": 30,
    "text": "Verificar comportamento de sublistas ou seções com estado em memória (ex: lista de contatos, itens de pedido): operações de adicionar, editar e remover itens da sublista devem ser mantidas em memória até o 'Salvar' principal. Testar: (a) adicionar e cancelar antes de salvar — item não deve persistir; (b) editar e confirmar antes de salvar — edição deve persistir após salvar; (c) remover e salvar — item não deve aparecer ao reabrir o registro"
  },
  {
    "order": 31,
    "text": "Verificar consistência entre exibição formatada no grid e entrada livre na busca: campos exibidos com máscara no grid (ex: CNPJ, CPF, telefone) devem ser localizáveis tanto com máscara quanto sem máscara na busca. Testar busca com formato mascarado e com somente dígitos para confirmar que ambos retornam o mesmo resultado"
  }
]
```

---

### Regras de Geração dos Test Cases

#### Organização e Agrupamento

- Agrupe os TCs por **flow** — agrupamento funcional dentro do módulo
- Separe features de **consulta/leitura** de features de **manutenção/escrita**, mesmo que usem a mesma tela
- Cubra na seguinte ordem: caminho feliz → validações de campo → edge cases → permissões por perfil
- Um TC = um cenário específico — não misture fluxos diferentes no mesmo TC
- A sequência de `id` é **global e incremental** ao longo de todos os TCs gerados

#### scenario_title

- Deve identificar o cenário sem ambiguidade
- Quando envolver perfis de acesso específicos, indique-os no título:
  ```
  "Busca Rápida - Nome [Owner Conta 1]\nUsers de acesso \"owner1\""
  ```
- Quando o TC envolver múltiplas features, indique no título: `"[Feature A + Feature B]"`

---

### Boas Práticas de Escrita dos Steps

#### A fórmula dos 4 elementos

Todo step deve conter, quando aplicável, os seguintes elementos em sequência:

| Elemento | Pergunta que responde | Exemplo isolado |
|---|---|---|
| **Contexto/pré-condição** | O que precisa ser verdade antes da ação? | "Com o campo 'País' preenchido e 'Estado' ainda vazio," |
| **Ação do ator** | O que o Tester faz? | "selecione um Estado no campo correspondente." |
| **Reação do sistema** | O que o sistema faz imediatamente? | "O sistema deve carregar as cidades correspondentes" |
| **Resultado esperado** | O que deve estar verificável ao final? | "e habilitar o campo 'Cidade' para seleção." |

**Step bem escrito — todos os 4 elementos:**
> "Com o campo 'País' preenchido, selecione um Estado. O sistema deve carregar automaticamente as cidades correspondentes e habilitar o campo 'Cidade' para seleção."

**Step de setup — só ação (sem resultado, pois não é uma verificação):**
> "Acesse o sistema com o usuário owner1 e navegue até 'Pacientes' pelo menu principal."

**Step mal escrito — vago, sem resultado esperado:**
> "Selecione um Estado."

---

#### Regras de decomposição — quando criar steps separados

Nunca colapsar em um único step situações distintas. Crie steps separados para:

| Situação | Regra |
|---|---|
| **Dado válido vs. dado inválido** | Um step para cada — comportamentos e resultados são diferentes |
| **Estado antes e depois de uma ação** | Um step para verificar o estado inicial, um para a ação, um para o novo estado |
| **Cada campo com validação própria** | Não agrupe validações de campos diferentes em um mesmo step |
| **Cada opção de um conjunto** | Se um filtro tem 3 status, cada combinação relevante é um step ou TC separado |
| **Cada cultura/idioma testado** | Um step por idioma quando o formato ou comportamento muda |
| **Setup, execução e verificação** | Nunca misture os três tipos na mesma linha |

---

#### Profundidade mínima por tipo de cenário

Em vez de um número fixo de steps, aplique estas regras por tipo:

**Busca/filtro** deve cobrir no mínimo:
1. Setup (login + navegação)
2. Estado inicial da tela antes de qualquer ação
3. Busca com dado válido existente → resultado correto
4. Busca com dado válido inexistente → "nenhum resultado"
5. Busca com dado inválido → mensagem de erro específica (quando aplicável)
6. Limpeza dos filtros → retorno ao estado inicial

**Cadastro/criação** deve cobrir no mínimo:
1. Setup (login + navegação)
2. Estado inicial do formulário (campos vazios, valores padrão pré-selecionados)
3. Tentar salvar vazio → bloqueio com mensagem de campos obrigatórios
4. Preencher com dado inválido e tentar salvar → mensagem de erro por campo
5. Preencher com dados válidos e salvar → sucesso com feedback

**Edição** deve cobrir no mínimo:
1. Localizar e abrir o registro existente
2. Verificar carregamento correto dos dados gravados anteriormente
3. Alterar para dado inválido e tentar salvar → mensagem de erro
4. Alterar para dado válido e salvar → sucesso com feedback
5. Verificar persistência: reabrir o registro e confirmar que os dados foram gravados

**Permissão por perfil** deve cobrir no mínimo:
1. Login com o perfil em questão
2. O que o perfil **vê** (telas disponíveis no menu, botões visíveis, modo da tela)
3. O que o perfil **não vê ou não pode fazer** (elementos ocultos, ações bloqueadas)
4. Pelo menos uma ação permitida ao perfil sendo executada com sucesso

---

#### Linguagem dos steps

- **Verbos no imperativo** para ações do ator: "Clique", "Informe", "Selecione", "Acesse", "Preencha"
- **"deve" e "devem"** para resultados esperados: "O sistema deve exibir...", "O campo deve estar..."
- **Nomes exatos dos elementos** como aparecem na tela: nome do botão, label do campo, texto da mensagem
- **Nunca use vago**: em vez de "informe um dado inválido", diga "informe o texto 'emailsemarroba' no campo 'E-mail'"
- **Estado explícito**: "deve estar habilitado", "deve estar desabilitado", "deve estar vazio", "deve estar preenchido com X"

---

### Regras de Automação

#### Política de ambientes — o que cada ambiente permite

| Ambiente | Inserção de novos registros | Operações sobre âncoras | Leitura / busca |
|---|---|---|---|
| `dev_qa` | ✅ Permitida | ✅ Permitida | ✅ Permitida |
| `hom_prod` | ❌ **Proibida** | ✅ Permitida (com restauração obrigatória) | ✅ Permitida |

**Regra unificada de âncoras:** todo TC que opera sobre registros âncora deve terminar com a base no estado inicial — sem exceção de ambiente. Registros criados em runtime em `dev_qa` (com timestamp) são descartáveis e não precisam ser revertidos.

**`hom_prod: null` — quando usar:**
- Step que cria registro novo com sucesso e persiste na base (alteração líquida — o TC não desfaz a criação)
- Steps subsequentes que dependem de um registro recém-criado que não existe em `hom_prod`

**`hom_prod: "X"` — elegibilidade:**
- TCs com `regression_tier: "smoke"` que operam exclusivamente sobre âncoras com restauração ao final
- TCs Core e Full têm `hom_prod: null` em **todos** os steps — a avaliação de `hom_prod` não se aplica a eles (ver seção de regression_tier)

#### Quando marcar `"X"` em `dev_qa` e `hom_prod`

Marque `"X"` em **ambos** sempre que o step envolver:

| Categoria | Exemplos |
|---|---|
| Login com usuário fixo | Autenticação com usuário pré-existente do ambiente |
| Navegação a uma tela | Acessar menu, clicar em link de navegação |
| Busca e pesquisa com dados fixos | Pesquisar usando registros pré-criados com valores conhecidos |
| Edição e gravação | Salvar alterações em registro pré-existente |
| Validações de campo | Campos obrigatórios, formatos inválidos, duplicidade |
| Carregamento de dados | Verificar dados carregados corretamente na abertura do formulário |
| Verificação de resultado | Conferir dados no grid, em labels, em mensagens de feedback |
| Navegação após ação | Redirecionar para tela correta após salvar/cancelar |

**Três situações que sempre recebem `"X"` em ambos os ambientes, mesmo em TCs de criação ou edição:**

**1. Formulário aberto mas não salvo** — navegar até a tela, preencher campos, interagir com elementos (checkbox, cascata, botão Limpar, botão Voltar) sem clicar em Salvar com sucesso não persiste nada. Todos esses steps são seguros para `hom_prod`. Exemplos: abrir formulário de novo cliente e preencher campos; marcar/desmarcar checkbox; selecionar Estado e verificar cascata de Cidade; preencher e clicar em "Limpar".

**2. Tentar salvar mas receber erro** — steps que submetem o formulário mas são bloqueados pelo sistema (campos obrigatórios vazios, formato inválido, duplicidade) não persistem dados. Seguros para `hom_prod`. Exemplos: Salvar com formulário vazio → mensagem de campos obrigatórios; CNPJ com dígito verificador inválido → mensagem de formato inválido.

**3. Interações em sublista que resultam em erro ou não chegam a ser confirmadas** — tentar adicionar item à sublista com dados inválidos, ou preencher os campos de inclusão sem clicar em "Adicionar", não altera o registro principal nem a sublista. Seguros para `hom_prod`.

> **Cenários negativos são automatizáveis.** Resultado negativo com entrada fixa e resposta do sistema estável **é automatizável** tanto quanto um resultado positivo — o critério é determinismo, não valência. Um step que valida "e-mail sem @ → mensagem de formato inválido" é tão determinístico quanto um que valida "busca retornou 1 registro".

#### Quando **NÃO** marcar `"X"` (deixar `null`)

| Situação | Ambiente afetado | Justificativa |
|---|---|---|
| Criação de registro **com sucesso** (registro persistido sem reversão posterior) | `hom_prod` | Alteração líquida na base |
| Steps de sucesso subsequentes que dependem de registro recém-criado não revertido | `hom_prod` | Registro não existe em hom_prod; steps perdem contexto |
| Criação de conta pelo usuário (signup) | ambos | Gera dados desnecessários na base de testes |
| Upload de imagem / captura por webcam | ambos | Sem suporte prático no Cypress |
| Troca de idioma/cultura (ES-ES, EN-US) | ambos | Custo alto para o retorno; fora do 80/20 |
| Steps puramente visuais (cor, ícone, layout, badge) | ambos | Fora do escopo da automação funcional |
| Fluxos de convite/ativação de usuário | ambos | Setup manual; referenciado via `reuse_id` |
| Steps de configuração de perfil de acesso | ambos | Idem ao anterior |
| Limpeza de campo sem resultado determinístico | ambos | Estado visual não facilmente assertável |
| "Retornar ao estado sem filtro" verificado pelo conteúdo do grid | ambos | Não determinístico — volume, paginação e ordenação variam por ambiente |
| Verificação de não-persistência de estado (filtros/buscas que não devem sobreviver à navegação) | ambos | Depende de estado de sessão — resultado visual não assertável de forma confiável |

#### Regra de verificação em telas de listagem

Em telas de listagem (grid, tabela ou lista), marcar `"X"` para steps que verificam a presença ou os dados de registros específicos **só é válido se uma busca ou filtro anterior já garantiu que esses registros estão visíveis na tela**. Sem essa garantia, paginação ou variação de ordenação podem ocultar o registro, tornando o step não determinístico.

**Regra:**
- Se o TC não realizou busca/filtro antes da verificação → `dev_qa: null`, `hom_prod: null`
- Se o TC já realizou busca/filtro que isola o registro → pode marcar `"X"`

**Distinção obrigatória — estrutura vs. valor formatado de dado específico:**

O TC de estado inicial de uma tela de listagem verifica **estrutura** — colunas presentes, títulos, botões, campos de busca. Ele **não** verifica o valor formatado de um dado de registro específico.

| Tipo de verificação | TC adequado | Automação |
|---|---|---|
| "A coluna 'CNPJ' existe no grid" | TC de estado inicial | `"X"` se determinístico |
| "O CNPJ do registro X exibe a máscara 00.000.000/0000-00" | TC de busca que isolou o registro X | `"X"` após busca |
| "O campo 'Status' exibe badge visual" | TC de estado inicial (estrutura) | `null` — visual |
| "O badge de 'Cliente Cypress 1' exibe 'Ativo'" | TC de busca que isolou o registro | `"X"` após busca |

#### Regra — Coerência de automação dentro do TC

Steps de setup (login, navegação, reuso via `reuse_id`) recebem `"X"` **somente se pelo menos um outro step de verificação do mesmo TC também receber `"X"`**. Se nenhum step de verificação do TC for automatizável, o step de setup também deve receber `null`.

> Um TC com apenas setup automatizado e sem nenhuma asserção não agrega valor à suíte regressiva. O TC permanece válido para execução manual, mas não entra na estratégia de automação.

#### Campo `strategy`

Preencha **somente** quando `dev_qa` ou `hom_prod` for `"X"`. Inclua:

- **Dado de entrada concreto**: valor exato digitado ou selecionado
- **Registro alvo**: nome exato do registro pré-criado que será usado
- **Resultado a validar**: o que deve aparecer, em qual campo, com qual valor exato

**Exemplos corretos:**
```
"Buscar \"cyp\", validar que carrega \"Paciente Cypress 1\" e \"Paciente Cypress 2\""
"Informar CPF: 400.541.218-17, deve carregar somente \"Paciente Cypress 2\""
"Criar nome usando timestamp: \"20022025111115\", email \"20022025111115@teste.com\", telefone \"(11) 111111111\""
"Informar data inicial e final: 20/01/2023, deve carregar somente \"Paciente Cypress 1\""
```

**Dados únicos por execução:** use timestamp no nome/e-mail para garantir unicidade.
**Inserção de registros (situação crítica):** documente todos os dados inseridos e justifique no `strategy` por que a inserção foi necessária em vez de usar registro pré-criado.
**Discriminação de dados:** antes de escrever uma `strategy` que afirme "deve retornar somente [Registro X]", verifique se os valores usados na busca são mutuamente exclusivos entre todos os registros pré-criados. Se o fragmento buscado for substring do valor de outro registro, o resultado real será múltiplo — e a `strategy` estará incorreta.

---

### Regras do `reuse_id`

O `reuse_id` é um **mecanismo de marcação e referência de fluxos reutilizáveis**. Ele tem dois papéis no mesmo campo:

#### Papel 1 — Marcar steps que pertencem a um bloco reutilizável

Quando um conjunto de steps pode ser executado por outros cenários, atribua o mesmo marcador (`"*1"`, `"*2"`, etc.) a cada step do bloco. O marcador identifica o bloco e onde ele vive.

```json
{ "order": 1, "description": "Acesse o sistema com o usuário liv_user1 no campo 'Login'.", "reuse_id": "*1" },
{ "order": 2, "description": "Informe a senha 'liv#user1' no campo 'Senha'.",              "reuse_id": "*1" },
{ "order": 3, "description": "Clique no botão 'Entrar'. O sistema deve autenticar e direcionar para a Home.", "reuse_id": "*1" }
```

#### Papel 2 — Referenciar um bloco marcado

Quando um cenário precisa executar um bloco já marcado em outro TC (ou no mesmo TC), escreva **um único step** apontando para o bloco. Não reescreva os steps — apenas referencie.

```json
{
  "order": 1,
  "description": "Execute os passos indicados com [*1] do TC 'Login' (TC_01).",
  "reuse_id": "*1"
}
```

Se o bloco está no mesmo conjunto de TCs:
```json
{
  "order": 1,
  "description": "Execute os passos indicados com [*1] deste mesmo TC.",
  "reuse_id": "*1"
}
```

---

#### Quando usar `reuse_id`

Use quando **2 ou mais steps** se repetiriam em múltiplos cenários — tanto dentro do mesmo conjunto de TCs quanto referenciando TCs externos. Um único step simples geralmente não justifica reuso.

| Situação | Abordagem |
|---|---|
| Fluxo de login/setup que aparece em N cenários | Marque os steps no TC de origem; referencie com um step nos demais |
| Fluxo de configuração de perfil (convite, ativação) | Marque no TC onde está documentado; referencie nos TCs que dependem |
| Step único e simples | Escreva normalmente — reuso de um step só adiciona complexidade |

#### `reuse_id` **não** é âncora de dados

Registros pré-criados (como "Cliente Cypress 1") são documentados nos **pré-requisitos** e referenciados no campo **`strategy`**. O `reuse_id` é exclusivamente para reuso de **fluxo de execução de steps** — nunca para indicar dependência de dado.

Use `null` quando o step não pertence a nenhum bloco reutilizável e não referencia nenhum bloco externo.

---

### Nomenclatura dos Test Cases — `tc_name`

Cada TC recebe um nome único e estável no campo `tc_name`, seguindo o padrão:

```
TC_{MODULE_CODE}_{NNN}
```

| Componente | Descrição | Exemplo |
|---|---|---|
| `TC` | Prefixo fixo | `TC` |
| `MODULE_CODE` | Código de 3 letras maiúsculas do módulo | `CLT` |
| `NNN` | Número sequencial global com 3 dígitos, zero-padded | `001`, `034` |

**Exemplos:** `TC_CLT_001`, `TC_CLT_033`, `TC_USR_034`, `TC_AGD_078`

**Regras:**
- O sequencial é **global** — continua de onde o último TC parou, independentemente do módulo
- Nunca reutilize ou reatribua um `tc_name` — se um TC for removido, seu número fica vago
- Use o `tc_name` nas referências de `reuse_id` no lugar de "TC 1", "TC 15", etc.: `"Execute [*1] do TC_CLT_001"`

---

### Estrutura JSON de Saída

```json
{
  "pre_requisitos": {
    "label": "Prerequisites",
    "value": "Descreva os pré-requisitos ou coloque 'Não há'"
  },
  "test_cases": [
    {
      "id": 1,
      "tc_name": "TC_CLT_001",
      "regression_tier": "smoke",
      "status": "ativo",
      "feature": "Título exato da spec de origem",
      "module": "Nome do Módulo",
      "module_code": "CLT",
      "flow": "Nome do Flow",
      "scenario_title": "Título descritivo do cenário",
      "steps": [
        {
          "order": 1,
          "description": "Contexto se necessário. Ação do ator. O sistema deve reagir de X forma. O resultado esperado é Y.",
          "reuse_id": null,
          "automation": {
            "dev_qa": null,
            "hom_prod": null,
            "strategy": null
          }
        }
      ]
    }
  ]
}
```

---

### Exemplo de Referência — TC Completo

O exemplo abaixo demonstra o padrão de qualidade esperado. Observe: `scenario_title` com perfil e usuários, steps com os 4 elementos, decisões corretas de automação, `strategy` com dados concretos e uso correto de `reuse_id`.

> **Contexto:** Feature "Consulta de Pacientes", busca avançada por e-mail. Registro pré-criado: "Paciente Cypress 2" com e-mail `PacienteCypress2@teste.com`. Usuário fixo: `owner1`.

```json
{
  "id": 5,
  "tc_name": "TC_PAC_005",
  "feature": "Consulta de Pacientes",
  "module": "Pacientes",
  "module_code": "PAC",
  "flow": "Lista de Pacientes",
  "scenario_title": "Filtros Avançados - Pesquisa pelo E-mail do paciente [Owner Conta 1]\nUsers de acesso \"owner1\"",
  "steps": [
    {
      "order": 1,
      "description": "Execute os passos indicados com [*1] do TC_PAC_001 para acessar a tela de Pacientes.",
      "reuse_id": "*1",
      "automation": {
        "dev_qa": "X",
        "hom_prod": "X",
        "strategy": null
      }
    },
    {
      "order": 2,
      "description": "Clique em 'Filtros' para abrir o painel de filtros avançados. O painel deve ser exibido com todos os campos de texto vazios e o campo 'Status do Paciente' com todas as opções pré-selecionadas (Ativo, Inativo e Falecido).",
      "reuse_id": null,
      "automation": {
        "dev_qa": "X",
        "hom_prod": "X",
        "strategy": null
      }
    },
    {
      "order": 3,
      "description": "No campo 'E-mail do paciente', informe o texto 'emailsemarroba' (e-mail sem o símbolo @). Clique em 'Buscar'. O sistema deve bloquear a busca e exibir a mensagem 'E-mail inválido' abaixo do campo.",
      "reuse_id": null,
      "automation": {
        "dev_qa": "X",
        "hom_prod": "X",
        "strategy": "Informar 'emailsemarroba'; deve exibir mensagem 'E-mail inválido' abaixo do campo"
      }
    },
    {
      "order": 4,
      "description": "Limpe o campo 'E-mail do paciente' e informe 'naoexiste@teste.com' (e-mail com formato válido, mas inexistente na base). Clique em 'Buscar'. O sistema deve exibir a mensagem 'Nenhum registro encontrado'.",
      "reuse_id": null,
      "automation": {
        "dev_qa": "X",
        "hom_prod": "X",
        "strategy": "Informar 'naoexiste@teste.com'; deve exibir 'Nenhum registro encontrado' no grid"
      }
    },
    {
      "order": 5,
      "description": "Limpe o campo e informe 'PacienteCypress2@teste.com'. Clique em 'Buscar'. O sistema deve retornar exatamente um registro — 'Paciente Cypress 2' — com nome completo, documento, telefone de contato e status exibidos corretamente no grid.",
      "reuse_id": null,
      "automation": {
        "dev_qa": "X",
        "hom_prod": "X",
        "strategy": "Informar: PacienteCypress2@teste.com, deve carregar somente \"Paciente Cypress 2\" (registro pré-criado — ver pré-requisitos)"
      }
    }
  ]
}
```

**Leitura do exemplo — por que cada decisão foi tomada assim:**

| Step | Automação | Raciocínio |
|---|---|---|
| 1 — Login e navegação | X / X / strategy null | Setup repetível com usuário fixo; não insere dados; válido em ambos os ambientes |
| 2 — Estado inicial | X / X / strategy null | Verificação de estado padrão determinístico; sem dado variável necessário |
| 3 — E-mail inválido | X / X / strategy preenchida | Validação de formato é determinística: entrada fixa → mensagem de bloqueio estável e verificável. O fato de o resultado ser um erro não torna o step manual |
| 4 — E-mail inexistente | X / X / strategy preenchida | "Nenhum resultado" com valor controlado e pré-definido é determinístico: entrada fixa que garantidamente não existe na base → mensagem estável → grid vazio verificável. O fato de o resultado ser negativo não torna o step manual |
| 5 — E-mail válido existente | X / X / strategy preenchida | Busca por registro pré-criado existente em ambos os ambientes — não insere dados; `reuse_id: null` pois não é bloco reutilizável; referência ao dado na `strategy` |

---

#### Exemplo de uso do `reuse_id` — marcação e referência

> **Contexto:** TC_01 documenta o fluxo de login. Os steps 1–3 são marcados com `*1` pois outros cenários precisam deles. TC_02 é um cenário de recuperação de senha que reutiliza o login sem reescrever os steps.

**TC_01 — Login com usuário válido (steps 1–3 marcados como bloco `*1`)**

```json
{
  "id": 1,
  "feature": "Login",
  "module": "Autenticação",
  "flow": "Login",
  "scenario_title": "Login com usuário LiV válido\n[*1] Bloco reutilizável: steps 1 a 3 — login padrão com liv_user1",
  "steps": [
    {
      "order": 1,
      "description": "Acesse a tela de login. No campo 'Login', informe 'liv_user1'.",
      "reuse_id": "*1",
      "automation": { "dev_qa": "X", "hom_prod": "X", "strategy": null }
    },
    {
      "order": 2,
      "description": "No campo 'Senha', informe 'liv#user1'.",
      "reuse_id": "*1",
      "automation": { "dev_qa": "X", "hom_prod": "X", "strategy": null }
    },
    {
      "order": 3,
      "description": "Clique em 'Entrar'. O sistema deve autenticar o usuário e redirecionar para a Home.",
      "reuse_id": "*1",
      "automation": { "dev_qa": "X", "hom_prod": "X", "strategy": null }
    },
    {
      "order": 4,
      "description": "Verifique que a Home é exibida com o nome do usuário 'liv_user1' no cabeçalho.",
      "reuse_id": null,
      "automation": { "dev_qa": "X", "hom_prod": "X", "strategy": null }
    }
  ]
}
```

**TC_02 — Recuperação de senha (referencia o bloco `*1` do TC_01)**

```json
{
  "id": 2,
  "feature": "Login",
  "module": "Autenticação",
  "flow": "Recuperação de Senha",
  "scenario_title": "Recuperação de senha a partir da tela de login",
  "steps": [
    {
      "order": 1,
      "description": "Execute os passos indicados com [*1] do TC_01 ('Login com usuário LiV válido') para acessar o sistema.",
      "reuse_id": "*1",
      "automation": { "dev_qa": "X", "hom_prod": "X", "strategy": null }
    },
    {
      "order": 2,
      "description": "Clique em 'Recuperar Senha'. O sistema deve exibir o formulário de recuperação.",
      "reuse_id": null,
      "automation": { "dev_qa": "X", "hom_prod": "X", "strategy": null }
    }
  ]
}
```

---

### Checklist de Autoavaliação — Antes de Entregar

Antes de finalizar a geração, verifique internamente:

- [ ] Todos os flows identificados têm pelo menos um TC?
- [ ] Quando múltiplas specs foram enviadas, as dependências cruzadas estão refletidas nos TCs?
- [ ] O campo `feature` de cada TC usa o título exato da spec de origem (sem renomear ou adaptar)?
- [ ] Cada TC de formulário cobre: estado inicial, dado inválido, dado válido e persistência?
- [ ] Cada TC de busca cobre: resultado encontrado, nenhum resultado e dado inválido?
- [ ] Há TCs de permissão para cada perfil com comportamento diferente?
- [ ] O TC de permissão cobre tanto ausência no menu quanto bloqueio por URL direta?
- [ ] Campos com cascata (pai → filho) têm steps de limpeza ao alterar o pai?
- [ ] Campos de data têm steps para cada cultura relevante?
- [ ] Cada step de verificação usa o nome exato do elemento da tela?
- [ ] O campo `strategy` está preenchido com dados concretos em todos os steps com X?
- [ ] Nenhum TC tem apenas steps de setup com `"X"` e todos os demais com `null` — se nenhum step de verificação é automatizável, o TC inteiro deve ter `null`?
- [ ] Algum step de verificação ficou `null` apenas por ser um "cenário negativo" (mensagem de erro, campo bloqueado, nenhum resultado)? Se sim, revise: resultado negativo com entrada fixa e resposta do sistema estável **é automatizável** — o critério é determinismo, não valência.
- [ ] Algum step ficou com `dev_qa: null` apenas por estar após um step com `hom_prod: null`? Os dois campos são independentes — um step posterior à criação pode receber `dev_qa: "X"` normalmente.
- [ ] Todo TC com pelo menos um step automatizável tem `regression_tier` preenchido com `"smoke"`, `"core"` ou `"full"`?
- [ ] TCs sem nenhum step automatizável que cobrem comportamento funcional relevante estão como `"full"` — não como `null`?
- [ ] `regression_tier: null` está sendo usado **somente** para TCs deliberadamente fora da suíte (ex: convite, ativação)?
- [ ] Há pelo menos 1 TC com `regression_tier: "smoke"` para cada flow identificado?
- [ ] O Smoke do flow de Cadastro/Criação é o TC de tentativa bloqueada por validação (ex: salvar vazio) — e não o TC de estado inicial do formulário?
- [ ] TCs com `regression_tier: "core"` ou `"full"` têm `hom_prod: null` em **todos** os steps, sem exceção? (A elegibilidade técnica do step não é avaliada para tiers Core e Full — o `null` é incondicional.)
- [ ] Algum TC Core ou Full recebeu `hom_prod: "X"` em algum step? Se sim, corrija para `null` — o tier sobrepõe qualquer avaliação individual de step.
- [ ] O TC Smoke eleito para cada flow é 100% elegível para `hom_prod` (todos os steps com `hom_prod: "X"`)? Um TC Smoke com step `hom_prod: null` por criação líquida deve ser reclassificado como `"core"`.
- [ ] Se o módulo tem operações de escrita: existe um TC de Restauração de Âncora no Smoke, com todos os steps `hom_prod: "X"` e terminando com o registro no estado inicial?
- [ ] Algum TC Smoke que opera sobre âncora tem step que modifica o dado sem step posterior de restauração?
- [ ] Steps de "retorno ao estado sem filtro" verificados pelo conteúdo do grid estão com `null` em ambos os ambientes?
- [ ] TCs de verificação de não-persistência de estado (filtros/buscas que não devem sobreviver à navegação) estão com `null` em ambos os ambientes?
- [ ] Verificações de valor formatado de dado específico (máscara de CNPJ de um registro concreto, badge de status) estão no TC de busca que isola esse registro — não no TC de estado inicial?
- [ ] O `TCRegistry_{MODULE_CODE}.json` foi gerado com todas as entradas desta geração e com o `last_global_id` atualizado?
- [ ] As referências de `reuse_id` nos steps usam o `tc_name` do TC de origem (ex: "Execute [*1] do TC_CLT_001")?
- [ ] Há pelo menos um par (dado válido / dado inválido) para cada validação relevante?
- [ ] Sublistas ou seções com estado em memória têm TCs cobrindo: adicionar, editar e remover antes e depois do Salvar principal?
- [ ] Campos exibidos com máscara no grid têm TCs de busca cobrindo tanto o formato com máscara quanto sem máscara?
- [ ] Para cada campo declarado como não editável após gravação: o TC de edição verifica que o campo está exibido como label ou input desabilitado — e não como input editável?
- [ ] O campo eleito para o TC de Restauração de Âncora respeita a hierarquia de prioridade? (texto livre obrigatório > evitar únicos, cascata e datas)

**Adicionalmente, se estiver no Modo B (Atualização):**
- [ ] Nenhum TC existente teve `id` ou `tc_name` alterado?
- [ ] TCs obsoletos têm `"status": "obsoleto"` e `scenario_title` prefixado com `[OBSOLETO - {motivo}]`?
- [ ] O `TCRegistry_{MODULE_CODE}_delta.json` contém apenas os TCs novos desta atualização?
- [ ] O relatório de atualização lista as quatro categorias (preservados, atualizados, obsoletos, novos)?
- [ ] O `last_global_id` no delta está correto após a geração dos novos TCs?

---

*Aguarde o(s) `.md` da(s) especificação(ões) funcional(is) — e, se for atualização (Modo B), o `TestCases_{MOD}.json` existente e o `TCRegistry_Global.json` — para iniciar.*

---

## 8. Estratégia de Regressão por Camadas

### Visão Geral

A suíte regressiva é dividida em **três camadas** — Smoke, Core e Full — cada uma com propósito, gatilho e critério de seleção distintos. O objetivo é garantir que os itens mais críticos sejam sempre verificados antes de qualquer deploy, sem exigir que toda a suíte rode em todo momento.

```
Evento                                 Camada executada       Meta de duração
──────────────────────────────────────────────────────────────────────────────
Todo push para dev_qa                  Smoke                  < 5 min
Fim de sprint / subida para hom_prod   Smoke + Core           < 15 min
Release major / mudança estrutural     Smoke + Core + Full    sem SLA fixo
Nightly (sem bloquear deploys)         Smoke + Core + Full    sem SLA fixo
```

---

### As Três Camadas

### Smoke — Portão de Entrada

**Propósito:** verificar que nenhum flow principal está quebrado antes de qualquer deploy. Se o Smoke falhar, o deploy é bloqueado.

**Gatilho:** todo push para `dev_qa`; obrigatório antes de subir para `hom_prod`.

**Meta de duração:** < 5 minutos (com paralelização padrão do CI).

**Critério de seleção:** mínimo **1 TC por flow**. O TC deve representar o comportamento mais central do flow — o cenário cuja falha torna o flow imediatamente inutilizável. Se dois cenários do mesmo flow forem igualmente centrais e rápidos, ambos podem ser Smoke.

> **Pergunta de classificação:** "Se esse TC falhar, o usuário percebe imediatamente que esse flow está quebrado?"
> Se sim → Smoke.

> **Restrição absoluta de elegibilidade:** o TC Smoke de qualquer flow **deve ser 100% elegível para `hom_prod`** — todos os seus steps devem poder receber `hom_prod: "X"`. Um TC Smoke que cria registros novos sem reversão **nunca é elegível** para `hom_prod` e portanto **não pode ser eleito como Smoke**. Se o cenário mais central de um flow for destrutivo (cria registro líquido), escolha o próximo cenário mais representativo que seja completamente não-destrutivo ou reversível.

---

### Core — Cobertura Funcional da Sprint

**Propósito:** cobrir os fluxos principais de todas as features em produção. Detecta regressões que não são imediatamente bloqueantes, mas que afetam uma funcionalidade concreta.

**Gatilho:** fim de sprint, antes de release para `hom_prod`.

**Meta de duração:** Smoke + Core juntos em < 15 minutos.

**Critério de seleção:** fluxos principais por feature. Validações de campo frequentes. Qualquer TC cujo defeito seria percebido rapidamente em uso real, mas que não impede o uso básico do sistema.

> **Pergunta de classificação:** "É o fluxo principal de uma feature em produção, mas sua falha não seria percebida imediatamente por todos os usuários?"
> Se sim → Core.

---

### Full — Cobertura Completa

**Propósito:** cobrir edge cases, cenários negativos secundários e validações de menor impacto. Garante que nada escapa no longo prazo.

**Gatilho:** releases major, mudanças estruturais (refactor, migração de banco, alteração de autenticação), execução nightly.

**Critério de seleção:** todos os TCs automatizáveis que não estejam em Smoke nem Core; TCs sem nenhum step automatizável, mas que cobrem comportamento funcional relevante (validação de negócio, fluxo de navegação, estado de tela).

> **Pergunta de classificação:** "É um edge case, validação secundária ou cenário negativo de menor impacto?"
> Se sim → Full.

---

### Regras de Quantidade por Camada

| Camada | Mínimo | Critério de limite |
|---|---|---|
| Smoke | 1 TC por flow identificado | Se exceder 5 min no CI, o QA move os excedentes para Core, mantendo apenas o mais central por flow |
| Core | Sem mínimo fixo | Meta: Smoke + Core < 15 min no CI com paralelização padrão |
| Full | Sem limite | Todos os automatizáveis que não estão em Smoke nem Core; todos os manuais com comportamento funcional relevante |
| null | — | TCs **deliberadamente** fora da suíte — fluxos de setup único (convite, ativação) que não se repetem a cada sprint |

> **`regression_tier: null` é reservado apenas para TCs excluídos intencionalmente da suíte regressiva.** TCs sem nenhum step automatizável que cobrem comportamento funcional relevante entram como `"full"` (execução manual na suíte). `null` não é sinônimo de "não automatizável".

---

### Critérios de Classificação

### Tabela de Decisão Principal

A classificação é ancorada em **impacto de negócio**, não em "está na spec". A pergunta central é: se esse TC falhar em produção, qual é a gravidade para o usuário?

| Critério | Tier |
|---|---|
| Falha = flow inutilizável para o usuário; detectado imediatamente em uso normal | `"smoke"` |
| Falha = funcionalidade principal afetada; usuário percebe e reclama em uso normal | `"core"` |
| Falha = comportamento incorreto detectável apenas em cenário específico ou edge case | `"full"` |
| É o TC de Restauração de Âncora obrigatório do módulo (ver seção específica) | `"smoke"` |
| Nenhum step é automatizável, mas o cenário cobre comportamento funcional relevante (validação de negócio, fluxo de navegação, estado de tela) | `"full"` |
| Nenhum step é automatizável E o cenário cobre apenas aparência visual (cor, ícone, badge, estilo) ou verificação via banco de dados (log de auditoria, SELECT direto) | `"full"` |
| Não é automatizável E é um fluxo de setup único que não se repete a cada sprint (convite, ativação) | `null` |

---

### Critério Auxiliar — Caminho Alternativo e Papel Funcional

Antes de classificar um TC como `core`, aplique este teste em sequência:

**Teste 1 — Caminho alternativo:**
Se essa funcionalidade falhar, o usuário consegue atingir o mesmo resultado por outro caminho sem intervenção técnica?

- Sim → a funcionalidade é uma conveniência ou atalho → tende a `"full"`
- Não → a funcionalidade é o único caminho → mantém avaliação de impacto normal

**Teste 2 — Papel funcional:**
Classifique o papel da funcionalidade dentro do fluxo:

| Papel | Descrição | Tier tendência |
|---|---|---|
| **Bloqueante** | Sem ela, o usuário não conclui o fluxo ou os dados ficam corrompidos | `"core"` ou `"smoke"` |
| **Proteção / salvaguarda** | Evita perda acidental de dados ou ação irreversível, mas o fluxo principal funciona sem ela | `"full"` |
| **Atalho de dados** | Copia, preenche automaticamente ou propaga valores — o usuário preenche manualmente se falhar | `"full"` |
| **Atalho de ação** | Limpa, reseta ou desfaz com um clique — o usuário executa a ação manualmente se falhar | `"full"` |
| **Canal alternativo** | Outro caminho já coberto por um TC de tier igual ou superior resolve o mesmo caso de uso | `"full"` |

> **Atenção — canal alternativo:** para classificar como canal alternativo, o caminho substituto deve estar coberto por um TC de tier `"smoke"` ou `"core"` já gerado. Se não estiver, o TC em avaliação pode ser o único cobrindo aquele caso de uso e não deve ser rebaixado.

**Aplicação dos dois testes em conjunto:**
- Se o Teste 1 for "Sim" E o papel for Proteção, Atalho ou Canal alternativo → `"full"`
- Se o Teste 1 for "Não" → avalie impacto normalmente pela tabela de critérios principal
- Em caso de dúvida entre `"core"` e `"full"`, pergunte: *"um usuário em uso normal reclamaria imediatamente se essa funcionalidade falhasse, ou só perceberia em uma situação específica?"* — reclamaria imediatamente → `"core"`; perceberia em situação específica → `"full"`

**Exemplos de aplicação:**
- Checkbox que copia endereço postal do empresarial: se não funcionar, o usuário preenche manualmente — inconveniente, não bloqueante → `"full"`
- Campo obrigatório que não bloqueia o Salvar: dados corrompidos na base — impacto crítico → `"core"` ou `"smoke"` dependendo da frequência de uso
- Busca por nome que não retorna resultado: funcionalidade principal inoperante → `"smoke"`
- Filtro por status que retorna registros errados: funcionalidade principal com resultado incorreto → `"core"`
- Validação de formato de CNPJ inválido que não bloqueia: dado inválido salvo → `"core"`
- Máscara de exibição de CNPJ no grid com formato incorreto: cosmético → `"full"`

---

### Regras de Elegibilidade do Smoke por Tipo de Flow

### Flow de Cadastro/Criação

O candidato natural ao Smoke **não é o TC de estado inicial do formulário, nem o TC de criação com sucesso** (que persiste registro novo). O candidato correto é o **TC de tentativa de gravação bloqueada por validação** (ex: salvar com campos obrigatórios vazios) — pois prova abertura da tela + resposta do sistema sem nenhuma persistência, sendo 100% elegível para `hom_prod`.

### Flow de Sublista/Contatos

Se o cenário mais central do flow cria registros novos (ex: adicionar contato a um cliente novo), ele não é elegível para Smoke. Eleja como Smoke o TC de validação de campo obrigatório da sublista (tentativa bloqueada) ou o TC que opera sobre registro âncora existente. Se nenhum cenário do flow for completamente não-destrutivo, **o flow não precisa de TC Smoke próprio** — a cobertura do ambiente de produção para esse flow é garantida pelo TC de Restauração de Âncora do módulo.

---

### `hom_prod` por Camada — Regra Absoluta

> **O campo `hom_prod` só é avaliado para TCs com `regression_tier: "smoke"`.** Para qualquer outro tier, a regra é incondicional e não admite exceção:

| Tier | `hom_prod` em todos os steps |
|---|---|
| `"smoke"` | Avaliado step a step pelas regras de automação — pode ser `"X"` ou `null` |
| `"core"` | **Sempre `null`** — sem exceção, sem avaliação individual de step |
| `"full"` | **Sempre `null`** — sem exceção, sem avaliação individual de step |
| `null` | **Sempre `null`** — TC fora da suíte regressiva |

> **Nunca avalie `hom_prod` step a step para TCs Core ou Full.** Mesmo que o step seja uma busca simples sobre âncora que "pareceria elegível" isoladamente, o tier Core ou Full impede `hom_prod: "X"` de forma absoluta. A elegibilidade técnica do step não tem relevância quando o TC não é Smoke.

> **Por que Core e Full não rodam em `hom_prod`:** `hom_prod` é um ambiente de produção onde o custo de qualquer instabilidade é alto. Smoke cobre o que é essencial para garantir que o ambiente está funcionando. Core e Full são executados em `dev_qa` onde o volume de execução não tem esse custo.

---

### Interação com as Regras de Automação Existentes

### Regra `hom_prod: null` em steps de criação

A regra existente permanece inalterada: o step que persiste um registro novo com sucesso recebe `hom_prod: null`. Isso se aplica igualmente a TCs de Smoke.

**Consequência prática:** um TC de Smoke do flow "Cadastro" roda em `hom_prod` com o step de salvamento pulado. A navegação, as validações de campo e os steps anteriores ao Salvar continuam sendo exercitados — mas a prova de que a gravação funciona em `hom_prod` **não é feita por esse TC**.

Essa lacuna é coberta pelo **TC de Restauração de Âncora obrigatório**, descrito na próxima seção.

---

### TC de Restauração de Âncora — Obrigatório no Smoke

Todo módulo com operações de escrita deve ter obrigatoriamente no Smoke **ao menos um TC que modifica e restaura um registro âncora**, sendo totalmente elegível para `hom_prod`. Esse TC é o **guardião de escrita do módulo em `hom_prod`**.

**Por que é obrigatório:** este é o único TC que prova, em `hom_prod`, que o ciclo **escrever → persistir → verificar** está funcionando. Sem ele, o Smoke em `hom_prod` cobre apenas leitura. Uma regressão na gravação passaria pelo portão de entrada invisível.

**O padrão cobre qualquer tipo de modificação reversível sobre âncora:**

```
Edição de campo:
  Step 1  Setup: login + navegação + localizar registro âncora [reuse_id: *N]
  Step 2  Editar campo para valor de teste → salvar → verificar alteração persistida
  Step 3  Editar campo de volta ao valor original → salvar → verificar restauração

Sublista (adicionar/remover):
  Step 1  Setup: login + navegação + localizar registro âncora [reuse_id: *N]
  Step 2  Adicionar item → salvar → verificar adição
  Step 3  Remover item → salvar → verificar remoção

O estado do registro ao final do TC deve ser idêntico ao estado antes do TC iniciar.
```

Todos os steps recebem `dev_qa: "X"` e `hom_prod: "X"`. O TC não cria registros novos líquidos — opera exclusivamente sobre âncoras e termina restaurado.

**Cobertura por módulo:** um único TC de restauração por módulo cobre `hom_prod` para todos os flows. Flows cujo Smoke cria registro novo (ex: Cadastro) ficam com `hom_prod: null` nesses steps — a cobertura de escrita em `hom_prod` está garantida pelo TC de Restauração do módulo.

**Quantidade:** mínimo 1 por módulo com operações de escrita. Em geral pertence ao flow "Edição de [Entidade]".

**Exemplo de strategy para os steps de reversão:**
```
Step 2: "Alterar 'Nome Fantasia' de 'Cypress Alpha' para 'Cypress Alpha Edit'; verificar que grid exibe 'Cypress Alpha Edit'"
Step 3: "Restaurar 'Nome Fantasia' para 'Cypress Alpha'; verificar que grid exibe 'Cypress Alpha' — dado âncora restaurado"
```

---

### Campo `regression_tier` no JSON

O campo é adicionado no nível do TC (não do step), pois o tier é uma decisão sobre o cenário como um todo.

```json
{
  "id": 5,
  "tc_name": "TC_CLT_005",
  "regression_tier": "smoke",
  "status": "ativo",
  "feature": "Consulta de Clientes",
  ...
}
```

**Valores válidos:**

| Valor | Significado |
|---|---|
| `"smoke"` | Smoke — portão de entrada, roda em todo deploy |
| `"core"` | Core — cobertura funcional, roda no fim de sprint |
| `"full"` | Full — cobertura completa, roda em releases major e nightly |
| `null` | Deliberadamente fora da suíte — não entra em nenhuma camada regressiva |

---

### Gatilhos de Execução e Tags Cypress

O automatizador aplica a tag Cypress correspondente ao `regression_tier` de cada TC:

| `regression_tier` | Tag Cypress |
|---|---|
| `"smoke"` | `@smoke` |
| `"core"` | `@core` |
| `"full"` | `@full` |
| `null` | sem tag (não entra na suíte) |

**Execução por camada no CI:**

```bash
# Smoke — todo push
cypress run --env grepTags=@smoke

# Core — fim de sprint
cypress run --env grepTags="@smoke|@core"

# Full — release major / nightly
cypress run --env grepTags="@smoke|@core|@full"
```

---

### Retroclassificação de TCs Existentes

Para TCs já gerados sem o campo `regression_tier`, aplicar o processo abaixo:

1. **Listar todos os flows** cobertos pelos TCs existentes do módulo
2. **Identificar o TC mais representativo de cada flow** → candidato a Smoke
   - Para flows de Cadastro/Criação: o candidato é o TC de tentativa bloqueada por validação, não o TC de criação com sucesso nem o TC de estado inicial
   - Para flows de Sublista: o candidato é o TC de validação de campo obrigatório (tentativa bloqueada) ou o TC sobre âncora existente
3. **Verificar a obrigatoriedade do TC de Restauração de Âncora** — se não existir, criar antes de classificar
4. **Classificar os demais** como Core ou Full conforme a tabela de decisão e o critério auxiliar
5. **Aplicar a regra `hom_prod` por camada**: TCs Core e Full recebem `hom_prod: null` em todos os steps, incondicionalmente
6. **Atualizar o JSON do módulo** adicionando `regression_tier` a cada TC
7. **Atualizar o TCRegistry_Global.json** — o campo `regression_tier` não precisa constar no Registry, apenas no JSON do módulo

---

### Restrições de Design para TCs de Smoke

Para garantir que o Smoke seja rápido e confiável:

| Restrição | Justificativa |
|---|---|
| TCs de Smoke não devem depender de outros TCs de Smoke | Falha em um não deve cascatear |
| TCs de Smoke devem usar exclusivamente registros âncora pré-criados | Sem criação de dados em runtime no Smoke |
| O TC de Restauração de Âncora deve sempre terminar com o registro no estado inicial | Execuções consecutivas do Smoke não devem interferir entre si |
| Smoke não deve incluir TCs de permissão por perfil que exijam múltiplos logins | Custo de autenticação eleva o tempo; mover para Core |

---

### Checklist de Classificação

Antes de finalizar a atribuição de `regression_tier`, verifique:

- [ ] Há pelo menos 1 TC com `regression_tier: "smoke"` para cada flow identificado?
- [ ] O Smoke do flow de Cadastro/Criação é o TC de tentativa bloqueada por validação (ex: salvar vazio) — e não o TC de estado inicial nem o de criação com sucesso?
- [ ] Para flows de Sublista: se nenhum cenário for completamente não-destrutivo, o flow está coberto pelo TC de Restauração de Âncora do módulo?
- [ ] O TC Smoke eleito para cada flow é 100% elegível para `hom_prod` (todos os steps com `hom_prod: "X"`)? Um TC Smoke com qualquer step `hom_prod: null` por criação de registro líquido **não atende ao critério** — deve ser reclassificado como `"core"` e um novo TC Smoke elegível deve ser eleito no flow.
- [ ] Se o módulo tem operações de escrita: existe um TC de Restauração de Âncora no Smoke, com todos os steps `hom_prod: "X"` e terminando com o registro no estado inicial?
- [ ] Algum TC Smoke que opera sobre âncora tem step que modifica o dado sem step posterior que restaure o estado? Se sim, adicionar o step de restauração ou retirar `hom_prod: "X"` desse TC.
- [ ] TCs com `regression_tier: "core"` ou `"full"` têm `hom_prod: null` em **todos** os steps, sem exceção? (A elegibilidade técnica do step não é avaliada para tiers Core e Full — o `null` é incondicional.)
- [ ] Algum TC Core ou Full recebeu `hom_prod: "X"` em algum step? Se sim, corrija para `null` — o tier sobrepõe qualquer avaliação individual de step.
- [ ] TCs sem nenhum step automatizável, mas que cobrem comportamento funcional relevante, estão classificados como `"full"` (e não como `null`)?
- [ ] `regression_tier: null` está sendo usado **somente** para TCs deliberadamente fora da suíte (ex: convite, ativação)?
- [ ] O critério auxiliar (Teste 1 + Teste 2) foi aplicado antes de classificar qualquer TC como `core`?

---

*Esta especificação é complementar às regras de automação documentadas no Manual de Processo QA e no Prompt de Geração de Test Cases (v11+). Em caso de conflito, as regras de automação existentes (hom_prod: null, restauração de âncora, coerência de setup) prevalecem — o regression_tier é uma camada de organização, não uma exceção às regras.*