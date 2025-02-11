# bhut
Prova backend Node.js - BHUT

Usando Node.JS (TypeScript), crie uma aplicação (API REST) que contenha 3 endpoints e 1 consumer, consumindo 2 endpoints de uma API REST externa: `http://api-test.bhut.com.br:3000/api`.

## Endpoints
- `GET /api/cars`: Retorna uma lista de carros da API externa.
- `POST /api/cars`: Adiciona um carro na API externa e envia uma mensagem na fila AMQP.
- `GET /api/logs`: Retorna os logs da aplicação (consumo de mensagens e chamadas do webhook) armazenados no MongoDB.

## Stack
- Node.JS
- TypeScript
- Express
- Redis
- RabbitMQ
- MongoDB

## Build
```shell
npm ci
npm run build
```

## Execução
O projeto é dividido em 2 partes: servidor e consumer.

### Servidor
O servidor é responsável por expor os endpoints da API REST e enviar mensagens para a fila AMQP.

```shell
npm run start
```

### Consumer
O consumer é responsável por consumir mensagens da fila AMQP e enviar requisições para o webhook.

```shell
npm run start:consumer
```

## Docker
O arquivo `docker-compose.yml` contém a configuração dos serviços necessários para a execução da aplicação.

```shell
docker compose up
```
