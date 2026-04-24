# Guia de Instalação — Python e Ambiente de Scripts QA

> **Público:** qualquer membro do time que for rodar o script de conversão JSON ↔ Excel pela primeira vez.  
> **Pré-requisito:** nenhum — este guia parte do zero.

---

## Sumário

1. [Instalando o Python](#1-instalando-o-python)
2. [Configurando o Ambiente Virtual](#2-configurando-o-ambiente-virtual)
3. [Instalando as Dependências do Script](#3-instalando-as-dependências-do-script)
4. [Configurando o Script de Conversão](#4-configurando-o-script-de-conversão)
5. [Solução de Problemas Comuns](#5-solução-de-problemas-comuns)

---

## 1. Instalando o Python

### 1.1 Baixar o instalador

Abra o navegador e acesse: 👉 **python.org/downloads**

Clique em **Download Python 3.x.x** (a versão mais recente está em destaque).

### 1.2 Executar o instalador

Quando o download terminar, clique duas vezes no arquivo baixado (ex: `python-3.12.5-amd64.exe`).

### 1.3 Configuração importante — Add Python to PATH

Na **primeira tela** do instalador você verá duas caixas de seleção:

- ✅ **Add Python 3.x to PATH** ← essa é fundamental, marque sempre!
- ✅ Install launcher for all users (recomendado, mas opcional)

> ⚠️ **Atenção:** marque "Add Python to PATH" **antes** de clicar em qualquer botão. Se não marcar, o Python não funcionará no terminal.

### 1.4 Instalar

1. Clique em **Install Now**
2. O instalador copiará os arquivos e configurará o PATH automaticamente
3. Quando terminar, clique em **Close**

### 1.5 Confirmar a instalação

Abra o **PowerShell** (tecla Windows → digite "PowerShell" → Enter) e digite:

```powershell
py -V
```

Você deve ver algo como:

```
Python 3.12.5
```

Se aparecer isso, o Python está instalado com sucesso 🎉

---

## 2. Configurando o Ambiente Virtual

O ambiente virtual isola as bibliotecas de cada projeto, evitando conflitos entre versões.

### 2.1 Criar a pasta do projeto

No PowerShell, navegue até onde você quer trabalhar:

```powershell
cd $HOME\PythonProjects
```

Se for usar uma pasta dentro do **OneDrive do projeto** que tenha `[ ]` no caminho, use o **CMD** (não o PowerShell):

```cmd
cd C:\Users\SeuUser\Kognit\LiV - LiVDocs\DocumentacaoReleases\LiV\current\CasosTestes
```

> 💡 O CMD lida melhor com caminhos que contêm colchetes.

### 2.2 Criar o ambiente virtual

Dentro da pasta do projeto, rode:

```powershell
py -m venv .venv
```

Isso cria uma subpasta chamada `.venv` com os arquivos do ambiente.

### 2.3 Ativar o ambiente virtual

**No PowerShell:**

```powershell
.\.venv\Scripts\Activate.ps1
```

**No CMD:**

```cmd
.venv\Scripts\activate.bat
```

Se deu certo, sua linha de comando ficará assim:

```
(.venv) PS C:\Users\SeuUser\...\CasosTestes>
```

O **`(.venv)`** no início confirma que você está dentro do ambiente.

> ⚠️ **Erro de ExecutionPolicy no PowerShell?**  
> Se aparecer um erro de política de execução, rode:
> ```powershell
> Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
> .\.venv\Scripts\Activate.ps1
> ```

### 2.4 Atualizar o pip

Sempre que for instalar algo novo, é boa prática atualizar o pip primeiro:

```powershell
py -m pip install --upgrade pip
```

### 2.5 Desativar o ambiente (quando terminar)

```powershell
deactivate
```

> 🔄 **Lembrete:** toda vez que abrir um novo terminal para trabalhar com o script, você precisa **ativar o ambiente virtual novamente** (passo 2.3).

---

## 3. Instalando as Dependências do Script

Com o ambiente virtual **ativado** (`(.venv)` aparecendo), instale a biblioteca necessária:

```powershell
pip install openpyxl
```

Quando terminar, deve aparecer:

```
Successfully installed openpyxl-x.x.x
```

> ✅ Você só precisa fazer isso **uma vez** por ambiente virtual. Na próxima vez que usar o script, basta ativar o ambiente (passo 2.3) e rodar diretamente.

---

## 4. Configurando o Script de Conversão

### 4.1 Copiar o script para a pasta do projeto

Copie o arquivo **`JSON_Excel_TestCase_por_modulo.py`** para dentro da pasta do seu projeto (a mesma onde está a pasta `.venv`).

Estrutura esperada:

```
CasosTestes/
├── .venv/
└── JSON_Excel_TestCase_por_modulo.py
```

### 4.2 Criar a pasta de entrada

Crie uma pasta `entrada` dentro do projeto para organizar os arquivos a converter:

```
CasosTestes/
├── .venv/
├── JSON_Excel_TestCase_por_modulo.py
└── entrada/       ← coloque aqui os JSONs ou Excels que quer converter
```

> 💡 As pastas de saída (`exportados_excel` e `exportados_json`) são criadas automaticamente pelo script. A pasta `entrada` é opcional — você pode informar o caminho completo do arquivo quando o script perguntar.

---

## 5. Solução de Problemas Comuns

### `python` não é reconhecido no terminal

**Causa:** Python não foi adicionado ao PATH durante a instalação.  
**Solução:** Desinstale e reinstale o Python, marcando "Add Python to PATH" na primeira tela.

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

**Causa:** O caminho informado para o arquivo está incorreto.  
**Solução:** Verifique o caminho digitado. Dica: arraste o arquivo do Explorer para o terminal — ele preenche o caminho automaticamente.

---

*Após concluir este guia, consulte o **Manual de Processo QA** para o fluxo completo de geração e gestão de Test Cases.*
