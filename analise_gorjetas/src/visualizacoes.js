import * as d3 from 'd3';

export function criarGraficoQuantidade(containerId, data2018, data2020, data2023) {
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
        { ano: "2020", comGorjeta: data2020.viagens_com_gorjeta, semGorjeta: data2020.viagens_sem_gorjeta },
        { ano: "2023", comGorjeta: data2023.viagens_com_gorjeta, semGorjeta: data2023.viagens_sem_gorjeta },
    ];

    const x0 = d3.scaleBand()
        .domain(["2018", "2020", "2023"])
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

    g.selectAll(".grid-line")
        .data(y.ticks(10))
        .enter()
        .append("line")
        .attr("class", "grid-line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", d => y(d))
        .attr("y2", d => y(d));

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
        .on("mouseover", function (event, d) {
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
        .on("mouseout", function () {
            d3.select(this).attr("opacity", 1);
            d3.selectAll(".tooltip").remove();
        });

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

    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0))
        .selectAll("text")
        .style("font-size", "14px")
        .style("font-weight", "600");

    g.append("g")
        .call(d3.axisLeft(y).tickFormat(d => (d / 1000000).toFixed(1) + "M"))
        .selectAll("text")
        .style("font-size", "12px");

    g.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Quantidade de Viagens");

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

export function criarGraficoMedia(containerId, data2018, data2020, data2023) {
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
        { ano: "2020", media: parseFloat(data2020.media_gorjeta) || 0 },
        { ano: "2023", media: parseFloat(data2023.media_gorjeta) || 0 }
    ];

    const x = d3.scaleBand()
        .domain(["2018", "2020", "2023"])
        .range([0, width])
        .padding(0.3);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.media) * 1.2])
        .nice()
        .range([height, 0]);

    g.selectAll(".grid-line")
        .data(y.ticks(10))
        .enter()
        .append("line")
        .attr("class", "grid-line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", d => y(d))
        .attr("y2", d => y(d));

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
        .on("mouseover", function (event, d) {
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
        .on("mouseout", function () {
            d3.select(this).attr("opacity", 1);
            d3.selectAll(".tooltip").remove();
        });

    g.selectAll(".value-label")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "value-label")
        .attr("x", d => x(d.ano) + x.bandwidth() / 2)
        .attr("y", d => y(d.media) - 5)
        .attr("text-anchor", "middle")
        .text(d => `$${d.media.toFixed(2)}`);

    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("font-size", "14px")
        .style("font-weight", "600");

    g.append("g")
        .call(d3.axisLeft(y).tickFormat(d => `$${d.toFixed(2)}`))
        .selectAll("text")
        .style("font-size", "12px");
    g.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Valor Médio (USD)");
}

export function criarGraficoComparacao(containerId, data2018, data2020, data2023) {
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
    const percentual2020 = (data2020.viagens_com_gorjeta / data2020.total_viagens) * 100;
    const percentual2023 = (data2023.viagens_com_gorjeta / data2023.total_viagens) * 100;

    const data = [
        { ano: "2018", percentual: percentual2018, media: parseFloat(data2018.media_gorjeta) || 0 },
        { ano: "2020", percentual: percentual2020, media: parseFloat(data2020.media_gorjeta) || 0 },
        { ano: "2023", percentual: percentual2023, media: parseFloat(data2023.media_gorjeta) || 0 }
    ];

    const x = d3.scaleBand()
        .domain(["2018", "2020", "2023"])
        .range([0, width])
        .padding(0.3);

    const yPercentual = d3.scaleLinear()
        .domain([0, 100])
        .range([height, 0]);

    const yMedia = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.media) * 1.2])
        .range([height, 0]);

    g.selectAll(".grid-line")
        .data(yPercentual.ticks(10))
        .enter()
        .append("line")
        .attr("class", "grid-line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", d => yPercentual(d))
        .attr("y2", d => yPercentual(d));

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
        .on("mouseover", function (event, d) {
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
        tooltip.html(`Ano: ${d.ano}<br/>Percentual: ${d.percentual.toFixed(1)}%`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
    })
    .on("mouseout", function () {
        d3.select(this).attr("opacity", 1);
        d3.selectAll(".tooltip").remove();
    });

    g.selectAll(".percent-label")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "value-label")
        .attr("x", d => x(d.ano) + x.bandwidth() / 2)
        .attr("y", d => yPercentual(d.percentual) - 5)
        .attr("text-anchor", "middle")
        .text(d => `${d.percentual.toFixed(1)}%`);

    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("font-size", "14px")
        .style("font-weight", "600");
    g.append("g")
        .call(d3.axisLeft(yPercentual).tickFormat(d => `${d}%`))
        .selectAll("text")
        .style("font-size", "12px");

    g.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Percentual de Viagens com Gorjeta (%)");
    g.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "600")
        .text("Percentual de Viagens com Gorjeta");
}

