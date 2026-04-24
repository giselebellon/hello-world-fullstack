# Manual de Processo — Geração e Gestão de Test Cases com IA

> **Versão:** 3.0 (prompt v11)  
> **Público:** Testers, QA Analysts e Automatizadores  
> **Pré-requisito de leitura:** nenhum — este manual parte do zero.  
> **Leitura complementar:** *Guia de Test Cases QA* para as regras de geração e referência técnica; *Guia de Instalação Python* para configurar o ambiente do script pela primeira vez.

---

## Sumário

1. [Visão Geral do Processo](#1-visão-geral-do-processo)
2. [Script de Conversão — JSON para Excel](#2-script-de-conversão--json-para-excel)
3. [Script de Conversão — Excel para JSON](#3-script-de-conversão--excel-para-json)
4. [Gerando Test Cases com IA (Claude)](#4-gerando-test-cases-com-ia-claude)
5. [Mantendo o TC Registry Global](#5-mantendo-o-tc-registry-global)
6. [Executando Testes Manuais na Planilha](#6-executando-testes-manuais-na-planilha)
7. [Fluxo Completo da Sprint](#7-fluxo-completo-da-sprint)
8. [Alterando e Mantendo Test Cases](#8-alterando-e-mantendo-test-cases)
9. [Solução de Problemas Comuns](#9-solução-de-problemas-comuns)

---

## 1. Visão Geral do Processo

O processo de test cases desta equipe combina três ferramentas:

| Ferramenta | Para que serve |
|---|---|
| **Claude (IA)** | Lê as specs funcionais (`.md`) e gera os TCs em JSON |
| **Script Python** | Converte JSON → Excel e Excel → JSON |
| **Excel** | Onde o time executa os testes e registra resultados |

O fluxo entre elas é:

```
Spec .md
   ↓
Claude (com o System Prompt v11 ativo no Project de QA)
   ↓
TestCases_{MOD}.json  +  TCRegistry_{MOD}.json
   ↓
Script Python (opção 2: JSON → Excel)
   ↓
TestCase_{MOD}.xlsx  ← Tester executa e preenche resultados aqui
   ↓  (se precisar atualizar o JSON a partir de edições feitas no Excel)
Script Python (opção 1: Excel → JSON)
   ↓
TestCases_{MOD}_atualizado.json
```

> 💡 **Antes de começar pela primeira vez:** configure o ambiente Python seguindo o *Guia de Instalação Python*. Esse passo é feito uma única vez por máquina.

---

## 2. Script de Conversão — JSON para Excel

Use esta opção quando tiver um JSON gerado pela IA e quiser transformá-lo em uma planilha Excel formatada.

### 2.1 Ativar o ambiente virtual e rodar o script

```powershell
.\.venv\Scripts\Activate.ps1
python JSON_Excel_TestCase_por_modulo.py
```

O menu vai aparecer:

```
Escolha uma opção:
1 - Exportar Excel para JSON por módulo
2 - Gerar Excel por módulo a partir de JSON
Opção:
```

### 2.2 Escolher a opção 2

Digite `2` e pressione Enter.

### 2.3 Informar o caminho do JSON

```
Digite o caminho do arquivo JSON de entrada:
```

Informe o caminho completo do arquivo. Exemplos:

```
C:\Users\SeuUser\Kognit\...\CasosTestes\entrada\TestCases_CLT.json
```

ou, se o arquivo estiver na mesma pasta do script:

```
TestCases_CLT.json
```

### 2.4 Resultado

O script gera um arquivo `.xlsx` por módulo encontrado no JSON, dentro da pasta `exportados_excel`:

```
Excel(s) gerado(s) com sucesso:
...\exportados_excel\TestCase_CLT_Clientes_20250408_143022.xlsx
```

### 2.5 Estrutura da planilha gerada

Cada arquivo Excel tem uma aba com o nome do módulo. A estrutura das colunas é:

| Col | Campo | Descrição |
|---|---|---|
| A | **ID** | Número sequencial do TC |
| B | **TC Name** | Ex: `TC_CLT_001` |
| C | **Feature** | Título exato da spec |
| D | **Module** | Nome do módulo |
| E | **Module Code** | Código de 3 letras (ex: `CLT`) |
| F | **Flow** | Agrupamento funcional do cenário |
| G | **Reuse \*** | Marcador de reuso de steps (`*1`, `*2`...) |
| H | **Scenario (what will be validated)** | Título do TC (linha de cabeçalho) ou descrição do step |
| I | **DEV/QA Automatizar** | `X` se o step será automatizado em dev_qa |
| J | **HOM./PROD Automatizar** | `X` se o step será automatizado em hom_prod |
| K | **Estratégia de Automatização** | Instruções e dados concretos para o Automatizador |

> 💡 **Como ler a planilha:** cada TC ocupa **uma linha de cabeçalho** (com ID, TC Name, Feature, Module, etc.) seguida por **uma linha por step**. A linha de cabeçalho tem fundo cinza e as linhas de steps ficam em branco.

---

## 3. Script de Conversão — Excel para JSON

Use esta opção quando você tiver editado a planilha Excel (corrigido steps, ajustado estratégias, etc.) e quiser atualizar o JSON de origem.

### 3.1 Ativar o ambiente virtual e rodar o script

Mesmos passos de 2.1.

### 3.2 Escolher a opção 1

```
Opção: 1
```

### 3.3 Informar o caminho do Excel

```
Digite o caminho do arquivo Excel de entrada:
...\entrada\TestCase_CLT_Clientes_20250408_143022.xlsx
```

### 3.4 Resultado

O script gera um arquivo `.json` por módulo encontrado, dentro da pasta `exportados_json`.

---

## 4. Gerando Test Cases com IA (Claude)

### 4.1 Configurar o System Prompt

O **System Prompt** é o conjunto de instruções que transforma o Claude em especialista de QA para geração de TCs. Ele é configurado **uma única vez** no Project do Claude.

**Como configurar:**

1. Acesse [claude.ai](https://claude.ai) e crie um **Project** para o time de QA
2. Nas configurações do Project, cole o conteúdo do arquivo `Prompt-geracao-test-cases-v11.md` no campo **"Project Instructions"**
3. Salve — o prompt ficará ativo para todas as conversas dentro deste Project

> 💡 Criando um Project, o System Prompt persiste entre sessões. Você não precisa colar o prompt toda vez.

### 4.2 Modo A — Geração inicial de um módulo novo

**O que você precisa ter em mãos:**

- ✅ Os arquivos `.md` com as especificações funcionais das features do módulo
- ✅ O **`TCRegistry_Global.json` atualizado** (para manter a sequência de IDs)

**Passo a passo:**

1. Abra uma nova conversa dentro do Project de QA
2. Anexe todos os arquivos `.md` das specs + o `TCRegistry_Global.json`
3. Escreva uma mensagem simples, por exemplo:

```
Utilize o conteúdo do arquivo "Prompt-geracao-test-cases-v11.md" como instruções para gerar os test cases do módulo de "Clientes". 
Inicie a sequencia do "Registry" em 1, não temos TCs definidos ainda. 
Os arquivos gerados de output devem ter a nomenclatura:
a) TestCase_{module_code}_{module_name}_%Y%m%d_%H%M%S
b) Registry_{module_code}_{module_name}_%Y%m%d_%H%M%S
Siga o processo completo do prompt.
```

4. Responda as perguntas de esclarecimento (detalhadas no *Guia de Test Cases QA*)
5. Receba e salve os arquivos gerados:
   - **`TestCase_{module_code}_{module_name}_{%Y%m%d_%H%M%S}.json`** — o roteiro completo de testes
   - **`Registry_{module_code}_{module_name}_{%Y%m%d_%H%M%S}.json`** — o registro desta geração para mesclar no global
6. Se for o primeiro TC o arquivo Registry gerado deverá ser o **`TCRegistry_Global.json`** para manter o mapping completo (veja item 5 para manutenção).

### 4.3 Modo B — Atualização de módulo existente

Ativado quando a spec de um módulo já existente muda. O Claude identifica o Modo B automaticamente pela presença do JSON do módulo anexado.

**O que você precisa ter em mãos:**

- ✅ O arquivo `.md` da spec **atualizada**
- ✅ O **`TestCase_{module_code}_{module_name}_{%Y%m%d_%H%M%S}.json` atual** do módulo ← obrigatório para o Modo B
- ✅ O **`TCRegistry_Global.json`** atualizado

**Passo a passo:**

1. Abra uma nova conversa dentro do Project de QA
2. Anexe os três arquivos acima
3. Inicie com uma mensagem descrevendo o contexto:

> *"A spec de 'Cadastro e Edição de Clientes' foi atualizada. Segue a spec nova, o JSON atual do módulo e o Registry global."*

4. O Claude apresentará um **relatório de impacto identificado** antes de fazer perguntas — confirme ou corrija o mapeamento proposto
5. Responda as demais perguntas de esclarecimento
6. Receba e salve os arquivos gerados:
   - **`TestCase_{module_code}_{module_name}_{%Y%m%d_%H%M%S}.json`** — JSON completo e versionado do módulo
   - **`Registry_{module_code}_{module_name}_{%Y%m%d_%H%M%S}.json`** — somente os TCs novos desta atualização
   - **Relatório de Atualização** — copie e arquive junto com os JSONs

> ⚠️ **TCs obsoletos no Excel:** após converter, localize as linhas dos TCs marcados como obsoletos e pinte o cabeçalho em cinza para sinalização visual — o script não faz isso automaticamente.

### 4.4 Sugestões de melhoria do checklist e da spec

Ao final de cada geração, o Claude apresenta duas saídas adicionais:

- **Sugestões de novos itens para o checklist de insights** — avalie cada sugestão e, se pertinente, adicione ao checklist no System Prompt para as próximas gerações.
- **Sugestões de ajustes na especificação** — gaps, ambiguidades ou inconsistências identificados durante a geração. Compartilhe com o time de produto e desenvolvimento antes da implementação ou da próxima sprint.

> ⚠️ Explique para a equipe de Processos da Kognit sobre os ajustes realizados, a fim de auxiliar na melhoria do processo organizacional.

---

## 5. Mantendo o TC Registry Global

O **TC Registry Global** é o arquivo central que mantém o histórico de todos os TCs gerados e garante que a numeração não se repita entre sessões e módulos.

### 5.1 Estrutura do arquivo

```json
{
  "last_global_id": 33,
  "last_tc_name": "TC_CLT_033",
  "version": "1.0",
  "entries": [
    {
      "id": 1,
      "tc_name": "TC_CLT_001",
      "module": "Clientes",
      "module_code": "CLT",
      "feature": "Consulta de Clientes",
      "flow": "Lista de Clientes",
      "scenario_title": "Lista de Clientes — Estado inicial e exibição do grid",
      "status": "ativo"
    }
  ]
}
```

**Campos do Registry:**

| Campo | Descrição |
|---|---|
| `last_global_id` | Maior ID gerado até o momento em todo o sistema |
| `last_tc_name` | `tc_name` correspondente ao `last_global_id` |
| `version` | Versão do Registry — incrementar a cada ciclo de atualização (ex: `"1.0"` → `"1.1"`) |
| `status` | `"ativo"` para TCs em uso; `"obsoleto"` para TCs revogados — **sempre explícito, nunca omitido** |
| `updated_at` | *(Opcional)* Data da última alteração da entry |
| `update_reason` | *(Opcional)* Motivo da alteração |

### 5.2 Como atualizar após cada geração

**Modo A (geração inicial):**

1. Abra o `TCRegistry_Global.json` no VS Code ou qualquer editor de texto
2. Abra o `Registry_{module_code}_{module_name}_{%Y%m%d_%H%M%S}.json` gerado pelo Claude
3. **Copie** todas as entradas do array `entries` do arquivo do módulo
4. **Cole** no final do array `entries` do arquivo global
5. Atualize `last_global_id`, `last_tc_name` e incremente `version`
6. Salve o `TCRegistry_Global.json`

**Modo B (atualização):**

1. Mescle o **`TCRegistry_{MOD}_delta.json`** (somente TCs novos) no global — mesmo processo acima
2. Para TCs marcados como obsoletos: localize a entry no global e altere `status` para `"obsoleto"`, adicionando `updated_at` e `update_reason`

**Exemplo — antes (global tinha CLT 001–033, adicionando USR 034–045):**

```json
{
  "last_global_id": 45,
  "last_tc_name": "TC_USR_045",
  "entries": [
    { "id": 1,  "tc_name": "TC_CLT_001", ... },
    { "id": 33, "tc_name": "TC_CLT_033", ... },
    { "id": 34, "tc_name": "TC_USR_034", ... },
    { "id": 45, "tc_name": "TC_USR_045", ... }
  ]
}
```

### 5.3 Fornecendo o Registry na próxima sessão

Na próxima conversa com o Claude, anexe o `TCRegistry_Global.json`. O Claude lerá o `last_global_id` e iniciará a numeração a partir de `last_global_id + 1`.

---

## 6. Executando Testes Manuais na Planilha

### 6.1 Abrindo a planilha para execução

Após converter o JSON para Excel (seção 2), abra o arquivo `.xlsx` gerado.

### 6.2 Registrando o resultado de cada step

Adicione uma coluna `L` chamada **"Data / Resultado"** para registro:

| Situação | O que registrar na coluna |
|---|---|
| TC ainda não executado | *(vazio)* |
| Step executado com sucesso | Data da execução (ex: `08/04/2025`) |
| Step executado com falha | Número do ticket (ex: `BUG-1234`) |

### 6.3 Boas práticas durante a execução

- Execute os TCs **na ordem do ID** — alguns cenários dependem de steps de TCs anteriores via `reuse_id`
- Ao encontrar um **step com `Reuse *`**, localize o TC referenciado e execute aqueles steps antes de prosseguir
- Registre o ticket imediatamente ao encontrar uma falha — não deixe para depois
- Se um TC de **Restauração de Âncora** falhar (steps que restauram registros âncora para o estado original), **marque como bloqueante** e avise o time antes de continuar — a falha pode impactar outros TCs que dependem daquele dado

---

## 7. Fluxo Completo da Sprint

```
INÍCIO DA SPRINT
      │
      ▼
┌─────────────────────────────────────────────────────────────┐
│  1. QA recebe as specs .md das features entregues na sprint │
└─────────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Abre Claude (Project de QA com System Prompt v11 ativo) │
│     Modo A: anexa .md + TCRegistry_Global.json              │
│     Modo B: anexa .md atualizado + JSON do módulo + Registry│
│     Responde as perguntas de esclarecimento                 │
└─────────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Salva os arquivos gerados:                              │
│     - TestCases_{MOD}.json  → pasta entrada/               │
│     - TCRegistry_{MOD}.json → mescla no TCRegistry_Global  │
│     - Relatório de Atualização (Modo B) → arquiva junto    │
└─────────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Roda o script Python (opção 2: JSON → Excel)            │
│     Gera TestCase_{MOD}.xlsx na pasta exportados_excel/     │
└─────────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Tester executa os testes manuais na planilha            │
│     Preenche data de execução ou número de ticket por step  │
└─────────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────────┐
│  6. Automatizador Cypress lê os TCs da sprint anterior      │
│     Implementa os testes regressivos conforme campo         │
│     "Estratégia de Automatização" de cada step              │
└─────────────────────────────────────────────────────────────┘
      │
      ▼
FIM DA SPRINT → PRÓXIMA SPRINT começa no passo 1
```

---

## 8. Alterando e Mantendo Test Cases

### 8.1 Quando alterar um TC

| Situação | Tipo de alteração |
|---|---|
| A especificação funcional foi atualizada (nova regra, campo novo, comportamento alterado) | Modo B no Claude — regerar o módulo com diff automático |
| Um step estava errado ou incompleto (revisão interna) | Correção pontual no Excel ou JSON |
| Um novo edge case foi identificado durante a execução | Adicionar step ou novo TC |
| A estratégia de automação mudou (dados fixos novos, ambiente diferente) | Atualizar campo `Estratégia de Automatização` |

### 8.2 Princípios que nunca mudam

> **1. IDs e `tc_name` são imutáveis.**  
> Um TC com `id: 5` e `tc_name: TC_CLT_005` nunca muda de número — mesmo que fique obsoleto. Isso protege referências de `reuse_id` e a rastreabilidade histórica.

> **2. Novos TCs sempre continuam a sequência global.**  
> Se o último ID do sistema é 45 e você precisa adicionar um TC novo ao módulo Clientes, ele vai ser `id: 46`, `tc_name: TC_CLT_046` — mesmo que seja inserido "no meio" de um conjunto existente.

> **3. `status` é sempre explícito — nunca omitido.**  
> Todo TC no JSON e toda entry no Registry carregam `"status": "ativo"` ou `"status": "obsoleto"`. Nunca deixe o campo ausente.

### 8.3 Cenário 1 — Correção pontual (typo, wording, estratégia)

Quando a mudança é pequena e não envolve regerar o TC via IA.

**Passos:**

1. Abra o `.xlsx` correspondente ao módulo
2. Localize o TC e o step a corrigir
3. Edite diretamente na célula da coluna **H** (descrição) ou **K** (estratégia)
4. Salve o Excel
5. Rode o script Python — **opção 1 (Excel → JSON)**
6. Substitua o JSON anterior pelo novo gerado em `exportados_json/`
7. **Não** precisa atualizar o `TCRegistry_Global.json` — nenhum TC foi criado ou removido

### 8.4 Cenário 2 — Spec atualizada com impacto em TCs existentes

Quando a especificação funcional muda e os TCs do módulo precisam refletir a mudança. Use o **Modo B** do Claude — ele faz o diff automaticamente e regera o JSON completo usando o JSON anterior como âncora.

**O que o Claude faz no Modo B:**
- Preserva `id` e `tc_name` de todos os TCs que continuam válidos
- Atualiza os steps dos TCs afetados, mantendo sua numeração
- Marca como `"status": "obsoleto"` os TCs cujo cenário foi revogado (prefixando o `scenario_title` com `[OBSOLETO - {motivo}]`)
- Cria novos TCs com IDs na sequência correta a partir do `last_global_id`
- Entrega um Relatório de Atualização listando cada categoria de mudança

**Passo a passo:** siga a seção 4.3 deste manual.

### 8.5 Cenário 3 — Adicionar um novo TC a um módulo existente

Quando você identificou um cenário não coberto e quer adicionar sem regerar tudo.

**Passos:**

1. Abra o Claude no Project de QA
2. Forneça o contexto do módulo, o `TCRegistry_Global.json` e a descrição do cenário:

> *"Preciso adicionar um TC para o cenário de tentativa de salvar um cliente com o campo 'Nome Fantasia' contendo apenas espaços em branco. Módulo Clientes (CLT), feature 'Cadastro e Edição de Clientes', flow 'Criação de Cliente'. O último ID global é 45."*

3. O Claude gera o TC com `id: 46` e `tc_name: TC_CLT_046`
4. Adicione manualmente o novo TC:
   - No JSON existente do módulo: insira o objeto no array `test_cases`
   - No `TCRegistry_Global.json`: adicione a entry e atualize `last_global_id`
5. Converta o JSON atualizado para Excel (opção 2 do script)

### 8.6 Cenário 4 — Marcar um TC como obsoleto (caso isolado)

Quando um TC não se aplica mais, mas você não quer perder o histórico.

**Não delete o TC.** Em vez disso:

**No JSON do módulo:**
```json
{
  "id": 19,
  "tc_name": "TC_CLT_019",
  "status": "obsoleto",
  "scenario_title": "[OBSOLETO - campo removido da spec] Criação — CNPJ duplicado",
  "updated_at": "2026-04-22",
  "update_reason": "Validação de CNPJ duplicado foi removida do fluxo de criação",
  "feature": "Cadastro e Edição de Clientes",
  ...
}
```

**No `TCRegistry_Global.json`:** localize a entry e aplique as mesmas alterações.

**No Excel:** pinte a linha de cabeçalho do TC em cinza para sinalização visual.

> 💡 Quando a spec mudou e vários TCs ficaram obsoletos ao mesmo tempo, use o Cenário 2 — o Claude (Modo B) faz essa marcação em lote com mais segurança do que a edição manual.

### 8.7 Resumo — qual caminho seguir?

```
Preciso alterar um TC
        │
        ├── É uma correção pequena (texto, estratégia)?
        │         └── Edita no Excel → Script opção 1 (Excel → JSON)
        │
        ├── A spec mudou e impacta vários TCs?
        │         └── Modo B no Claude
        │             (spec atualizada + JSON do módulo + Registry)
        │             Claude faz o diff, confirma, regera JSON completo + delta
        │             Salva → Versiona JSON → Mescla delta → Script opção 2
        │
        ├── Preciso adicionar um TC novo isolado?
        │         └── Claude gera o TC com ID correto
        │             Insere manualmente no JSON e no Registry
        │             Script opção 2 (JSON → Excel)
        │
        └── O TC ficou obsoleto (caso isolado)?
                  └── Altera status → "obsoleto" no JSON e no Registry
                      Prefixa scenario_title com [OBSOLETO - motivo]
                      Pinta linha em cinza no Excel
                      Nunca deleta, nunca renumera
```

---

## 9. Solução de Problemas Comuns

### `python` não é reconhecido no terminal

**Causa:** Python não foi adicionado ao PATH durante a instalação.  
**Solução:** Desinstale e reinstale o Python, marcando "Add Python to PATH" na primeira tela. Consulte o *Guia de Instalação Python*.

---

### `ModuleNotFoundError: No module named 'openpyxl'`

**Causa:** O ambiente virtual não está ativo ou a biblioteca não foi instalada.  
**Solução:**
1. Ative o ambiente: `.\.venv\Scripts\Activate.ps1`
2. Instale: `pip install openpyxl`

---

### Erro de `ExecutionPolicy` no PowerShell

**Causa:** Política de segurança do Windows bloqueando scripts `.ps1`.  
**Solução:**
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

---

### `FileNotFoundError: Arquivo JSON não encontrado`

**Causa:** O caminho informado está incorreto.  
**Solução:** Verifique o caminho digitado. Dica: arraste o arquivo do Explorer para o terminal — ele preenche o caminho automaticamente.

---

### Claude gerou TCs com IDs repetidos em relação a uma geração anterior

**Causa:** O `TCRegistry_Global.json` não foi fornecido na sessão e o Claude iniciou do zero.  
**Solução:**
1. Edite o JSON gerado manualmente, ajustando IDs e `tc_name` para continuar da sequência correta
2. Para próximas gerações, sempre anexe o `TCRegistry_Global.json` na conversa

---

### O Excel gerado tem colunas com largura inadequada

**Causa:** O script ajusta larguras automaticamente, mas textos muito longos podem causar variações.  
**Solução:** Ajuste manualmente no Excel após a geração — isso não afeta os dados e não precisa ser convertido de volta.

---

*Manual mantido pelo time de QA. Para sugestões de melhoria, abra uma issue no repositório do projeto ou fale com o responsável pelo processo.*
