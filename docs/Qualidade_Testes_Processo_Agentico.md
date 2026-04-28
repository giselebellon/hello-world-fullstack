# Qualidade e Testes no Processo Agent-First Kognit

> **Público:** Time de produto, engenharia e QA
> **Objetivo:** Explicar como o processo Agent-First garante qualidade de entrega e onde os testes se encaixam — com base nas melhores práticas documentadas pelo mercado

---

## Por que esta mudança é necessária

O processo atual de qualidade da Kognit foi desenhado para um contexto em que humanos escrevem código e humanos executam testes. Os Test Cases — documentos passo a passo que guiam o Tester na execução manual — fazem sentido nesse contexto: o Tester precisa de instruções claras, pois é ele quem decide e age a cada step.

No processo Agent-First, o Coding Agent implementa as funcionalidades de forma autônoma. Ele não precisa de um manual — ele precisa de contratos. A diferença é fundamental: um manual instrui um humano sobre como executar; um contrato define o resultado que precisa ser atingido e como verificar que foi atingido. O agente descobre o como por conta própria, e verifica contra o contrato antes de declarar conclusão.

Isso não significa que qualidade é menos importante — significa que ela é garantida de forma diferente, mais cedo e de forma mais sistemática. O paper *Agentic Software Engineering: Foundational Pillars and a Research Roadmap* (Hassan et al., 2025) descreve essa transição com precisão: o campo está se movendo *"toward defining high-level, property-based acceptance criteria rather than brittle, example-based test cases, leading to more robust and generalizable solutions."*

---

## A espinha dorsal da qualidade: o Acceptance Contract

No processo Agent-First, a especificação do que precisa funcionar — e de como verificar que funciona — vive no **Acceptance Contract**. Ele é gerado antes de qualquer linha de código ser escrita, a partir do design técnico aprovado pelo Product Engineer.

Cada critério do contrato define:

```
Critério:         [ID único]
Contexto:         dado que [estado inicial]
Ação:             quando [evento ou ação]
Resultado:        então [comportamento esperado]
Verificabilidade: automática-unit | automática-api | automática-componente |
                  e2e-smoke | revisão humana | não funcional | observabilidade
Evidência:        [o que precisa ser produzido como prova]
Responsável:      Backend Coder | Frontend Coder | CI/CD | Product Engineer
```

O campo `verificabilidade` responde diretamente à pergunta "o que automatizar e com qual ferramenta?" — não é uma decisão que precisa ser tomada depois, por um QA separado. Está codificada no contrato, derivada do impacto de negócio e da natureza técnica de cada critério:

| Verificabilidade | O que é | Executor | Velocidade |
|---|---|---|---|
| `automática-unit` | Unit test — lógica pura, sem I/O (xUnit / Vitest) | Backend ou Frontend Coder (loop interno) | < 1 min |
| `automática-api` | API integration via WebApplicationFactory — app .NET Core inteiro em memória, HTTP real, sem browser | Backend Coder (loop interno) | < 3 min |
| `automática-componente` | React component test (RTL + msw) — componente isolado com API mockada, sem browser | Frontend Coder (loop interno) | < 2 min |
| `e2e-smoke` | Jornada crítica via browser real — apenas o que não pode ser verificado nas camadas anteriores | CI/CD (Cypress / Playwright) | < 5 min total |
| `revisão humana` | Requer julgamento — UX, acessibilidade, decisão de negócio | Product Engineer (Gate D) | — |
| `não funcional` | Performance, segurança, escalabilidade | CI/CD ou ferramenta específica | — |
| `observabilidade` | Logs, métricas, traces — verificável via monitoramento | Release Agent (pós-deploy) | — |

Esse modelo implementa o princípio que o SASE framework chama de *Evidence-Based Acceptance Criteria*: *"The LoopScript defines the structure of the final deliverable: a 'Merge-Readiness Pack.' This isn't just a pull request; it's a bundled collection of evidence that proves the agent's work meets all criteria for being merged."* O contrato define o que o agente precisa provar — não apenas o que precisa escrever.

---

## O princípio da camada mínima necessária

O princípio que orienta toda a estratégia de teste:

> **Cada critério do Acceptance Contract deve ser verificado na camada mais rápida que for tecnicamente capaz de verificá-lo.**

Na prática: validações de campo, regras de negócio, comportamento de API e persistência no banco ficam em `automática-api` — testados via HTTP real sem browser em segundos. Comportamento de formulário React, estados de loading e mensagens de erro ficam em `automática-componente` — testados sem browser, com API mockada. Apenas o que genuinamente requer uma sessão de browser — login real, navegação entre páginas, interação frontend + backend em ambiente real — vai para `e2e-smoke`.

