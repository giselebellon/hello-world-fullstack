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
Critério:       [número único]
Contexto:       dado que [estado inicial]
Ação:           quando [evento ou ação]
Resultado:      então [comportamento esperado]
Verificabilidade: automática | automatizável com ambiente |
                  revisão humana | não funcional | observabilidade
Evidência:      [o que precisa ser produzido como prova]
Responsável:    Coding Agent | Code Reviewer | Product Engineer
```

O campo `verificabilidade` responde diretamente à pergunta "o que automatizar?" — não é uma decisão que precisa ser tomada depois, por um QA separado. Ela está codificada no contrato, derivada do impacto de negócio e da natureza técnica de cada critério.

Esse modelo implementa o princípio que o SASE framework chama de *Evidence-Based Acceptance Criteria*: *"The LoopScript defines the structure of the final deliverable: a 'Merge-Readiness Pack.' This isn't just a pull request; it's a bundled collection of evidence that proves the agent's work meets all criteria for being merged."* O contrato define o que o agente precisa provar — não apenas o que precisa escrever.

---

## Os dois loops de verificação

A verificação acontece em dois momentos distintos, com responsabilidades complementares.

### Loop interno — o Coding Agent verifica seu próprio trabalho

Durante a implementação, o Coding Agent opera em um ciclo contínuo de escrever código, executar testes e corrigir erros antes de abrir qualquer Pull Request. Esse loop cobre testes unitários e de integração — os que rodam em processo, sem dependência de ambiente externo completo, e que dão feedback rápido e determinístico.

```
Implementa código
  → escreve testes unitários e de integração
    → executa
      → testes passam? → abre PR com evidência
      → testes falham? → corrige código → executa de novo
        → após N iterações sem resolução → emite CRP ao Product Engineer