export function criarEstatisticas(containerId, data) {
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

export function criarSerieMensalMediaGorjeta(containerId, seriesMap) {
    const container = d3.select(`#${containerId}`);
    container.selectAll("*").remove();

    const margin = { top: 40, right: 120, bottom: 60, left: 80 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = container
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const anos = Object.keys(seriesMap);
    const meses = d3.range(1, 13);

    const x = d3.scalePoint()
        .domain(meses)
        .range([0, width])
        .padding(0.5);

    const allValues = anos.flatMap(a => seriesMap[a].map(d => d.media_gorjeta || 0));
    const y = d3.scaleLinear()
        .domain([0, d3.max(allValues) * 1.2 || 1])
        .nice()
        .range([height, 0]);

    g.selectAll(".grid-line")
        .data(y.ticks(10))
        .enter()
        .append("line")
        .attr("class", "grid-line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", d => y(d))
        .attr("y2", d => y(d))
        .attr("stroke", "#e0e0e0")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "2,2");

    const color = d3.scaleOrdinal()
        .domain(anos)
        .range(["#667eea", "#38b2ac", "#ed64a6", "#f6ad55"]);

    const line = d3.line()
        .x(d => x(d.mes))
        .y(d => y(d.media_gorjeta || 0))
        .curve(d3.curveMonotoneX);

    d3.selectAll(`.tooltip-${containerId}`).remove();
    const tooltip = d3.select("body").append("div")
        .attr("class", `tooltip tooltip-${containerId}`)
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background", "rgba(0,0,0,0.85)")
        .style("color", "white")
        .style("padding", "10px")
        .style("border-radius", "6px")
        .style("pointer-events", "none")
        .style("font-size", "12px")
        .style("box-shadow", "0 2px 8px rgba(0,0,0,0.3)")
        .style("z-index", "1000");

    const allDataPoints = [];
    anos.forEach(ano => {
        seriesMap[ano].forEach(d => {
            allDataPoints.push({
                ano: ano,
                mes: d.mes,
                valor: d.media_gorjeta || 0,
                x: x(d.mes),
                y: y(d.media_gorjeta || 0)
            });
        });
    });

    anos.forEach(ano => {
        const data = seriesMap[ano];

        g.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", color(ano))
            .attr("stroke-width", 2.5)
            .attr("d", line)
            .attr("class", `line-${ano}`);
    });

    anos.forEach(ano => {
        const data = seriesMap[ano];
        g.selectAll(`.dot-${ano}`)
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => x(d.mes))
            .attr("cy", d => y(d.media_gorjeta || 0))
            .attr("r", 5)
            .attr("fill", color(ano))
            .attr("stroke", "white")
            .attr("stroke-width", 2)
            .attr("class", `dot-${ano}`)
            .style("pointer-events", "none"); 
    });

    const highlightCircle = g.append("circle")
        .attr("r", 6)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .style("display", "none")
        .style("pointer-events", "none");

    const overlay = g.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .style("cursor", "crosshair")
        .on("mouseover", function() {
            highlightCircle.style("display", null);
        })
        .on("mouseout", function() {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0);
            highlightCircle.style("display", "none");
        })
        .on("mousemove", function(event) {
            const [mouseX, mouseY] = d3.pointer(event, this);

            let closestPoint = null;
            let minDistance = Infinity;
            
            allDataPoints.forEach(point => {
                const distance = Math.sqrt(
                    Math.pow(mouseX - point.x, 2) + Math.pow(mouseY - point.y, 2)
                );
                if (distance < minDistance) {
                    minDistance = distance;
                    closestPoint = point;
                }
            });
            
            if (closestPoint && minDistance < 50) { 
                highlightCircle
                    .attr("cx", closestPoint.x)
                    .attr("cy", closestPoint.y)
                    .attr("stroke", color(closestPoint.ano))
                    .style("display", null);
                const mesNome = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", 
                                "Jul", "Ago", "Set", "Out", "Nov", "Dez"][closestPoint.mes - 1];
                const valor = closestPoint.valor.toFixed(2);
                
                tooltip.transition()
                    .duration(100)
                    .style("opacity", 1);
                
                tooltip.html(`<strong>${closestPoint.ano}</strong><br/>Mês: ${mesNome} (${closestPoint.mes})<br/>Valor: $${valor}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px");
            } else {
                highlightCircle.style("display", "none");
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0);
            }
        });

    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(m => String(m).padStart(2, '0')))
        .selectAll("text")
        .style("font-size", "12px");

    g.append("g")
        .call(d3.axisLeft(y).tickFormat(d => `$${d.toFixed(2)}`))
        .selectAll("text")
        .style("font-size", "12px");

    g.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Média de Gorjeta (USD)");

    g.append("text")
        .attr("class", "axis-label")
        .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Mês");

    const legend = g.append("g")
        .attr("transform", `translate(${width + 10}, 20)`);

    anos.forEach((ano, i) => {
        const lg = legend.append("g").attr("transform", `translate(0, ${i * 25})`);
        lg.append("line")
            .attr("x1", 0)
            .attr("x2", 20)
            .attr("y1", 0)
            .attr("y2", 0)
            .attr("stroke", color(ano))
            .attr("stroke-width", 3);
        lg.append("text")
            .attr("x", 25)
            .attr("y", 5)
            .style("font-size", "13px")
            .style("font-weight", "500")
            .text(ano);
    });
}

export function criarSerieMensalTipRate(containerId, seriesMap, usarMediana = false) {
    const container = d3.select(`#${containerId}`);
    container.selectAll("*").remove();

    const margin = { top: 40, right: 120, bottom: 60, left: 80 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = container
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const anos = Object.keys(seriesMap);
    const meses = d3.range(1, 13);

    const x = d3.scalePoint()
        .domain(meses)
        .range([0, width])
        .padding(0.5);

    const pick = d => usarMediana ? (d.tip_rate_mediano || 0) : (d.tip_rate_medio || 0);
    const allValues = anos.flatMap(a => seriesMap[a].map(pick));
    const y = d3.scaleLinear()
        .domain([0, Math.max(0.5, d3.max(allValues) * 1.1 || 0.5)])
        .nice()
        .range([height, 0]);

    g.selectAll(".grid-line")
        .data(y.ticks(10))
        .enter()
        .append("line")
        .attr("class", "grid-line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", d => y(d))
        .attr("y2", d => y(d));

    const color = d3.scaleOrdinal()
        .domain(anos)
        .range(["#667eea", "#38b2ac", "#ed64a6", "#f6ad55"]);

    const line = d3.line()
        .x(d => x(d.mes))
        .y(d => y(pick(d)));

    d3.selectAll(`.tooltip-${containerId}`).remove();
    const tooltip = d3.select("body").append("div")
        .attr("class", `tooltip tooltip-${containerId}`)
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background", "rgba(0,0,0,0.85)")
        .style("color", "white")
        .style("padding", "10px")
        .style("border-radius", "6px")
        .style("pointer-events", "none")
        .style("font-size", "12px")
        .style("box-shadow", "0 2px 8px rgba(0,0,0,0.3)")
        .style("z-index", "1000");

    anos.forEach(ano => {
        const data = seriesMap[ano];
        g.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", color(ano))
            .attr("stroke-width", 2)
            .attr("d", line)
            .attr("class", `line-rate-${ano}`)
            .style("cursor", "pointer");

        g.selectAll(`.dot-rate-${ano}`)
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => x(d.mes))
            .attr("cy", d => y(pick(d)))
            .attr("r", 4)
            .attr("fill", color(ano))
            .attr("stroke", "white")
            .attr("stroke-width", 2)
            .attr("class", `dot-rate-${ano}`)
            .style("cursor", "pointer")
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .attr("r", 6)
                    .attr("stroke-width", 3);
                
                const mesNome = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", 
                                "Jul", "Ago", "Set", "Out", "Nov", "Dez"][d.mes - 1];
                const v = pick(d);
                const valor = (v * 100).toFixed(2);
                const tipo = usarMediana ? "Mediano" : "Médio";
                
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);
                
                tooltip.html(`<strong>${ano}</strong><br/>${mesNome}/${d.mes}<br/>Tip Rate ${tipo}: ${valor}%`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px");
            })
            .on("mouseout", function() {
                d3.select(this)
                    .attr("r", 4)
                    .attr("stroke-width", 2);
                
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0);
            });
    });

    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(m => String(m).padStart(2, '0')));

    g.append("g")
        .call(d3.axisLeft(y).tickFormat(d => `${(d * 100).toFixed(0)}%`));

    g.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(usarMediana ? "Tip Rate Mediano (%)" : "Tip Rate Médio (%)");

    const legend = g.append("g")
        .attr("transform", `translate(${width + 10}, 0)`);

    anos.forEach((ano, i) => {
        const lg = legend.append("g").attr("transform", `translate(0, ${i * 20})`);
        lg.append("rect").attr("width", 12).attr("height", 12).attr("fill", color(ano));
        lg.append("text").attr("x", 18).attr("y", 10).style("font-size", "12px").text(ano);
    });
}

