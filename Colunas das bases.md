# Dicionário de Dados: Registros de Viagens de Táxi Amarelo

**Fonte:** TLC Trip Record Data
**Data do Documento:** 11 de maio de 2022

Este dicionário de dados descreve os dados de viagens de táxi amarelo.

---

## Campos do Conjunto de Dados

### VendorID
* **Descrição:** Um código indicando o provedor TPEP (Taxímetro Eletrônico) que forneceu o registro.
* **Valores:**
    * `1`: Creative Mobile Technologies, LLC
    * `2`: VeriFone Inc.

### tpep_pickup_datetime
* **Descrição:** A data e hora em que o taxímetro foi acionado (início da viagem).

### tpep_dropoff_datetime
* **Descrição:** A data e hora em que o taxímetro foi desativado (fim da viagem).

### Passenger_count
* **Descrição:** O número de passageiros no veículo.
* **Nota:** Este é um valor inserido manualmente pelo motorista.

### Trip_distance
* **Descrição:** A distância da viagem percorrida em milhas, reportada pelo taxímetro.

### PULocationID
* **Descrição:** A Zona de Táxi TLC (TLC Taxi Zone) em que o taxímetro foi acionado (local de embarque).

### DOLocationID
* **Descrição:** A Zona de Táxi TLC (TLC Taxi Zone) em que o taxímetro foi desativado (local de desembarque).

### RateCodeID
* **Descrição:** O código da tarifa final em vigor no final da viagem.
* **Valores:**
    * `1`: Tarifa padrão
    * `2`: JFK (Aeroporto JFK)
    * `3`: Newark (Aeroporto de Newark)
    * `4`: Nassau ou Westchester
    * `5`: Tarifa negociada
    * `6`: Viagem em grupo

### Store_and_fwd_flag
* **Descrição:** Esta flag indica se o registro da viagem foi mantido na memória do veículo antes de ser enviado ao fornecedor ("store and forward"), porque o veículo não tinha conexão com o servidor.
* **Valores:**
    * `Y`: Viagem "store and forward"
    * `N`: Não é uma viagem "store and forward"

### Payment_type
* **Descrição:** Um código numérico que significa como o passageiro pagou pela viagem.
* **Valores:**
    * `1`: Cartão de crédito
    * `2`: Dinheiro
    * `3`: Sem cobrança
    * `4`: Disputa
    * `5`: Desconhecido
    * `6`: Viagem anulada

### Fare_amount
* **Descrição:** A tarifa de tempo e distância calculada pelo taxímetro.

### Extra
* **Descrição:** Extras e sobretaxas diversas. Atualmente, isso inclui apenas as cobranças de $0,50 e $1 de hora de pico e noturnas.

### MTA_tax
* **Descrição:** Taxa MTA de $0,50 que é automaticamente acionada com base na tarifa taxada em uso.

### Improvement_surcharge
* **Descrição:** Sobretaxa de melhoria de $0,30 cobrada nas viagens no início da corrida (flag drop). Começou a ser cobrada em 2015.

### Tip_amount
* **Descrição:** Valor da gorjeta. Este campo é preenchido automaticamente para gorjetas de cartão de crédito.
* **Nota:** Gorjetas em dinheiro não são incluídas.

### Tolls_amount
* **Descrição:** Valor total de todos os pedágios pagos na viagem.

### Total_amount
* **Descrição:** O valor total cobrado dos passageiros.
* **Nota:** Não inclui gorjetas em dinheiro.

### Congestion_Surcharge
* **Descrição:** Valor total coletado na viagem para a sobretaxa de congestionamento do Estado de Nova York (NYS).

### Airport_fee
* **Descrição:** $1,25 para embarque (pick up) apenas nos Aeroportos LaGuardia (LGA) e John F. Kennedy (JFK).