# Análise de Gorjetas - Táxis Amarelos de NYC

Este projeto analisa e visualiza dados de gorjetas (Tip_amount) de táxis amarelos de Nova York, comparando os anos de 2018 e 2023.

## 📊 Análises Realizadas

- **Quantidade de pessoas que deram gorjeta**: Comparação entre 2018 e 2023
- **Valor médio de gorjeta**: Média de gorjetas em cada ano
- **Percentual de viagens com gorjeta**: Porcentagem de viagens que receberam gorjeta

## 🚀 Como Executar

1. Instale as dependências (se ainda não fez):
```bash
npm install
```

2. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

3. Abra o navegador no endereço indicado (geralmente `http://localhost:5173`)

## 📁 Estrutura do Projeto

- `src/config.js`: Configuração do DuckDB
- `src/taxi.js`: Classe para carregar e consultar dados dos táxis
- `src/main.js`: Arquivo principal que orquestra o carregamento e visualização
- `src/visualizacoes.js`: Funções D3.js para criar os gráficos
- `index.html`: Interface HTML
- `index.css`: Estilos CSS

## 📈 Visualizações

O projeto gera três tipos de visualizações:

1. **Gráfico de Quantidade**: Compara viagens com e sem gorjeta entre os anos
2. **Gráfico de Média**: Mostra o valor médio de gorjeta em cada ano
3. **Gráfico de Comparação**: Exibe o percentual de viagens com gorjeta

## 📝 Notas

- Os dados são carregados diretamente dos arquivos `.parquet` na pasta `../data/yellow/`
- A análise considera apenas viagens com `tip_amount > 0` como viagens com gorjeta
- Gorjetas em dinheiro não são incluídas nos dados (conforme documentação)

