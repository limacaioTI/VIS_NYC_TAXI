# Análise Visual de Táxis NYC

| | |
| :--- | :--- |
| **Projeto:** | Narrativa Visual sobre Táxis em NYC |
| **Grupo:** | Caio Lima, Claussio Soares, Lucca Amaral, Yuri Moura |
| **Prazo:** | 13/11/2025 |
| **Fonte de Dados:** | [NYC TLC Trip Record Data](https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page) |

---

## 🚨 Configuração Inicial (Importante)

Ao clonar o projeto, é necessário criar a pasta `data` na raiz e baixar os dados do link abaixo.

**Link dos Dados:** [Google Drive](https://drive.google.com/drive/folders/1pfaLidqAJmTWezdbgspOpbA2RDbOq9pc?usp=sharing)

A estrutura de pastas esperada é:
/
|-- data/
|   |-- yellow/
|       |-- 2018/
|       |-- 2023/
|-- duckdb/
|-- ... (outros arquivos do projeto)

## 1. 🎯 Objetivo Central
Construir uma aplicação web de página única (single-page application) que carrega e processa dados brutos (`.parquet`) de táxis de NYC usando DuckDB e renderiza visualizações interativas usando D3.js. A análise será consolidada em um relatório PDF de 4 páginas.

## 2. 🏛️ Pilares Técnicos (Regras Inquebráveis)
* **Visualização:** 100% D3.js. Nenhuma outra biblioteca de gráficos (Chart.js, Plotly, etc.) é permitida.
* **Processamento:** Zero pré-processamento externo. Não podemos usar Python/Pandas para limpar dados e salvar um CSV. Toda a limpeza, filtragem e agregação deve ser feita pela nossa aplicação.
* **Banco de Dados:** Os arquivos `.parquet` originais devem ser carregados e consultados diretamente por uma instância do DuckDB.

## 3. 🏗️ Arquitetura Proposta (Como tudo se conecta)
Para atender aos requisitos, usaremos um pequeno servidor Node.js (Express) para lidar com o DuckDB, enquanto o D3.js cuidará da renderização no frontend.

### Fluxo de Dados:
1.  **Frontend (Cliente):** O usuário acessa o `index.html`. O código D3.js (JavaScript) faz uma requisição `fetch` para o nosso próprio servidor (ex: `GET /api/corridas-por-hora`).
2.  **Backend (Servidor Node.js):**
    * Nosso servidor (Express) recebe a requisição.
    * Ele usa a biblioteca `duckdb-node` para se conectar ao DuckDB.
    * Ele executa uma query SQL no DuckDB para processar os arquivos `.parquet` (ex: `SELECT HOUR(pickup_datetime), COUNT(*) FROM 'yellow_tripdata.parquet' GROUP BY 1`).
3.  **Resposta:**
    * O DuckDB retorna o resultado da query (um JSON) para o nosso servidor.
    * O servidor envia esse JSON de volta para o Frontend.
4.  **Visualização (Cliente):** O D3.js recebe o JSON e usa `.data()` para desenhar o gráfico.

### Por que essa arquitetura?
* Ela cumpre o requisito de **"não pré-processar"**, pois os dados são processados "ao vivo" (on-the-fly) a cada requisição.
* Ela cumpre o requisito de usar **DuckDB** para carregar os arquivos originais.
* Ela permite que o **D3.js** se concentre apenas em desenhar, recebendo dados limpos e agregados do nosso backend.

## 4. 🗺️ Plano de Ação (Fases do Projeto)

### Fase 1: Setup e Prova de Conceito (PoC)
*O objetivo é provar que nossa arquitetura funciona.*
- [ ] **Ação:** Criar um novo projeto (`npm init`).
- [ ] **Ação:** Instalar dependências: `npm install express duckdb`.
- [ ] **Ação:** Criar um servidor `server.js` básico.
- [ ] **Ação (Teste Crítico):** Criar um endpoint de API (ex: `/api/test`) que:
    - Carregue um arquivo `.parquet` no DuckDB.
    - Execute uma query simples (ex: `SELECT COUNT(*) FROM 'arquivo.parquet'`).
    - Retorne o resultado como JSON.
- [ ] **Ação:** Criar um `index.html` com D3.js que chame esse `/api/test` e exiba o resultado na tela.
- **Resultado Esperado:** Temos uma página web que mostra o número total de corridas lido diretamente do Parquet.

### Fase 2: Exploração e Narrativa
*O objetivo é definir nossa história e justificar o período de tempo.*
- [ ] **Ação:** Usar o DuckDB (pode ser em um notebook separado, apenas para exploração) para analisar o volume de corridas de 2018 a 2023.
- [ ] **Ação (Decisão de Grupo):** Escolher nosso período de tempo (ex: "pré vs. pós-pandemia", "o ano de 2019", "verões de 2018-2022").
- [ ] **Ação:** Justificar a escolha. (Ex: "Escolhemos 2019 e 2021 para comparar, pois o gráfico [anexar] mostra a queda de 2020").
- [ ] **Ação:** Definir as perguntas que nossos gráficos responderão (ex: "Como a gorjeta varia por método de pagamento?", "Qual a hora de pico em dias de semana vs. fins de semana?").

### Fase 3: Desenvolvimento (Backend e Frontend)
*O objetivo é construir a aplicação.*
- [ ] **Ação (Backend):** Criar todos os endpoints da API necessários. Cada endpoint corresponde a um gráfico.
    - Ex: `/api/corridas-por-hora`
    - Ex: `/api/metodos-pagamento`
    - Ex: `/api/composicao-tarifa`
- [ ] **Ação (Frontend):** Desenvolver os gráficos D3.js.
    - Cada gráfico deve chamar seu respectivo endpoint da API.
    - Garantir que os gráficos sejam claros, tenham eixos (axis), legendas e títulos.
- [ ] **Ação (Frontend):** (Opcional, se houver tempo) Adicionar interatividade D3.js (filtros, tooltips com `d3.mouse`).
- [ ] **Ação (Auditoria):** Criar uma seção/gráfico de diagnóstico (ex: % de gorjetas zeradas, valores de tarifa nulos) para incluir no relatório.

### Fase 4: Relatório e Entrega (Até 13/11)
- [ ] **Ação:** Tirar prints de alta qualidade de todas as visualizações construídas.
- [ ] **Ação:** Escrever o relatório em PDF (máx. 4 páginas), seguindo a narrativa definida na Fase 2 e usando os gráficos como evidência.
- [ ] **Ação (Checklist Final):** Preparar o ZIP:
    - [ ] Deletar a pasta `node_modules`.
    - [ ] Deletar todos os arquivos de dados (`.parquet`).
    - [ ] Garantir que o `package.json` está incluído.
    - [ ] Compactar apenas os arquivos-fonte (.js, .html, .css, package.json, etc.)
- [ ] **Ação:** Enviar o ZIP e o PDF no Google Classroom.

## 5. 👥 Divisão de Tarefas (Sugestão)

| Pessoa (Função) | Responsabilidade Principal | Tarefas Chave |
| :--- | :--- | :--- |
| **Pessoa 1: Arquiteto Backend / DevOps** | Fase 1 (Setup do servidor Node.js/Express e DuckDB) | Criar todos os endpoints da API (`/api/...`), escrever as queries SQL para o DuckDB e garantir que os dados sejam enviados como JSON. |
| **Pessoa 2: Dev D3.js (Temporal)** | Gráficos de variação de tempo | Criar os gráficos de linha (corridas ao longo do dia), barras (dia da semana) ou heatmaps (sazonalidade). Chamar as APIs. |
| **Pessoa 3: Dev D3.js (Tarifas)** | Gráficos de composição | Criar os gráficos de pizza/donut (métodos de pagamento) ou barras empilhadas (composição da tarifa). Chamar as APIs. |
| **Pessoa 4: Analista / Gerente / Redator**| Fase 2 (Narrativa) e Fase 4 (Relatório) | Liderar a escolha do período, definir as perguntas, garantir que os gráficos respondam às perguntas e redigir o relatório final em PDF. |

## 6. 🛠️ Ferramentas Essenciais
* **Código:** VS Code
* **Controle de Versão:** Git / GitHub
* **Ambiente:** Node.js (v18 ou superior)
* **Comunicação:** [Discord / WhatsApp / Slack do grupo]

## 7. ✅ Checklist de Entrega (13/11)
- [ ] Relatório PDF (máx. 4 páginas) enviado?
- [ ] Código-Fonte ZIP enviado?
- [ ] O ZIP contém o `package.json`?
- [ ] O ZIP **NÃO** contém `node_modules`?
- [ ] O ZIP **NÃO** contém arquivos `.parquet`?
- [ ] O trabalho foi enviado por apenas um membro?