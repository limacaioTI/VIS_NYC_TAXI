import { loadDb } from './config';

export class Taxi {
    async init() {
        this.db = await loadDb();
        this.conn = await this.db.connect();
        this.color = "yellow";
    }

    async getMonthlyTipSeries(year, months = 12) {
        // Processa em lotes para evitar excesso de memória
        const batchSize = 3;
        const monthlyAgg = new Map(); // key: mes (1-12) -> acumuladores

        for (let startMonth = 1; startMonth <= months; startMonth += batchSize) {
            const endMonth = Math.min(startMonth + batchSize - 1, months);

            const files = [];
            for (let id = startMonth; id <= endMonth; id++) {
                const sId = String(id).padStart(2, '0');
                const url = `${this.color}/${year}/${this.color}_tripdata_${year}-${sId}.parquet`;
                const key = `Y${year}M${sId}`;
                files.push({ key, url });

                console.log(`Carregando arquivo: ${url}`);
                const res = await fetch(url);
                if (!res.ok) {
                    throw new Error(`Erro ao carregar arquivo ${url}: ${res.status} ${res.statusText}`);
                }
                const arrayBuffer = await res.arrayBuffer();
                if (arrayBuffer.byteLength === 0) {
                    throw new Error(`Arquivo ${url} está vazio`);
                }
                const uint8Array = new Uint8Array(arrayBuffer);
                await this.db.registerFileBuffer(key, uint8Array);
            }

            const fileKeys = files.map(d => `'${d.key}'`).join(",");
            // Observações:
            // - tip_rate calculado apenas quando fare_amount > 0
            // - usamos median() e avg() do DuckDB
            const sql = `
                WITH base AS (
                    SELECT
                        year(tpep_pickup_datetime) AS ano,
                        month(tpep_pickup_datetime) AS mes,
                        tip_amount AS tip_amount,
                        fare_amount AS fare_amount
                    FROM read_parquet([${fileKeys}])
                )
                SELECT
                    ano,
                    mes,
                    COUNT(*) AS total_viagens,
                    COUNT(CASE WHEN tip_amount > 0 THEN 1 END) AS viagens_com_gorjeta,
                    AVG(CASE WHEN tip_amount > 0 THEN tip_amount END) AS media_gorjeta,
                    -- tip_rate: considerar apenas fares > 0
                    AVG(CASE WHEN fare_amount > 0 THEN tip_amount / NULLIF(fare_amount, 0) END) AS tip_rate_medio,
                    MEDIAN(CASE WHEN fare_amount > 0 THEN tip_amount / NULLIF(fare_amount, 0) END) AS tip_rate_mediano
                FROM base
                GROUP BY ano, mes
                ORDER BY ano, mes
            `;

            const batch = await this.query(sql);
            for (const row of batch) {
                const mes = parseInt(row.mes);
                const key = mes;
                if (!monthlyAgg.has(key)) {
                    monthlyAgg.set(key, {
                        ano: parseInt(row.ano),
                        mes,
                        total_viagens: 0,
                        viagens_com_gorjeta: 0,
                        soma_media_gorjeta: 0,
                        count_media_gorjeta: 0,
                        soma_tip_rate: 0,
                        count_tip_rate: 0,
                        medians: [] // iremos combinar medianas ao final com aproximação pela média das medianas
                    });
                }
                const acc = monthlyAgg.get(key);
                acc.total_viagens += parseInt(row.total_viagens) || 0;
                acc.viagens_com_gorjeta += parseInt(row.viagens_com_gorjeta) || 0;

                const mediaGorjeta = parseFloat(row.media_gorjeta);
                const countMedia = parseInt(row.viagens_com_gorjeta) || 0;
                if (!Number.isNaN(mediaGorjeta) && countMedia > 0) {
                    acc.soma_media_gorjeta += mediaGorjeta * countMedia;
                    acc.count_media_gorjeta += countMedia;
                }

                const tipRateMedio = parseFloat(row.tip_rate_medio);
                // Para média de tip_rate, usamos um acumulado simples ponderado por total de viagens válidas de rate
                // Como não temos count direto dos válidos, aproximamos usando total_viagens (efeito mínimo para análise visual)
                if (!Number.isNaN(tipRateMedio)) {
                    acc.soma_tip_rate += tipRateMedio * (parseInt(row.total_viagens) || 0);
                    acc.count_tip_rate += (parseInt(row.total_viagens) || 0);
                }

                const tipRateMediano = parseFloat(row.tip_rate_mediano);
                if (!Number.isNaN(tipRateMediano)) {
                    acc.medians.push(tipRateMediano);
                }
            }
        }

        // Consolidar
        const series = [];
        for (const [mes, acc] of monthlyAgg.entries()) {
            const media_gorjeta =
                acc.count_media_gorjeta > 0 ? acc.soma_media_gorjeta / acc.count_media_gorjeta : 0;
            const tip_rate_medio =
                acc.count_tip_rate > 0 ? acc.soma_tip_rate / acc.count_tip_rate : 0;
            const tip_rate_mediano =
                acc.medians.length > 0 ? acc.medians.reduce((a, b) => a + b, 0) / acc.medians.length : 0;

            series.push({
                ano: acc.ano,
                mes: acc.mes,
                total_viagens: acc.total_viagens,
                viagens_com_gorjeta: acc.viagens_com_gorjeta,
                media_gorjeta,
                tip_rate_medio,
                tip_rate_mediano
            });
        }

        // Ordenar por mês
        series.sort((a, b) => a.mes - b.mes);
        return series;
    }

