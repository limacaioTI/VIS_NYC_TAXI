import * as d3 from 'd3';

export function criarGraficoQuantidade(containerId, data2018, data2023) {
    const container = d3.select(`#${containerId}`);
    container.selectAll("*").remove();

    const margin = { top: 40, right: 40, bottom: 60, left: 80 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = container
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const data = [
        { ano: "2018", comGorjeta: data2018.viagens_com_gorjeta, semGorjeta: data2018.viagens_sem_gorjeta },
        { ano: "2023", comGorjeta: data2023.viagens_com_gorjeta, semGorjeta: data2023.viagens_sem_gorjeta }
    ];

    const x0 = d3.scaleBand()
        .domain(["2018", "2023"])
        .range([0, width])
        .paddingInner(0.2)
        .paddingOuter(0.1);

    const x1 = d3.scaleBand()
        .domain(["comGorjeta", "semGorjeta"])
        .range([0, x0.bandwidth()])
        .padding(0.05);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => Math.max(d.comGorjeta, d.semGorjeta)) * 1.1])
        .nice()
        .range([height, 0]);

    // Grid lines
    g.selectAll(".grid-line")
        .data(y.ticks(10))
        .enter()
        .append("line")
        .attr("class", "grid-line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", d => y(d))
        .attr("y2", d => y(d));

    // Bars
    const anos = g.selectAll(".ano")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "ano")
        .attr("transform", d => `translate(${x0(d.ano)},0)`);

    anos.selectAll("rect")
        .data(d => [
            { key: "comGorjeta", value: d.comGorjeta, label: "Com Gorjeta" },
            { key: "semGorjeta", value: d.semGorjeta, label: "Sem Gorjeta" }
        ])
        .enter()
        .append("rect")
        .attr("x", d => x1(d.key))
        .attr("y", d => y(d.value))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", d => d.key === "comGorjeta" ? "#667eea" : "#e0e0e0")
        .attr("class", "bar")
        .on("mouseover", function(event, d) {
            d3.select(this).attr("opacity", 0.7);
            const tooltip = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0)
                .style("position", "absolute")
                .style("background", "rgba(0,0,0,0.8)")
                .style("color", "white")
                .style("padding", "8px")
                .style("border-radius", "4px")
                .style("pointer-events", "none");
            
            tooltip.transition()
                .duration(200)
                .style("opacity", 1);
            
            tooltip.html(`${d.label}<br/>${d.value.toLocaleString('pt-BR')} viagens`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).attr("opacity", 1);
            d3.selectAll(".tooltip").remove();
        });

    // Value labels
    anos.selectAll(".value-label")
        .data(d => [
            { key: "comGorjeta", value: d.comGorjeta },
            { key: "semGorjeta", value: d.semGorjeta }
        ])
        .enter()
        .append("text")
        .attr("class", "value-label")
        .attr("x", d => x1(d.key) + x1.bandwidth() / 2)
        .attr("y", d => y(d.value) - 5)
        .attr("text-anchor", "middle")
        .text(d => d.value > 0 ? (d.value / 1000000).toFixed(1) + "M" : "");

    // X axis
    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0))
        .selectAll("text")
        .style("font-size", "14px")
        .style("font-weight", "600");

    // Y axis
    g.append("g")
        .call(d3.axisLeft(y).tickFormat(d => (d / 1000000).toFixed(1) + "M"))
        .selectAll("text")
        .style("font-size", "12px");

    // Y axis label
    g.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Quantidade de Viagens");

    // Legend
    const legend = g.append("g")
        .attr("transform", `translate(${width - 200}, 20)`);

    const legendData = [
        { label: "Com Gorjeta", color: "#667eea" },
        { label: "Sem Gorjeta", color: "#e0e0e0" }
    ];

    legend.selectAll("rect")
        .data(legendData)
        .enter()
        .append("rect")
        .attr("x", (d, i) => i * 100)
        .attr("y", 0)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", d => d.color);

    legend.selectAll("text")
        .data(legendData)
        .enter()
        .append("text")
        .attr("x", (d, i) => i * 100 + 20)
        .attr("y", 12)
        .style("font-size", "12px")
        .text(d => d.label);
}