export function criarGraficoPizzaPeriodoDia(containerId, data2018, data2020, data2023) {

    const container = d3.select(`#${containerId}`);
    container.selectAll("*").remove();

    const width = 900;
    const height = 450;
    const radius = 120; 

    const svg = container
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    d3.selectAll(`.tooltip-${containerId}`).remove();
    const tooltip = d3.select("body").append("div")
        .attr("class", `tooltip tooltip-${containerId}`)
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background", "rgba(0,0,0,0.85)")
        .style("color", "white")
        .style("padding", "10px")
        .style("border-radius", "6px")
        .style("pointer-events", "none")
        .style("font-size", "12px")
        .style("box-shadow", "0 2px 8px rgba(0,0,0,0.3)")
        .style("z-index", "1000");

    const anos = [
        { ano: "2018", data: data2018 },
        { ano: "2020", data: data2020 },
        { ano: "2023", data: data2023 }
    ];

    const periodos = [
        { key: "madrugada", label: "Madrugada", horario: "00:00 - 05:59", color: "#4a5568" },
        { key: "manha", label: "Manhã", horario: "06:00 - 11:59", color: "#f6ad55" },
        { key: "tarde", label: "Tarde", horario: "12:00 - 17:59", color: "#667eea" },
        { key: "noite", label: "Noite", horario: "18:00 - 23:59", color: "#38b2ac" }
    ];

    const pie = d3.pie()
        .value(d => d.value)
        .sort(null);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    const arcHover = d3.arc()
        .innerRadius(0)
        .outerRadius(radius + 10);

    anos.forEach((item, index) => {
        const g = svg.append("g")
            .attr("transform", `translate(${(index * width / 3) + width / 6}, ${height / 2})`);

        const dados = periodos.map(p => ({
            periodo: p.key,
            label: p.label,
            horario: p.horario,
            color: p.color,
            value: item.data[p.key] || 0
        })).filter(d => d.value > 0);

        const total = d3.sum(dados, d => d.value);

        const paths = g.selectAll("path")
            .data(pie(dados))
            .enter()
            .append("path")
            .attr("fill", d => d.data.color)
            .attr("stroke", "white")
            .attr("stroke-width", 2)
            .attr("d", arc)
            .style("cursor", "pointer")
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("d", arcHover);

                const percent = ((d.data.value / total) * 100).toFixed(1);
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);

                tooltip.html(`
                    <strong>${item.ano}</strong><br/>
                    ${d.data.label}<br/>
                    ${d.data.horario}<br/>
                    <strong>${d.data.value.toLocaleString('pt-BR')} viagens</strong><br/>
                    ${percent}% do total
                `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px");
            })
            .on("mouseout", function() {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("d", arc);

                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0);
            });

        const labels = g.selectAll("text")
            .data(pie(dados))
            .enter()
            .append("text")
            .attr("transform", d => `translate(${arc.centroid(d)})`)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("font-weight", "600")
            .style("fill", "white")
            .style("pointer-events", "none")
            .text(d => {
                const percent = (d.data.value / total) * 100;
                return percent > 5 ? `${percent.toFixed(1)}%` : "";
            });

        g.append("text")
            .attr("y", -radius - 30)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-weight", "600")
            .text(item.ano);

        g.append("text")
            .attr("y", -radius - 10)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "#666")
            .text(`${total.toLocaleString('pt-BR')} viagens`);
    });

    const legend = svg.append("g")
        .attr("transform", `translate(${width / 2}, ${height - 60})`);

    const legendItems = legend.selectAll(".legend-item")
        .data(periodos)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(${(i - 1.5) * 180}, 0)`);

    legendItems.append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", d => d.color)
        .attr("stroke", "white")
        .attr("stroke-width", 1);

    legendItems.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .style("font-size", "12px")
        .text(d => `${d.label} (${d.horario})`);
}

