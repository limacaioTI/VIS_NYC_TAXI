Documentação do Projeto: Análise Visual de Táxis NYC
Projeto: Narrativa Visual sobre Táxis em NYC 
Prazo: 13/11/2025 
Grupo: [Caio Lima, Claussio Soares, Lucca Amaral, Yuri Moura]
Fonte de dados: https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page
1. Objetivo Central
Nosso objetivo é construir uma aplicação web de página única (single-page application) que carrega e processa dados brutos (.parquet) de táxis de NYC usando DuckDB e renderiza visualizações interativas usando D3.js. A análise será consolidada em um relatório PDF de 4 páginas.
2. Pilares Técnicos (Regras Inquebráveis)
Visualização: 100% D3.js. Nenhuma outra biblioteca de gráficos (Chart.js, Plotly, etc.) é permitida.
Processamento: Zero pré-processamento externo. Não podemos usar Python/Pandas para limpar dados e salvar um CSV. Toda a limpeza, filtragem e agregação deve ser feita pela nossa aplicação.
Banco de Dados: Os arquivos .parquet originais devem ser carregados e consultados diretamente por uma instância do DuckDB.

3. Arquitetura Proposta (Como tudo se conecta)
Para atender aos requisitos, não podemos simplesmente abrir o D3.js em um index.html. Precisamos de um pequeno servidor (backend) para lidar com o DuckDB.
Sugestão: Usar Node.js + Express como servidor.
Fluxo de Dados:
Frontend (Cliente): O usuário vê a página (index.html). Esta página contém nosso código D3.js.
Requisição: O código D3.js (JavaScript) faz uma requisição fetch para o nosso próprio servidor (ex: GET /api/corridas-por-hora).
Backend (Servidor Node.js):
Nosso servidor (criado com Express) recebe a requisição.
Ele usa a biblioteca duckdb-node para se conectar ao DuckDB.
Ele executa uma query SQL no DuckDB para processar os arquivos .parquet (ex: SELECT HOUR(pickup_datetime), COUNT(*) FROM 'yellow_tripdata.parquet' GROUP BY 1).
Resposta:
O DuckDB retorna o resultado da query (um JSON) para o nosso servidor.
O servidor envia esse JSON de volta para o Frontend.
Visualização (Cliente): O D3.js recebe o JSON e usa .data() para desenhar o gráfico (barras, linhas, etc.).
[Diagrama de fluxo de dados]
Por que essa arquitetura?
Ela cumpre o requisito de "não pré-processar", pois os dados são processados "ao vivo" (on-the-fly) a cada requisição.
Ela cumpre o requisito de usar DuckDB para carregar os arquivos originais.
Ela permite que o D3.js se concentre apenas em desenhar, recebendo dados limpos e agregados do nosso backend.

