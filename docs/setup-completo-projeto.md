# Hello World Full Stack — Guia Completo para Iniciantes

> Este guia foi criado para quem está começando do zero.
> Cada passo explica **o que fazer** e **por que fazer**.

---

## O que você vai construir

Uma aplicação simples com duas partes que conversam entre si:

- **Backend** → uma API feita em C# (.NET Core) que responde com "Hello World"
- **Frontend** → uma tela em React que exibe essa resposta
- **Git + GitHub** → para salvar e versionar o código
- **GitBook** → para documentar tudo isso

---

## O que você precisa instalar antes de começar

### 1. Visual Studio (para o backend)

👉 Baixe em: [visualstudio.microsoft.com](https://visualstudio.microsoft.com)

Durante a instalação, marque:
- ✅ **ASP.NET and web development**

> **Por que?** O Visual Studio é o editor usado para criar aplicações em C#.

---

### 2. VS Code (para o frontend e documentação)

👉 Baixe em: [code.visualstudio.com](https://code.visualstudio.com)

> **Por que?** O VS Code é mais leve e ideal para trabalhar com React e arquivos Markdown.

---

### 3. Node.js (necessário para o React)

👉 Baixe em: [nodejs.org](https://nodejs.org) — escolha a versão **LTS**

Após instalar, abra o CMD e verifique:

```bash
node -v
npm -v
```

> Se aparecer um número de versão, a instalação funcionou.

---

### 4. Git (para versionamento)

👉 Baixe em: [git-scm.com/download/win](https://git-scm.com/download/win)

Após instalar, verifique:

```bash
git --version
```

> **Por que o Git?** Ele registra cada mudança no seu código, como um histórico com "desfazer" ilimitado.

---

## Criando a estrutura de pastas

Crie uma pasta principal chamada `HelloWorldFullStack` e dentro dela crie três subpastas:

```
HelloWorldFullStack/
  backend/
  frontend/
  docs/
```

> Você pode criar as pastas pelo Explorer normalmente, clicando com o botão direito → Nova pasta.

---

## Parte 1 — Backend em C# (.NET Core)

### Passo 1: Criar o projeto no Visual Studio

1. Abra o Visual Studio
2. Clique em **Criar novo projeto**
3. Escolha o template: **API Web do ASP.NET Core**
4. Configure assim:
   - Nome do projeto: `HelloWorld.Api`
   - Local: sua pasta `backend/`
   - ✅ Usar controllers
   - ✅ Habilitar OpenAPI (Swagger)
5. Clique em **Criar**

---

### Passo 2: Criar o endpoint "Hello World"

Dentro da pasta `Controllers/`, crie um arquivo chamado `HelloController.cs` com o seguinte conteúdo:

```csharp
using Microsoft.AspNetCore.Mvc;

namespace HelloWorld.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HelloController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            message = "Hello World from .NET Core API!"
        });
    }
}
```

> **O que esse código faz?** Cria uma rota `/api/hello` que, quando acessada, retorna uma mensagem JSON.

---

### Passo 3: Configurar CORS

CORS permite que o frontend (rodando em outra porta) acesse o backend.

Abra o arquivo `Program.cs` e substitua o conteúdo por:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddOpenApi();

var app = builder.Build();

app.UseCors("AllowReactApp");

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

---

### Passo 4: Rodar o backend

1. Pressione **F5** no Visual Studio (ou clique em **Executar**)
2. O navegador vai abrir com o Swagger
3. Teste a rota acessando:

```
https://localhost:7162/api/hello
```

Resposta esperada:

```json
{
  "message": "Hello World from .NET Core API!"
}
```

> ⚠️ Guarde o número da porta (ex: `7162`). Você vai usar no frontend.

---

## Parte 2 — Frontend em React

### Passo 1: Criar o projeto React

Abra o CMD, navegue até a pasta `frontend/` e execute:

```bash
npm create vite@latest . -- --template react
npm install
```

> O ponto `.` diz ao Vite para criar o projeto na pasta atual.

---

### Passo 2: Rodar o frontend

```bash
npm run dev
```

Acesse no navegador:

```
http://localhost:5173
```

---

### Passo 3: Conectar ao backend

Abra o arquivo `frontend/src/App.jsx` e substitua todo o conteúdo por:

```jsx
import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("https://localhost:7162/api/hello")
      .then((response) => response.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage("Erro ao conectar com a API"));
  }, []);

  return (
    <div>
      <h1>Hello World Full Stack</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;
```

> ⚠️ Se a porta do seu backend for diferente de `7162`, troque no código acima.

Agora abra o navegador em `http://localhost:5173` e você deve ver a mensagem vinda do backend.

---

## Parte 3 — Git e GitHub

### Passo 1: Inicializar o Git na pasta do projeto

Abra o CMD, navegue até a pasta raiz do projeto e execute:

```bash
cd C:\Users\gisele\ClaudeProjects\HelloWorldFullStack
git init
```

> **O que isso faz?** Transforma a pasta em um repositório Git, habilitando o controle de versão.

---

### Passo 2: Criar o arquivo `.gitignore`

Na raiz do projeto, crie um arquivo chamado `.gitignore` com o conteúdo abaixo.

> **Por que?** Esse arquivo diz ao Git quais pastas ignorar — como `node_modules/` (que é enorme e não precisa ser enviada ao GitHub).

```gitignore
# .NET
bin/
obj/
.vs/

# React
node_modules/
dist/

# Logs
*.log

# Sistema operacional
.DS_Store
Thumbs.db
```

---

### Passo 3: Fazer o primeiro commit

```bash
git add .
git commit -m "Initial full stack hello world project"
```

> **O que é um commit?** É um "salvo" do seu projeto naquele momento, com uma mensagem descrevendo o que foi feito.

---

### Passo 4: Publicar no GitHub

1. Acesse [github.com](https://github.com) e crie um novo repositório chamado `hello-world-fullstack`
2. Não marque nenhuma opção de inicialização (sem README, sem .gitignore)
3. Copie o link do repositório e execute no CMD:

```bash
git remote add origin https://github.com/SEU_USUARIO/hello-world-fullstack.git
git branch -M main
git push -u origin main
```

> Substitua `SEU_USUARIO` pelo seu nome de usuário no GitHub.

---

## Parte 4 — Documentação com GitBook

### Estrutura necessária

Dentro da pasta `docs/` crie dois arquivos:

```
docs/
  README.md
  SUMMARY.md
```

---

### README.md

```markdown
# Hello World Full Stack

Documentação do projeto Hello World Full Stack.

## Objetivo

Demonstrar uma aplicação simples com frontend React, backend .NET Core e integração entre os dois.
```

---

### SUMMARY.md

```markdown
# Summary

* [Introdução](README.md)
```

> ⚠️ **Esse arquivo é crítico.** O GitBook usa o `SUMMARY.md` para montar o menu de navegação. Se ele estiver errado ou vazio, nenhuma página aparece.

---

### Configurar a integração no GitBook

1. Acesse [app.gitbook.com](https://app.gitbook.com)
2. Crie um **Space** (espaço de documentação)
3. Vá em **Integrations → GitHub**
4. Configure:
   - **Repository:** `hello-world-fullstack`
   - **Branch:** `main`
   - **Project directory:** `docs`
5. Selecione a direção: **GitHub → GitBook**
6. Salve e aguarde a sincronização

---

### Problemas comuns e soluções

| Problema | Causa | Solução |
|---|---|---|
| Página não aparece no GitBook | `SUMMARY.md` mal configurado | Adicionar referência ao `README.md` |
| Conteúdo não atualiza | Change request não aprovado | Fazer merge ou desativar workflow |
| Dropdown do GitHub vazio | GitHub App não instalado | Instalar e autorizar o repositório |
| Erro ao chamar a API | Backend não está rodando | Executar no Visual Studio (F5) |
| CORS bloqueado | Porta do frontend diferente | Ajustar a URL no `Program.cs` |

---

## Estrutura final do projeto

```
HelloWorldFullStack/
  backend/
    HelloWorld.Api/
      Controllers/
        HelloController.cs
      Program.cs
  frontend/
    src/
      App.jsx
  docs/
    README.md
    SUMMARY.md
    setup-completo-projeto.md
  .gitignore
```

---

## Fluxo de trabalho do dia a dia

Sempre que fizer mudanças no projeto:

```bash
# 1. Ver o que mudou
git status

# 2. Adicionar os arquivos modificados
git add .

# 3. Salvar com uma mensagem
git commit -m "descrição do que foi feito"

# 4. Enviar para o GitHub
git push
```

---

## Resumo do que você aprendeu

| Ferramenta | Para que serve |
|---|---|
| Visual Studio | Criar e rodar o backend em C# |
| VS Code | Editar o frontend e a documentação |
| Node.js + Vite | Criar e rodar o projeto React |
| Git | Controle de versão local |
| GitHub | Armazenar o código na nuvem |
| GitBook | Documentar o projeto de forma organizada |

---

## Parte 5 — Integração GitHub com Claude (Claude Code Action)

Esta etapa permite usar o Claude diretamente no seu repositório GitHub para:

- Revisar Pull Requests automaticamente
- Gerar sugestões de código
- Automatizar análises com IA

---

### 5.1 Pré-requisitos

Antes de começar, você precisa:

- Conta no GitHub
- Repositório já criado (ex: `hello-world-fullstack`)
- Conta na Anthropic (Claude)

---

### 5.2 Criar a chave de API do Claude

1. Acesse: https://console.anthropic.com/
2. Vá em **API Keys**
3. Clique em **Create Key**
4. Copie a chave gerada (ex: `sk-ant-...`)

---

### 5.3 Adicionar a chave como segredo no GitHub

1. Acesse seu repositório no GitHub
2. Vá em:

```text
Settings → Secrets and variables → Actions
````

3. Clique em:

```text
New repository secret
```

4. Configure:

```text
Name: ANTHROPIC_API_KEY
Value: (cole sua chave da Anthropic)
```

5. Clique em **Add secret**

---

### 5.4 Criar o workflow do GitHub Actions

No seu projeto, crie o arquivo:

```text
.github/workflows/claude.yml
```

Conteúdo:

```yaml
name: Claude Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  claude-review:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Claude Code Action
        uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

---

### 5.5 Fazer commit da configuração

```bash
git add .
git commit -m "Add Claude GitHub Action"
git push
```

---

### 5.6 Como funciona

A partir de agora:

1. Sempre que você abrir ou atualizar um Pull Request
2. O GitHub executa automaticamente o workflow
3. O Claude analisa o código
4. Ele pode adicionar comentários ou sugestões no PR

---

### 5.7 Boas práticas (segurança e simplicidade)

* Nunca exponha sua API Key no código
* Sempre use `secrets` do GitHub
* Limite o uso inicialmente a Pull Requests (mais seguro)
* Teste primeiro em um repositório pessoal antes de usar em produção

---

### 5.8 Possíveis evoluções

Depois de validar, você pode evoluir para:

* Revisão automática mais detalhada
* Geração de testes automatizados
* Sugestão de melhorias arquiteturais
* Integração com backlog (Linear, etc.)

---

