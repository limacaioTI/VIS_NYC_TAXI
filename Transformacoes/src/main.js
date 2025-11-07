import { Taxi } from "./taxi";

function showError(message) {
    const div = document.querySelector("#table");
    if(div) {
        div.innerHTML = `<div style="color: red; padding: 20px; border: 2px solid red; background: #ffe6e6;">
            <h3>Erro:</h3>
            <p>${message}</p>
            <p>Verifique o console do navegador (F12) para mais detalhes.</p>
        </div>`;
    }
    console.error(message);
}

function showLoading(message) {
    const div = document.querySelector("#table");
    if(div) {
        div.innerHTML = `<div style="padding: 20px;">
            <p>${message}</p>
        </div>`;
    }
}

function createTableWithInnerHTML(data) {
    if (!data || data.length === 0) {
        showError("Nenhum dado retornado. Verifique se os arquivos parquet estão acessíveis.");
        return;
    }

    try {
        let tableHTML = '<table border="1" style="border-collapse: collapse; width: 100%;"><tr>';

        Object.keys(data[0]).forEach(key => {
            tableHTML += `<th style="padding: 8px; background: #f0f0f0;">${key}</th>`;
        });

        tableHTML += '</tr>';

        data.forEach( item => {
            tableHTML += '<tr>';
            Object.values(item).forEach(value => {
                tableHTML += `<td style="padding: 8px; border: 1px solid #ddd;">${value}</td>`;
            });
            tableHTML += '</tr>';
        });
        tableHTML += '</table>';

        const div = document.querySelector("#table");
        if(div) {
            div.innerHTML = tableHTML;
        }
    } catch (error) {
        showError(`Erro ao criar tabela: ${error.message}`);
    }
}

window.onload = async () => {
    try {
        const months = 1;
        const limit = 50;

        showLoading("Inicializando DuckDB...");
        const taxi = new Taxi();

        console.log("Inicializando banco de dados...");
        await taxi.init();
        console.log("Banco de dados inicializado!");

        showLoading("Carregando dados dos arquivos parquet...");
        console.log("Carregando arquivos parquet...");
        await taxi.loadTaxi(months);
        console.log("Arquivos carregados!");

        showLoading("Executando transformações...");
        console.log("Executando select...");
        const select = await taxi.select(limit);
        console.log("Select concluído:", select.length, "registros");

        console.log("Executando filter...");
        const filter = await taxi.filter(limit);
        console.log("Filter concluído:", filter.length, "registros");

        console.log("Executando groupBy...");
        const group = await taxi.groupBy(limit);
        console.log("GroupBy concluído:", group.length, "registros");

        console.log("Executando binning...");
        const bins = await taxi.binning(limit);
        console.log("Binning concluído:", bins.length, "registros");

        console.log("Executando normalize...");
        const norm = await taxi.normalize(limit);
        console.log("Normalize concluído:", norm.length, "registros");

        console.log("Executando derive...");
        const derive = await taxi.derive(limit);
        console.log("Derive concluído:", derive.length, "registros");

        console.log("Criando tabela...");
        createTableWithInnerHTML(derive);
        console.log("Tabela criada com sucesso!");
    } catch (error) {
        showError(`Erro ao carregar dados: ${error.message}`);
        console.error("Erro completo:", error);
    }
};