```

O Agyn — sistema multi-agente desenvolvido para engenharia de software autônoma — documenta exatamente esse padrão como mecanismo central de qualidade: *"when the initial test state is clean and failures correspond directly to the reported issue, this approach provides a reliable feedback signal that guides incremental fixes and helps prevent regressions."* O teste é o sinal de feedback que orienta o agente — não uma verificação posterior ao trabalho.

O agente só abre o PR quando os testes passam. Isso elimina o padrão problemático de um desenvolvedor (humano ou agente) abrir PR com testes quebrados "para resolver depois no CI". O PR já chega ao Code Reviewer com evidência de verificação interna.

O limite de iterações é definido no `CLAUDE.md` do projeto — quando atingido sem resolução, o agente emite um CRP (Clarification Request Point) ao Product Engineer, documentando o que tentou e por que não conseguiu avançar. Isso protege contra loops infinitos e garante que decisões que requerem julgamento humano chegam ao humano certo, na hora certa.

### Loop externo — CI/CD e Code Reviewer verificam a integração

Após o PR ser aberto, dois processos rodam em paralelo:

**CodeRabbit + Code Reviewer Agent** verificam o PR contra o Acceptance Contract, critério por critério. Cada critério recebe um resultado explícito — passou, falhou, ou não verificável automaticamente. Critérios marcados como "revisão humana" chegam ao Product Engineer com contexto suficiente para decisão rápida, sem precisar ler o código completo.

**CI/CD** executa os testes E2E e a suíte regressiva — os testes que requerem ambiente completo, browser e dados de teste. Isso inclui os testes de smoke (< 5 min), core (< 15 min) e full (releases major e nightly). O pipeline é determinístico: os mesmos testes, no mesmo ambiente, produzem os mesmos resultados. Nenhum agente executa testes durante inferência — o CI/CD é sempre o executor final.

O SASE framework descreve o produto desse processo conjunto como um *Merge-Readiness Pack* — não apenas um pull request, mas um pacote de evidências estruturado que prova cinco critérios antes do merge humano:

**1. Completude funcional** — todos os critérios de aceite foram atendidos e a feature funciona em cenários realistas, sem trabalho pendente. *"The Gap: Agents often produce superficial or partial fixes that pass a narrow set of tests but fail to address the holistic user need."* A evidência aqui são os resultados E2E e a cobertura do Acceptance Contract.

**2. Verificação sólida** — o plano de testes é razoável e os testes gerados cobrem caminhos felizes, edge cases e modos de falha. *"The Gap: Agents may generate code that passes an existing, weak test suite, or they may fail to create new, robust tests for their own logic."* A evidência inclui não só os logs de testes passando, mas os próprios testes escritos pelo agente — provando que a estratégia de verificação é sólida.

**3. Higiene de engenharia** — o código é pequeno, focado, logicamente estruturado e adere aos princípios do projeto (SOLID, DRY, padrões do `CLAUDE.md`). *"The Gap: Agent-generated code can be functional but difficult to maintain, often violating project style guides."* A evidência são os relatórios de análise estática, linting e complexity checkers.

**4. Racional claro** — o raciocínio do agente é sintetizado em uma explicação legível que descreve a abordagem adotada e os trade-offs considerados. *"The Gap: An agent's reasoning is often buried in low-level, verbose trajectory files impractical for a human to audit."*

**5. Auditabilidade completa** — rastreabilidade do código de volta ao Acceptance Contract, e do contrato de volta à Feature Spec e ao Business Need que originou a demanda.

O Product Engineer só precisa revisar quando esse pacote está completo — sua atenção é concentrada em decisões que realmente exigem julgamento humano, não em verificação mecânica.

---

## O que muda para o time de QA

O papel de QA na Kognit atual — conforme definido no processo vigente — tem foco em *"planejamento de testes baseado em risco, identificação de cenários negativos e de exceção, e manutenção da origem única dos testes do produto, organizando cobertura por prioridade (80/20 – core) e estratégia de regressão."* Esse conhecimento não desaparece no processo Agent-First — ele muda de suporte.

No processo atual, esse conhecimento vive nos Test Cases: documentos passo a passo que um Tester executa. No processo Agent-First, esse mesmo conhecimento vai para três lugares:

**No Acceptance Contract** — os cenários negativos, edge cases e critérios de aceite que o QA definiria nos TCs são agora os critérios do contrato, com tipo de verificabilidade explícito. O agente verifica contra eles automaticamente.

**No `CLAUDE.md` do projeto** — as regras de o que não automatizar (fluxos de convite, uploads de imagem, verificações puramente visuais), a convenção de `data-testid`, a estratégia de dados com âncoras e as regras de ambiente (o que pode rodar em produção vs. apenas em dev_qa). Essas regras, que hoje dependem do conhecimento tácito do QA, tornam-se `MentorScript` — *"team-specific best practices, architectural principles, and coding styles codified, versioned, and applied consistently"* (SASE, Hassan et al., 2025).

**Na estratégia de regressão em camadas** — a classificação Smoke/Core/Full, que define o que roda em cada evento do CI/CD, é derivada da criticidade de negócio de cada critério do Acceptance Contract. Essa classificação é documentada no `feature-map.yaml` por feature, não por TC individual.

O resultado prático: o QA passa a atuar mais próximo da especificação — garantindo que o Acceptance Contract cobre os cenários corretos e que o `CLAUDE.md` reflete as regras de qualidade do produto — e menos na execução manual de roteiros. É a mesma transição que o SASE descreve para o desenvolvedor humano: de executor de tarefas para *Agent Coach*, mantendo foco estratégico no seu domínio.

---

## O que permanece igual

Três princípios do processo atual de qualidade da Kognit permanecem inalterados:

**A estratégia de regressão em camadas.** Smoke < 5 minutos, Smoke + Core < 15 minutos, Full em releases major e nightly. Essa estratégia é uma das melhores práticas mais consolidadas do mercado e continua sendo o critério de design da suíte automatizada.

**O princípio 80/20.** Automatizar o que dá retorno real — fluxos críticos, validações de campo frequentes, caminhos que quebram com facilidade — e não gastar esforço em verificações visuais ou fluxos de setup únicos. Isso não muda; muda apenas onde essa decisão é documentada.

**A âncora de dados.** A estratégia de usar registros pré-criados como âncoras — dados conhecidos, estáveis, mutuamente exclusivos para buscas parciais — continua sendo a base da automação confiável. Ela migra para o `CLAUDE.md` e para o contexto do projeto, onde o Coding Agent a aplica ao escrever testes.

---

## Referências

- Hassan, A. et al. (2025). *Agentic Software Engineering: Foundational Pillars and a Research Roadmap*. SASE Framework.
- Agyn. (2025). *A Multi-Agent System for Team-Based Autonomous Software Engineering*.
- Atlassian. (2025). *RovoDev Code Reviewer: A Large-Scale Online Evaluation of LLM-based Code Review Automation*.
- Kognit. (2025). *Processo Atual — Papéis e Responsabilidades QA*. Documento interno.
- Kognit. (2025). *reThink Gi v3 — Processo Agent-First*. Documento interno.