4. Plano de Ação (Fases do Projeto)
Dividiremos o trabalho em 4 fases principais:
Fase 1: Setup e Prova de Conceito (PoC) (Até [Data])
O objetivo é provar que nossa arquitetura funciona.
[ ] Ação: Criar um novo projeto (npm init).
[ ] Ação: Instalar dependências: npm install express duckdb.
[ ] Ação: Criar um servidor server.js básico.
[ ] Ação: (Teste Crítico) Criar um endpoint de API (ex: /api/test) que:
Carregue um arquivo .parquet no DuckDB.
Execute uma query simples (ex: SELECT COUNT(*) FROM 'arquivo.parquet').
Retorne o resultado como JSON.
[ ] Ação: Criar um index.html com D3.js que chame esse /api/test e exiba o resultado na tela.
Resultado Esperado: Temos uma página web que mostra o número total de corridas lido diretamente do Parquet. Se isso funcionar, o resto do projeto é viável.
Fase 2: Exploração e Narrativa (Até [Data])
O objetivo é definir nossa história e justificar o período de tempo.
[ ] Ação: Usar o DuckDB (pode ser em um notebook separado, apenas para exploração) para analisar o volume de corridas de 2018 a 2023.
[ ] Ação: (Decisão de Grupo) Escolher nosso período de tempo (ex: "pré vs. pós-pandemia", "o ano de 2019", "verões de 2018-2022").
[ ] Ação: Justificar a escolha. (Ex: "Escolhemos 2019 e 2021 para comparar, pois o gráfico [anexar] mostra a queda de 2020").
[ ] Ação: Definir as perguntas que nossos gráficos responderão (ex: "Como a gorjeta varia por método de pagamento?", "Qual a hora de pico em dias de semana vs. fins de semana?").
Fase 3: Desenvolvimento (Backend e Frontend) (Até [Data])
O objetivo é construir a aplicação.
[ ] Ação (Backend): Criar todos os endpoints da API necessários. Cada endpoint corresponde a um gráfico.
Ex: /api/corridas-por-hora
Ex: /api/metodos-pagamento
Ex: /api/composicao-tarifa
[ ] Ação (Frontend): Desenvolver os gráficos D3.js.
Cada gráfico deve chamar seu respectivo endpoint da API.
Garantir que os gráficos sejam claros, tenham eixos (axis), legendas e títulos.
[ ] Ação (Frontend): (Opcional, se houver tempo) Adicionar interatividade D3.js (filtros, tooltips com d3.mouse).
[ ] Ação (Auditoria): Criar uma seção/gráfico de diagnóstico (ex: % de gorjetas zeradas, valores de tarifa nulos) para incluir no relatório.
Fase 4: Relatório e Entrega (Até 13/11)
[ ] Ação: Tirar prints de alta qualidade de todas as visualizações construídas.
[ ] Ação: Escrever o relatório em PDF (máx. 4 páginas), seguindo a narrativa definida na Fase 2 e usando os gráficos como evidência.
[ ] Ação: (Checklist Final) Preparar o ZIP:
[ ] Deletar a pasta node_modules.
[ ] Deletar todos os arquivos de dados (.parquet).
[ ] Garantir que o package.json está incluído.
[ ] Compactar apenas os arquivos-fonte (.js, .html, .css, package.json, etc.)
[ ] Ação: Enviar o ZIP e o PDF no Google Classroom.

5. Divisão de Tarefas (Sugestão para 4 Pessoas)
Pessoa 1: Arquiteto Backend / DevOps
Responsável por: Fase 1 (Setup do servidor Node.js/Express e DuckDB).
Tarefas: Criar todos os endpoints da API (/api/...), escrever as queries SQL para o DuckDB e garantir que os dados sejam enviados como JSON.
Pessoa 2: Desenvolvedor(a) D3.js (Temporal e Sazonalidade)
Responsável por: Gráficos de variação de tempo.
Tarefas: Criar os gráficos de linha (corridas ao longo do dia), barras (corridas por dia da semana) ou heatmaps (sazonalidade). Chamar as APIs criadas pela Pessoa 1.
Pessoa 3: Desenvolvedor(a) D3.js (Tarifas e Pagamentos)
Responsável por: Gráficos de composição.
Tarefas: Criar os gráficos de pizza/donut (métodos de pagamento) ou barras empilhadas (composição da tarifa: valor, gorjeta, taxas). Chamar as APIs criadas pela Pessoa 1.
Pessoa 4: Analista de Dados / Gerente de Projeto e Redator
Responsável por: Fase 2 (Exploração e definição da narrativa) e Fase 4 (Relatório).
Tarefas: Liderar a escolha do período, definir as perguntas, garantir que os gráficos respondam às perguntas e redigir o relatório final em PDF.
6. Ferramentas Essenciais
Código: VS Code
Controle de Versão: Git / GitHub (Fundamental para trabalho em equipe, mesmo que não entregue o link).
Ambiente: Node.js (v18 ou superior).
Comunicação: [Discord / WhatsApp / Slack do grupo].

7. Checklist de Entrega (13/11)
[ ] Relatório PDF (máx. 4 páginas) enviado?
[ ] Código-Fonte ZIP enviado?
[ ] O ZIP contém o package.json?
[ ] O ZIP NÃO contém node_modules?
[ ] O ZIP NÃO contém arquivos .parquet?
[ ] O trabalho foi enviado por apenas um membro?

