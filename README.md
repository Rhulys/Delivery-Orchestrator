# 🚀 Delivery Event Orchestrator (Backend & Cloud)

Este projeto consiste em uma engine de orquestração de pedidos de delivery utilizando uma **arquitetura orientada a eventos (EDA)**. O foco principal é garantir alta disponibilidade, resiliência e escalabilidade horizontal através de serviços Serverless da AWS.

---

## 🏗️ Arquitetura e Decisões Técnicas

Diferente de sistemas monolíticos tradicionais, este orquestrador utiliza o padrão de **desacoplamento** para garantir que picos de tráfego não derrubem o sistema.

### Componentes Principais:
- **API Gateway**: Porta de entrada para requisições REST.
- **AWS Lambda (Producer)**: Valida os dados de entrada e encaminha para a fila de processamento.
- **Amazon SQS (Simple Queue Service)**: Atua como um buffer de mensagens, garantindo resiliência com **Retries** e **Dead Letter Queues (DLQ)** para tratamento de falhas.
- **AWS Lambda (Consumer)**: Processa as mensagens da fila de forma assíncrona, otimizando custos e performance.
- **Amazon DynamoDB**: Banco de dados NoSQL escalável para persistência dos estados dos pedidos.
- **Amazon SNS (Simple Notification Service)**: Implementação do padrão **Fan-out** para notificar múltiplos interessados (ex: e-mail para o restaurante) simultaneamente.
- **AWS CDK (Cloud Development Kit)**: Infraestrutura como Código (IaC) escrita em **TypeScript**, garantindo que o ambiente seja 100% reprodutível.

---

## 🛠️ Tecnologias Utilizadas

* **Linguagem:** TypeScript
* **Runtime:** Node.js (v18+)
* **Infraestrutura:** AWS CDK
* **Serviços Cloud:** Lambda, SQS, SNS, DynamoDB, API Gateway
* **Ferramentas:** AWS CLI, SDK AWS

---

## 🎯 Destaques de Engenharia (O que aprendi)

Neste projeto, apliquei conceitos avançados que são fundamentais para sistemas de larga escala:

1.  **Consistência Eventual:** Entendimento de que o status do pedido é atualizado de forma assíncrona, permitindo uma resposta mais rápida ao usuário.
2.  **Resiliência (DLQ):** Implementação de filas de "mensagens mortas" para evitar perda de dados em caso de falhas críticas.
3.  **Privilégio Mínimo:** As permissões IAM foram configuradas estritamente para o que cada Lambda precisa (ex: a Lambda de consulta tem apenas `grantReadData`).
4.  **Escalabilidade Serverless:** O sistema escala de 0 a milhares de pedidos automaticamente sem necessidade de gerenciar servidores.

---

## 🚀 Como Executar

1. **Clone o repositório:**
    `git clone` 
2. **Instale as dependências:**
    `npm install`
3. **Configure suas credenciais AWS e faça o deploy:**
    `cdk bootstrap cdk deploy`
4. **Teste o endpoint:**
    Use o link gerado pelo DeliveryApiEndpoint para enviar um POST via cURL ou Postman.

---

## 📈 Próximos Passos (Roadmap)
[ ] Implementar autenticação via Amazon Cognito. <br>
[ ] Adicionar testes unitários com Jest.<br>
[ ] Criar um Dashboard simples em React/Next.js para acompanhar os pedidos em tempo real.

## Contato
[Rhulyanderson Sander](https://www.linkedin.com/in/rhulys/)