    async registerFiles(year, months = 12) {
        if (!this.db || !this.conn)
            throw new Error('Database not initialized. Please call init() first.');

        const files = [];

        for (let id = 1; id <= months; id++) {
            const sId = String(id).padStart(2, '0');
            const url = `${this.color}/${year}/${this.color}_tripdata_${year}-${sId}.parquet`;
            const key = `Y${year}M${sId}`;
            
            files.push({ key, url });

            console.log(`Carregando arquivo: ${url}`);
            try {
                const res = await fetch(url);
                
                if (!res.ok) {
                    throw new Error(`Erro ao carregar arquivo ${url}: ${res.status} ${res.statusText}`);
                }

                const arrayBuffer = await res.arrayBuffer();
                
                if (arrayBuffer.byteLength === 0) {
                    throw new Error(`Arquivo ${url} está vazio`);
                }
                
                console.log(`Arquivo ${url} carregado com sucesso! Tamanho: ${(arrayBuffer.byteLength / 1024 / 1024).toFixed(2)} MB`);
                
                const uint8Array = new Uint8Array(arrayBuffer);
                await this.db.registerFileBuffer(key, uint8Array);
                console.log(`Arquivo ${key} registrado no DuckDB`);
            } catch (error) {
                console.error(`Erro ao processar arquivo ${url}:`, error);
                throw new Error(`Falha ao carregar arquivo ${url}. Erro: ${error.message}`);
            }
        }
        
        return files;
    }

    async query(sql) {
        if (!this.db || !this.conn)
            throw new Error('Database not initialized. Please call init() first.');

        let result = await this.conn.query(sql);
        return result.toArray().map(row => row.toJSON());
    }

    async getTipAnalysis(year, months = 12) {
        // Processar em lotes de 3 meses para evitar problemas de memória
        const batchSize = 3;
        const results = [];
        
        for (let startMonth = 1; startMonth <= months; startMonth += batchSize) {
            const endMonth = Math.min(startMonth + batchSize - 1, months);
            
            console.log(`Processando meses ${startMonth} a ${endMonth} de ${year}...`);
            
            // Registrar arquivos do lote
            const files = [];
            for (let id = startMonth; id <= endMonth; id++) {
                const sId = String(id).padStart(2, '0');
                const url = `${this.color}/${year}/${this.color}_tripdata_${year}-${sId}.parquet`;
                const key = `Y${year}M${sId}`;
                
                files.push({ key, url });

                console.log(`Carregando arquivo: ${url}`);
                try {
                    const res = await fetch(url);
                    
                    if (!res.ok) {
                        throw new Error(`Erro ao carregar arquivo ${url}: ${res.status} ${res.statusText}`);
                    }

                    const arrayBuffer = await res.arrayBuffer();
                    
                    if (arrayBuffer.byteLength === 0) {
                        throw new Error(`Arquivo ${url} está vazio`);
                    }
                    
                    console.log(`Arquivo ${url} carregado! Tamanho: ${(arrayBuffer.byteLength / 1024 / 1024).toFixed(2)} MB`);
                    
                    const uint8Array = new Uint8Array(arrayBuffer);
                    await this.db.registerFileBuffer(key, uint8Array);
                } catch (error) {
                    console.error(`Erro ao processar arquivo ${url}:`, error);
                    throw new Error(`Falha ao carregar arquivo ${url}. Erro: ${error.message}`);
                }
            }
            
            // Fazer análise do lote
            const fileKeys = files.map(d => `'${d.key}'`).join(",");
            const sql = `
                SELECT 
                    COUNT(*) as total_viagens,
                    COUNT(CASE WHEN tip_amount > 0 THEN 1 END) as viagens_com_gorjeta,
                    COUNT(CASE WHEN tip_amount = 0 THEN 1 END) as viagens_sem_gorjeta,
                    AVG(CASE WHEN tip_amount > 0 THEN tip_amount END) as media_gorjeta,
                    SUM(CASE WHEN tip_amount > 0 THEN tip_amount END) as total_gorjetas
                FROM read_parquet([${fileKeys}])
            `;
            
            const batchResult = await this.query(sql);
            results.push(batchResult[0]);
            
            console.log(`Lote processado: ${batchResult[0].total_viagens} viagens`);
        }
        
        // Agregar resultados de todos os lotes
        const aggregated = {
            total_viagens: 0,
            viagens_com_gorjeta: 0,
            viagens_sem_gorjeta: 0,
            total_gorjetas: 0,
            soma_gorjetas_para_media: 0,
            count_para_media: 0
        };
        
        for (const result of results) {
            aggregated.total_viagens += parseInt(result.total_viagens) || 0;
            aggregated.viagens_com_gorjeta += parseInt(result.viagens_com_gorjeta) || 0;
            aggregated.viagens_sem_gorjeta += parseInt(result.viagens_sem_gorjeta) || 0;
            aggregated.total_gorjetas += parseFloat(result.total_gorjetas) || 0;
            
            // Para calcular média ponderada
            const media = parseFloat(result.media_gorjeta) || 0;
            const count = parseInt(result.viagens_com_gorjeta) || 0;
            if (count > 0) {
                aggregated.soma_gorjetas_para_media += media * count;
                aggregated.count_para_media += count;
            }
        }
        
        // Calcular média final
        aggregated.media_gorjeta = aggregated.count_para_media > 0 
            ? aggregated.soma_gorjetas_para_media / aggregated.count_para_media 
            : 0;
        
        return [aggregated];
    }

