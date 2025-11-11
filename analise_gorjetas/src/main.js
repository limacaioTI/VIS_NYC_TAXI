import { Taxi } from './taxi';
import { criarGraficoQuantidade, criarGraficoMedia, criarGraficoComparacao, criarEstatisticas, criarSerieMensalMediaGorjeta, criarGraficoPizzaPeriodoDia } from './visualizacoes';

window.onload = async () => {
    const loadingDiv = document.querySelector("#loading");
    const contentDiv = document.querySelector("#content");

    try {
        console.log("Inicializando DuckDB...");
        const taxi = new Taxi();
        await taxi.init();

        console.log("Analisando gorjetas de 2018...");
        const analise2018 = await taxi.getTipAnalysis(2018, 12);
        const data2018 = analise2018[0];

        const analise2020 = await taxi.getTipAnalysis(2020, 12);
        const data2020 = analise2020[0];

        console.log("Analisando gorjetas de 2023...");
        const analise2023 = await taxi.getTipAnalysis(2023, 12);
        const data2023 = analise2023[0];

        console.log("Dados de 2018:", data2018);
        console.log("Dados de 2023:", data2023);

        console.log("Carregando séries mensais...");
        const [series2018, series2020, series2023] = await Promise.all([
            taxi.getMonthlyTipSeries(2018, 12),
            taxi.getMonthlyTipSeries(2020, 12),
            taxi.getMonthlyTipSeries(2023, 12),
        ]);

        console.log("Carregando dados por período do dia...");
        const [periodo2018, periodo2020, periodo2023] = await Promise.all([
            taxi.getTipAnalysisByPeriodoDia(2018, 12),
            taxi.getTipAnalysisByPeriodoDia(2020, 12),
            taxi.getTipAnalysisByPeriodoDia(2023, 12),
        ]);

        // Esconder loading e mostrar conteúdo
        loadingDiv.classList.add("hidden");
        contentDiv.classList.remove("hidden");

        // Criar estatísticas
        criarEstatisticas("stats-2018", data2018, 2018);
        criarEstatisticas("stats-2020", data2020, 2020);
        criarEstatisticas("stats-2023", data2023, 2023);

        // Criar gráficos
        criarGraficoQuantidade("chart-count", data2018, data2020, data2023);
        criarGraficoMedia("chart-avg", data2018, data2020, data2023);
        criarGraficoComparacao("chart-comparison", data2018, data2020, data2023);

        // Séries mensais (linha)
        const seriesMapMedia = {
            "2018": series2018.map(d => ({ mes: d.mes, media_gorjeta: d.media_gorjeta })),
            "2020": series2020.map(d => ({ mes: d.mes, media_gorjeta: d.media_gorjeta })),
            "2023": series2023.map(d => ({ mes: d.mes, media_gorjeta: d.media_gorjeta })),
        };
        criarSerieMensalMediaGorjeta("chart-monthly-avg", seriesMapMedia);

        // Gráfico de pizza por período do dia
        criarGraficoPizzaPeriodoDia("chart-pizza-periodo", periodo2018, periodo2020, periodo2023);

        console.log("Visualizações criadas com sucesso!");

    } catch (error) {
        console.error("Erro ao processar dados:", error);
        loadingDiv.innerHTML = `<p style="color: red;">Erro ao carregar dados: ${error.message}</p>`;
    }
};