O resultado: o pipeline não precisa subir um browser para verificar que um campo obrigatório vazio gera a mensagem correta. Isso é testado internamente pelo agente, antes do PR ser aberto.

---

## Os dois loops de verificação

A verificação acontece em dois momentos distintos, com responsabilidades complementares.

### Loop interno — cada agente verifica seu próprio trabalho

Durante a implementação, os Coding Agents operam em ciclos contínuos de escrever código, executar testes e corrigir erros. As ferramentas diferem por agente e por tipo de critério:

**Backend Coder (.NET Core / C#):**

```
Implementa código (entities, services, controllers)
  → escreve unit tests (xUnit)               → critérios "automática-unit"
  → escreve API integration tests             → critérios "automática-api"
    (WebApplicationFactory — app em memória,
     HTTP real, banco de dados de teste)
  → executa ambas as suítes
    → passam? → abre PR com evidência
    → falham? → corrige → executa de novo
    → após N iterações sem resolução → CRP ao PE
```

O `WebApplicationFactory` é a ferramenta-chave: sobe o app ASP.NET Core inteiro em memória — middleware, DI, validações, EF Core, regras de negócio — e permite fazer chamadas HTTP reais sem browser nem servidor externo. Um teste que valida *"salvar com CNPJ inválido retorna 422 com a mensagem correta"* roda em milissegundos e cobre exatamente o que hoje exigiria um cenário E2E completo.

**Frontend Coder (React / TypeScript):**

```
Implementa componentes React/TypeScript
  → escreve unit tests (Vitest)               → critérios "automática-unit"
  → escreve component tests                   → critérios "automática-componente"
    (React Testing Library + msw —
     componente isolado, API mockada,
     sem browser)
  → executa ambas as suítes
    → passam? → abre PR com evidência
    → falham? → corrige → executa de novo
    → após N iterações sem resolução → CRP ao PE
```

O msw (Mock Service Worker) intercepta chamadas HTTP do React em nível de rede — o componente de formulário acredita que está se comunicando com uma API real, mas é o msw que responde com dados controlados. Isso permite verificar comportamentos como *"campos obrigatórios vazios → mensagem de erro aparece"* sem subir nenhum servidor.

O Agyn documenta esse padrão como mecanismo central de qualidade: *"when the initial test state is clean and failures correspond directly to the reported issue, this approach provides a reliable feedback signal that guides incremental fixes and helps prevent regressions."* O teste é o sinal de feedback que orienta o agente — não uma verificação posterior ao trabalho.

O agente só abre o PR quando os testes passam. O PR chega ao Code Reviewer com evidência concreta de verificação — sem browser, sem ambiente externo, em minutos.

O limite de iterações é definido no `CLAUDE.md` do projeto. Quando atingido sem resolução, o agente emite um CRP ao Product Engineer documentando o que tentou e por que não conseguiu avançar — protegendo contra loops infinitos e garantindo que decisões que requerem julgamento humano chegam ao humano certo.

### Loop externo — CI/CD executa apenas o que requer browser

Após o PR ser aberto, dois processos rodam em paralelo:

**CodeRabbit + Code Reviewer Agent** verificam o PR contra o Acceptance Contract, critério por critério. Cada critério recebe um resultado explícito — passou, falhou, ou não verificável automaticamente. Critérios marcados como `revisão humana` chegam ao Product Engineer com contexto suficiente para decisão rápida.

**CI/CD executa o `e2e-smoke`** — a **única camada com browser** no processo. São 1–2 jornadas críticas por módulo: login real + ação central que só uma sessão completa de browser pode provar. Meta: menos de 5 minutos no total. O Harness Design da Anthropic confirma o valor e os limites desta camada ao descrever seu avaliador usando Playwright para *"testing UI features, API endpoints, and database states"* — mas reconhecendo que *"small layout issues, interactions that felt unintuitive in places, and undiscovered bugs in more deeply nested features"* ainda escapam, reforçando que browser sozinho não é suficiente nem eficiente para cobrir tudo.

O que fica fora do `e2e-smoke`: validações de campo, erros de API, comportamento de formulário, regras de negócio — tudo isso já foi verificado nas camadas internas, sem browser, antes do PR existir.

---

## O que o Product Engineer recebe: o Merge-Readiness Pack

O SASE framework descreve o produto desse processo conjunto como um *Merge-Readiness Pack* — não apenas um pull request, mas um pacote de evidências estruturado que prova cinco critérios antes do merge humano:

**1. Completude funcional** — todos os critérios de aceite foram atendidos. *"The Gap: Agents often produce superficial or partial fixes that pass a narrow set of tests but fail to address the holistic user need."* A evidência primária são os API integration tests (WebApplicationFactory) e os component tests (RTL) cobrindo cada critério; o smoke E2E complementa com a jornada crítica de browser.

**2. Verificação sólida** — os testes escritos pelo agente cobrem caminhos felizes, edge cases e modos de falha. *"The Gap: Agents may generate code that passes an existing, weak test suite, or they may fail to create new, robust tests for their own logic."* A evidência inclui as suítes xUnit, WebApplicationFactory e RTL — provando que a estratégia de verificação é sólida e não depende apenas de smoke E2E.

**3. Higiene de engenharia** — o código é focado, estruturado e adere aos princípios do projeto (SOLID, DRY, padrões do `CLAUDE.md`). *"The Gap: Agent-generated code can be functional but difficult to maintain, often violating project style guides."* A evidência são os relatórios de análise estática, linting e complexity checkers.

**4. Racional claro** — o raciocínio do agente é sintetizado em uma explicação legível. *"The Gap: An agent's reasoning is often buried in low-level, verbose trajectory files impractical for a human to audit."*

**5. Auditabilidade completa** — rastreabilidade do código de volta ao Acceptance Contract, e do contrato de volta à Feature Spec e ao Business Need que originou a demanda.

O Product Engineer só precisa revisar quando esse pacote está completo — sua atenção é concentrada nos critérios `revisão humana` e nos riscos sinalizados, não em verificação mecânica.

---

## O que muda para o time de QA

O papel de QA na Kognit atual — conforme definido no processo vigente — tem foco em *"planejamento de testes baseado em risco, identificação de cenários negativos e de exceção, e manutenção da origem única dos testes do produto, organizando cobertura por prioridade (80/20 – core) e estratégia de regressão."* Esse conhecimento não desaparece no processo Agent-First — ele muda de suporte.

No processo atual, esse conhecimento vive nos Test Cases. No processo Agent-First, vai para três lugares:

**No Acceptance Contract** — os cenários negativos, edge cases e critérios de aceite são agora os critérios do contrato, com `verificabilidade` explícita e precisa. O agente usa a ferramenta certa para cada tipo: WebApplicationFactory para validar regras de negócio, RTL para verificar comportamento de componente, Cypress apenas para a jornada crítica de browser.

**No `CLAUDE.md` do projeto** — as regras de o que não automatizar (fluxos de convite, uploads de imagem, verificações puramente visuais), a convenção de `data-testid`, a estratégia de dados com âncoras e a definição de quais jornadas merecem `e2e-smoke`. Essas regras tornam-se `MentorScript` — *"team-specific best practices, architectural principles, and coding styles codified, versioned, and applied consistently"* (SASE, Hassan et al., 2025).

**Na estratégia de cobertura por feature** — a classificação de quais critérios são `e2e-smoke` versus `automática-api` versus `automática-componente` é derivada da criticidade e da natureza técnica de cada comportamento. Documentada no `feature-map.yaml` por feature, não por TC individual.

O resultado prático: o QA passa a atuar mais próximo da especificação — garantindo que o Acceptance Contract cobre os cenários corretos com o tipo de verificação certo, e que o `CLAUDE.md` reflete as regras de qualidade do produto.

---

## O que permanece igual

Três princípios do processo atual de qualidade da Kognit permanecem inalterados:

**O princípio da camada mais rápida.** Automatizar o que dá retorno real na camada mais eficiente. A novidade é que "camada mais rápida" agora tem significado preciso: API integration (WebApplicationFactory) antes de E2E, component test (RTL) antes de API integration quando o comportamento é puramente de frontend. Browser apenas quando é estritamente necessário.

**O princípio 80/20.** Nenhuma suíte E2E completa roda a cada PR — só o smoke crítico via browser. Todo o resto é coberto internamente pelas suítes de API integration e component tests, antes do PR existir. A eficiência do pipeline é preservada; a cobertura funcional aumenta.

**A âncora de dados.** A estratégia de usar registros pré-criados como âncoras continua sendo a base da automação confiável. Para os API integration tests (WebApplicationFactory), as âncoras são criadas no setup do teste e destruídas no teardown, mantendo o banco de teste limpo. Para o `e2e-smoke`, as âncoras existentes no ambiente de dev_qa são usadas diretamente.

---

## Referências

- Hassan, A. et al. (2025). *Agentic Software Engineering: Foundational Pillars and a Research Roadmap*. SASE Framework.
- Agyn. (2025). *A Multi-Agent System for Team-Based Autonomous Software Engineering*.
- Anthropic. (2025). *Harness Design for Long-Running Application Development*.
- Atlassian. (2025). *RovoDev Code Reviewer: A Large-Scale Online Evaluation of LLM-based Code Review Automation*.
- Kognit. (2025). *Processo Atual — Papéis e Responsabilidades QA*. Documento interno.
- Kognit. (2025). *reThink v4 Skeleton 10 — Processo Agent-First*. Documento interno.