    async getTipAnalysisByPeriodoDia(year, months = 12) {
        // Processar em lotes de 3 meses para evitar problemas de memória
        const batchSize = 3;
        const periodoAgg = {
            madrugada: 0,  // 0-5
            manha: 0,      // 6-11
            tarde: 0,      // 12-17
            noite: 0       // 18-23
        };
        
        for (let startMonth = 1; startMonth <= months; startMonth += batchSize) {
            const endMonth = Math.min(startMonth + batchSize - 1, months);
            
            console.log(`Processando períodos do dia - meses ${startMonth} a ${endMonth} de ${year}...`);
            
            // Registrar arquivos do lote
            const files = [];
            for (let id = startMonth; id <= endMonth; id++) {
                const sId = String(id).padStart(2, '0');
                const url = `${this.color}/${year}/${this.color}_tripdata_${year}-${sId}.parquet`;
                const key = `Y${year}M${sId}`;
                
                files.push({ key, url });

                console.log(`Carregando arquivo: ${url}`);
                try {
                    const res = await fetch(url);
                    
                    if (!res.ok) {
                        throw new Error(`Erro ao carregar arquivo ${url}: ${res.status} ${res.statusText}`);
                    }

                    const arrayBuffer = await res.arrayBuffer();
                    
                    if (arrayBuffer.byteLength === 0) {
                        throw new Error(`Arquivo ${url} está vazio`);
                    }
                    
                    console.log(`Arquivo ${url} carregado! Tamanho: ${(arrayBuffer.byteLength / 1024 / 1024).toFixed(2)} MB`);
                    
                    const uint8Array = new Uint8Array(arrayBuffer);
                    await this.db.registerFileBuffer(key, uint8Array);
                } catch (error) {
                    console.error(`Erro ao processar arquivo ${url}:`, error);
                    throw new Error(`Falha ao carregar arquivo ${url}. Erro: ${error.message}`);
                }
            }
            
            // Fazer análise do lote por período do dia
            const fileKeys = files.map(d => `'${d.key}'`).join(",");
            const sql = `
                SELECT 
                    CASE 
                        WHEN hour(tpep_pickup_datetime) >= 0 AND hour(tpep_pickup_datetime) <= 5 THEN 'madrugada'
                        WHEN hour(tpep_pickup_datetime) >= 6 AND hour(tpep_pickup_datetime) <= 11 THEN 'manha'
                        WHEN hour(tpep_pickup_datetime) >= 12 AND hour(tpep_pickup_datetime) <= 17 THEN 'tarde'
                        WHEN hour(tpep_pickup_datetime) >= 18 AND hour(tpep_pickup_datetime) <= 23 THEN 'noite'
                    END as periodo,
                    COUNT(*) as viagens_com_gorjeta
                FROM read_parquet([${fileKeys}])
                WHERE tip_amount > 0
                GROUP BY periodo
            `;
            
            const batchResult = await this.query(sql);
            
            for (const row of batchResult) {
                const periodo = row.periodo;
                const count = parseInt(row.viagens_com_gorjeta) || 0;
                if (periodo && periodoAgg.hasOwnProperty(periodo)) {
                    periodoAgg[periodo] += count;
                }
            }
            
            console.log(`Lote processado para períodos do dia`);
        }
        
        return periodoAgg;
    }
}

