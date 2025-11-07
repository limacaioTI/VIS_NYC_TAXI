import { loadDb } from './config';

export class Taxi {
    async init() {
        this.db = await loadDb();
        this.conn = await this.db.connect();
        this.color = "yellow";
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
}