export function criarGraficoMedia(containerId, data2018, data2023) {
    const container = d3.select(`#${containerId}`);
    container.selectAll("*").remove();

    const margin = { top: 40, right: 40, bottom: 60, left: 80 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = container
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const data = [
        { ano: "2018", media: parseFloat(data2018.media_gorjeta) || 0 },
        { ano: "2023", media: parseFloat(data2023.media_gorjeta) || 0 }
    ];

    const x = d3.scaleBand()
        .domain(["2018", "2023"])
        .range([0, width])
        .padding(0.3);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.media) * 1.2])
        .nice()
        .range([height, 0]);

    // Grid lines
    g.selectAll(".grid-line")
        .data(y.ticks(10))
        .enter()
        .append("line")
        .attr("class", "grid-line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", d => y(d))
        .attr("y2", d => y(d));

    // Bars
    g.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.ano))
        .attr("y", d => y(d.media))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.media))
        .attr("fill", "#667eea")
        .on("mouseover", function(event, d) {
            d3.select(this).attr("opacity", 0.7);
            const tooltip = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0)
                .style("position", "absolute")
                .style("background", "rgba(0,0,0,0.8)")
                .style("color", "white")
                .style("padding", "8px")
                .style("border-radius", "4px")
                .style("pointer-events", "none");
            
            tooltip.transition()
                .duration(200)
                .style("opacity", 1);
            
            tooltip.html(`Ano: ${d.ano}<br/>Média: $${d.media.toFixed(2)}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).attr("opacity", 1);
            d3.selectAll(".tooltip").remove();
        });

    // Value labels
    g.selectAll(".value-label")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "value-label")
        .attr("x", d => x(d.ano) + x.bandwidth() / 2)
        .attr("y", d => y(d.media) - 5)
        .attr("text-anchor", "middle")
        .text(d => `$${d.media.toFixed(2)}`);

    // X axis
    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("font-size", "14px")
        .style("font-weight", "600");

    // Y axis
    g.append("g")
        .call(d3.axisLeft(y).tickFormat(d => `$${d.toFixed(2)}`))
        .selectAll("text")
        .style("font-size", "12px");

    // Y axis label
    g.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Valor Médio (USD)");
}

export function criarGraficoComparacao(containerId, data2018, data2023) {
    const container = d3.select(`#${containerId}`);
    container.selectAll("*").remove();

    const margin = { top: 40, right: 40, bottom: 60, left: 80 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = container
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const percentual2018 = (data2018.viagens_com_gorjeta / data2018.total_viagens) * 100;
    const percentual2023 = (data2023.viagens_com_gorjeta / data2023.total_viagens) * 100;

    const data = [
        { ano: "2018", percentual: percentual2018, media: parseFloat(data2018.media_gorjeta) || 0 },
        { ano: "2023", percentual: percentual2023, media: parseFloat(data2023.media_gorjeta) || 0 }
    ];

    const x = d3.scaleBand()
        .domain(["2018", "2023"])
        .range([0, width])
        .padding(0.3);

    const yPercentual = d3.scaleLinear()
        .domain([0, 100])
        .range([height, 0]);

    const yMedia = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.media) * 1.2])
        .range([height, 0]);

    // Grid lines
    g.selectAll(".grid-line")
        .data(yPercentual.ticks(10))
        .enter()
        .append("line")
        .attr("class", "grid-line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", d => yPercentual(d))
        .attr("y2", d => yPercentual(d));

    // Bars for percentage
    g.selectAll(".bar-percent")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.ano))
        .attr("y", d => yPercentual(d.percentual))
        .attr("width", x.bandwidth())
        .attr("height", d => height - yPercentual(d.percentual))
        .attr("fill", "#667eea")
        .attr("opacity", 0.6);

    // Percentage labels
    g.selectAll(".percent-label")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "value-label")
        .attr("x", d => x(d.ano) + x.bandwidth() / 2)
        .attr("y", d => yPercentual(d.percentual) - 5)
        .attr("text-anchor", "middle")
        .text(d => `${d.percentual.toFixed(1)}%`);

    // X axis
    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("font-size", "14px")
        .style("font-weight", "600");

    // Y axis (percentage)
    g.append("g")
        .call(d3.axisLeft(yPercentual).tickFormat(d => `${d}%`))
        .selectAll("text")
        .style("font-size", "12px");

    // Y axis label
    g.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Percentual de Viagens com Gorjeta (%)");

    // Title
    g.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "600")
        .text("Percentual de Viagens com Gorjeta");
}

export function criarEstatisticas(containerId, data, ano) {
    const container = d3.select(`#${containerId}`);
    container.selectAll("*").remove();

    const percentual = (data.viagens_com_gorjeta / data.total_viagens) * 100;

    const stats = [
        { label: "Total de Viagens", value: data.total_viagens.toLocaleString('pt-BR') },
        { label: "Viagens com Gorjeta", value: data.viagens_com_gorjeta.toLocaleString('pt-BR') },
        { label: "Viagens sem Gorjeta", value: data.viagens_sem_gorjeta.toLocaleString('pt-BR') },
        { label: "Percentual com Gorjeta", value: `${percentual.toFixed(2)}%` },
        { label: "Média de Gorjeta", value: `$${parseFloat(data.media_gorjeta || 0).toFixed(2)}` },
        { label: "Total em Gorjetas", value: `$${parseFloat(data.total_gorjetas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }
    ];

    stats.forEach(stat => {
        const statDiv = container.append("div")
            .attr("class", "stat-item");
        
        statDiv.append("div")
            .attr("class", "stat-label")
            .text(stat.label);
        
        statDiv.append("div")
            .attr("class", "stat-value")
            .text(stat.value);
    });
}

